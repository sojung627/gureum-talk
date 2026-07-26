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
}

export type ChatServerStatus = 'online' | 'offline'

type ChatErrorResponse = {
  message?: string
  detail?: string
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
  history: ChatHistoryMessage[],
): Promise<ChatResponse> {
  try {
    const response = await apiClient.post<ChatResponse>(
      '/api/ai/chat',
      {
        message,
        history,
      },
    )

    return response.data
  } catch (error: unknown) {
    if (!axios.isAxiosError<ChatErrorResponse>(error)) {
      throw new Error(
        '채팅 요청 중 알 수 없는 오류가 발생했어요.',
        { cause: error },
      )
    }

    const serverMessage =
      error.response?.data?.message
      ?? error.response?.data?.detail

    if (serverMessage) {
      throw new Error(serverMessage, { cause: error })
    }

    if (!error.response) {
      throw new Error(
        '백엔드 서버에 연결할 수 없어요. FastAPI 서버가 실행 중인지 확인해 주세요.',
        { cause: error },
      )
    }

    throw new Error(
      '구름이의 답변을 받아오지 못했어요.',
      { cause: error },
    )
  }
}
