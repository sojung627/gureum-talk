import { useState } from 'react'
import UserRegisterModal from '../pages/users/UserRegisterModal'
import UserLoginModal from '../pages/users/UserLoginModal'
import PasswordResetModal from '../pages/users/UserPasswordResetModal'
import { useNavigate, useLocation } from 'react-router-dom'

type ModalType = 'login' | 'register' | 'password-reset' | null

const navigationItems = ['홈', '기능', '요금제', '도움말']

//경로 매핑
const PATH_TO_MENU: Record<string, string> = {
  '/': '홈',
  '/plans': '요금제',
  '/features': '기능'
}

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeMenu = PATH_TO_MENU[location.pathname] ?? '홈'
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [loginUser, setLoginUser] = useState<{ username: string; name: string } | null>(null)

    const handleMenuClick = (item: string) => {
      if (item === '기능') navigate('/features')
      if (item === '요금제') navigate('/plans')
      if (item === '홈') navigate('/')
    }

  const handleLoginSuccess = (username: string, name: string) => {
    setLoginUser({ username, name })
    setActiveModal(null)
  }

  const handleLogout = () => {
    setLoginUser(null)
  }

  return (
    <>
      <header className="relative z-50 bg-transparent">
        <div className="mx-auto flex h-24 max-w-[1480px] items-center justify-between px-6 lg:px-12">
          <button
            type="button"
            className="flex items-center gap-3"
            onClick={() => navigate('/')}
          >
            <img className="w-15 h-15 object-contain" src="/images/gureum/GureumAI.png" alt="구름AI" />
            <span className="text-2xl font-bold tracking-tight text-slate-800">
              Gureum<span className="text-violet-500">Talk</span>
            </span>
          </button>

          <nav className="hidden items-center gap-12 md:flex">
            {navigationItems.map((item) => {
              const isActive = activeMenu === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleMenuClick(item)}
                  className={`relative py-4 text-[15px] font-medium transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-500 hover:text-violet-500'
                  }`}
                >
                  {item}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-violet-500" />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            {loginUser ? (
              <>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl border border-slate-100 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveModal('login')}
                  className="rounded-2xl border border-slate-100 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('register')}
                  className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {activeModal === 'login' && (
        <UserLoginModal
          onClose={() => setActiveModal(null)}
          onSwitchToRegister={() => setActiveModal('register')}
          onSwitchToPasswordReset={() => setActiveModal('password-reset')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {activeModal === 'register' && (
        <UserRegisterModal
          onClose={() => setActiveModal(null)}
          onSwitchToLogin={() => setActiveModal('login')}
        />
      )}

      {activeModal === 'password-reset' && (
        <PasswordResetModal
          onClose={() => setActiveModal(null)}
          onSwitchToLogin={() => setActiveModal('login')}
        />
      )}
    </>
  )
}

export default Header