import os
import unittest
from datetime import datetime, timedelta, timezone


os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GROQ_API_KEY"] = "test-key"
os.environ["SESSION_SECRET_KEY"] = "test-session-secret"

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.services.conversation import (
    list_chat_rooms,
    update_chat_room_pin,
)
from app.db.database import Base
from app.models.chat import ChatRoom
from app.models.user import User


class ChatRoomServiceTest(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite:///:memory:",
        )
        Base.metadata.create_all(self.engine)
        self.database_session = Session(self.engine)

        self.user = User(
            user_id=1,
            user_login_id="gureum",
            user_name="구름",
            user_tel="010-0000-0000",
            user_email="gureum@example.com",
            user_password_hash="test-password-hash",
        )
        self.database_session.add(self.user)
        self.database_session.commit()

    def tearDown(self) -> None:
        self.database_session.close()
        self.engine.dispose()

    def test_pinned_room_is_listed_before_recent_unpinned_room(self) -> None:
        current_time = datetime.now(timezone.utc)
        pinned_room = ChatRoom(
            chat_room_id=1,
            user_id=self.user.user_id,
            chat_title="고정한 대화",
            chat_is_pinned=True,
            chat_pinned_at=current_time,
            chat_updated_at=current_time - timedelta(days=1),
        )
        recent_room = ChatRoom(
            chat_room_id=2,
            user_id=self.user.user_id,
            chat_title="최근 대화",
            chat_is_pinned=False,
            chat_updated_at=current_time,
        )
        self.database_session.add_all(
            [
                recent_room,
                pinned_room,
            ]
        )
        self.database_session.commit()

        chat_rooms = list_chat_rooms(
            db=self.database_session,
            user_id=self.user.user_id,
        )

        self.assertEqual(
            [
                "고정한 대화",
                "최근 대화",
            ],
            [
                chat_room.chat_title
                for chat_room in chat_rooms
            ],
        )

    def test_pin_update_saves_pin_time_and_can_be_released(self) -> None:
        chat_room = ChatRoom(
            chat_room_id=3,
            user_id=self.user.user_id,
            chat_title="고정할 대화",
            chat_is_pinned=False,
        )
        self.database_session.add(chat_room)
        self.database_session.commit()

        pinned_chat_room = update_chat_room_pin(
            db=self.database_session,
            chat_room=chat_room,
            chat_is_pinned=True,
        )

        self.assertTrue(pinned_chat_room.chat_is_pinned)
        self.assertIsNotNone(pinned_chat_room.chat_pinned_at)

        released_chat_room = update_chat_room_pin(
            db=self.database_session,
            chat_room=chat_room,
            chat_is_pinned=False,
        )

        self.assertFalse(released_chat_room.chat_is_pinned)
        self.assertIsNone(released_chat_room.chat_pinned_at)


if __name__ == "__main__":
    unittest.main()
