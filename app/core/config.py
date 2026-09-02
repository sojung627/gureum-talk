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
    # SOLAPI 문자 인증
    solapi_api_key: str = ""
    solapi_api_secret: str = ""
    solapi_sender_number: str = ""
    # 로컬 임베딩 모델
    embedding_model: str = "intfloat/multilingual-e5-small"
    # 로컬 Qdrant 데이터 저장 경로
    qdrant_local_path: str = "knowledge_base/qdrant_data"
    qdrant_collection_name: str = "gureumtalk_service_policy"
    # 최상위 .env 읽어라
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
settings = Settings()
