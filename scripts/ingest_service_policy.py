import argparse
from pathlib import Path

from app.core.knowledge_base.chunker import load_and_split_markdown
from app.core.knowledge_base.embedding import create_embedding
from app.core.knowledge_base.qdrant_store import (
    build_point,
    create_qdrant_client,
    ensure_collection,
    upsert_points,
)


DEFAULT_POLICY_PATH = (
    Path(__file__).resolve().parents[1]
    / "knowledge_base"
    / "documents"
    / "gureumtalk_service_policy.md"
)


def ingest_markdown(
        markdown_path: Path,
        max_characters: int,
) -> int:
    """MD 청크 생성, 임베딩, Qdrant 적재를 순서대로 수행"""
    chunks = load_and_split_markdown(
        markdown_path=markdown_path,
        max_characters=max_characters,
    )
    if not chunks:
        raise ValueError("적재할 마크다운 청크가 없습니다.")

    print(f"생성된 청크: {len(chunks)}개")
    points = []

    for current_number, chunk in enumerate(chunks, start=1):
        print(
            f"[{current_number}/{len(chunks)}] "
            f"{chunk.title} 임베딩 중"
        )
        vector = create_embedding(chunk.content)
        points.append(
            build_point(
                chunk=chunk,
                vector=vector,
            )
        )

    qdrant_client = create_qdrant_client()
    try:
        ensure_collection(
            client=qdrant_client,
            vector_size=len(points[0].vector),
        )
        upsert_points(
            client=qdrant_client,
            points=points,
        )
    finally:
        qdrant_client.close()

    print(f"Qdrant 적재 완료: {len(points)}개")
    return len(points)


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="구름톡 서비스 규정 MD를 Qdrant에 적재",
    )
    parser.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_POLICY_PATH,
        help="적재할 마크다운 파일 경로",
    )
    parser.add_argument(
        "--max-characters",
        type=int,
        default=1200,
        help="청크 하나의 최대 글자 수",
    )
    return parser.parse_args()


if __name__ == "__main__":
    arguments = parse_arguments()
    ingest_markdown(
        markdown_path=arguments.file.resolve(),
        max_characters=arguments.max_characters,
    )
