CREATE TABLE IF NOT EXISTS password_reset_verifications (
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

CREATE INDEX IF NOT EXISTS idx_password_reset_user_created
    ON password_reset_verifications(user_id, created_at DESC);
