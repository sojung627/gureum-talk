# 로그인 안하고 시도한 경우
class AuthenticationRequiredError(Exception):
    def __init__(
            self,
            message: str = "로그인이 필요합니다.",
    ):
        self.message = message

        super().__init__(
            self.message,
        )


class ChatRoomNotFoundError(Exception):
    def __init__(
        self,
        message: str = "대화방을 찾을 수 없습니다.",
    ):
        self.message = message
        super().__init__(self.message)


# AI가 비어 있는 답변을 반환한 경우
class EmptyAIResponseError(Exception):
    def __init__(
        self,
        message: str = "구름이가 답변을 만들지 못했습니다.",
    ):
        self.message = message
        super().__init__(self.message)
