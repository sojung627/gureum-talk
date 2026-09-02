import apiClient from './axios'
import axios from 'axios'


export type LoginUser = {
  username: string
  name: string
}

type UserSessionResponse = {
  authenticated: boolean
  username: string | null
  name: string | null
}

type PasswordResetErrorResponse = {
  message?: string
  field?: string
  retry_after_seconds?: number
}

export type PasswordResetCodeSentResponse = {
  message: string
  request_id: string
  expires_in_seconds: number
}

export type PasswordResetCodeVerifiedResponse = {
  message: string
  reset_token: string
}

export type PasswordResetResponse = {
  message: string
}


export class PasswordResetApiError extends Error {
  status?: number
  field?: string
  retryAfterSeconds?: number

  constructor(
    message: string,
    options?: {
      status?: number
      field?: string
      retryAfterSeconds?: number
      cause?: unknown
    },
  ) {
    super(message, { cause: options?.cause })
    this.name = 'PasswordResetApiError'
    this.status = options?.status
    this.field = options?.field
    this.retryAfterSeconds = options?.retryAfterSeconds
  }
}


function createPasswordResetApiError(
  error: unknown,
  fallbackMessage: string,
): PasswordResetApiError {
  if (!axios.isAxiosError<PasswordResetErrorResponse>(error)) {
    return new PasswordResetApiError(fallbackMessage, { cause: error })
  }

  return new PasswordResetApiError(
    error.response?.data?.message ?? fallbackMessage,
    {
      status: error.response?.status,
      field: error.response?.data?.field,
      retryAfterSeconds: error.response?.data?.retry_after_seconds,
      cause: error,
    },
  )
}


export async function getCurrentUser(): Promise<LoginUser | null> {
  const response = await apiClient.get<UserSessionResponse>(
    '/api/users/session',
  )
  const sessionUser = response.data

  if (
    !sessionUser.authenticated
    || !sessionUser.username
    || !sessionUser.name
  ) {
    return null
  }

  return {
    username: sessionUser.username,
    name: sessionUser.name,
  }
}


export async function logoutCurrentUser(): Promise<void> {
  await apiClient.post('/api/users/logout')
}


export async function requestPasswordResetCode(
  username: string,
  phone: string,
): Promise<PasswordResetCodeSentResponse> {
  try {
    const response = await apiClient.post<PasswordResetCodeSentResponse>(
      '/api/users/password-reset/code',
      { username, phone },
    )
    return response.data
  } catch (error: unknown) {
    throw createPasswordResetApiError(
      error,
      '인증번호를 발송할 수 없습니다.',
    )
  }
}


export async function verifyPasswordResetCode(
  requestId: string,
  code: string,
): Promise<PasswordResetCodeVerifiedResponse> {
  try {
    const response = await apiClient.post<PasswordResetCodeVerifiedResponse>(
      '/api/users/password-reset/verify',
      { request_id: requestId, code },
    )
    return response.data
  } catch (error: unknown) {
    throw createPasswordResetApiError(
      error,
      '인증에 실패하였습니다.',
    )
  }
}


export async function changePasswordWithResetToken(
  resetToken: string,
  password: string,
  passwordConfirm: string,
): Promise<PasswordResetResponse> {
  try {
    const response = await apiClient.post<PasswordResetResponse>(
      '/api/users/password-reset',
      {
        reset_token: resetToken,
        password,
        password_confirm: passwordConfirm,
      },
    )
    return response.data
  } catch (error: unknown) {
    throw createPasswordResetApiError(
      error,
      '비밀번호 변경에 실패하였습니다.',
    )
  }
}
