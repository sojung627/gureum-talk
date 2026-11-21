from uuid import UUID
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import FileResponse
from starlette.datastructures import UploadFile
from starlette.formparsers import MultiPartException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatRoomPinUpdateRequest,
    ChatRoomResponse,
    ChatRoomTitleUpdateRequest,
    EmotionScoreResponse,
    StoredChatMessageResponse,
    ChatAttachmentResponse,
)
from app.core.services.chat import create_chat_response, create_chat_title
from app.core.services.conversation import (
    delete_chat_room,
    get_chat_messages,
    get_chat_room,
    get_recent_chat_messages,
    list_chat_rooms,
    save_chat_exchange,
    update_chat_room_pin,
    update_chat_room_title,
)
from app.core.services.user import require_session_user
from app.db.database import get_db
from app.models.chat import ChatAttachment, ChatMessage, ChatRoom
from app.core.services.chat_images import (
    attachment_response, get_pending_images, image_content, image_path, upload_images,
)


router = APIRouter(
    prefix="/api/ai",
    tags=["ai"],
)


def create_chat_room_response(chat_room) -> ChatRoomResponse:
    return ChatRoomResponse(
        chat_room_id=chat_room.chat_room_id,
        chat_title=chat_room.chat_title,
        chat_is_pinned=chat_room.chat_is_pinned,
        chat_pinned_at=chat_room.chat_pinned_at,
        chat_created_at=chat_room.chat_created_at,
        chat_updated_at=chat_room.chat_updated_at,
    )


def completed_request(db: Session, user_id: int, request_id: str | None):
    if not request_id:
        return None
    message = db.query(ChatMessage).join(ChatRoom).filter(
        ChatRoom.user_id == user_id, ChatMessage.client_request_id == request_id,
    ).first()
    return ChatResponse(**message.response_data) if message and message.response_data else None


@router.post("/images", response_model=list[ChatAttachmentResponse])
async def upload_chat_images(http_request: Request, db: Session = Depends(get_db)):
    user = require_session_user(db=db, http_request=http_request)
    total_bytes = 0
    receive = http_request.receive

    async def bounded_receive():
        nonlocal total_bytes
        event = await receive()
        total_bytes += len(event.get("body", b""))
        if total_bytes > 15 * 1024 * 1024 + 65536:
            # MultiPartException makes Starlette close any spooled temporary files.
            raise MultiPartException("이미지는 한 장당 5MB까지 첨부할 수 있습니다.")
        return event

    bounded_request = Request(http_request.scope, receive=bounded_receive)
    # Bound multipart parsing too, before allocating arbitrarily many file parts.
    try:
        async with bounded_request.form(max_files=3, max_fields=0, max_part_size=5 * 1024 * 1024) as form:
            files = form.getlist("files")
            if any(not isinstance(file, UploadFile) for file in files):
                raise HTTPException(400, "올바른 이미지 파일을 첨부해 주세요.")
            attachments = await upload_images(db, user.user_id, files)
    except HTTPException as error:
        if total_bytes > 15 * 1024 * 1024 + 65536:
            raise HTTPException(413, "이미지는 한 장당 5MB까지 첨부할 수 있습니다.") from error
        if error.status_code == 400 and "Too many files" in str(error.detail):
            raise HTTPException(400, "이미지는 한 번에 최대 3장까지 첨부할 수 있습니다.") from error
        raise
    return [attachment_response(attachment) for attachment in attachments]


@router.get("/images/{attachment_id}")
def get_chat_image(attachment_id: UUID, http_request: Request, db: Session = Depends(get_db)):
    user = require_session_user(db=db, http_request=http_request)
    attachment = db.query(ChatAttachment).filter(
        ChatAttachment.attachment_id == str(attachment_id), ChatAttachment.user_id == user.user_id,
    ).first()
    if attachment is None or not image_path(attachment.storage_key).is_file():
        raise HTTPException(404, "이미지를 찾을 수 없습니다.")
    return FileResponse(image_path(attachment.storage_key), media_type=attachment.content_type,
                        headers={"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"})


