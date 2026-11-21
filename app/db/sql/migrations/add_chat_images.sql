BEGIN;

ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS client_request_id VARCHAR(36) UNIQUE,
    ADD COLUMN IF NOT EXISTS response_data JSON;

ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_message_type_check
    CHECK (message_type IN ('TEXT', 'VOICE', 'IMAGE'));

CREATE TABLE IF NOT EXISTS chat_attachments (
    attachment_id VARCHAR(36) PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    chat_message_id BIGINT REFERENCES chat_messages(chat_message_id) ON DELETE CASCADE,
    storage_key VARCHAR(64) NOT NULL,
    content_type VARCHAR(40) NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_user ON chat_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message ON chat_attachments(chat_message_id);

COMMIT;
