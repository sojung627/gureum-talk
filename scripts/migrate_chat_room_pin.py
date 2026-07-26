from sqlalchemy import text

from app.db.database import engine


MIGRATION_STATEMENTS = (
    """
    ALTER TABLE chat_rooms
    ADD COLUMN IF NOT EXISTS chat_is_pinned
    BOOLEAN NOT NULL DEFAULT FALSE
    """,
    """
    ALTER TABLE chat_rooms
    ADD COLUMN IF NOT EXISTS chat_pinned_at
    TIMESTAMPTZ
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_pinned
    ON chat_rooms(
        user_id,
        chat_is_pinned DESC,
        chat_pinned_at DESC,
        chat_updated_at DESC
    )
    """,
)


def migrate_chat_room_pin() -> None:
    """기존 PostgreSQL DB에 대화방 고정 컬럼과 인덱스를 추가한다."""
    with engine.begin() as database_connection:
        for migration_statement in MIGRATION_STATEMENTS:
            database_connection.execute(
                text(migration_statement),
            )


if __name__ == "__main__":
    migrate_chat_room_pin()
    print("대화방 고정 컬럼 마이그레이션 완료")
