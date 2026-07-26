from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.error.exceptions import ChatRoomNotFoundError
from app.models.chat import ChatMessage, ChatRoom


def list_chat_rooms(
        db: Session,
        user_id: int,
) -> list[ChatRoom]:
    """사용자의 대화방을 최근 사용 순서로 조회한다."""
    return (
        db.query(ChatRoom)
        .filter(ChatRoom.user_id == user_id)
        .order_by(
            ChatRoom.chat_updated_at.desc(),
            ChatRoom.chat_room_id.desc(),
        )
        .all()
    )


def get_chat_room(
        db: Session,
        user_id: int,
        chat_room_id: int,
) -> ChatRoom:
    """다른 사용자의 대화방에는 접근할 수 없도록 소유자까지 검사한다."""
    chat_room = (
        db.query(ChatRoom)
        .filter(
            ChatRoom.chat_room_id == chat_room_id,
            ChatRoom.user_id == user_id,
            )
        .first()
    )

    if chat_room is None:
        raise ChatRoomNotFoundError()

    return chat_room


def get_chat_messages(
        db: Session,
        chat_room_id: int,
) -> list[ChatMessage]:
    """대화 메시지를 생성 순서대로 조회한다."""
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_room_id == chat_room_id)
        .order_by(
            ChatMessage.chat_message_created_at.asc(),
            ChatMessage.chat_message_id.asc(),
        )
        .all()
    )


def get_recent_chat_messages(
        db: Session,
        chat_room_id: int,
        limit: int = 30,
) -> list[ChatMessage]:
    """LLM 문맥에 전달할 최근 메시지만 조회한다."""
    recent_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_room_id == chat_room_id)
        .order_by(
            ChatMessage.chat_message_created_at.desc(),
            ChatMessage.chat_message_id.desc(),
        )
        .limit(limit)
        .all()
    )

    return list(reversed(recent_messages))


def save_chat_exchange(
        db: Session,
        user_id: int,
        user_message: str,
        assistant_message: str,
        chat_title: str,
        chat_room: ChatRoom | None = None,
) -> ChatRoom:
    """사용자 질문과 AI 답변을 하나의 트랜잭션으로 저장한다."""
    try:
        if chat_room is None:
            chat_room = ChatRoom(
                user_id=user_id,
                chat_title=chat_title,
            )
            db.add(chat_room)
            db.flush()

        db.add_all(
            [
                ChatMessage(
                    chat_room_id=chat_room.chat_room_id,
                    sender_role="USER",
                    message_type="TEXT",
                    chat_content=user_message,
                ),
                ChatMessage(
                    chat_room_id=chat_room.chat_room_id,
                    sender_role="ASSISTANT",
                    message_type="TEXT",
                    chat_content=assistant_message,
                ),
            ]
        )

        chat_room.chat_updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(chat_room)
        return chat_room
    except Exception:
        db.rollback()
        raise


def update_chat_room_title(
        db: Session,
        chat_room: ChatRoom,
        chat_title: str,
) -> ChatRoom:
    """사용자가 입력한 제목으로 대화방 제목을 수정한다."""
    chat_room.chat_title = chat_title.strip()
    chat_room.chat_updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(chat_room)
    return chat_room


def delete_chat_room(
        db: Session,
        chat_room: ChatRoom,
) -> None:
    """대화방을 삭제하면 FK 설정에 따라 메시지도 함께 삭제된다."""
    db.delete(chat_room)
    db.commit()
