import os
import unittest
from datetime import timedelta
from unittest.mock import patch


os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GROQ_API_KEY"] = "test-key"
os.environ["SESSION_SECRET_KEY"] = "test-session-secret"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.services.password_reset import SmsDeliveryError, utc_now
from app.core.services.user import hash_password, verify_password
from app.db.database import Base, get_db
from app.main import app
from app.models.password_reset import PasswordResetVerification
from app.models.user import User


class PasswordResetApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        self.session_factory = sessionmaker(
            bind=self.engine,
            autoflush=False,
            expire_on_commit=False,
        )
        Base.metadata.create_all(self.engine)
        self.database = self.session_factory()
        self.user = User(
            user_id=1,
            user_login_id="gureum1",
            user_name="구름",
            user_tel="010-1234-5678",
            user_email="gureum@example.com",
            user_password_hash=hash_password("oldpw1"),
        )
        self.database.add(self.user)
        self.database.commit()
        self.sent_code = ""

        def override_database():
            yield self.database

        app.dependency_overrides[get_db] = override_database
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.client.close()
        self.database.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def capture_sms(self, phone: str, code: str) -> None:
        self.assertEqual("010-1234-5678", phone)
        self.sent_code = code

    def request_code(self):
        with patch(
            "app.core.services.password_reset.send_verification_sms",
            side_effect=self.capture_sms,
        ):
            response = self.client.post(
                "/api/users/password-reset/code",
                json={
                    "username": "gureum1",
                    "phone": "01012345678",
                },
            )
        self.assertEqual(200, response.status_code)
        self.assertRegex(self.sent_code, r"^\d{6}$")
        return response.json()

    def verify_code(self):
        request_response = self.request_code()
        response = self.client.post(
            "/api/users/password-reset/verify",
            json={
                "request_id": request_response["request_id"],
                "code": self.sent_code,
            },
        )
        self.assertEqual(200, response.status_code)
        return response.json()

    def test_member_mismatch_does_not_send_sms(self) -> None:
        with patch(
            "app.core.services.password_reset.send_verification_sms",
        ) as send_sms:
            response = self.client.post(
                "/api/users/password-reset/code",
                json={
                    "username": "gureum1",
                    "phone": "010-9999-9999",
                },
            )

        self.assertEqual(404, response.status_code)
        self.assertEqual("일치하는 회원이 없습니다.", response.json()["message"])
        send_sms.assert_not_called()

    def test_code_is_saved_only_after_sms_delivery_succeeds(self) -> None:
        response_body = self.request_code()

        verification = self.database.get(
            PasswordResetVerification,
            response_body["request_id"],
        )
        self.assertIsNotNone(verification)
        self.assertNotEqual(self.sent_code, verification.code_hash)
        self.assertEqual("인증번호가 발송되었습니다.", response_body["message"])

    def test_sms_delivery_failure_does_not_save_verification(self) -> None:
        with patch(
            "app.core.services.password_reset.send_verification_sms",
            side_effect=SmsDeliveryError(),
        ):
            response = self.client.post(
                "/api/users/password-reset/code",
                json={
                    "username": "gureum1",
                    "phone": "010-1234-5678",
                },
            )

        self.assertEqual(502, response.status_code)
        self.assertEqual(
            "인증번호를 발송할 수 없습니다.",
            response.json()["message"],
        )
        self.assertEqual(
            0,
            self.database.query(PasswordResetVerification).count(),
        )

    def test_wrong_verification_code_fails(self) -> None:
        request_response = self.request_code()
        response = self.client.post(
            "/api/users/password-reset/verify",
            json={
                "request_id": request_response["request_id"],
                "code": "999999" if self.sent_code != "999999" else "888888",
            },
        )

        self.assertEqual(400, response.status_code)
        self.assertEqual("인증에 실패하였습니다.", response.json()["message"])

    def test_five_failed_attempts_invalidate_verification(self) -> None:
        request_response = self.request_code()
        wrong_code = "999999" if self.sent_code != "999999" else "888888"

        for _ in range(5):
            response = self.client.post(
                "/api/users/password-reset/verify",
                json={
                    "request_id": request_response["request_id"],
                    "code": wrong_code,
                },
            )
            self.assertEqual(400, response.status_code)

        correct_code_response = self.client.post(
            "/api/users/password-reset/verify",
            json={
                "request_id": request_response["request_id"],
                "code": self.sent_code,
            },
        )
        self.assertEqual(400, correct_code_response.status_code)

    def test_resending_invalidates_previous_code(self) -> None:
        first_request = self.request_code()
        first_code = self.sent_code
        first_verification = self.database.get(
            PasswordResetVerification,
            first_request["request_id"],
        )
        first_verification.created_at = utc_now() - timedelta(minutes=2)
        self.database.commit()

        second_request = self.request_code()
        self.assertNotEqual(first_request["request_id"], second_request["request_id"])

        old_code_response = self.client.post(
            "/api/users/password-reset/verify",
            json={
                "request_id": first_request["request_id"],
                "code": first_code,
            },
        )
        self.assertEqual(400, old_code_response.status_code)

    def test_correct_verification_code_returns_reset_token(self) -> None:
        response_body = self.verify_code()

        self.assertEqual("인증되었습니다.", response_body["message"])
        self.assertTrue(response_body["reset_token"])

    def test_expired_code_is_rejected_before_code_comparison(self) -> None:
        request_response = self.request_code()
        verification = self.database.get(
            PasswordResetVerification,
            request_response["request_id"],
        )
        verification.expires_at = utc_now() - timedelta(seconds=1)
        self.database.commit()

        response = self.client.post(
            "/api/users/password-reset/verify",
            json={
                "request_id": request_response["request_id"],
                "code": self.sent_code,
            },
        )

        self.assertEqual(410, response.status_code)
        self.assertEqual(
            "인증 유효시간이 지났습니다.",
            response.json()["message"],
        )

    def test_password_policy_violation_is_rejected(self) -> None:
        reset_token = self.verify_code()["reset_token"]
        response = self.client.post(
            "/api/users/password-reset",
            json={
                "reset_token": reset_token,
                "password": "abcde",
                "password_confirm": "abcde",
            },
        )

        self.assertEqual(400, response.status_code)
        self.assertEqual("password", response.json()["field"])

    def test_password_confirmation_mismatch_is_rejected(self) -> None:
        reset_token = self.verify_code()["reset_token"]
        response = self.client.post(
            "/api/users/password-reset",
            json={
                "reset_token": reset_token,
                "password": "newpw1",
                "password_confirm": "other1",
            },
        )

        self.assertEqual(400, response.status_code)
        self.assertEqual(
            "비밀번호가 일치하지 않습니다.",
            response.json()["message"],
        )

    def test_reset_token_cannot_be_reused(self) -> None:
        reset_token = self.verify_code()["reset_token"]
        request_body = {
            "reset_token": reset_token,
            "password": "newpw1",
            "password_confirm": "newpw1",
        }

        first_response = self.client.post(
            "/api/users/password-reset",
            json=request_body,
        )
        second_response = self.client.post(
            "/api/users/password-reset",
            json=request_body,
        )
        self.database.refresh(self.user)

        self.assertEqual(200, first_response.status_code)
        self.assertEqual("비밀번호가 변경되었습니다.", first_response.json()["message"])
        self.assertTrue(verify_password("newpw1", self.user.user_password_hash))
        self.assertEqual(401, second_response.status_code)
        self.assertEqual(
            "비밀번호 변경에 실패하였습니다.",
            second_response.json()["message"],
        )

    def test_expired_reset_token_is_rejected(self) -> None:
        reset_token = self.verify_code()["reset_token"]
        verification = (
            self.database.query(PasswordResetVerification)
            .filter(PasswordResetVerification.is_verified.is_(True))
            .first()
        )
        verification.reset_token_expires_at = utc_now() - timedelta(seconds=1)
        self.database.commit()

        response = self.client.post(
            "/api/users/password-reset",
            json={
                "reset_token": reset_token,
                "password": "newpw1",
                "password_confirm": "newpw1",
            },
        )
        self.assertEqual(401, response.status_code)


if __name__ == "__main__":
    unittest.main()
