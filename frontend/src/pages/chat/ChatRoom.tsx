import { translateMessage } from '../../i18n'
import { useTranslation } from 'react-i18next'
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtom, useAtomValue } from 'jotai'
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
import VoiceVisualizer from './VoiceVisualizer'
import { queryKeys } from '../../queries/queryKeys'
import {
  activeChatRoomIdAtom,
  activeModalAtom,
  shortcutsEnabledAtom,
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
  const { t } = useTranslation()

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeChatRoomId, setActiveChatRoomId] = useAtom(
    activeChatRoomIdAtom,
  )
  const [activeModal, setActiveModal] = useAtom(activeModalAtom)
  const shortcutsEnabled = useAtomValue(shortcutsEnabledAtom)
  const [inputMessage, setInputMessage] = useState('')
  const [actionChatRoomId, setActionChatRoomId] =
    useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [isVoiceListening, setIsVoiceListening] = useState(false)

  const nextLocalMessageId = useRef(1)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null)
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
          : t('voiceSettingsFailed'),
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
      label: t('pinned'),
      chatRooms: chatRooms.filter(
        (chatRoom) => chatRoom.chat_is_pinned,
      ),
    },
    {
      label: t('recent'),
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

  const toggleVoiceListening = () => {
    if (updateVoicePreferenceMutation.isPending) {
      return
    }

    setErrorMessage('')
    if (!isVoiceChatOpen) {
      updateVoicePreferenceMutation.mutate(true)
    }
    setIsVoiceListening((currentValue) => !currentValue)
  }

  const closeVoiceChatPanel = () => {
    setIsVoiceListening(false)
    toggleVoiceChatPanel()
  }

  const handleMicrophoneError = useCallback(() => {
    setIsVoiceListening(false)
    setErrorMessage(
      t('microphoneFailed'),
    )
  }, [t])

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

  const startNewChat = useCallback(() => {
    if (isSending || isSessionLoading || !isAuthenticated || actionChatRoomId !== null) {
      return
    }
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
    messageInputRef.current?.focus()
  }, [isSending, isSessionLoading, isAuthenticated, actionChatRoomId,
    setActiveChatRoomId, queryClient, activeModal, setActiveModal, navigate])

  useEffect(() => {
    if (!shortcutsEnabled) {
      return
    }
    const handleNewChatShortcut = (event: KeyboardEvent) => {
      if (
        !event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey
        || event.code !== 'KeyO' || event.isComposing
      ) {
        return
      }
      event.preventDefault()
      if (!event.repeat) {
        startNewChat()
      }
    }
    window.addEventListener('keydown', handleNewChatShortcut)
    return () => window.removeEventListener('keydown', handleNewChatShortcut)
  }, [shortcutsEnabled, startNewChat])

  useEffect(() => {
    const input = messageInputRef.current
    if (input) {
      input.style.height = 'auto'
      input.style.height = `${Math.min(input.scrollHeight, 144)}px`
    }
  }, [inputMessage])

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
    setIsVoiceListening(false)
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
          : t('chatFailed')
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
          : t('pinFailed')
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
      showNotice(t('renamed'))
    } catch (error: unknown) {
      const readableErrorMessage =
        error instanceof Error
          ? error.message
          : t('renameFailed')
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
              ? t('me')
              : t('gureum')
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
          showNotice(t('shareOpened'))
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
      showNotice(t('copied'))
    } catch (error: unknown) {
      const readableErrorMessage =
        error instanceof Error
          ? error.message
          : t('shareFailed')
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
      showNotice(t('deleted'))
    } catch (error: unknown) {
      const readableErrorMessage =
        error instanceof Error
          ? error.message
          : t('deleteFailed')
      setErrorMessage(readableErrorMessage)
    } finally {
      setActionChatRoomId(null)
    }
  }

  const statusInformation = {
    checking: {
      label: t('connecting'),
      dotClassName: 'bg-amber-300',
    },
    online: {
      label: t('connected'),
      dotClassName: 'bg-green-400',
    },
    offline: {
      label: t('disconnected'),
      dotClassName: 'bg-slate-300 dark:bg-slate-600',
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
          ? 'md:grid-cols-[minmax(0,2.65fr)_minmax(0,7fr)_minmax(0,2.65fr)]'
          : 'md:grid-cols-[2.3fr_10fr]'
      }`}>
        <div className="flex flex-col rounded-2xl border border-violet-100 dark:border-violet-400/20 bg-white dark:bg-[#151c35] p-5 shadow-sm md:h-[700px]">
          <div className="flex min-h-0 w-full flex-1 flex-col">
            <button
              type="button"
              onClick={startNewChat}
              title={t(shortcutsEnabled ? 'newChatShortcut' : 'newChat')}
              aria-keyshortcuts={shortcutsEnabled ? 'Control+Shift+O' : undefined}
              disabled={isSending || isSessionLoading || !isAuthenticated || actionChatRoomId !== null}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-400 px-7 font-semibold text-white shadow-xl shadow-violet-200 dark:shadow-violet-950/40 transition hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-plus" />
              {t('newChat')}</button>

            <div className="mt-5 font-semibold">
              {t('conversations')}</div>

            <div className="mt-2 min-h-0 flex-1 overflow-y-auto scrollbar-custom">
              {isRoomListLoading ? (
                <div
                  className="flex h-10 items-center justify-center gap-1"
                  aria-label={t('loadingConversations')}
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

            <div className="mt-3 shrink-0 rounded-2xl bg-violet-100 dark:bg-violet-400/15 p-4 text-center shadow-sm">
              <div className="flex justify-center">
                <img
                  alt={t('gureum')}
                  src="/images/gureum/Gureum_img01.png"
                  className="h-[92px] w-[92px] object-contain"
                />
              </div>
              <p className="text-sm leading-5 text-slate-700 dark:text-slate-200">
                {t('withGureum')}<br />
                {t('spendYourDay')}{' '}
                <i className="fa-solid fa-heart text-violet-500 dark:text-violet-300" />
              </p>
              <button
                type="button"
                className="mt-3 h-9 w-full rounded-xl border border-violet-500 font-bold text-violet-500 dark:text-violet-300"
                onClick={() => navigate('/help')}
              >
                {t('learnMore')}</button>
            </div>
          </div>
        </div>

        <div className="flex min-h-[445px] flex-col rounded-2xl border border-violet-100 dark:border-violet-400/20 bg-white dark:bg-[#151c35] p-4 shadow-sm md:h-[700px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                alt="Gureum AI"
                src="/images/gureum/GureumAI.png"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 dark:text-slate-100">
                  Gureum AI
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-400">
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
          <hr className="-mx-4 mt-3 border-gray-200 dark:border-slate-700/70" />

          <div
            className="scrollbar-custom min-h-0 flex-1 overflow-y-auto px-2 py-4"
            aria-live="polite"
          >
            {messages.length === 0 && !isSending && (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-400 dark:text-slate-400">
                <img
                  alt=""
                  src="/images/gureum/GureumAI.png"
                  className="mb-3 h-16 w-16 rounded-full object-cover opacity-90"
                />
                <p className="font-medium text-gray-400 dark:text-slate-400">
                  {t('chatEmpty')}</p>
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
                        : 'max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md border border-violet-100 dark:border-violet-400/20 bg-violet-50 dark:bg-violet-400/10 px-4 py-2.5 text-sm leading-relaxed text-gray-700 dark:text-slate-200'
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
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-violet-100 dark:border-violet-400/20 bg-violet-50 dark:bg-violet-400/10 px-4 py-3">
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
              className="mb-2 px-2 text-xs text-rose-500 dark:text-rose-300"
              role="alert"
            >
              {translateMessage(displayedErrorMessage)}
            </p>
          )}

          <form
            className="mt-auto"
            onSubmit={handleChatSubmit}
          >
            <div className="flex min-h-[45px] w-full items-center gap-3 rounded-3xl border border-violet-100 dark:border-violet-400/20 py-2 pl-5 pr-2 shadow-sm focus-within:border-violet-300 dark:focus-within:border-violet-400/20">
              <textarea
                ref={messageInputRef}
                rows={1}
                className="min-w-0 flex-1 resize-none bg-transparent leading-6 text-gray-700 dark:text-slate-200 outline-none caret-violet-500 placeholder:text-gray-300 dark:placeholder:text-slate-400 disabled:cursor-not-allowed"
                value={inputMessage}
                onKeyDown={(event) => {
                  if (
                    !shortcutsEnabled || event.key !== 'Enter' || event.shiftKey
                    || event.nativeEvent.isComposing || event.keyCode === 229
                  ) {
                    return
                  }
                  event.preventDefault()
                  if (!event.repeat) {
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                onChange={(event) => {
                  setInputMessage(event.target.value)
                }}
                placeholder={t('chatPlaceholder')}
                disabled={
                  isSending
                  || isSessionLoading
                  || !isAuthenticated
                }
                aria-label={t('chatMessage')}
              />
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleVoiceListening}
                  className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isVoiceListening
                      ? 'bg-violet-500 text-white shadow-sm shadow-violet-300 dark:shadow-violet-950/40'
                      : 'bg-gray-100 dark:bg-[#232d49] text-gray-400 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-300'
                  }`}
                  disabled={
                    isSending
                    || isSessionLoading
                    || !isAuthenticated
                    || updateVoicePreferenceMutation.isPending
                  }
                  aria-label={
                    isVoiceListening
                      ? t('stopVoiceInput')
                      : t('startVoiceInput')
                  }
                  aria-pressed={isVoiceListening}
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
                  aria-label={t('sendMessage')}
                >
                  <i className="fa-solid fa-paper-plane translate-y-[1px] text-[13px]" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {isVoiceChatOpen && (
          <div className="flex flex-col rounded-2xl border border-violet-100 dark:border-violet-400/20 bg-white dark:bg-[#151c35] p-5 shadow-sm md:h-[700px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800 dark:text-slate-100">
                {t('voiceChat')}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeVoiceChatPanel}
                  disabled={updateVoicePreferenceMutation.isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-slate-700/70 transition-colors hover:bg-gray-100 dark:hover:bg-[#232d49] disabled:cursor-wait disabled:opacity-50"
                  aria-label={t('closeVoiceChat')}
                >
                  <i className="fa-solid fa-minus text-gray-400 dark:text-slate-400" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-slate-700/70 transition-colors hover:bg-gray-100 dark:hover:bg-[#232d49]"
                >
                  <i className="fa-solid fa-sliders text-gray-400 dark:text-slate-400" />
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center py-6">
              <VoiceVisualizer
                isListening={isVoiceListening}
                onMicrophoneError={handleMicrophoneError}
              />
            </div>
          </div>
        )}
      </div>

      {pendingDeleteChatRoom && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#151c35] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {t('deleteConversation')}</h2>
            <p className="mt-3 break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t('deleteConfirmation', { title: pendingDeleteChatRoom.chat_title })}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                }}
                disabled={actionChatRoomId !== null}
                className="rounded-xl border border-slate-200 dark:border-slate-700/70 px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1d2542]"
              >
                {t('cancel')}</button>
              <button
                type="button"
                onClick={() => {
                  void confirmDeleteChatRoom()
                }}
                disabled={actionChatRoomId !== null}
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-wait disabled:bg-rose-300"
              >
                {t('delete')}</button>
            </div>
          </div>
        </div>
      )}

      {noticeMessage && (
        <div
          className="fixed bottom-6 left-1/2 z-[1100] -translate-x-1/2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-medium text-white shadow-xl"
          role="status"
        >
          {translateMessage(noticeMessage)}
        </div>
      )}
    </>
  )
}


export default ChatRoom
