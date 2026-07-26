-- chat_rooms 테이블에 대화방 고정 정보 추가
ALTER TABLE chat_rooms
ADD COLUMN IF NOT EXISTS chat_is_pinned BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE chat_rooms
ADD COLUMN IF NOT EXISTS chat_pinned_at TIMESTAMPTZ;

-- 대화방 목록을 고정 여부 + 최근 사용 순서로 조회
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_pinned
ON chat_rooms(
    user_id,
    chat_is_pinned DESC,
    chat_pinned_at DESC,
    chat_updated_at DESC
);
