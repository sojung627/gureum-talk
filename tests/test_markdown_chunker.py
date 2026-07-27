import unittest

from app.core.knowledge_base.chunker import split_markdown


class MarkdownChunkerTest(unittest.TestCase):
    def test_splits_markdown_by_second_level_heading(self) -> None:
        markdown_text = """# 구름톡 서비스

## 서비스 소개

구름톡은 감성형 AI 챗봇이다.

## 요금제

무료 요금제를 제공한다.
"""

        chunks = split_markdown(
            markdown_text=markdown_text,
            source="policy.md",
        )

        self.assertEqual(2, len(chunks))
        self.assertEqual("서비스 소개", chunks[0].title)
        self.assertEqual("요금제", chunks[1].title)
        self.assertIn("# 구름톡 서비스", chunks[0].content)
        self.assertEqual("policy.md", chunks[0].source)

    def test_rejects_too_small_maximum_size(self) -> None:
        with self.assertRaises(ValueError):
            split_markdown(
                markdown_text="# 제목",
                source="policy.md",
                max_characters=100,
            )


if __name__ == "__main__":
    unittest.main()
