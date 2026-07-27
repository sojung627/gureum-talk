import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from app.core.knowledge_base.qdrant_store import (
    RetrievedChunk,
    search_similar_chunks,
)
from app.core.services.rag import (
    build_knowledge_context,
    retrieve_service_policy,
)


class RagServiceTest(unittest.TestCase):
    def test_search_returns_payload_and_score(self) -> None:
        fake_client = MagicMock()
        fake_client.query_points.return_value = SimpleNamespace(
            points=[
                SimpleNamespace(
                    score=0.91,
                    payload={
                        "content": "회원은 설정에서 탈퇴할 수 있습니다.",
                        "title": "회원 탈퇴",
                        "source": "gureumtalk_service_policy.md",
                        "chunk_index": 24,
                    },
                )
            ]
        )

        results = search_similar_chunks(
            client=fake_client,
            query_vector=[0.1, 0.2],
        )

        self.assertEqual(1, len(results))
        self.assertEqual("회원 탈퇴", results[0].title)
        self.assertEqual(0.91, results[0].score)
        fake_client.query_points.assert_called_once()

    @patch("app.core.services.rag.create_qdrant_client")
    @patch("app.core.services.rag.create_embedding")
    def test_question_uses_query_embedding(
            self,
            mock_create_embedding,
            mock_create_qdrant_client,
    ) -> None:
        mock_create_embedding.return_value = [0.1, 0.2]
        fake_client = MagicMock()
        fake_client.query_points.return_value = SimpleNamespace(points=[])
        mock_create_qdrant_client.return_value = fake_client

        results = retrieve_service_policy("환불은 어떻게 해?")

        self.assertEqual([], results)
        mock_create_embedding.assert_called_once_with(
            "환불은 어떻게 해?",
            is_query=True,
        )
        fake_client.close.assert_called_once()

    def test_context_contains_only_answer_material(self) -> None:
        chunks = [
            RetrievedChunk(
                content="구름톡은 감정 기반 AI 대화를 제공합니다.",
                title="서비스 소개",
                source="gureumtalk_service_policy.md",
                chunk_index=1,
                score=0.88,
            )
        ]

        context = build_knowledge_context(chunks)

        self.assertIn("서비스 소개", context)
        self.assertIn("감정 기반 AI 대화", context)
        self.assertNotIn("0.88", context)


if __name__ == "__main__":
    unittest.main()
