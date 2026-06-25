import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

type ApiResponse = {
  message: string
}

function App() {
  const [message, setMessage] = useState('백엔드 연결 확인 중...')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`)
        }

        return response.json() as Promise<ApiResponse>
      })
      .then((data) => {
        setMessage(data.message)
      })
      .catch((error) => {
        console.error(error)
        setMessage('백엔드 연결 실패')
      })
  }, [])

  return (
    <main className="min-h-screen bg-violet-50 p-10">
      <h1 className="text-5xl font-bold text-violet-600">
        GureumTalk
      </h1>

      <p className="mt-5 text-xl text-slate-700">
        {message}
      </p>
    </main>
  )
}

export default App