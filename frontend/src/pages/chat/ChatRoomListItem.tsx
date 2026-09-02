import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { type ChatRoomSummary } from '../../api/chat'


type ChatRoomListItemProps = {
  chatRoom: ChatRoomSummary
  isActive: boolean
  isBusy: boolean
  onSelect: (chatRoomId: number) => void
  onPin: (chatRoom: ChatRoomSummary) => Promise<void>
  onRename: (
    chatRoom: ChatRoomSummary,
    chatTitle: string,
  ) => Promise<void>
  onShare: (chatRoom: ChatRoomSummary) => Promise<void>
  onDelete: (chatRoom: ChatRoomSummary) => void
}


type FloatingMenuPosition = {
  top: number
  left: number
}


function ChatRoomListItem({
  chatRoom,
  isActive,
  isBusy,
  onSelect,
  onPin,
  onRename,
  onShare,
  onDelete,
}: ChatRoomListItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [titleDraft, setTitleDraft] = useState(chatRoom.chat_title)
  const [menuPosition, setMenuPosition] =
    useState<FloatingMenuPosition | null>(null)
  const itemRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const floatingMenuRef = useRef<HTMLDivElement | null>(null)
  const renameInputRef = useRef<HTMLInputElement | null>(null)

  // 대화방 밖을 누르면 펼쳐진 메뉴를 닫는다.
  useEffect(() => {
    const closeMenuOutside = (event: PointerEvent) => {
      const clickedElement = event.target as Node
      const clickedInsideItem =
        itemRef.current?.contains(clickedElement) ?? false
      const clickedInsideFloatingMenu =
        floatingMenuRef.current?.contains(clickedElement) ?? false

      if (!clickedInsideItem && !clickedInsideFloatingMenu) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener(
      'pointerdown',
      closeMenuOutside,
    )

    return () => {
      document.removeEventListener(
        'pointerdown',
        closeMenuOutside,
      )
    }
  }, [])

  // 화면 크기나 스크롤 위치가 바뀌면 기존 좌표의 메뉴를 닫는다.
  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const closeFloatingMenu = () => {
      setIsMenuOpen(false)
    }

    window.addEventListener('resize', closeFloatingMenu)
    window.addEventListener('scroll', closeFloatingMenu, true)

    return () => {
      window.removeEventListener('resize', closeFloatingMenu)
      window.removeEventListener('scroll', closeFloatingMenu, true)
    }
  }, [isMenuOpen])

  // 이름 바꾸기를 시작하면 입력창에 바로 입력할 수 있게 한다.
  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [isRenaming])

  const startRenaming = () => {
    setTitleDraft(chatRoom.chat_title)
    setIsMenuOpen(false)
    setIsRenaming(true)
  }

  const cancelRenaming = () => {
    setTitleDraft(chatRoom.chat_title)
    setIsRenaming(false)
  }

  const saveRenamedTitle = async () => {
    const normalizedTitle = titleDraft.trim()
    if (!normalizedTitle) {
      return
    }

    try {
      await onRename(
        chatRoom,
        normalizedTitle,
      )
      setIsRenaming(false)
    } catch {
      // 부모 화면에 오류가 표시되므로 입력창은 유지해 재시도할 수 있게 한다.
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
      cancelRenaming()
    }
  }

  const toggleFloatingMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
      return
    }

    const menuButtonRectangle =
      menuButtonRef.current?.getBoundingClientRect()

    if (!menuButtonRectangle) {
      return
    }

    const menuWidth = 160
    const menuHeight = 132
    const panelPaddingWidth = 24
    const menuGap = 8
    const viewportPadding = 12
    const rightSidePosition =
      menuButtonRectangle.right
      + panelPaddingWidth
      + menuGap
    const leftSidePosition =
      menuButtonRectangle.left
      - menuWidth
      - panelPaddingWidth
      - menuGap

    const menuLeftPosition =
      rightSidePosition + menuWidth
      <= window.innerWidth - viewportPadding
        ? rightSidePosition
        : Math.max(viewportPadding, leftSidePosition)
    const menuTopPosition = Math.min(
      Math.max(viewportPadding, menuButtonRectangle.top - 6),
      window.innerHeight - menuHeight - viewportPadding,
    )

    setMenuPosition({
      top: menuTopPosition,
      left: menuLeftPosition,
    })
    setIsMenuOpen(true)
  }

  return (
    <>
      <div
        ref={itemRef}
        className="group mb-1"
      >
        <div
          className={`flex min-h-10 items-center gap-1 rounded-xl px-2 transition-colors ${
            isActive
              ? 'bg-violet-100 text-violet-700'
              : 'text-slate-600 hover:bg-violet-50'
          }`}
        >
          {isRenaming ? (
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <input
                ref={renameInputRef}
                type="text"
                value={titleDraft}
                maxLength={150}
                onChange={(event) => {
                  setTitleDraft(event.target.value)
                }}
                onKeyDown={handleRenameKeyDown}
                className="h-8 min-w-0 flex-1 rounded-lg border border-violet-300 bg-white px-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-violet-100"
                aria-label="대화방 이름"
              />
              <button
                type="button"
                onClick={() => {
                  void saveRenamedTitle()
                }}
                disabled={!titleDraft.trim() || isBusy}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-violet-500 hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                aria-label="이름 저장"
              >
                <i className="fa-solid fa-check text-xs" />
              </button>
              <button
                type="button"
                onClick={cancelRenaming}
                disabled={isBusy}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-white"
                aria-label="이름 변경 취소"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  void onPin(chatRoom)
                }}
                disabled={isBusy}
                className={`grid h-7 shrink-0 place-items-center overflow-hidden transition-all duration-150 ${
                  chatRoom.chat_is_pinned
                    ? 'w-7 text-violet-600 opacity-100'
                    : 'w-7 text-slate-400 opacity-100 hover:text-violet-500'
                }`}
                aria-label={
                  chatRoom.chat_is_pinned
                    ? '대화방 고정 해제'
                    : '대화방 맨 위에 고정'
                }
                title={
                  chatRoom.chat_is_pinned
                    ? '고정 해제'
                    : '맨 위에 고정'
                }
              >
                <i className="fa-solid fa-thumbtack text-xs" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelect(chatRoom.chat_room_id)
                }}
                disabled={isBusy}
                className="min-w-0 flex-1 truncate py-2 text-left text-sm font-medium disabled:cursor-wait"
                title={chatRoom.chat_title}
              >
                {chatRoom.chat_title}
              </button>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={toggleFloatingMenu}
                disabled={isBusy}
                className="grid h-7 w-7 shrink-0 place-items-center text-slate-400 opacity-0 transition hover:text-violet-500 group-hover:opacity-100 group-focus-within:opacity-100"
                aria-label="대화방 메뉴"
                aria-expanded={isMenuOpen}
              >
                <i className="fa-solid fa-ellipsis text-xs" />
              </button>
            </>
          )}
        </div>
      </div>

      {isMenuOpen
        && menuPosition
        && createPortal(
          <div
            ref={floatingMenuRef}
            className="fixed z-[100] grid w-40 grid-cols-1 gap-1 rounded-xl border border-violet-100 bg-white p-1.5 shadow-xl"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false)
                void onShare(chatRoom)
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-600 hover:bg-violet-50 hover:text-violet-600"
            >
              <i className="fa-solid fa-share-nodes" />
              공유하기
            </button>
            <button
              type="button"
              onClick={startRenaming}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-600 hover:bg-violet-50 hover:text-violet-600"
            >
              <i className="fa-solid fa-pen" />
              이름 바꾸기
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false)
                onDelete(chatRoom)
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-500 hover:bg-rose-50"
            >
              <i className="fa-solid fa-trash-can" />
              삭제하기
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}


export default ChatRoomListItem
