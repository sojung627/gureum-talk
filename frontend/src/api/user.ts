import apiClient from './axios'


export type LoginUser = {
  username: string
  name: string
}

type UserSessionResponse = {
  authenticated: boolean
  username: string | null
  name: string | null
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
