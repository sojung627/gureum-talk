import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GROQ_API_KEY"] = "test-key"
os.environ["SESSION_SECRET_KEY"] = "test-session-secret"

from datetime import datetime, timedelta, timezone
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from fastapi.testclient import TestClient
from groq import APIStatusError
import httpx
from PIL import Image
from sqlalchemy import BigInteger, create_engine, event
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.services.chat_images import cleanup_images, MAX_IMAGE_BYTES
from app.core.services.conversation import delete_chat_room
from app.db.database import Base, get_db
from app.main import app
from app.models.chat import ChatAttachment, ChatMessage, ChatRoom
from app.models.user import User


@compiles(BigInteger, "sqlite")
def sqlite_integer(element, compiler, **kw):
    # SQLite only autoincrements a primary key spelled INTEGER.
    return "INTEGER"


def image_bytes(format="PNG"):
    output = BytesIO()
    Image.new("RGB", (60, 40), "purple").save(output, format)
    return output.getvalue()


class ChatImagesTest(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.storage_patch = patch.object(settings, "chat_upload_path", self.temp.name)
        self.storage_patch.start()
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)

        @event.listens_for(self.engine, "connect")
        def foreign_keys(connection, record):
            connection.execute("PRAGMA foreign_keys=ON")

        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine, expire_on_commit=False)
        self.users = [User(user_id=number, user_login_id=f"user{number}", user_name="구름",
                           user_tel=f"010{number}", user_email=f"user{number}@example.com", user_password_hash="hash")
                      for number in (1, 2)]
        self.db.add_all(self.users)
        self.db.commit()

        def database():
            try:
                yield self.db
            finally:
                self.db.rollback()

        app.dependency_overrides[get_db] = database
        self.client = TestClient(app)
        self.login(1)
        completion = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content="이미지를 확인했어요."))])
        self.llm = AsyncMock(return_value=completion)
        self.patches = [
            patch("app.core.services.chat.groq_client.chat.completions.create", self.llm),
            patch("app.core.services.chat.retrieve_service_policy", return_value=[]),
            patch("app.core.routers.chat.create_chat_title", new=AsyncMock(return_value="사진 이야기")),
        ]
        for patcher in self.patches:
            patcher.start()

    def login(self, number):
        with patch("app.core.routers.user.login_user", return_value=(self.users[number - 1], None, False, 0, 0)):
            response = self.client.post("/api/users/login", json={"username": f"user{number}", "password": "password1"})
            self.assertEqual(response.status_code, 200)

    def tearDown(self):
        for patcher in self.patches:
            patcher.stop()
        app.dependency_overrides.clear()
        self.client.close()
        self.db.close()
        self.engine.dispose()
        self.storage_patch.stop()
        self.temp.cleanup()

    def upload(self, count=1):
        response = self.client.post("/api/ai/images", files=[("files", (f"image{i}.png", image_bytes(), "image/png")) for i in range(count)])
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def send(self, attachments, **kwargs):
        return self.client.post("/api/ai/chat", json={"attachment_ids": [item["attachment_id"] for item in attachments], **kwargs})

    def test_three_images_only_message_persists_and_replays_without_duplicates(self):
        attachments = self.upload(3)
        request_id = str(uuid4())
        response = self.send(attachments, client_request_id=request_id)
        self.assertEqual(response.status_code, 200, response.text)
        room_id = response.json()["chat_room_id"]
        self.assertEqual(response.json()["model"], settings.groq_vision_model)
        messages = self.client.get(f"/api/ai/rooms/{room_id}/messages").json()
        self.assertEqual(len(messages), 2)
        self.assertEqual(len(messages[0]["attachments"]), 3)
        self.assertEqual(messages[0]["content"], "")
        replay = self.send(attachments, client_request_id=request_id)
        self.assertEqual(replay.json(), response.json())
        self.assertEqual(self.db.query(ChatMessage).count(), 2)
        self.llm.assert_awaited_once()
        self.assertEqual(self.client.get(attachments[0]["url"]).headers["content-type"], "image/jpeg")

    def test_three_images_use_compact_prompt_without_policy_retrieval(self):
        with patch("app.core.services.chat.retrieve_service_policy") as retrieve:
            response = self.send(self.upload(3), message="사진을 설명해 줘")
        self.assertEqual(response.status_code, 200, response.text)
        retrieve.assert_not_called()
        request = self.llm.await_args.kwargs
        self.assertLess(len(request["messages"][0]["content"]), 600)
        self.assertEqual(sum(part["type"] == "image_url" for part in request["messages"][-1]["content"]), 3)

    def test_provider_input_limit_is_not_reported_as_bad_gateway(self):
        attachments = self.upload(3)
        error = APIStatusError(
            "Request too large", response=httpx.Response(413, request=httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")),
            body={"error": {"code": "rate_limit_exceeded", "message": "Input token limit exceeded"}},
        )
        self.llm.side_effect = error
        with self.assertLogs("app.core.error.error_handlers", level="WARNING") as logs:
            response = self.send(attachments, message="사진을 설명해 줘")
        self.assertEqual(response.status_code, 413, response.text)
        self.assertEqual(response.json()["code"], "ai_input_limit")
        self.assertIn("rate_limit_exceeded", logs.output[0])
        self.assertNotIn("data:image", logs.output[0])
        self.assertEqual(self.db.query(ChatMessage).count(), 0)
        self.assertTrue(all(item.chat_message_id is None for item in self.db.query(ChatAttachment).all()))

    def test_four_images_rejected_on_upload_and_send(self):
        response = self.client.post("/api/ai/images", files=[("files", ("x.png", image_bytes(), "image/png"))] * 4)
        self.assertEqual(response.status_code, 400)
        response = self.client.post("/api/ai/chat", json={"attachment_ids": [str(uuid4()) for _ in range(4)]})
        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.db.query(ChatAttachment).count(), 0)

    def test_fake_image_oversize_and_batch_failure_leave_no_files(self):
        for data, status in [(b"not an image", 415), (b"x" * (MAX_IMAGE_BYTES + 1), 413)]:
            response = self.client.post("/api/ai/images", files=[("files", ("fake.png", data, "image/png"))])
            self.assertEqual(response.status_code, status)
        response = self.client.post("/api/ai/images", files=[
            ("files", ("good.png", image_bytes(), "image/png")),
            ("files", ("bad.png", b"broken", "image/png")),
        ])
        self.assertEqual(response.status_code, 415)
        self.assertEqual(list(Path(self.temp.name).glob("*.jpg")), [])

    def test_unauthenticated_and_other_user_cannot_read_or_send_images(self):
        attachments = self.upload()
        self.login(2)
        self.assertEqual(self.client.get(attachments[0]["url"]).status_code, 404)
        self.assertEqual(self.send(attachments).status_code, 400)
        self.client.cookies.clear()
        self.assertEqual(self.client.get(attachments[0]["url"]).status_code, 401)
        self.assertEqual(self.client.post("/api/ai/images", files=[("files", ("x.png", image_bytes(), "image/png"))]).status_code, 401)

    def test_ai_failure_keeps_images_for_retry(self):
        attachments = self.upload()
        with patch("app.core.routers.chat.create_chat_response", new=AsyncMock(side_effect=RuntimeError("offline"))):
            with self.assertRaises(RuntimeError):
                self.send(attachments, message="사진 설명해 줘")
        self.assertIsNone(self.db.query(ChatAttachment).one().chat_message_id)
        response = self.send(attachments, message="사진 설명해 줘")
        self.assertEqual(response.status_code, 200, response.text)

    def test_followup_uses_recent_images_with_total_limit_three(self):
        first = self.send(self.upload(3))
        room_id = first.json()["chat_room_id"]
        second = self.send(self.upload(2), message="이 사진도 봐 줘", chat_room_id=room_id)
        self.assertEqual(second.status_code, 200, second.text)
        parts = [part for message in self.llm.await_args.kwargs["messages"]
                 if isinstance(message["content"], list) for part in message["content"]]
        self.assertEqual(sum(part["type"] == "image_url" for part in parts), 3)
        third = self.send([], message="방금 사진은 어때?", chat_room_id=room_id)
        self.assertEqual(third.status_code, 200)
        self.assertEqual(self.llm.await_args.kwargs["model"], settings.groq_vision_model)

    def test_room_deletion_removes_images_and_expiry_cleans_only_pending(self):
        saved = self.upload()
        response = self.send(saved)
        pending = self.upload()
        attachment = self.db.get(ChatAttachment, pending[0]["attachment_id"])
        attachment.created_at = datetime.now(timezone.utc) - timedelta(days=2)
        self.db.commit()
        cleanup_images(self.db)
        self.assertEqual(self.client.get(pending[0]["url"]).status_code, 404)
        self.assertEqual(self.client.get(saved[0]["url"]).status_code, 200)
        room = self.db.get(ChatRoom, response.json()["chat_room_id"])
        delete_chat_room(self.db, room)
        self.assertEqual(self.db.query(ChatAttachment).count(), 0)
        self.assertEqual(list(Path(self.temp.name).glob("*.jpg")), [])


if __name__ == "__main__":
    unittest.main()
