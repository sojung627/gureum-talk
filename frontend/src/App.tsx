import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import {
  getCurrentUser,
  type LoginUser,
  logoutCurrentUser,
} from './api/user'
import Footer from './components/Footer'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ChatRoom from './pages/chat/ChatRoom'
import Features from './pages/features/Features'
import Help from './pages/help/Help'
import Plans from './pages/plans/Plans'
import { queryKeys } from './queries/queryKeys'
import {
  activeChatRoomIdAtom,
  activeModalAtom,
} from './state/uiAtoms'


function LoginRequiredRedirect() {
  const setActiveModal = useSetAtom(activeModalAtom)

  useEffect(() => {
    setActiveModal({ type: 'login', returnTo: '/chat' })
  }, [setActiveModal])

  return <Navigate to="/" replace />
}


function App() {
  const queryClient = useQueryClient()
  const setActiveChatRoomId = useSetAtom(activeChatRoomIdAtom)
  const setActiveModal = useSetAtom(activeModalAtom)
  const sessionQuery = useQuery({
    queryKey: queryKeys.session,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60_000,
  })
  const logoutMutation = useMutation({
    mutationFn: logoutCurrentUser,
  })
  const loginUser = sessionQuery.data ?? null
  const isSessionLoading = sessionQuery.isPending

  const handleLoginSuccess = (nextLoginUser: LoginUser) => {
    queryClient.setQueryData(queryKeys.session, nextLoginUser)
    setActiveChatRoomId(null)
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      queryClient.setQueryData(queryKeys.session, null)
      queryClient.removeQueries({ queryKey: queryKeys.chat.all })
      setActiveChatRoomId(null)
      setActiveModal(null)
    }
  }

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
        onLoginSuccess={handleLoginSuccess}
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
            element={isSessionLoading ? null : loginUser ? (
              <ChatRoom
                key={loginUser.username}
                isAuthenticated
                isSessionLoading={false}
              />
            ) : <LoginRequiredRedirect />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}


export default App
