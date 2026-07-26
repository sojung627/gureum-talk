from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatRoomResponse,
    ChatRoomTitleUpdateRequest,
    EmotionScoreResponse,
    StoredChatMessageResponse,
)
from app.core.services.chat import create_chat_response, create_chat_title
from app.core.services.conversation import (
    delete_chat_room,
    get_chat_messages,
    get_chat_room,
    get_recent_chat_messages,
    list_chat_rooms,
    save_chat_exchange,
    update_chat_room_title,
)
from app.core.services.user import require_session_user
from app.db.database import get_db


router = APIRouter(
    prefix="/api/ai",
    tags=["ai"],
)


def create_chat_room_response(chat_room) -> ChatRoomResponse:
    return ChatRoomResponse(
        chat_room_id=chat_room.chat_room_id,
        chat_title=chat_room.chat_title,
        chat_created_at=chat_room.chat_created_at,
        chat_updated_at=chat_room.chat_updated_at,
        chat_is_pinned=chat_room.chat_is_pinned,
        chat_pinned_at=chat_room.chat_pinned_at,
    )


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

    chat_room = None
    history: list[dict[str, str]] = []

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
        history = [
            {
                "role": stored_message.sender_role.lower(),
                "content": stored_message.chat_content,
            }
            for stored_message in stored_messages
            if stored_message.chat_content
            and stored_message.sender_role in {"USER", "ASSISTANT"}
        ]

    chat_result = await create_chat_response(
        message=request.message,
        history=history,
    )

    if chat_room is None:
        chat_title = await create_chat_title(request.message)
    else:
        chat_title = chat_room.chat_title

    saved_chat_room = save_chat_exchange(
        db=db,
        user_id=user.user_id,
        user_message=request.message.strip(),
        assistant_message=chat_result.answer,
        chat_title=chat_title,
        chat_room=chat_room,
    )

    return ChatResponse(
        answer=chat_result.answer,
        model=settings.groq_model,
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
    return [
        StoredChatMessageResponse(
            chat_message_id=chat_message.chat_message_id,
            role=chat_message.sender_role.lower(),
            content=chat_message.chat_content or "",
            created_at=chat_message.chat_message_created_at,
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
