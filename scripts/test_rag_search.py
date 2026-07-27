import argparse

from app.core.services.rag import retrieve_service_policy


def parse_arguments() -> argparse.Namespace:
    """검색 테스트에 사용할 사용자 질문을 읽음"""
    parser = argparse.ArgumentParser(
        description="구름톡 로컬 Qdrant의 RAG 검색 결과를 확인합니다.",
    )
    parser.add_argument(
        "question",
        help="서비스 규정에서 검색할 질문",
    )
    return parser.parse_args()


def print_search_results(question: str) -> None:
    """질문과 관련된 상위 서비스 규정 청크를출력"""
    results = retrieve_service_policy(question)

    if not results:
        print("유사도 기준을 통과한 서비스 규정이 없습니다.")
        return

    print(f"검색 결과: {len(results)}개")

    for result_number, result in enumerate(results, start=1):
        print()
        print(
            f"[{result_number}] "
            f"{result.title} "
            f"(유사도: {result.score:.4f})"
        )
        print(result.content)


if __name__ == "__main__":
    arguments = parse_arguments()
    print_search_results(arguments.question)
