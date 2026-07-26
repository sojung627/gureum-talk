import os
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch


# 실제 DB와 API 키를 사용하지 않는 통합 테스트용 설정
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GROQ_API_KEY"] = "test-key"
os.environ["SESSION_SECRET_KEY"] = "test-session-secret"

from fastapi.testclient import TestClient

from app.core.services import chat as chat_service
from app.db.database import get_db
from app.main import app


class FakeDatabase:
    def __init__(self, user):
        self.user = user

    def get(self, model, user_id):
        if user_id == self.user.user_id:
            return self.user
        return None


class ChatApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.user = SimpleNamespace(
            user_id=7,
            user_login_id="gureum",
            user_name="구름",
        )
        self.fake_database = FakeDatabase(self.user)

        def override_database():
            yield self.fake_database

        app.dependency_overrides[get_db] = override_database

        fake_completion = SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content=(
                            "답답한 상황이었겠어요. "
                            "어떤 부분에서 가장 막혔는지 알려주면 함께 해결해 볼게요."
                        )
                    )
                )
            ]
        )
        self.mock_chat_completion = AsyncMock(return_value=fake_completion)
        chat_service.groq_client.chat.completions.create = (
            self.mock_chat_completion
        )

        self.create_title_patcher = patch(
            "app.core.routers.chat.create_chat_title",
            new=AsyncMock(return_value="짜증나는 상황"),
        )
        self.save_exchange_patcher = patch(
            "app.core.routers.chat.save_chat_exchange",
            return_value=SimpleNamespace(
                chat_room_id=10,
                chat_title="짜증나는 상황",
            ),
        )
        self.create_title_patcher.start()
        self.save_exchange_patcher.start()

        self.client = TestClient(app)
        with patch(
                "app.core.routers.user.login_user",
                return_value=(self.user, None, False, 0, 0),
        ):
            login_response = self.client.post(
                "/api/users/login",
                json={
                    "username": "gureum",
                    "password": "password1",
                },
            )
        self.assertEqual(200, login_response.status_code)

    def tearDown(self) -> None:
        self.create_title_patcher.stop()
        self.save_exchange_patcher.stop()
        app.dependency_overrides.clear()
        self.client.close()

    def test_empty_history_still_calls_llm_and_returns_emotions(self) -> None:
        response = self.client.post(
            "/api/ai/chat",
            json={
                "message": "짜증나",
                "history": [],
            },
        )

        self.assertEqual(200, response.status_code)
        response_body = response.json()
        self.assertEqual(
            ["분노", "답답함"],
            [emotion["label"] for emotion in response_body["emotions"]],
        )
        self.assertFalse(response_body["safety_detected"])
        self.mock_chat_completion.assert_awaited_once()

    def test_safety_response_does_not_call_llm(self) -> None:
        response = self.client.post(
            "/api/ai/chat",
            json={
                "message": "요즘 정말 죽고 싶어",
                "history": [],
            },
        )

        self.assertEqual(200, response.status_code)
        self.assertTrue(response.json()["safety_detected"])
        self.mock_chat_completion.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
