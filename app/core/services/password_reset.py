import hashlib
import hmac
import re
import secrets
from datetime import datetime, timedelta, timezone

from solapi import SolapiMessageService
from solapi.model import RequestMessage
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.services.user import PASSWORD_PATTERN, hash_password
from app.models.password_reset import PasswordResetVerification
from app.models.user import User


CODE_VALID_MINUTES = 3
RESET_TOKEN_VALID_MINUTES = 10
RESEND_COOLDOWN_SECONDS = 60
MAX_VERIFICATION_ATTEMPTS = 5


class SmsDeliveryError(Exception):
    pass


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_phone_number(phone: str) -> str:
    return "".join(character for character in phone if character.isdigit())


def ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def hash_verification_code(request_id: str, code: str) -> str:
    return hmac.new(
        settings.session_secret_key.encode("utf-8"),
        f"{request_id}:{code}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def find_user_for_password_reset(
    db: Session,
    username: str,
    phone: str,
) -> User | None:
    user = (
        db.query(User)
        .filter(User.user_login_id == username.strip())
        .first()
    )
    if user is None:
        return None

    if normalize_phone_number(user.user_tel) != normalize_phone_number(phone):
        return None

    return user


def get_resend_wait_seconds(db: Session, user_id: int) -> int:
    latest_verification = (
        db.query(PasswordResetVerification)
        .filter(PasswordResetVerification.user_id == user_id)
        .order_by(PasswordResetVerification.created_at.desc())
        .first()
    )
    if latest_verification is None:
        return 0

    elapsed_seconds = (
        utc_now() - ensure_utc(latest_verification.created_at)
    ).total_seconds()
    return max(0, RESEND_COOLDOWN_SECONDS - int(elapsed_seconds))


def send_verification_sms(phone: str, code: str) -> None:
    if not (
        settings.solapi_api_key
        and settings.solapi_api_secret
        and settings.solapi_sender_number
    ):
        raise SmsDeliveryError()

    message_service = SolapiMessageService(
        api_key=settings.solapi_api_key,
        api_secret=settings.solapi_api_secret,
    )
    message = RequestMessage(
        from_=normalize_phone_number(settings.solapi_sender_number),
        to=normalize_phone_number(phone),
        text=f"GureumTalk 비밀번호 재설정 인증번호는 [{code}]입니다.",
    )

    try:
        message_service.send(message)
    except Exception as error:
        raise SmsDeliveryError() from error


def create_password_reset_verification(
    db: Session,
    user: User,
) -> PasswordResetVerification:
    request_id = secrets.token_urlsafe(32)
    code = f"{secrets.randbelow(1_000_000):06d}"
    now = utc_now()

    send_verification_sms(user.user_tel, code)

    active_verifications = (
        db.query(PasswordResetVerification)
        .filter(
            PasswordResetVerification.user_id == user.user_id,
            PasswordResetVerification.used_at.is_(None),
        )
        .all()
    )
    for verification in active_verifications:
        verification.used_at = now

    verification = PasswordResetVerification(
        request_id=request_id,
        user_id=user.user_id,
        code_hash=hash_verification_code(request_id, code),
        expires_at=now + timedelta(minutes=CODE_VALID_MINUTES),
        attempt_count=0,
        is_verified=False,
        created_at=now,
    )
    db.add(verification)
    db.commit()
    db.refresh(verification)
    return verification


def verify_password_reset_code(
    db: Session,
    request_id: str,
    code: str,
) -> tuple[str | None, str | None, str | None]:
    if not re.fullmatch(r"\d{6}", code):
        return None, "인증에 실패하였습니다.", "code"

    verification = db.get(PasswordResetVerification, request_id)
    if verification is None or verification.used_at is not None:
        return None, "인증에 실패하였습니다.", "code"

    now = utc_now()
    if ensure_utc(verification.expires_at) <= now:
        return None, "인증 유효시간이 지났습니다.", "expired"

    if verification.is_verified:
        return None, "인증에 실패하였습니다.", "code"

    if verification.attempt_count >= MAX_VERIFICATION_ATTEMPTS:
        return None, "인증에 실패하였습니다.", "attempts"

    expected_hash = hash_verification_code(request_id, code)
    if not hmac.compare_digest(verification.code_hash, expected_hash):
        verification.attempt_count += 1
        if verification.attempt_count >= MAX_VERIFICATION_ATTEMPTS:
            verification.used_at = now
        db.commit()
        return None, "인증에 실패하였습니다.", "code"

    reset_token = secrets.token_urlsafe(48)
    verification.is_verified = True
    verification.reset_token_hash = hash_reset_token(reset_token)
    verification.reset_token_expires_at = now + timedelta(
        minutes=RESET_TOKEN_VALID_MINUTES,
    )
    db.commit()
    return reset_token, None, None


def reset_user_password(
    db: Session,
    reset_token: str,
    password: str,
    password_confirm: str,
) -> tuple[bool, str | None, str | None]:
    if not PASSWORD_PATTERN.fullmatch(password):
        return (
            False,
            "비밀번호는 영문 소문자와 숫자를 포함하여 5자 이상 15자 이내로 작성해주세요.",
            "password",
        )

    if password != password_confirm:
        return False, "비밀번호가 일치하지 않습니다.", "password_confirm"

    verification = (
        db.query(PasswordResetVerification)
        .filter(
            PasswordResetVerification.reset_token_hash
            == hash_reset_token(reset_token),
        )
        .first()
    )
    now = utc_now()
    if (
        verification is None
        or not verification.is_verified
        or verification.used_at is not None
        or verification.reset_token_expires_at is None
        or ensure_utc(verification.reset_token_expires_at) <= now
    ):
        return False, "비밀번호 변경에 실패하였습니다.", "token"

    user = db.get(User, verification.user_id)
    if user is None:
        return False, "비밀번호 변경에 실패하였습니다.", "token"

    user.user_password_hash = hash_password(password)
    db.delete(verification)
    db.commit()
    return True, None, None
