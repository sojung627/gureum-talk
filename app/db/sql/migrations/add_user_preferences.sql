CREATE TABLE IF NOT EXISTS user_preferences (
    user_id BIGINT PRIMARY KEY,
    voice_chat_panel_open BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_preferences_user
        FOREIGN KEY (user_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE
);
