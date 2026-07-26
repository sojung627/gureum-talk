import os
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock


# 실제 DB와 API 키를 사용하지 않는 통합 테스트용 설정
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GROQ_API_KEY"] = "test-key"
os.environ["SESSION_SECRET_KEY"] = "test-session-secret"

from fastapi.testclient import TestClient

from app.core.services import chat as chat_service
from app.main import app


class ChatApiTest(unittest.TestCase):
    def setUp(self) -> None:
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
        self.client = TestClient(app)

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
