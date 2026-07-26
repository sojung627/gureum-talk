from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # postgreSQL 연결
    database_url: str
    # Groq API 연결
    groq_api_key: str
    # AI 챗봇 모델
    groq_model: str = "qwen/qwen3.6-27b"
    # 로그인 세션
    session_secret_key: str
    # 최상위 .env 읽어라
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
settings = Settings()
