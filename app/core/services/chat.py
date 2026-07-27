import re
from dataclasses import dataclass

from groq import APIConnectionError, APIStatusError, AsyncGroq, RateLimitError

from app.core.config import settings
from app.core.error.exceptions import EmptyAIResponseError
from app.core.prompts.chat import build_system_prompt
from app.core.services.rag import build_knowledge_context, retrieve_service_policy
from app.core.services.safety import SAFETY_RESPONSE, has_safety_risk
from app.ml.gureum import EmotionPrediction, classify_emotions


@dataclass(frozen=True)
class ChatServiceResult:
    answer: str
    emotion_prediction: EmotionPrediction
    safety_detected: bool

# API 키로 비동기 클라이언트 생성
groq_client = AsyncGroq(
    api_key=settings.groq_api_key,
)


# 사용자 질문을 AI에게 전달
async def create_chat_response(
        message: str,
        history: list[dict[str, str]],
) -> ChatServiceResult:
    normalized_message = message.strip()
    emotion_prediction = classify_emotions(normalized_message)

    # 안전 위험 질문 시 경고문
    if has_safety_risk(normalized_message):
        return ChatServiceResult(
            answer=SAFETY_RESPONSE,
            emotion_prediction=emotion_prediction,
            safety_detected=True,
        )

    try:
        retrieved_chunks = retrieve_service_policy(normalized_message)
    except (OSError, RuntimeError, ValueError):
        # 지식베이스가 비어 있거나 잠긴 경우에도 일반 대화는 계속한다.
        retrieved_chunks = []

    knowledge_context = build_knowledge_context(retrieved_chunks)

    request_messages = [
        {
            "role": "system",
            "content": build_system_prompt(
                emotion_prediction=emotion_prediction,
                knowledge_context=knowledge_context,
            ),
        }
    ]

    # 토큰 절약 - 최근 메시지 30개만 전달
    for history_message in history[-30:]:
        request_messages.append(
            {
                "role": history_message["role"],
                "content": history_message["content"],
            }
        )

    # 반복문 밖에서 현재 질문을 한 번만 추가
    request_messages.append(
        {
            "role": "user",
            "content": normalized_message,
        }
    )

    # AI 모델 호출
    chat_completion = await groq_client.chat.completions.create(
        model=settings.groq_model,
        messages=request_messages,
        temperature=0.7,
        max_completion_tokens=512,
        # Qwen 3.6의 생각 모드를 끄고 답변 본문만 생성
        # reasoning_format="hidden"만 사용하면 제한된 출력 토큰을
        # 숨겨진 생각에 모두 사용해 content가 비는 경우가 있음
        reasoning_effort="none",
    )
    answer = chat_completion.choices[0].message.content

    if not answer:
        raise EmptyAIResponseError()

    return ChatServiceResult(
        answer=answer.strip(),
        emotion_prediction=emotion_prediction,
        safety_detected=False,
    )


def create_fallback_chat_title(message: str) -> str:
    """AI 제목 생성에 실패하면 사용자의 첫 질문을 제목으로 사용"""
    normalized_message = " ".join(message.strip().split())
    if len(normalized_message) <= 30:
        return normalized_message

    return f"{normalized_message[:30].rstrip()}…"


def normalize_generated_chat_title(
        generated_title: str,
        fallback_title: str,
) -> str:
    """AI의 생각 태그와 불필요한 표현을 제거하고 제목만 반환"""
    title_without_thinking = re.sub(
        r"<think\b[^>]*>.*?</think>",
        "",
        generated_title,
        flags=re.IGNORECASE | re.DOTALL,
    )
    title_without_tags = re.sub(
        r"</?[^>]+>",
        "",
        title_without_thinking,
    )
    normalized_title = " ".join(
        title_without_tags.strip().strip("\"'“”").split()
    )

    # 생각 태그만 반환됐거나 제목이 비어 있으면 첫 질문을 사용
    if not normalized_title:
        return fallback_title

    # 모델이 지시문 형태로 붙인 접두어는 제목에서 제외
    normalized_title = re.sub(
        r"^(?:제목|대화\s*제목)\s*[:：]\s*",
        "",
        normalized_title,
        flags=re.IGNORECASE,
    ).strip()

    if not normalized_title:
        return fallback_title

    # 대화 목록에서 읽기 쉽도록 제목 길이를 제한
    if len(normalized_title) <= 20:
        return normalized_title

    return f"{normalized_title[:20].rstrip()}…"


async def create_chat_title(message: str) -> str:
    """사용자의 첫 질문을 바탕으로 짧은 제목 생성"""
    fallback_title = create_fallback_chat_title(message)

    try:
        title_completion = await groq_client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "사용자의 첫 메시지에서 핵심 단어나 문장을 뽑아 "
                        "한국어 대화 제목 하나만 만들어. "
                        "20자 이내로 작성하고 따옴표, 마침표, 설명, "
                        "생각 과정, 태그는 절대 출력하지 마."
                    ),
                },
                {
                    "role": "user",
                    "content": message.strip(),
                },
            ],
            temperature=0.2,
            max_completion_tokens=30,
            # 짧은 제목에는 추론이 필요하지 않으므로 생각 모드 끔
            reasoning_effort="none",
        )
    except (APIConnectionError, APIStatusError, RateLimitError):
        return fallback_title

    generated_title = title_completion.choices[0].message.content
    if not generated_title:
        return fallback_title

    return normalize_generated_chat_title(
        generated_title=generated_title,
        fallback_title=fallback_title,
    )
