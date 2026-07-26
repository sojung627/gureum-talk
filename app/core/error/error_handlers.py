from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from groq import APIConnectionError, APIStatusError, RateLimitError
from app.core.error.exceptions import (
    AuthenticationRequiredError,
    ChatRoomNotFoundError,
    EmptyAIResponseError,
)


# 애플리케이션과 Groq 관련 오류 처리
def register_error_handlers(app: FastAPI) -> None:
    # 비로그인자가 로그인 필요한 곳에 접근 시
    @app.exception_handler(AuthenticationRequiredError)
    async def handle_authentication_required_error(
            request: Request,
            error: AuthenticationRequiredError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "message": error.message,
            },
        )

    @app.exception_handler(ChatRoomNotFoundError)
    async def handle_chat_room_not_found_error(
        request: Request,
        error: ChatRoomNotFoundError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "message": error.message,
            },
        )

    # AI가 빈 답변을 반환한 경우
    @app.exception_handler(EmptyAIResponseError)
    async def handle_empty_ai_response_error(
        request: Request,
        error: EmptyAIResponseError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "message": error.message,
            },
        )

    # 무료 사용 초과 시
    @app.exception_handler(RateLimitError)
    async def handle_rate_limit_error(
            request: Request,
            error: RateLimitError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "message": "무료 한도를 초과하였습니다. 결제하여 구름이와 다시 대화 하시겠습니까?",
            },
        )

    # Groq 서버 연결 실패 시
    @app.exception_handler(APIConnectionError)
    async def handler_api_connection_error(
        request: Request,
        error: APIConnectionError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "message": "AI 서버에 연결할 수 없습니다."
            },
        )

    # Groq API 오류 반환 시
    @app.exception_handler(APIStatusError)
    async def handle_api_status_error(
            request: Request,
            error: APIStatusError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "message": "AI 서버에서 답변을 생성하지 못했습니다.",
            },
        )
