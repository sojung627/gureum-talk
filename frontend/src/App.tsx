import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import Plans from './pages/plans/Plans'
import Features from './pages/features/Features'
import Help from './pages/help/Help'
import ChatRoom from './pages/chat/ChatRoom'

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
    <div
      className="relative min-h-screen overflow-hidden bg-[#fbfaff] bg-cover bg-center bg-no-repeat text-slate-800"
      style={{
        backgroundImage: "url('/images/background/backgroundMain.png')",
      }}
    >
      <Header />
      <main>
         <Routes>
           <Route path="/" element={<HomePage apiMessage={message} />} />
           <Route path="/plans" element={<Plans />} />
           <Route path="/features" element={<Features />} />
           <Route path="/help" element={<Help />} />
           <Route path="/chat" element={<ChatRoom />} />
         </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App