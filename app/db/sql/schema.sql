-- 1. 사용자
CREATE TABLE users (
                       user_id BIGSERIAL PRIMARY KEY,
                       user_name VARCHAR(50) NOT NULL,
                       user_email VARCHAR(100) NOT NULL UNIQUE,
                       user_password_hash VARCHAR(255) NOT NULL,
                       user_created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 대화방
CREATE TABLE chat_rooms (
                            chat_room_id BIGSERIAL PRIMARY KEY,
                            user_id BIGINT NOT NULL,
                            chat_title VARCHAR(150) NOT NULL DEFAULT '새로운 대화',
                            chat_created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            chat_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                            CONSTRAINT fk_chat_rooms_user
                                FOREIGN KEY (user_id)
                                    REFERENCES users(user_id)
                                    ON DELETE CASCADE
);

-- 3. 대화 메시지
CREATE TABLE chat_messages (
                               chat_message_id BIGSERIAL PRIMARY KEY,
                               chat_room_id BIGINT NOT NULL,

    -- USER: 사용자 / ASSISTANT: AI / SYSTEM: 시스템 메시지
                               sender_role VARCHAR(20) NOT NULL
                                   CHECK (sender_role IN ('USER', 'ASSISTANT', 'SYSTEM')),

    -- TEXT: 일반 채팅 / VOICE: 음성 입력
                               message_type VARCHAR(20) NOT NULL
                                   CHECK (message_type IN ('TEXT', 'VOICE')),

                               chat_content TEXT,
                               voice_file_path VARCHAR(512),
                               chat_message_created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                               CONSTRAINT fk_chat_messages_room
                                   FOREIGN KEY (chat_room_id)
                                       REFERENCES chat_rooms(chat_room_id)
                                       ON DELETE CASCADE,

                               CONSTRAINT chk_message_content
                                   CHECK (
                                       chat_content IS NOT NULL
                                           OR voice_file_path IS NOT NULL
                                       )
);

-- 조회 성능을 위한 인덱스
CREATE INDEX idx_chat_rooms_user_id
    ON chat_rooms(user_id);

CREATE INDEX idx_chat_messages_room_created
    ON chat_messages(chat_room_id, chat_message_created_at);