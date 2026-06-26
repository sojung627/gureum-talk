import { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'

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

  // 페이지 등록 + 기본 배경 설정
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbfaff] text-slate-800">
      <div className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-64 h-[520px] w-[520px] rounded-full bg-violet-200/40 blur-3xl" />

      <Header />
      <main>
        <HomePage apiMessage={message} />
      </main>
      <Footer />
    </div>
  )
}

export default App