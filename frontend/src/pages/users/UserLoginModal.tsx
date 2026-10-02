import { translateMessage } from '../../i18n'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import apiClient from '../../api/axios'

type UserLoginModalProps = {
  onClose: () => void
  onSwitchToRegister: () => void
  onSwitchToPasswordReset: () => void
  onLoginSuccess: (username: string, name: string) => void
}

type LoginErrorResponse = {
  remaining_seconds?: number
  attempt_count?: number
}

const SAVED_ID_KEY = 'gureum_saved_id'

function UserLoginModal({
  onClose,
  onSwitchToRegister,
  onSwitchToPasswordReset,
  onLoginSuccess,
}: UserLoginModalProps) {
  const { t } = useTranslation()

  const savedId = localStorage.getItem(SAVED_ID_KEY) ?? ''

  const [username, setUsername] = useState(savedId)
  const [password, setPassword] = useState('')
  const [saveId, setSaveId] = useState(!!savedId)
  const [showPassword, setShowPassword] = useState(false)

  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loginError, setLoginError] = useState('')

  const [locked, setLocked] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [lockExpired, setLockExpired] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [attemptCount, setAttemptCount] = useState(0)

  useEffect(() => {
    if (!locked) return

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setLocked(false)
          setLockExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current!)
  }, [locked])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return t('remainingTime', { minutes: m, seconds: String(s).padStart(2, '0') })
  }

  const handleLogin = async () => {
    setAttemptCount(0)
    setUsernameError('')
    setPasswordError('')
    setLoginError('')
    setLockExpired(false)

    let valid = true
    if (!username.trim()) {
      setUsernameError(t('usernameRequired'))
      valid = false
    }
    if (!password.trim()) {
      setPasswordError(t('passwordRequired'))
      valid = false
    }
    if (!valid) return

    try {
      const { data } = await apiClient.post('/api/users/login', {
        username: username.trim(),
        password: password.trim(),
      })

      if (saveId) {
        localStorage.setItem(SAVED_ID_KEY, username.trim())
      } else {
        localStorage.removeItem(SAVED_ID_KEY)
      }

      onLoginSuccess(data.username, data.name)
      onClose()
    } catch (err: unknown) {
      if (!axios.isAxiosError<LoginErrorResponse>(err)) {
        setLoginError(t('serverUnavailable'))
        return
      }

      const status = err.response?.status
      const data = err.response?.data

      if (status === 423 && data?.remaining_seconds !== undefined) {
        setLocked(true)
        setLockExpired(false)
        setRemainingSeconds(data.remaining_seconds)
        return
      }

      if (status === 401) {
        setUsernameError(' ')
        setPasswordError(' ')
        setAttemptCount(data?.attempt_count ?? 0)
        setLoginError(t('invalidCredentials'))
        return
      }

      setLoginError(t('serverUnavailable'))
    }
  }

  const isLoginDisabled = locked && remainingSeconds > 0

  return (
    <div className="overflow-hidden fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-[520px] rounded-[32px] bg-white dark:bg-[#151c35] p-8 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-custom">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-3xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <i className="fa-solid fa-x" />
        </button>

        <div className="flex justify-center">
          <img className="w-25 h-25 object-contain" src="/images/gureum/GureumAI.png" alt={t('gureumAI')} />
        </div>

        <h2 className="text-center text-3xl font-bold text-slate-800 dark:text-slate-100">{t('login')}</h2>

        <p className="mt-3 text-center text-slate-500 dark:text-slate-400">
          {t('authIntro')}</p>

        {/* 아이디 */}
        <div className="mt-8">
          <label className="mb-1 block text-base font-semibold text-slate-700 dark:text-slate-200">{t('username')}</label>

          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameError('')
                setLoginError('')
              }}
              placeholder={t('usernamePlaceholder')}
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition focus:border-violet-400 ${
                usernameError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700/70'
              }`}
            />
            <i className="fa-regular fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {usernameError && usernameError.trim() && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {translateMessage(usernameError)}
            </p>
          )}

          <div className="regular mt-2">
            <label className="group flex cursor-pointer items-center gap-3 text-base text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                className="peer hidden"
                checked={saveId}
                onChange={(e) => setSaveId(e.target.checked)}
              />
              <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700/70 transition peer-checked:border-violet-500 peer-checked:bg-violet-500">
                <i className="fa-solid fa-check text-xs text-white opacity-0 transition group-has-[:checked]:opacity-100" />
              </div>
              <span>{t('rememberUsername')}</span>
            </label>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700 dark:text-slate-200">{t('password')}</label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError('')
                setLoginError('')
              }}
              placeholder={t('passwordPlaceholder')}
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition focus:border-violet-400 ${
                passwordError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700/70'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 dark:hover:text-violet-300"
            >
              <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'} />
            </button>
          </div>

          {passwordError && passwordError.trim() && !loginError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {translateMessage(passwordError)}
            </p>
          )}

          {loginError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {translateMessage(loginError)}{' '}
              <span className="font-semibold">({attemptCount} / 5)</span>
            </p>
          )}

          {locked && remainingSeconds > 0 && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {t('loginLockNotice', { time: formatTime(remainingSeconds) })}
            </p>
          )}

          {lockExpired && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
              <i className="bi bi-info-circle" />
              {t('loginUnlocked')}</p>
          )}
        </div>

        {/* 로그인 버튼 */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoginDisabled}
            className={`h-14 w-full rounded-2xl font-semibold text-white shadow-lg transition ${
              isLoginDisabled
                ? 'cursor-not-allowed bg-slate-300 dark:bg-slate-600 shadow-none'
                : 'bg-gradient-to-r from-violet-600 to-indigo-400 shadow-violet-200 dark:shadow-violet-950/40 hover:-translate-y-0.5 hover:shadow-xl'
            }`}
          >
            {t('login')}</button>

          <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('noAccount')}{' '}
            <button type="button" onClick={onSwitchToRegister} className="font-semibold text-violet-500 dark:text-violet-300 hover:underline">
              {t('register')}</button>
          </div>
          <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('forgotPassword')}{' '}
            <button type="button" onClick={onSwitchToPasswordReset} className="font-semibold text-violet-500 dark:text-violet-300 hover:underline">
              {t('resetPassword')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLoginModal
