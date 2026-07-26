import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import Plans from './pages/plans/Plans'
import Features from './pages/features/Features'
import Help from './pages/help/Help'
import ChatRoom from './pages/chat/ChatRoom'
import {
  getCurrentUser,
  type LoginUser,
  logoutCurrentUser,
} from './api/user'

function App() {
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const restoreLoginSession = async () => {
      try {
        const sessionUser = await getCurrentUser()

        if (isMounted) {
          setLoginUser(sessionUser)
        }
      } catch (error) {
        console.error('로그인 세션 확인 실패', error)
        if (isMounted) {
          setLoginUser(null)
        }
      } finally {
        if (isMounted) {
          setIsSessionLoading(false)
        }
      }
    }

    void restoreLoginSession()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logoutCurrentUser()
    } finally {
      setLoginUser(null)
    }
  }

  // 페이지 등록 + 기본 배경 설정
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#fbfaff] bg-cover bg-center bg-no-repeat text-slate-800"
      style={{
        backgroundImage: "url('/images/background/backgroundMain.png')",
      }}
    >
      <Header
        loginUser={loginUser}
        isSessionLoading={isSessionLoading}
        onLoginSuccess={setLoginUser}
        onLogout={handleLogout}
      />
      <main>
         <Routes>
           <Route path="/" element={<HomePage />} />
           <Route path="/plans" element={<Plans />} />
           <Route path="/features" element={<Features />} />
           <Route path="/help" element={<Help />} />
           <Route
             path="/chat"
             element={(
               <ChatRoom
                 isAuthenticated={loginUser !== null}
                 isSessionLoading={isSessionLoading}
               />
             )}
           />
         </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
