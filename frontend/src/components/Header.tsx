import { useTranslation } from 'react-i18next'
import { useAtom } from 'jotai'
import { useLocation, useNavigate } from 'react-router-dom'

import { type LoginUser } from '../api/user'
import PasswordResetModal from '../pages/users/UserPasswordResetModal'
import UserLoginModal from '../pages/users/UserLoginModal'
import UserRegisterModal from '../pages/users/UserRegisterModal'
import { activeModalAtom } from '../state/uiAtoms'

const navigationItems = [
  { path: '/', label: 'home' },
  { path: '/features', label: 'features' },
  { path: '/plans', label: 'plans' },
  { path: '/help', label: 'help' },
]

type HeaderProps = {
  loginUser: LoginUser | null
  isSessionLoading: boolean
  onLoginSuccess: (loginUser: LoginUser) => void
  onLogout: () => Promise<void>
}

function Header({
  loginUser,
  isSessionLoading,
  onLoginSuccess,
  onLogout,
}: HeaderProps) {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const location = useLocation()
  const [activeModal, setActiveModal] = useAtom(activeModalAtom)

  const handleMenuClick = (item: string) => {
    navigate(item)
  }

  const handleLoginSuccess = (username: string, name: string) => {
    const returnTo = activeModal?.type === 'login'
      ? activeModal.returnTo
      : undefined

    onLoginSuccess({ username, name })
    setActiveModal(null)
    navigate(returnTo ?? '/')
  }

  const handleLogout = async () => {
    await onLogout()
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
            <img className="w-15 h-15 object-contain" src="/images/gureum/GureumAI.png" alt={t('gureumAI')} />
            <span className="text-2xl font-bold tracking-tight text-slate-800">
              Gureum<span className="text-violet-500">Talk</span>
            </span> 
          </button>

          <nav className="hidden items-center gap-12 md:flex">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleMenuClick(item.path)}
                  className={`relative py-4 text-[15px] font-medium transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-500 hover:text-violet-500'
                  }`}
                >
                  {t(item.label)}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-violet-500" />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            {!isSessionLoading && loginUser ? (
              <>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl border border-slate-100 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  {t('logout')}</button>
              </>
            ) : !isSessionLoading ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveModal({ type: 'login' })}
                  className="rounded-2xl border border-slate-100 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  {t('login')}</button>
                <button
                  type="button"
                  onClick={() => setActiveModal({ type: 'register' })}
                  className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
                >
                  {t('register')}</button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {activeModal?.type === 'login' && (
        <UserLoginModal
          onClose={() => setActiveModal(null)}
          onSwitchToRegister={() => setActiveModal({ type: 'register' })}
          onSwitchToPasswordReset={() => setActiveModal({ type: 'password-reset' })}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {activeModal?.type === 'register' && (
        <UserRegisterModal
          onClose={() => setActiveModal(null)}
          onSwitchToLogin={() => setActiveModal({ type: 'login' })}
        />
      )}

      {activeModal?.type === 'password-reset' && (
        <PasswordResetModal
          onClose={() => setActiveModal(null)}
          onSwitchToLogin={() => setActiveModal({ type: 'login' })}
        />
      )}
    </>
  )
}

export default Header
