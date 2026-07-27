from app.core.knowledge_base.embedding import create_embedding
from app.core.knowledge_base.qdrant_store import (
    RetrievedChunk,
    create_qdrant_client,
    search_similar_chunks,
)


def retrieve_service_policy(
        question: str,
        *,
        limit: int = 3,
        score_threshold: float = 0.7,
) -> list[RetrievedChunk]:
    """사용자 질문과 관련 있는 서비스 규정 청크를 검색"""
    normalized_question = question.strip()
    if not normalized_question:
        return []

    query_vector = create_embedding(
        normalized_question,
        is_query=True,
    )
    qdrant_client = create_qdrant_client()

    try:
        return search_similar_chunks(
            client=qdrant_client,
            query_vector=query_vector,
            limit=limit,
            score_threshold=score_threshold,
        )
    finally:
        qdrant_client.close()


def build_knowledge_context(
        retrieved_chunks: list[RetrievedChunk],
) -> str:
    """검색된 청크를 LLM이 읽을 수 있는 문맥 문자열로 만듦"""
    context_sections = []

    for result_number, chunk in enumerate(retrieved_chunks, start=1):
        context_sections.append(
            "\n".join(
                [
                    f"[참고 규정 {result_number}]",
                    f"제목: {chunk.title}",
                    f"내용: {chunk.content}",
                ]
            )
        )

    return "\n\n".join(context_sections)
