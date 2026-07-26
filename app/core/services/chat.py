from dataclasses import dataclass

from groq import APIConnectionError, APIStatusError, AsyncGroq, RateLimitError

from app.core.config import settings
from app.core.error.exceptions import EmptyAIResponseError
from app.core.prompts.chat import build_system_prompt
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

    request_messages = [
        {
            "role": "system",
            "content": build_system_prompt(emotion_prediction),
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

    # 반복문 밖에서 현재 질문을 한 번만 추가한다.
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
        reasoning_format="hidden",
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
    """제목 생성"""
    normalized_message = " ".join(message.strip().split())
    if len(normalized_message) <= 30:
        return normalized_message

    return f"{normalized_message[:30].rstrip()}…"


async def create_chat_title(message: str) -> str:
    """첫 대화 바탕으로 짧은 제목 생성"""
    fallback_title = create_fallback_chat_title(message)

    try:
        title_completion = await groq_client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "사용자의 첫 메시지를 바탕으로 한국어 대화 제목을 만들어. "
                        "핵심 주제만 담아 20자 이내로 작성하고 따옴표, 마침표, 설명은 출력하지마."
                    ),
                },
                {
                    "role": "user",
                    "content": message.strip(),
                },
            ],
            temperature=0.2,
            max_completion_tokens=30,
        )
    except (APIConnectionError, APIStatusError, RateLimitError):
        return fallback_title

    generated_title = title_completion.choices[0].message.content
    if not generated_title:
        return fallback_title

    normalized_title = " ".join(
        generated_title.strip().strip("\"'“”").split()
    )
    if not normalized_title:
        return fallback_title

    return normalized_title[:150]
