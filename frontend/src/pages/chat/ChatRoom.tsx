import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  type ChatServerStatus,
  type ChatHistoryMessage,
  getChatServerStatus,
  sendChatMessage,
} from '../../api/chat'


type DisplayMessage = ChatHistoryMessage & {
  id: number
}

type ChatRoomProps = {
  isAuthenticated: boolean
  isSessionLoading: boolean
}

function ChatRoom({
  isAuthenticated,
  isSessionLoading,
}: ChatRoomProps) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [serverStatus, setServerStatus] =
    useState<ChatServerStatus | 'checking'>('checking')
  const nextMessageId = useRef(1)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // 고정 문구가 아니라 실제 백엔드 연결 결과로 상태를 표시한다.
  useEffect(() => {
    let isMounted = true

    const updateServerStatus = async () => {
      const currentStatus = await getChatServerStatus()
      if (isMounted) {
        setServerStatus(currentStatus)
      }
    }

    void updateServerStatus()
    const statusCheckTimer = window.setInterval(
      updateServerStatus,
      30_000,
    )

    return () => {
      isMounted = false
      window.clearInterval(statusCheckTimer)
    }
  }, [])

  // 새 메시지가 추가되면 가장 최근 대화가 보이도록 이동한다.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, isSending])

  const createDisplayMessage = (
    role: ChatHistoryMessage['role'],
    content: string,
  ): DisplayMessage => {
    const newMessage = {
      id: nextMessageId.current,
      role,
      content,
    }
    nextMessageId.current += 1

    return newMessage
  }

  const startNewChat = () => {
    setMessages([])
    setInputMessage('')
    setErrorMessage('')
    navigate('/chat')
  }

  const handleChatSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const trimmedMessage = inputMessage.trim()
    if (
      !trimmedMessage
      || isSending
      || isSessionLoading
      || !isAuthenticated
    ) {
      return
    }

    // 현재 질문을 제외한 기존 대화만 history로 전달한다.
    const requestHistory = messages
      .map(({ role, content }) => ({
        role,
        content,
      }))
      .slice(-30)

    const userMessage = createDisplayMessage(
      'user',
      trimmedMessage,
    )
    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ])
    setInputMessage('')
    setErrorMessage('')
    setIsSending(true)

    try {
      const chatResponse = await sendChatMessage(
        trimmedMessage,
        requestHistory,
      )
      const assistantMessage = createDisplayMessage(
        'assistant',
        chatResponse.answer,
      )
      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ])
      setServerStatus('online')
    } catch (error: unknown) {
      const readableErrorMessage =
        error instanceof Error
          ? error.message
          : '채팅 요청 중 오류가 발생했어요.'
      setErrorMessage(readableErrorMessage)
      const currentStatus = await getChatServerStatus()
      setServerStatus(currentStatus)
    } finally {
      setIsSending(false)
    }
  }

  const statusInformation = {
    checking: {
      label: '연결 확인 중',
      dotClassName: 'bg-amber-300',
    },
    online: {
      label: '연결됨',
      dotClassName: 'bg-green-400',
    },
    offline: {
      label: '연결 끊김',
      dotClassName: 'bg-slate-300',
    },
  }[serverStatus]

  return (
    <div className="mt-12 grid grid-cols-1 items-stretch gap-6 px-6 md:grid-cols-9 lg:px-24 max-w-[1480px] mx-auto">
      <div className="md:col-span-2 md:h-[496px] rounded-2xl bg-white border border-violet-100 shadow-sm p-5">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={startNewChat}
            className="w-full h-[40px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-400 px-7 py-4 font-semibold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-plus" />
            새 대화
          </button>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="font-semibold">
            대화 목록
          </span>
        </div>
        <div>
          제목 리스트들 출력 예정
        </div>
        <div className="text-center rounded-2xl bg-violet-100 shadow-sm p-5">
          <div className="flex justify-center items-center">
            <img
              alt="구름이"
              src="/images/gureum/Gureum_img01.png"
              className="w-[150px] h-[150px] object-contain"
            />
          </div>
          구름이와 함께 <br />
          하루를 보내세요{' '}
          <i className="fa-solid fa-heart text-violet-500" />
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              className="w-full h-[40px] font-bold border border-violet-500 text-violet-500 rounded-xl"
              onClick={() => navigate('/help')}
            >
              더 알아보기
            </button>
          </div>
        </div>
      </div>

      <div className="md:col-span-5 md:h-[496px] min-h-[445px] flex flex-col rounded-2xl bg-white border border-violet-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              alt="Gureum AI"
              src="/images/gureum/GureumAI.png"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">
                Gureum AI
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span
                  className={`w-2 h-2 rounded-full ${statusInformation.dotClassName}`}
                />
                {statusInformation.label}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
          >
            <i className="fa-solid fa-ellipsis text-gray-400" />
          </button>
        </div>
        <hr className="border-gray-200 mt-3 -mx-4" />

        <div
          className="scrollbar-custom min-h-0 flex-1 overflow-y-auto px-2 py-4"
          aria-live="polite"
        >
          {messages.length === 0 && !isSending && (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-400">
              <img
                alt=""
                src="/images/gureum/GureumAI.png"
                className="mb-3 h-16 w-16 rounded-full object-cover opacity-90"
              />
              <p className="font-medium text-gray-400">
                구름이에게 마음을 전달해보세요.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {messages.map((chatMessage) => (
              <div
                key={chatMessage.id}
                className={
                  chatMessage.role === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }
              >
                <div
                  className={
                    chatMessage.role === 'user'
                      ? 'max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm'
                      : 'max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md border border-violet-100 bg-violet-50 px-4 py-2.5 text-sm leading-relaxed text-gray-700'
                  }
                >
                  {chatMessage.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-violet-100 bg-violet-50 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:240ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {errorMessage && (
          <p
            className="mb-2 px-2 text-xs text-rose-500"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <form
          className="mt-auto"
          onSubmit={handleChatSubmit}
        >
          <div className="flex items-center gap-3 w-full h-[45px] pl-5 pr-2 border border-violet-100 rounded-full shadow-sm focus-within:border-violet-300">
            <input
              className="flex-1 outline-none caret-violet-500 bg-transparent text-gray-700 placeholder:text-gray-300"
              type="text"
              value={inputMessage}
              onChange={(event) => {
                setInputMessage(event.target.value)
              }}
              placeholder="구름이에게 연락해보세요..."
              disabled={
                isSending
                || isSessionLoading
                || !isAuthenticated
              }
              aria-label="채팅 메시지"
            />
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
                disabled
                title="음성 입력은 다음 단계에서 연결할 예정이에요"
                aria-label="음성 입력 준비 중"
              >
                <i className="fa-solid fa-microphone text-[12px]" />
              </button>
              <button
                type="submit"
                className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
                disabled={
                  !inputMessage.trim()
                  || isSending
                  || isSessionLoading
                  || !isAuthenticated
                }
                aria-label="메시지 전송"
              >
                <i className="fa-solid fa-paper-plane text-[13px] translate-y-[1px]" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="md:col-span-2 md:h-[496px] rounded-2xl bg-white border border-violet-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">
            음성 채팅
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
            >
              <i className="fa-solid fa-minus text-gray-400" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
            >
              <i className="fa-solid fa-sliders text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatRoom
