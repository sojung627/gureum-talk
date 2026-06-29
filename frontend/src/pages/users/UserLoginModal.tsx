import { useEffect, useRef, useState } from 'react'
import apiClient from '../../api/axios'

type UserLoginModalProps = {
  onClose: () => void
  onSwitchToRegister: () => void
  onSwitchToPasswordReset: () => void
  onLoginSuccess: (username: string, name: string) => void
}

const SAVED_ID_KEY = 'gureum_saved_id'

function UserLoginModal({
  onClose,
  onSwitchToRegister,
  onSwitchToPasswordReset,
  onLoginSuccess,
}: UserLoginModalProps) {
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
    if (!locked || remainingSeconds <= 0) return

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
    return `${m}분 ${String(s).padStart(2, '0')}초`
  }

  const handleLogin = async () => {
    setAttemptCount(0)
    setUsernameError('')
    setPasswordError('')
    setLoginError('')
    setLockExpired(false)

    let valid = true
    if (!username.trim()) {
      setUsernameError('아이디를 입력해주세요.')
      valid = false
    }
    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요.')
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
    } catch (err: any) {
      const status = err.response?.status
      const data = err.response?.data

      if (status === 423) {
        setLocked(true)
        setLockExpired(false)
        setRemainingSeconds(data.remaining_seconds)
        return
      }

      if (status === 401) {
        setUsernameError(' ')
        setPasswordError(' ')
        setAttemptCount(data.attempt_count)
        setLoginError('아이디 혹은 비밀번호가 올바르지 않습니다.')
        return
      }

      setLoginError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const isLoginDisabled = locked && remainingSeconds > 0

  return (
    <div className="overflow-hidden fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-[520px] rounded-[32px] bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-custom">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-3xl text-slate-400 hover:text-slate-700"
        >
          <i className="fa-solid fa-x" />
        </button>

        <div className="flex justify-center">
          <img className="w-25 h-25 object-contain" src="/images/gureum/GureumAI.png" alt="구름AI" />
        </div>

        <h2 className="text-center text-3xl font-bold text-slate-800">로그인</h2>

        <p className="mt-3 text-center text-slate-500">
          GureumTalk와 함께 따뜻한 대화를 시작해보세요.
        </p>

        {/* 아이디 */}
        <div className="mt-8">
          <label className="mb-1 block text-base font-semibold text-slate-700">아이디</label>

          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameError('')
                setLoginError('')
              }}
              placeholder="아이디를 입력해주세요"
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition focus:border-violet-400 ${
                usernameError ? 'border-red-400 focus:border-red-400' : 'border-slate-200'
              }`}
            />
            <i className="fa-regular fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {usernameError && usernameError.trim() && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {usernameError}
            </p>
          )}

          <div className="regular mt-2">
            <label className="group flex cursor-pointer items-center gap-3 text-base text-slate-500">
              <input
                type="checkbox"
                className="peer hidden"
                checked={saveId}
                onChange={(e) => setSaveId(e.target.checked)}
              />
              <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 transition peer-checked:border-violet-500 peer-checked:bg-violet-500">
                <i className="fa-solid fa-check text-xs text-white opacity-0 transition group-has-[:checked]:opacity-100" />
              </div>
              <span>아이디 저장</span>
            </label>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700">비밀번호</label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError('')
                setLoginError('')
              }}
              placeholder="비밀번호를 입력해주세요"
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition focus:border-violet-400 ${
                passwordError ? 'border-red-400 focus:border-red-400' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
            >
              <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'} />
            </button>
          </div>

          {passwordError && passwordError.trim() && !loginError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {passwordError}
            </p>
          )}

          {loginError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {loginError}{' '}
              <span className="font-semibold">({attemptCount} / 5)</span>
            </p>
          )}

          {locked && remainingSeconds > 0 && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              로그인이 잠겼습니다. {formatTime(remainingSeconds)} 후 다시 시도해주세요.
            </p>
          )}

          {lockExpired && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
              <i className="bi bi-info-circle" />
              로그인할 수 있습니다.
            </p>
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
                ? 'cursor-not-allowed bg-slate-300 shadow-none'
                : 'bg-gradient-to-r from-violet-600 to-indigo-400 shadow-violet-200 hover:-translate-y-0.5 hover:shadow-xl'
            }`}
          >
            로그인
          </button>

          <div className="mt-5 text-center text-sm text-slate-500">
            아직 계정이 없으신가요?{' '}
            <button type="button" onClick={onSwitchToRegister} className="font-semibold text-violet-500 hover:underline">
              회원가입
            </button>
          </div>
          <div className="mt-5 text-center text-sm text-slate-500">
            비밀번호를 잊으셨나요?{' '}
            <button type="button" onClick={onSwitchToPasswordReset} className="font-semibold text-violet-500 hover:underline">
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLoginModal