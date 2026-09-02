import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

import { type ChatRoomSummary } from '../../api/chat'


type ChatRoomHeaderMenuProps = {
  chatRoom: ChatRoomSummary | null
  isBusy: boolean
  isVoiceChatOpen: boolean
  isVoicePreferenceUpdating: boolean
  onShare: (chatRoom: ChatRoomSummary) => Promise<void>
  onRename: (
    chatRoom: ChatRoomSummary,
    chatTitle: string,
  ) => Promise<void>
  onToggleVoiceChat: () => void
  onDelete: (chatRoom: ChatRoomSummary) => void
}


function ChatRoomHeaderMenu({
  chatRoom,
  isBusy,
  isVoiceChatOpen,
  isVoicePreferenceUpdating,
  onShare,
  onRename,
  onToggleVoiceChat,
  onDelete,
}: ChatRoomHeaderMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const menuContainerRef = useRef<HTMLDivElement | null>(null)
  const renameInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const closeMenuOutside = (event: PointerEvent) => {
      const clickedElement = event.target as Node
      if (!menuContainerRef.current?.contains(clickedElement)) {
        setIsMenuOpen(false)
        setIsRenaming(false)
      }
    }

    document.addEventListener('pointerdown', closeMenuOutside)
    return () => {
      document.removeEventListener('pointerdown', closeMenuOutside)
    }
  }, [])

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [isRenaming])

  const startRenaming = () => {
    if (!chatRoom) {
      return
    }
    setTitleDraft(chatRoom.chat_title)
    setIsRenaming(true)
  }

  const saveRenamedTitle = async () => {
    const normalizedTitle = titleDraft.trim()
    if (!chatRoom || !normalizedTitle || isBusy) {
      return
    }

    try {
      await onRename(chatRoom, normalizedTitle)
      setIsRenaming(false)
      setIsMenuOpen(false)
    } catch {
      // 상위 채팅 화면에서 오류 문구를 표시하므로 입력 상태를 유지한다.
    }
  }

  const handleRenameKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      void saveRenamedTitle()
    }

    if (event.key === 'Escape') {
      setIsRenaming(false)
    }
  }

  const roomActionClassName =
    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-600 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent'

  return (
    <div ref={menuContainerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsMenuOpen((currentValue) => !currentValue)
          setIsRenaming(false)
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-100"
        aria-label="채팅방 메뉴"
        aria-expanded={isMenuOpen}
      >
        <i className="fa-solid fa-ellipsis text-gray-400" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-violet-100 bg-white p-1.5 shadow-xl">
          {isRenaming && chatRoom ? (
            <div className="p-1.5">
              <label
                htmlFor="active-chat-room-title"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                이름 바꾸기
              </label>
              <input
                id="active-chat-room-title"
                ref={renameInputRef}
                type="text"
                value={titleDraft}
                maxLength={150}
                onChange={(event) => setTitleDraft(event.target.value)}
                onKeyDown={handleRenameKeyDown}
                disabled={isBusy}
                className="h-9 w-full rounded-lg border border-violet-200 px-2 text-sm text-slate-700 outline-none focus:border-violet-400 disabled:cursor-wait"
              />
              <div className="mt-2 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  disabled={isBusy}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => void saveRenamedTitle()}
                  disabled={!titleDraft.trim() || isBusy}
                  className="rounded-lg bg-violet-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:bg-violet-200"
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (chatRoom) {
                    setIsMenuOpen(false)
                    void onShare(chatRoom)
                  }
                }}
                disabled={!chatRoom || isBusy}
                className={roomActionClassName}
              >
                <i className="fa-solid fa-share-nodes w-4" />
                공유하기
              </button>
              <button
                type="button"
                onClick={startRenaming}
                disabled={!chatRoom || isBusy}
                className={roomActionClassName}
              >
                <i className="fa-solid fa-pen w-4" />
                이름 바꾸기
              </button>
              {!isVoiceChatOpen && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleVoiceChat()
                    setIsMenuOpen(false)
                  }}
                  disabled={isVoicePreferenceUpdating}
                  className={roomActionClassName}
                >
                  <i className="fa-solid fa-microphone w-4" />
                  음성 채팅 열기
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (chatRoom) {
                    setIsMenuOpen(false)
                    onDelete(chatRoom)
                  }
                }}
                disabled={!chatRoom || isBusy}
                className={`${roomActionClassName} text-rose-500 hover:bg-rose-50 hover:text-rose-600`}
              >
                <i className="fa-solid fa-trash-can w-4" />
                삭제하기
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}


export default ChatRoomHeaderMenu
