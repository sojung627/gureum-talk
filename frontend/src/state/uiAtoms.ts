import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { type ChatRoomSummary } from '../api/chat'


export type AppModal =
  | { type: 'login'; returnTo?: string }
  | { type: 'register' }
  | { type: 'password-reset' }
  | { type: 'delete-chat-room'; chatRoom: ChatRoomSummary }
  | null


export const activeChatRoomIdAtom = atom<number | null>(null)

export const activeModalAtom = atom<AppModal>(null)

export const darkModeOnAtom = atomWithStorage(
  'gureumtalk.darkModeOn',
  false,
  undefined,
  { getOnInit: true },
)

export const notificationsEnabledAtom = atomWithStorage(
  'gureumtalk.notificationsEnabled',
  true,
  undefined,
  { getOnInit: true },
)

export const shortcutsEnabledAtom = atomWithStorage(
  'gureumtalk.shortcutsEnabled',
  true,
  undefined,
  { getOnInit: true },
)