@router.post(
    "/chat",
    response_model=ChatResponse,
)
async def chat(
        http_request: Request,
        request: ChatRequest,
        db: Session = Depends(get_db),
) -> ChatResponse:
    user = require_session_user(
        db=db,
        http_request=http_request,
    )

    request_id = str(request.client_request_id) if request.client_request_id else None
    previous = completed_request(db, user.user_id, request_id)
    if previous:
        return previous
    try:
        attachments = get_pending_images(db, user.user_id, [str(value) for value in request.attachment_ids])
    except HTTPException:
        previous = completed_request(db, user.user_id, request_id)
        if previous:
            return previous
        raise

    chat_room = None
    history: list[dict] = []

    if request.chat_room_id is not None:
        chat_room = get_chat_room(
            db=db,
            user_id=user.user_id,
            chat_room_id=request.chat_room_id,
        )
        stored_messages = get_recent_chat_messages(
            db=db,
            chat_room_id=chat_room.chat_room_id,
        )
        stored_attachments = db.query(ChatAttachment).filter(
            ChatAttachment.chat_message_id.in_([item.chat_message_id for item in stored_messages]),
        ).order_by(ChatAttachment.created_at, ChatAttachment.attachment_id).all()
        by_message = {}
        for attachment in stored_attachments:
            by_message.setdefault(attachment.chat_message_id, []).append(attachment)
        # The provider allows at most three images across the entire request.
        remaining = 3 - len(attachments)
        selected = {}
        for item in reversed(stored_messages):
            candidates = by_message.get(item.chat_message_id, []) if item.sender_role == "USER" else []
            chosen = candidates[:remaining]
            selected[item.chat_message_id] = chosen
            remaining -= len(chosen)
        history = [
            {
                "role": stored_message.sender_role.lower(),
                "content": ([{"type": "text", "text": stored_message.chat_content or "첨부 이미지"}, *image_content(selected[stored_message.chat_message_id])]
                            if selected[stored_message.chat_message_id] else stored_message.chat_content or "[이전 이미지 첨부]"),
            }
            for stored_message in stored_messages
            if stored_message.sender_role in {"USER", "ASSISTANT"}
        ]

    chat_result = await create_chat_response(
        message=request.message,
        history=history,
        images=image_content(attachments),
    )

    if chat_room is None:
        chat_title = await create_chat_title(request.message) if request.message.strip() else "이미지 대화"
    else:
        chat_title = chat_room.chat_title

    response_data = dict(
        answer=chat_result.answer, model=chat_result.model or settings.groq_model,
        emotions=[{"label": emotion.label, "score": emotion.score} for emotion in chat_result.emotion_prediction.emotions],
        safety_detected=chat_result.safety_detected,
    )
    try:
        saved_chat_room = save_chat_exchange(
            db=db,
            user_id=user.user_id,
            user_message=request.message.strip(),
            assistant_message=chat_result.answer,
            chat_title=chat_title,
            chat_room=chat_room,
            attachments=attachments, client_request_id=request_id, response_data=response_data,
        )
    except IntegrityError:
        db.rollback()
        previous = completed_request(db, user.user_id, request_id)
        if previous:
            return previous
        raise

    return ChatResponse(
        answer=chat_result.answer,
        model=chat_result.model or settings.groq_model,
        emotions=[
            EmotionScoreResponse(
                label=emotion.label,
                score=emotion.score,
            )
            for emotion in chat_result.emotion_prediction.emotions
        ],
        safety_detected=chat_result.safety_detected,
        chat_room_id=saved_chat_room.chat_room_id,
        chat_title=saved_chat_room.chat_title,
    )


@router.get(
    "/rooms",
    response_model=list[ChatRoomResponse],
)
def get_rooms(
        http_request: Request,
        db: Session = Depends(get_db),
) -> list[ChatRoomResponse]:
    user = require_session_user(
        db=db,
        http_request=http_request,
    )
    chat_rooms = list_chat_rooms(
        db=db,
        user_id=user.user_id,
    )
    return [
        create_chat_room_response(chat_room)
        for chat_room in chat_rooms
    ]


@router.get(
    "/rooms/{chat_room_id}/messages",
    response_model=list[StoredChatMessageResponse],
)
def get_room_messages(
        chat_room_id: int,
        http_request: Request,
        db: Session = Depends(get_db),
) -> list[StoredChatMessageResponse]:
    user = require_session_user(
        db=db,
        http_request=http_request,
    )
    chat_room = get_chat_room(
        db=db,
        user_id=user.user_id,
        chat_room_id=chat_room_id,
    )
    chat_messages = get_chat_messages(
        db=db,
        chat_room_id=chat_room.chat_room_id,
    )
    attachments = db.query(ChatAttachment).filter(
        ChatAttachment.chat_message_id.in_([message.chat_message_id for message in chat_messages]),
    ).order_by(ChatAttachment.created_at, ChatAttachment.attachment_id).all()
    by_message = {}
    for attachment in attachments:
        by_message.setdefault(attachment.chat_message_id, []).append(attachment_response(attachment))
    return [
        StoredChatMessageResponse(
            chat_message_id=chat_message.chat_message_id,
            role=chat_message.sender_role.lower(),
            content=chat_message.chat_content or "",
            created_at=chat_message.chat_message_created_at,
            attachments=by_message.get(chat_message.chat_message_id, []),
        )
        for chat_message in chat_messages
        if chat_message.sender_role in {"USER", "ASSISTANT"}
    ]


@router.patch(
    "/rooms/{chat_room_id}",
    response_model=ChatRoomResponse,
)
def rename_room(
        chat_room_id: int,
        title_request: ChatRoomTitleUpdateRequest,
        http_request: Request,
        db: Session = Depends(get_db),
) -> ChatRoomResponse:
    user = require_session_user(
        db=db,
        http_request=http_request,
    )
    chat_room = get_chat_room(
        db=db,
        user_id=user.user_id,
        chat_room_id=chat_room_id,
    )
    updated_chat_room = update_chat_room_title(
        db=db,
        chat_room=chat_room,
        chat_title=title_request.chat_title,
    )
    return create_chat_room_response(updated_chat_room)


@router.patch(
    "/rooms/{chat_room_id}/pin",
    response_model=ChatRoomResponse,
)
def pin_room(
        chat_room_id: int,
        pin_request: ChatRoomPinUpdateRequest,
        http_request: Request,
        db: Session = Depends(get_db),
) -> ChatRoomResponse:
    user = require_session_user(
        db=db,
        http_request=http_request,
    )
    chat_room = get_chat_room(
        db=db,
        user_id=user.user_id,
        chat_room_id=chat_room_id,
    )
    updated_chat_room = update_chat_room_pin(
        db=db,
        chat_room=chat_room,
        chat_is_pinned=pin_request.chat_is_pinned,
    )
    return create_chat_room_response(updated_chat_room)


@router.delete("/rooms/{chat_room_id}")
def remove_room(
        chat_room_id: int,
        http_request: Request,
        db: Session = Depends(get_db),
) -> dict[str, str]:
    user = require_session_user(
        db=db,
        http_request=http_request,
    )
    chat_room = get_chat_room(
        db=db,
        user_id=user.user_id,
        chat_room_id=chat_room_id,
    )
    delete_chat_room(
        db=db,
        chat_room=chat_room,
    )
    return {
        "message": "대화방 삭제 완료",
    }
