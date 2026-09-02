import os
import unittest
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool


os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GROQ_API_KEY"] = "test-key"
os.environ["SESSION_SECRET_KEY"] = "test-session-secret"

from fastapi.testclient import TestClient

from app.db.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.user_preference import UserPreference


class UserPreferenceApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.session_factory = sessionmaker(
            bind=self.engine,
            expire_on_commit=False,
        )

        with self.session_factory() as database_session:
            self.user = User(
                user_id=7,
                user_login_id="gureum",
                user_name="구름",
                user_tel="01012345678",
                user_email="gureum@example.com",
                user_password_hash="unused-in-this-test",
            )
            database_session.add(self.user)
            database_session.commit()

        def override_database():
            database_session: Session = self.session_factory()
            try:
                yield database_session
            finally:
                database_session.close()

        app.dependency_overrides[get_db] = override_database
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
        app.dependency_overrides.clear()
        self.client.close()
        self.engine.dispose()

    def test_default_preference_is_created_as_open(self) -> None:
        response = self.client.get("/api/users/preferences")

        self.assertEqual(200, response.status_code)
        self.assertEqual(
            {"voice_chat_panel_open": True},
            response.json(),
        )

        with self.session_factory() as database_session:
            preference = database_session.get(UserPreference, 7)
            self.assertIsNotNone(preference)
            self.assertTrue(preference.voice_chat_panel_open)

    def test_updated_preference_is_restored_from_database(self) -> None:
        update_response = self.client.patch(
            "/api/users/preferences",
            json={"voice_chat_panel_open": False},
        )
        self.assertEqual(200, update_response.status_code)
        self.assertEqual(
            {"voice_chat_panel_open": False},
            update_response.json(),
        )

        get_response = self.client.get("/api/users/preferences")
        self.assertEqual(200, get_response.status_code)
        self.assertEqual(
            {"voice_chat_panel_open": False},
            get_response.json(),
        )

    def test_preference_api_requires_login(self) -> None:
        self.client.post("/api/users/logout")

        get_response = self.client.get("/api/users/preferences")
        patch_response = self.client.patch(
            "/api/users/preferences",
            json={"voice_chat_panel_open": False},
        )

        self.assertEqual(401, get_response.status_code)
        self.assertEqual(401, patch_response.status_code)


if __name__ == "__main__":
    unittest.main()
