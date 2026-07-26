import axios from 'axios'

import apiClient from './axios'


export type ChatRole = 'user' | 'assistant'

export type ChatHistoryMessage = {
  role: ChatRole
  content: string
}

export type EmotionScore = {
  label: string
  score: number
}

export type ChatResponse = {
  answer: string
  model: string
  emotions: EmotionScore[]
  safety_detected: boolean
  chat_room_id: number
  chat_title: string
}

export type ChatRoomSummary = {
  chat_room_id: number
  chat_title: string
  chat_is_pinned: boolean
  chat_pinned_at: string | null
  chat_created_at: string
  chat_updated_at: string
}

export type StoredChatMessage = {
  chat_message_id: number
  role: ChatRole
  content: string
  created_at: string
}

export type ChatServerStatus = 'online' | 'offline'

type ChatErrorResponse = {
  message?: string
  detail?: string
}


function createChatApiError(
  error: unknown,
  fallbackMessage: string,
): Error {
  if (!axios.isAxiosError<ChatErrorResponse>(error)) {
    return new Error(
      fallbackMessage,
      { cause: error },
    )
  }

  const serverMessage =
    error.response?.data?.message
    ?? error.response?.data?.detail

  if (serverMessage) {
    return new Error(
      serverMessage,
      { cause: error },
    )
  }

  if (!error.response) {
    return new Error(
      '백엔드 서버에 연결할 수 없어요. FastAPI 서버가 실행 중인지 확인해 주세요.',
      { cause: error },
    )
  }

  return new Error(
    fallbackMessage,
    { cause: error },
  )
}


export async function getChatServerStatus(): Promise<ChatServerStatus> {
  try {
    await apiClient.get(
      '/',
      {
        timeout: 5_000,
      },
    )
    return 'online'
  } catch {
    return 'offline'
  }
}


export async function sendChatMessage(
  message: string,
  chatRoomId: number | null,
): Promise<ChatResponse> {
  try {
    const response = await apiClient.post<ChatResponse>(
      '/api/ai/chat',
      {
        message,
        chat_room_id: chatRoomId,
      },
    )

    return response.data
  } catch (error: unknown) {
    throw createChatApiError(
      error,
      '구름이의 답변을 받아오지 못했어요.',
    )
  }
}


export async function getChatRooms(): Promise<ChatRoomSummary[]> {
  try {
    const response = await apiClient.get<ChatRoomSummary[]>(
      '/api/ai/rooms',
    )
    return response.data
  } catch (error: unknown) {
    throw createChatApiError(
      error,
      '대화 목록을 불러오지 못했어요.',
    )
  }
}


export async function getChatRoomMessages(
  chatRoomId: number,
): Promise<StoredChatMessage[]> {
  try {
    const response = await apiClient.get<StoredChatMessage[]>(
      `/api/ai/rooms/${chatRoomId}/messages`,
    )
    return response.data
  } catch (error: unknown) {
    throw createChatApiError(
      error,
      '저장된 대화를 불러오지 못했어요.',
    )
  }
}


export async function renameChatRoom(
  chatRoomId: number,
  chatTitle: string,
): Promise<ChatRoomSummary> {
  try {
    const response = await apiClient.patch<ChatRoomSummary>(
      `/api/ai/rooms/${chatRoomId}`,
      {
        chat_title: chatTitle,
      },
    )
    return response.data
  } catch (error: unknown) {
    throw createChatApiError(
      error,
      '대화방 이름을 변경하지 못했어요.',
    )
  }
}


export async function updateChatRoomPin(
  chatRoomId: number,
  chatIsPinned: boolean,
): Promise<ChatRoomSummary> {
  try {
    const response = await apiClient.patch<ChatRoomSummary>(
      `/api/ai/rooms/${chatRoomId}/pin`,
      {
        chat_is_pinned: chatIsPinned,
      },
    )
    return response.data
  } catch (error: unknown) {
    throw createChatApiError(
      error,
      '대화방 고정 상태를 변경하지 못했어요.',
    )
  }
}


export async function deleteChatRoom(
  chatRoomId: number,
): Promise<void> {
  try {
    await apiClient.delete(
      `/api/ai/rooms/${chatRoomId}`,
    )
  } catch (error: unknown) {
    throw createChatApiError(
      error,
      '대화방을 삭제하지 못했어요.',
    )
  }
}
