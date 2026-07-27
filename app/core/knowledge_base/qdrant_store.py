import uuid
from dataclasses import dataclass
from pathlib import Path

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.core.config import settings
from app.core.knowledge_base.chunker import MarkdownChunk


@dataclass(frozen=True)
class RetrievedChunk:
    """Qdrant에서 검색된 서비스 규정 청크"""

    content: str
    title: str
    source: str
    chunk_index: int
    score: float


def create_qdrant_client() -> QdrantClient:
    """서버 없이 프로젝트 내부의 로컬 Qdrant 저장소 열기"""
    app_directory = Path(__file__).resolve().parents[2]
    qdrant_data_path = app_directory / settings.qdrant_local_path
    qdrant_data_path.parent.mkdir(parents=True, exist_ok=True)

    return QdrantClient(path=str(qdrant_data_path))


def ensure_collection(
        client: QdrantClient,
        vector_size: int,
) -> None:
    """컬렉션이 없을 때 코사인 거리 컬렉션을 생성"""
    collection_name = settings.qdrant_collection_name
    if client.collection_exists(collection_name):
        collection_info = client.get_collection(collection_name)
        configured_size = collection_info.config.params.vectors.size
        if configured_size != vector_size:
            raise ValueError(
                "기존 Qdrant 컬렉션의 벡터 차원과 "
                f"현재 임베딩 차원이 다릅니다: "
                f"{configured_size} != {vector_size}"
            )
        return

    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=vector_size,
            distance=Distance.COSINE,
        ),
    )


def build_point(
        chunk: MarkdownChunk,
        vector: list[float],
) -> PointStruct:
    """재적재 시 같은 청크가 갱신되도록 고정 UUID 포인트 만듦"""
    point_key = (
        f"{settings.qdrant_collection_name}:"
        f"{chunk.source}:{chunk.chunk_index}:{chunk.title}"
    )
    point_id = str(uuid.uuid5(uuid.NAMESPACE_URL, point_key))

    return PointStruct(
        id=point_id,
        vector=vector,
        payload={
            "content": chunk.content,
            "title": chunk.title,
            "source": chunk.source,
            "chunk_index": chunk.chunk_index,
        },
    )


def upsert_points(
        client: QdrantClient,
        points: list[PointStruct],
) -> None:
    """생성한 임베딩 포인트를 Qdrant에 일괄 저장"""
    client.upsert(
        collection_name=settings.qdrant_collection_name,
        points=points,
        wait=True,
    )


def search_similar_chunks(
        client: QdrantClient,
        query_vector: list[float],
        *,
        limit: int = 3,
        score_threshold: float = 0.7,
) -> list[RetrievedChunk]:
    """질문과 의미가 가까운 서비스 규정 청크를 검색"""
    query_result = client.query_points(
        collection_name=settings.qdrant_collection_name,
        query=query_vector,
        limit=limit,
        score_threshold=score_threshold,
        with_payload=True,
    )

    retrieved_chunks = []

    for scored_point in query_result.points:
        payload = scored_point.payload or {}
        content = str(payload.get("content", "")).strip()

        if not content:
            continue

        retrieved_chunks.append(
            RetrievedChunk(
                content=content,
                title=str(payload.get("title", "제목 없음")),
                source=str(payload.get("source", "출처 없음")),
                chunk_index=int(payload.get("chunk_index", 0)),
                score=float(scored_point.score),
            )
        )

    return retrieved_chunks
