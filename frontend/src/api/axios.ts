import axios from 'axios'

// 로그인 세션
const defaultApiBaseUrl =
  `${window.location.protocol}//${window.location.hostname}:8000`

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL
    ?? defaultApiBaseUrl,
  // 로그인 세션 백엔드에 전달
  withCredentials: true,
  // AI 답변 생성을 기다리기 --> 일반 요청보다 길게 설정
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
