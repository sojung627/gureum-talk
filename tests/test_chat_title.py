import os
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch


# 실제 API 키 없이 제목 정제 기능을 검사한다.
os.environ["GROQ_API_KEY"] = "test-key"

from app.core.services.chat import (
    create_chat_response,
    create_chat_title,
    create_fallback_chat_title,
    normalize_generated_chat_title,
)


class ChatTitleTest(unittest.TestCase):
    def test_removes_thinking_and_uses_generated_title(self) -> None:
        generated_title = (
            "<think>사용자의 질문을 분석한다.</think>"
            "여름철 출근 고민"
        )

        normalized_title = normalize_generated_chat_title(
            generated_title=generated_title,
            fallback_title="내일 출근하기 너무 싫어",
        )

        self.assertEqual("여름철 출근 고민", normalized_title)

    def test_uses_first_question_when_only_thinking_is_returned(self) -> None:
        normalized_title = normalize_generated_chat_title(
            generated_title="<think>제목을 생각하는 중이다.</think>",
            fallback_title="구름톡 사용 방법",
        )

        self.assertEqual("구름톡 사용 방법", normalized_title)

    def test_removes_title_prefix(self) -> None:
        normalized_title = normalize_generated_chat_title(
            generated_title="제목: 감정 분석 결과 활용",
            fallback_title="감정 분석 결과를 어디에 써?",
        )

        self.assertEqual("감정 분석 결과 활용", normalized_title)

    def test_shortens_long_first_question_for_fallback(self) -> None:
        fallback_title = create_fallback_chat_title(
            "사용자의 첫 질문이 아주 길어서 제목 목록을 넘어가는 경우를 확인해줘"
        )

        self.assertLessEqual(len(fallback_title), 31)
        self.assertTrue(fallback_title.endswith("…"))


class ChatTitleRequestTest(unittest.IsolatedAsyncioTestCase):
    async def test_disables_reasoning_when_generating_title(self) -> None:
        title_completion = SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content="구름 이동 속도",
                    )
                )
            ]
        )

        with patch(
                "app.core.services.chat.groq_client.chat.completions.create",
                new=AsyncMock(return_value=title_completion),
        ) as mocked_create:
            title = await create_chat_title(
                "구름의 이동속도는 시속 몇 미터야?"
            )

        self.assertEqual("구름 이동 속도", title)

        request_options = mocked_create.await_args.kwargs
        self.assertEqual("none", request_options["reasoning_effort"])
        self.assertNotIn("reasoning_format", request_options)


class ChatResponseRequestTest(unittest.IsolatedAsyncioTestCase):
    async def test_disables_reasoning_when_generating_answer(self) -> None:
        chat_completion = SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content="구름의 이동 속도는 바람에 따라 달라져."
                    )
                )
            ]
        )
        emotion_prediction = SimpleNamespace(emotions=[])

        with (
            patch(
                "app.core.services.chat.classify_emotions",
                return_value=emotion_prediction,
            ),
            patch(
                "app.core.services.chat.has_safety_risk",
                return_value=False,
            ),
            patch(
                "app.core.services.chat.groq_client.chat.completions.create",
                new=AsyncMock(return_value=chat_completion),
            ) as mocked_create,
        ):
            result = await create_chat_response(
                message="구름의 이동속도는 시속 몇 미터야?",
                history=[],
            )

        self.assertEqual(
            "구름의 이동 속도는 바람에 따라 달라져.",
            result.answer,
        )

        request_options = mocked_create.await_args.kwargs
        self.assertEqual("none", request_options["reasoning_effort"])
        self.assertNotIn("reasoning_format", request_options)


if __name__ == "__main__":
    unittest.main()
