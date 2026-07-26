import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch


os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GROQ_API_KEY"] = "test-key"
os.environ["SESSION_SECRET_KEY"] = "test-session-secret"

from fastapi.testclient import TestClient

from app.db.database import get_db
from app.main import app


class FakeDatabase:
    def __init__(self, user):
        self.user = user

    def get(self, model, user_id):
        if user_id == self.user.user_id:
            return self.user
        return None


class LoginSessionTest(unittest.TestCase):
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
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.client.close()

    def test_login_cookie_restores_session_and_logout_clears_it(self) -> None:
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
        self.assertIn("gureumtalk_session", self.client.cookies)

        session_response = self.client.get("/api/users/session")
        self.assertEqual(200, session_response.status_code)
        self.assertEqual(
            {
                "authenticated": True,
                "username": "gureum",
                "name": "구름",
            },
            session_response.json(),
        )

        logout_response = self.client.post("/api/users/logout")
        self.assertEqual(200, logout_response.status_code)

        signed_out_session_response = self.client.get(
            "/api/users/session",
        )
        self.assertEqual(200, signed_out_session_response.status_code)
        self.assertEqual(
            {
                "authenticated": False,
                "username": None,
                "name": None,
            },
            signed_out_session_response.json(),
        )


if __name__ == "__main__":
    unittest.main()
