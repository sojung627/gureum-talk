"""Private image storage. Only normalized, bounded JPEGs reach disk or the LLM."""
import base64
from datetime import datetime, timedelta, timezone
from io import BytesIO
from pathlib import Path
from uuid import uuid4
import warnings

from fastapi import HTTPException
from starlette.datastructures import UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.schemas.chat import ChatAttachmentResponse
from app.models.chat import ChatAttachment

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
TEMP_IMAGE_TTL = timedelta(hours=24)


def image_path(storage_key: str) -> Path:
    root = Path(settings.chat_upload_path).resolve()
    path = (root / storage_key).resolve()
    if path.parent != root:
        raise HTTPException(404, "이미지를 찾을 수 없습니다.")
    return path


def attachment_response(attachment: ChatAttachment) -> ChatAttachmentResponse:
    return ChatAttachmentResponse(
        attachment_id=attachment.attachment_id,
        url=f"/api/ai/images/{attachment.attachment_id}",
        content_type=attachment.content_type,
        size=attachment.size, width=attachment.width, height=attachment.height,
    )


def normalize_image(data: bytes) -> tuple[bytes, int, int]:
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(data)) as source:
                if source.format not in {"JPEG", "PNG", "WEBP"}:
                    raise HTTPException(415, "JPG, PNG, WebP 이미지만 첨부할 수 있습니다.")
                if source.width * source.height > MAX_IMAGE_PIXELS:
                    raise HTTPException(413, "이미지 해상도가 너무 큽니다.")
                source.load()
                image = ImageOps.exif_transpose(source)
                image.thumbnail((1600, 1600))
                rgba = image.convert("RGBA")
                result = Image.new("RGB", rgba.size, "white")
                result.paste(rgba, mask=rgba.getchannel("A"))
                output = BytesIO()
                result.save(output, "JPEG", quality=85, optimize=True)
                # Bound the total base64 payload even for three noisy images.
                while output.tell() > 800_000:
                    result = result.resize((max(1, result.width * 3 // 4), max(1, result.height * 3 // 4)))
                    output = BytesIO()
                    result.save(output, "JPEG", quality=80, optimize=True)
                return output.getvalue(), result.width, result.height
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
        raise HTTPException(415, "올바른 이미지 파일을 첨부해 주세요.") from error


def cleanup_images(db: Session) -> None:
    """Run on uploads or with scripts/cleanup_chat_images.py for idle servers."""
    cutoff = datetime.now(timezone.utc) - TEMP_IMAGE_TTL
    expired = db.query(ChatAttachment).filter(
        ChatAttachment.chat_message_id.is_(None), ChatAttachment.created_at < cutoff,
    ).with_for_update(skip_locked=True).all()
    for attachment in expired:
        db.delete(attachment)
    db.commit()
    for attachment in expired:
        try:
            image_path(attachment.storage_key).unlink(missing_ok=True)
        except OSError:
            pass  # The orphan scan retries after filesystem access recovers.
    # Includes files left behind by a failed DB commit, room/account deletion, or crash.
    live_keys = {row[0] for row in db.query(ChatAttachment.storage_key).all()}
    root = Path(settings.chat_upload_path)
    if root.exists():
        for path in root.glob("*.jpg"):
            if path.name not in live_keys and path.stat().st_mtime < cutoff.timestamp():
                path.unlink(missing_ok=True)


async def upload_images(db: Session, user_id: int, files: list[UploadFile]) -> list[ChatAttachment]:
    if not 1 <= len(files) <= 3:
        raise HTTPException(400, "이미지는 한 번에 최대 3장까지 첨부할 수 있습니다.")
    cleanup_images(db)
    prepared = []
    for file in files:
        data = await file.read(MAX_IMAGE_BYTES + 1)
        if len(data) > MAX_IMAGE_BYTES:
            raise HTTPException(413, "이미지는 한 장당 5MB까지 첨부할 수 있습니다.")
        normalized, width, height = normalize_image(data)
        attachment_id = str(uuid4())
        prepared.append((ChatAttachment(
            attachment_id=attachment_id, user_id=user_id,
            storage_key=f"{attachment_id}.jpg", content_type="image/jpeg",
            size=len(normalized), width=width, height=height,
            created_at=datetime.now(timezone.utc),
        ), normalized))
    written = []
    try:
        for attachment, data in prepared:
            path = image_path(attachment.storage_key)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            written.append(path)
            db.add(attachment)
        db.commit()
    except Exception:
        db.rollback()
        for path in written:
            path.unlink(missing_ok=True)
        raise
    return [attachment for attachment, _ in prepared]


def get_pending_images(db: Session, user_id: int, attachment_ids: list[str]) -> list[ChatAttachment]:
    if not attachment_ids:
        return []
    images = db.query(ChatAttachment).filter(
        ChatAttachment.attachment_id.in_(attachment_ids), ChatAttachment.user_id == user_id,
        ChatAttachment.chat_message_id.is_(None),
        ChatAttachment.created_at >= datetime.now(timezone.utc) - TEMP_IMAGE_TTL,
    ).with_for_update().all()
    by_id = {image.attachment_id: image for image in images}
    if len(by_id) != len(attachment_ids):
        raise HTTPException(400, "첨부 이미지가 만료되었거나 사용할 수 없습니다. 다시 첨부해 주세요.")
    return [by_id[attachment_id] for attachment_id in attachment_ids]


def image_content(attachments: list[ChatAttachment]) -> list[dict]:
    parts = []
    for attachment in attachments:
        try:
            encoded = base64.b64encode(image_path(attachment.storage_key).read_bytes()).decode("ascii")
        except FileNotFoundError as error:
            raise HTTPException(410, "이미지 파일이 없습니다. 다시 첨부해 주세요.") from error
        parts.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded}"}})
    return parts
