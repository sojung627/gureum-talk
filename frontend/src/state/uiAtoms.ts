import { atom } from 'jotai'

import { type ChatRoomSummary } from '../api/chat'


export type AppModal =
  | { type: 'login' }
  | { type: 'register' }
  | { type: 'password-reset' }
  | { type: 'delete-chat-room'; chatRoom: ChatRoomSummary }
  | null


export const activeChatRoomIdAtom = atom<number | null>(null)

export const activeModalAtom = atom<AppModal>(null)
