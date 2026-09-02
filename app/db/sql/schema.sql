-- 테이블 삭제
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS password_reset_verifications CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- 1. 사용자
CREATE TABLE users (
                       user_id BIGSERIAL PRIMARY KEY,
                       user_login_id VARCHAR(50) NOT NULL UNIQUE,
                       user_name VARCHAR(50) NOT NULL,
                       user_tel VARCHAR(20) NOT NULL UNIQUE,
                       user_email VARCHAR(100) NOT NULL UNIQUE,
                       user_password_hash VARCHAR(255) NOT NULL,
                       user_created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
    user_id BIGINT PRIMARY KEY,
    voice_chat_panel_open BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_preferences_user
        FOREIGN KEY (user_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE
);

-- 비밀번호 재설정 인증
CREATE TABLE password_reset_verifications (
    request_id VARCHAR(64) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    code_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    reset_token_hash VARCHAR(64) UNIQUE,
    reset_token_expires_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE
);

-- 2. 대화방
CREATE TABLE chat_rooms (
                            chat_room_id BIGSERIAL PRIMARY KEY,
                            user_id BIGINT NOT NULL,
                            chat_title VARCHAR(150) NOT NULL DEFAULT '새로운 대화',
                            chat_is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
                            chat_pinned_at TIMESTAMPTZ,
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

CREATE INDEX idx_chat_rooms_user_pinned
    ON chat_rooms(
                  user_id,
                  chat_is_pinned DESC,
                  chat_pinned_at DESC,
                  chat_updated_at DESC
        );

CREATE INDEX idx_chat_messages_room_created
    ON chat_messages(chat_room_id, chat_message_created_at);

CREATE INDEX idx_password_reset_user_created
    ON password_reset_verifications(user_id, created_at DESC);
