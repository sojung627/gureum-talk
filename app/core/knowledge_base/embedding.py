from sentence_transformers import SentenceTransformer

from app.core.config import settings


_embedding_model: SentenceTransformer | None = None


def get_embedding_model() -> SentenceTransformer:
    """로컬 임베딩 모델을 한 번만 불러온 뒤 재사용"""
    global _embedding_model

    if _embedding_model is None:
        _embedding_model = SentenceTransformer(settings.embedding_model)

    return _embedding_model


def create_embedding(
        text: str,
        *,
        is_query: bool = False,
) -> list[float]:
    """문서 또는 질문에 맞는 접두어를 붙여 임베딩을 생성"""
    normalized_text = text.strip()
    if not normalized_text:
        raise ValueError("빈 문자열은 임베딩할 수 없습니다.")

    text_prefix = "query" if is_query else "passage"
    embedding_text = f"{text_prefix}: {normalized_text}"
    embedding_vector = get_embedding_model().encode(
        embedding_text,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    return embedding_vector.tolist()
