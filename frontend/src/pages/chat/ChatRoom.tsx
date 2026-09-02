import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'

import {
  type ChatHistoryMessage,
  type ChatRoomSummary,
  type ChatServerStatus,
  deleteChatRoom,
  getChatRoomMessages,
  getChatRooms,
  getChatServerStatus,
  renameChatRoom,
  sendChatMessage,
  updateChatRoomPin,
} from '../../api/chat'
import {
  getUserPreferences,
  updateVoiceChatPanelPreference,
  type UserPreferences,
} from '../../api/user'
import ChatRoomHeaderMenu from './ChatRoomHeaderMenu'
import ChatRoomListItem from './ChatRoomListItem'
import { queryKeys } from '../../queries/queryKeys'
import {
  activeChatRoomIdAtom,
  activeModalAtom,
} from '../../state/uiAtoms'
// md를 위해 추가
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


type DisplayMessage = ChatHistoryMessage & {
  id: string
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
  const queryClient = useQueryClient()
  const [activeChatRoomId, setActiveChatRoomId] = useAtom(
    activeChatRoomIdAtom,
  )
  const [activeModal, setActiveModal] = useAtom(activeModalAtom)
  const [inputMessage, setInputMessage] = useState('')
  const [actionChatRoomId, setActionChatRoomId] =
    useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [noticeMessage, setNoticeMessage] = useState('')

  const nextLocalMessageId = useRef(1)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const noticeTimerRef = useRef<number | null>(null)

  const serverStatusQuery = useQuery({
    queryKey: queryKeys.chat.status,
    queryFn: getChatServerStatus,
    refetchInterval: 30_000,
  })
  const chatRoomsQuery = useQuery({
    queryKey: queryKeys.chat.rooms,
    queryFn: getChatRooms,
    enabled: isAuthenticated && !isSessionLoading,
  })
  const userPreferencesQuery = useQuery({
    queryKey: queryKeys.userPreferences,
    queryFn: getUserPreferences,
    enabled: isAuthenticated && !isSessionLoading,
    retry: false,
  })
  const messagesQuery = useQuery({
    queryKey: queryKeys.chat.messages(activeChatRoomId),
    queryFn: async (): Promise<DisplayMessage[]> => {
      const storedMessages = await getChatRoomMessages(
        activeChatRoomId as number,
      )
      return storedMessages.map((storedMessage) => ({
        id: `stored-${storedMessage.chat_message_id}`,
        role: storedMessage.role,
        content: storedMessage.content,
      }))
    },
    enabled: (
      activeChatRoomId !== null
      && isAuthenticated
      && !isSessionLoading
    ),
    initialData: [],
  })
  const sendMessageMutation = useMutation({
    mutationFn: ({
      message,
      chatRoomId,
    }: {
      message: string
      chatRoomId: number | null
    }) => sendChatMessage(message, chatRoomId),
  })
  const pinChatRoomMutation = useMutation({
    mutationFn: ({
      chatRoomId,
      chatIsPinned,
    }: {
      chatRoomId: number
      chatIsPinned: boolean
    }) => updateChatRoomPin(chatRoomId, chatIsPinned),
  })
  const renameChatRoomMutation = useMutation({
    mutationFn: ({
      chatRoomId,
      chatTitle,
    }: {
      chatRoomId: number
      chatTitle: string
    }) => renameChatRoom(chatRoomId, chatTitle),
  })
  const deleteChatRoomMutation = useMutation({
    mutationFn: deleteChatRoom,
  })
  const updateVoicePreferenceMutation = useMutation({
    mutationFn: updateVoiceChatPanelPreference,
    onMutate: async (voiceChatPanelOpen: boolean) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.userPreferences,
      })
      const previousPreferences =
        queryClient.getQueryData<UserPreferences>(
          queryKeys.userPreferences,
        )
      queryClient.setQueryData<UserPreferences>(
        queryKeys.userPreferences,
        { voice_chat_panel_open: voiceChatPanelOpen },
      )
      return { previousPreferences }
    },
    onError: (error, _voiceChatPanelOpen, context) => {
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          queryKeys.userPreferences,
          context.previousPreferences,
        )
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '음성 채팅 설정을 저장하지 못했어요.',
      )
    },
    onSuccess: (preferences) => {
      queryClient.setQueryData(
        queryKeys.userPreferences,
        preferences,
      )
    },
  })

  const chatRooms = chatRoomsQuery.data ?? []
  const chatRoomSections = [
    {
      label: '고정됨',
      chatRooms: chatRooms.filter(
        (chatRoom) => chatRoom.chat_is_pinned,
      ),
    },
    {
      label: '최근',
      chatRooms: chatRooms.filter(
        (chatRoom) => !chatRoom.chat_is_pinned,
      ),
    },
  ].filter((section) => section.chatRooms.length > 0)
  const messages = messagesQuery.data
  const isVoiceChatOpen =
    userPreferencesQuery.data?.voice_chat_panel_open ?? true
  const activeChatRoom = activeChatRoomId === null
    ? null
    : chatRooms.find(
      (chatRoom) => chatRoom.chat_room_id === activeChatRoomId,
    ) ?? null
  const isSending = sendMessageMutation.isPending
  const isRoomListLoading = (
    isAuthenticated
    && !isSessionLoading
    && chatRoomsQuery.isPending
  )
  const loadingChatRoomId = messagesQuery.isFetching
    ? activeChatRoomId
    : null
  const pendingDeleteChatRoom =
    activeModal?.type === 'delete-chat-room'
      ? activeModal.chatRoom
      : null
  const serverStatus: ChatServerStatus | 'checking' =
    serverStatusQuery.data ?? 'checking'

  const toggleVoiceChatPanel = () => {
    if (updateVoicePreferenceMutation.isPending) {
      return
    }
    setErrorMessage('')
    updateVoicePreferenceMutation.mutate(!isVoiceChatOpen)
  }

  const showNotice = useCallback((message: string) => {
    setNoticeMessage(message)

    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current)
    }

    noticeTimerRef.current = window.setTimeout(() => {
      setNoticeMessage('')
      noticeTimerRef.current = null
    }, 2_500)
  }, [])

  // 컴포넌트가 사라질 때 안내 문구 타이머를 함께 정리한다.
  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current)
      }
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
    const displayMessage = {
      id: `local-${nextLocalMessageId.current}`,
      role,
      content,
    }
    nextLocalMessageId.current += 1
    return displayMessage
  }

  const startNewChat = () => {
    setActiveChatRoomId(null)
    queryClient.setQueryData<DisplayMessage[]>(
      queryKeys.chat.messages(null),
      [],
    )
    setInputMessage('')
    setErrorMessage('')
    if (activeModal?.type === 'delete-chat-room') {
      setActiveModal(null)
    }
    navigate('/chat')
  }

  const selectChatRoom = (chatRoomId: number) => {
    if (
      isSending
      || loadingChatRoomId !== null
      || actionChatRoomId !== null
    ) {
      return
    }

    setErrorMessage('')
    setActiveChatRoomId(chatRoomId)
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

    const userMessage = createDisplayMessage(
      'user',
      trimmedMessage,
    )
    const sourceChatRoomId = activeChatRoomId
    const sourceMessageKey = queryKeys.chat.messages(sourceChatRoomId)
    queryClient.setQueryData<DisplayMessage[]>(
      sourceMessageKey,
      (currentMessages = []) => [...currentMessages, userMessage],
    )
    setInputMessage('')
    setErrorMessage('')

    try {
      const chatResponse = await sendMessageMutation.mutateAsync({
        message: trimmedMessage,
        chatRoomId: sourceChatRoomId,
      })
      const assistantMessage = createDisplayMessage(
        'assistant',
        chatResponse.answer,
      )
      const completedMessages = [
        ...(queryClient.getQueryData<DisplayMessage[]>(sourceMessageKey) ?? []),
        assistantMessage,
      ]
      queryClient.setQueryData(sourceMessageKey, completedMessages)
      queryClient.setQueryData(
        queryKeys.chat.messages(chatResponse.chat_room_id),
        completedMessages,
      )
      setActiveChatRoomId(chatResponse.chat_room_id)
      queryClient.setQueryData(queryKeys.chat.status, 'online')

      // 첫 대화에서 생성된 AI 제목과 최근 대화 순서를 목록에 반영한다.
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chat.rooms,
      })
    } catch (error: unknown) {
      const readableErrorMessage =
        error instanceof Error
          ? error.message
          : '채팅 요청 중 오류가 발생했어요.'
      setErrorMessage(readableErrorMessage)
      await serverStatusQuery.refetch()
    }
  }

  const changeChatRoomPin = async (
    chatRoom: ChatRoomSummary,
  ) => {
    setActionChatRoomId(chatRoom.chat_room_id)
    setErrorMessage('')

    try {
      await pinChatRoomMutation.mutateAsync({
        chatRoomId: chatRoom.chat_room_id,
        chatIsPinned: !chatRoom.chat_is_pinned,
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chat.rooms,
      })
    } catch (error: unknown) {
      const readableErrorMessage =
        error instanceof Error
          ? error.message
          : '대화방 고정 상태를 변경하지 못했어요.'
      setErrorMessage(readableErrorMessage)
    } finally {
      setActionChatRoomId(null)
    }
  }

  const changeChatRoomTitle = async (
    chatRoom: ChatRoomSummary,
    chatTitle: string,
  ) => {
    setActionChatRoomId(chatRoom.chat_room_id)
    setErrorMessage('')

    try {
      await renameChatRoomMutation.mutateAsync({
        chatRoomId: chatRoom.chat_room_id,
        chatTitle,
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chat.rooms,
      })
      showNotice('대화방 이름을 변경했어요.')
    } catch (error: unknown) {
      const readableErrorMessage =
        error instanceof Error
          ? error.message
          : '대화방 이름을 변경하지 못했어요.'
      setErrorMessage(readableErrorMessage)
      throw error
    } finally {
      setActionChatRoomId(null)
    }
  }

  const copyTextToClipboard = async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }

    const temporaryTextArea = document.createElement('textarea')
    temporaryTextArea.value = text
    temporaryTextArea.style.position = 'fixed'
    temporaryTextArea.style.opacity = '0'
    document.body.appendChild(temporaryTextArea)
    temporaryTextArea.focus()
    temporaryTextArea.select()
    document.execCommand('copy')
    temporaryTextArea.remove()
  }

  const shareChatRoom = async (
    chatRoom: ChatRoomSummary,
  ) => {
    setActionChatRoomId(chatRoom.chat_room_id)
    setErrorMessage('')

    try {
      const storedMessages = await queryClient.fetchQuery({
        queryKey: queryKeys.chat.shareMessages(chatRoom.chat_room_id),
        queryFn: () => getChatRoomMessages(chatRoom.chat_room_id),
        staleTime: 0,
      })
      const conversationText = storedMessages
        .map((storedMessage) => {
          const speakerName =
            storedMessage.role === 'user'
              ? '나'
              : '구름이'
          return `${speakerName}: ${storedMessage.content}`
        })
        .join('\n\n')
      const shareText = `${chatRoom.chat_title}\n\n${conversationText}`

      if (navigator.share) {
        try {
          await navigator.share({
            title: chatRoom.chat_title,
            text: shareText,
          })
          showNotice('공유 창을 열었어요.')
          return
        } catch (shareError: unknown) {
          if (
            shareError instanceof DOMException
            && shareError.name === 'AbortError'
          ) {
            return
          }
        }
      }

      await copyTextToClipboard(shareText)
      showNotice('대화 내용을 클립보드에 복사했어요.')
    } catch (error: unknown) {
      const readableErrorMessage =
        error instanceof Error
          ? error.message
          : '대화 내용을 공유하지 못했어요.'
      setErrorMessage(readableErrorMessage)
    } finally {
      setActionChatRoomId(null)
    }
  }

  const confirmDeleteChatRoom = async () => {
    if (pendingDeleteChatRoom === null) {
      return
    }

    const chatRoomId = pendingDeleteChatRoom.chat_room_id
    setActionChatRoomId(chatRoomId)
    setErrorMessage('')

    try {
      await deleteChatRoomMutation.mutateAsync(chatRoomId)

      if (activeChatRoomId === chatRoomId) {
        setActiveChatRoomId(null)
        queryClient.setQueryData<DisplayMessage[]>(
          queryKeys.chat.messages(null),
          [],
        )
        setInputMessage('')
      }

      queryClient.removeQueries({
        queryKey: queryKeys.chat.messages(chatRoomId),
      })
      setActiveModal(null)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chat.rooms,
      })
      showNotice('대화방을 삭제했어요.')
    } catch (error: unknown) {
      const readableErrorMessage =
        error instanceof Error
          ? error.message
          : '대화방을 삭제하지 못했어요.'
      setErrorMessage(readableErrorMessage)
    } finally {
      setActionChatRoomId(null)
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
  const queryError = chatRoomsQuery.error
    ?? messagesQuery.error
    ?? userPreferencesQuery.error
  const displayedErrorMessage = errorMessage || (
    queryError instanceof Error ? queryError.message : ''
  )

  return (
    <>
      <div className={`mx-auto mt-12 grid max-w-[1480px] grid-cols-1 items-stretch gap-6 px-6 lg:px-12 ${
        isVoiceChatOpen
          ? 'md:grid-cols-[2.3fr_7fr_3fr]'
          : 'md:grid-cols-[2.3fr_10fr]'
      }`}>
        <div className="flex flex-col rounded-2xl border border-violet-100 bg-white p-5 shadow-sm md:h-[700px]">
          <div className="flex min-h-0 w-full flex-1 flex-col">
            <button
              type="button"
              onClick={startNewChat}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-400 px-7 font-semibold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-plus" />
              새 대화
            </button>

            <div className="mt-5 font-semibold">
              대화 목록
            </div>

            <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-custom">
              {isRoomListLoading ? (
                <div
                  className="flex h-10 items-center justify-center gap-1"
                  aria-label="대화 목록 불러오는 중"
                >
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:240ms]" />
                </div>
              ) : chatRoomSections.map((section, sectionIndex) => (
                <section
                  key={section.label}
                  className={sectionIndex === 0 ? '' : 'mt-3'}
                  aria-label={section.label}
                >
                  <h2 className="mb-1 px-2 text-xs font-semibold text-slate-400">
                    {section.label}
                  </h2>
                  {section.chatRooms.map((chatRoom) => (
                    <ChatRoomListItem
                      key={chatRoom.chat_room_id}
                      chatRoom={chatRoom}
                      isActive={
                        activeChatRoomId
                        === chatRoom.chat_room_id
                      }
                      isBusy={
                        isSending
                        || loadingChatRoomId !== null
                        || actionChatRoomId
                          === chatRoom.chat_room_id
                      }
                      onSelect={(chatRoomId) => {
                        void selectChatRoom(chatRoomId)
                      }}
                      onPin={changeChatRoomPin}
                      onRename={changeChatRoomTitle}
                      onShare={shareChatRoom}
                      onDelete={(chatRoom) => {
                        setActiveModal({
                          type: 'delete-chat-room',
                          chatRoom,
                        })
                      }}
                    />
                  ))}
                </section>
              ))}
            </div>

            <div className="mt-3 shrink-0 rounded-2xl bg-violet-100 p-4 text-center shadow-sm">
              <div className="flex justify-center">
                <img
                  alt="구름이"
                  src="/images/gureum/Gureum_img01.png"
                  className="h-[92px] w-[92px] object-contain"
                />
              </div>
              <p className="text-sm leading-5 text-slate-700">
                구름이와 함께
                <br />
                하루를 보내세요{' '}
                <i className="fa-solid fa-heart text-violet-500" />
              </p>
              <button
                type="button"
                className="mt-3 h-9 w-full rounded-xl border border-violet-500 font-bold text-violet-500"
                onClick={() => navigate('/help')}
              >
                더 알아보기
              </button>
            </div>
          </div>
        </div>

        <div className="flex min-h-[445px] flex-col rounded-2xl border border-violet-100 bg-white p-4 shadow-sm md:h-[700px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                alt="Gureum AI"
                src="/images/gureum/GureumAI.png"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">
                  Gureum AI
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span
                    className={`h-2 w-2 rounded-full ${statusInformation.dotClassName}`}
                  />
                  {statusInformation.label}
                </div>
              </div>
            </div>
            <ChatRoomHeaderMenu
              chatRoom={activeChatRoom}
              isBusy={actionChatRoomId !== null || isSending}
              isVoiceChatOpen={isVoiceChatOpen}
              isVoicePreferenceUpdating={
                updateVoicePreferenceMutation.isPending
              }
              onShare={shareChatRoom}
              onRename={changeChatRoomTitle}
              onToggleVoiceChat={toggleVoiceChatPanel}
              onDelete={(chatRoom) => {
                setActiveModal({
                  type: 'delete-chat-room',
                  chatRoom,
                })
              }}
            />
          </div>
          <hr className="-mx-4 mt-3 border-gray-200" />

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
                    {chatMessage.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {chatMessage.content}
                      </ReactMarkdown>
                    ) : (
                      chatMessage.content  
                    )}
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

          {displayedErrorMessage && (
            <p
              className="mb-2 px-2 text-xs text-rose-500"
              role="alert"
            >
              {displayedErrorMessage}
            </p>
          )}

          <form
            className="mt-auto"
            onSubmit={handleChatSubmit}
          >
            <div className="flex h-[45px] w-full items-center gap-3 rounded-full border border-violet-100 pl-5 pr-2 shadow-sm focus-within:border-violet-300">
              <input
                className="flex-1 bg-transparent text-gray-700 outline-none caret-violet-500 placeholder:text-gray-300 disabled:cursor-not-allowed"
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
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    isSending
                    || isSessionLoading
                    || !isAuthenticated
                  }
                  aria-label="음성 입력"
                >
                  <i className="fa-solid fa-microphone text-[12px]" />
                </button>
                <button
                  type="submit"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
                  disabled={
                    !inputMessage.trim()
                    || isSending
                    || isSessionLoading
                    || !isAuthenticated
                  }
                  aria-label="메시지 전송"
                >
                  <i className="fa-solid fa-paper-plane translate-y-[1px] text-[13px]" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {isVoiceChatOpen && (
          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm md:h-[700px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                음성 채팅
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleVoiceChatPanel}
                  disabled={updateVoicePreferenceMutation.isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-50"
                  aria-label="음성 채팅 닫기"
                >
                  <i className="fa-solid fa-minus text-gray-400" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-100"
                >
                  <i className="fa-solid fa-sliders text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {pendingDeleteChatRoom && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800">
              대화방 삭제
            </h2>
            <p className="mt-3 break-words text-sm leading-6 text-slate-500">
              ‘{pendingDeleteChatRoom.chat_title}’ 대화방과
              저장된 메시지를 모두 삭제할까요?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                }}
                disabled={actionChatRoomId !== null}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  void confirmDeleteChatRoom()
                }}
                disabled={actionChatRoomId !== null}
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-wait disabled:bg-rose-300"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {noticeMessage && (
        <div
          className="fixed bottom-6 left-1/2 z-[1100] -translate-x-1/2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-medium text-white shadow-xl"
          role="status"
        >
          {noticeMessage}
        </div>
      )}
    </>
  )
}


export default ChatRoom
