import { useState } from 'react'
import apiClient from '../../api/axios'

type UserRegisterModalProps = {
  onClose: () => void
  onSwitchToLogin: () => void
}

function UserRegisterModal({ onClose, onSwitchToLogin }: UserRegisterModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [email, setEmail] = useState('')

  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [userIdError, setUserIdError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordConfirmError, setPasswordConfirmError] = useState('')
  const [emailError, setEmailError] = useState('')

  const [userIdChecked, setUserIdChecked] = useState(false)
  const [checkingUserId, setCheckingUserId] = useState(false)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '')
    setName(value)
    setNameError('')
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    let formatted = raw
    if (raw.length <= 3) formatted = raw
    else if (raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`
    else formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`
    setPhone(formatted)
    setPhoneError('')
  }

  const validateUserId = (value: string) => {
    if (value.length === 0) return ''
    if (!/^[a-z0-9]+$/.test(value)) return '영문 소문자와 숫자만 입력해주세요.'
    if (value.length < 5) return '5자 이상 작성해주세요.'
    return ''
  }

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').slice(0, 15)
    setUserId(value)
    setUserIdError(validateUserId(value))
    setUserIdChecked(false)
  }

  const handleCheckUserId = async () => {
    const error = validateUserId(userId)
    if (!userId.trim()) {
      setUserIdError('아이디를 입력해주세요.')
      return
    }
    if (error) {
      setUserIdError(error)
      return
    }

    setCheckingUserId(true)
    try {
      const { data } = await apiClient.get('/api/users/check-username', {
        params: { username: userId },
      })
      if (data.available) {
        setUserIdError('')
        setUserIdChecked(true)
      } else {
        setUserIdError('이미 사용 중인 아이디입니다.')
        setUserIdChecked(false)
      }
    } catch {
      setUserIdError('확인 중 오류가 발생했습니다.')
    } finally {
      setCheckingUserId(false)
    }
  }

  const validatePassword = (value: string) => {
    if (value.length === 0) return ''
    if (!/^[a-z0-9]+$/.test(value)) return '영문 소문자와 숫자만 입력해주세요.'
    if (value.length < 5 || value.length > 15) return '5자 이상 15자 이내로 작성해주세요.'
    return ''
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').slice(0, 15)
    setPassword(value)
    setPasswordError(validatePassword(value))

    //비밀번호 확인란에 이미 값이 있는 경우, 비밀번호를 다시 칠 때도 실시간으로 일치 여부 재검사
    if (passwordConfirm) {
      setPasswordConfirmError(value !== passwordConfirm ? '비밀번호가 일치하지 않습니다.' : '')
    }
  }

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '')
    setPasswordConfirm(value)

    //비밀번호 확인란 입력 중 실시간으로 비밀번호와 일치하는지 검사
    setPasswordConfirmError(value && value !== password ? '비밀번호가 일치하지 않습니다.' : '')
  }

  const validateEmail = (value: string) => {
    if (value.length === 0) return ''
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return '올바른 이메일 형식이 아닙니다.'
    return ''
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '')
    setEmail(value)
    setEmailError(validateEmail(value))
  }

  const isFormValid =
    name.trim() &&
    phone.trim() &&
    userId.trim() &&
    userIdChecked &&
    password.trim() &&
    passwordConfirm.trim() &&
    email.trim() &&
    !userIdError &&
    !passwordError &&
    !passwordConfirmError &&
    !emailError

  const handleRegister = async () => {
    setNameError('')
    setPhoneError('')

    let valid = true

    if (!name.trim()) { setNameError('이름을 입력해주세요.'); valid = false }
    if (!phone.trim()) { setPhoneError('전화번호를 입력해주세요.'); valid = false }
    if (!userId.trim()) { setUserIdError('아이디를 입력해주세요.'); valid = false }
    if (!password.trim()) { setPasswordError('비밀번호를 입력해주세요.'); valid = false }
    if (!passwordConfirm.trim()) { setPasswordConfirmError('비밀번호 확인을 입력해주세요.'); valid = false }
    if (!email.trim()) { setEmailError('이메일을 입력해주세요.'); valid = false }

    if (userIdError) valid = false
    if (passwordError) valid = false
    if (emailError) valid = false

    if (password && passwordConfirm && password !== passwordConfirm) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.')
      valid = false
    }

    if (!valid) return

    try {
      await apiClient.post('/api/users/register', {
        name: name.trim(),
        username: userId.trim(),
        password: password.trim(),
        password_confirm: passwordConfirm.trim(),
        phone: phone.trim(),
        email: email.trim(),
      })

      onSwitchToLogin()
    } catch (err: any) {
      const status = err.response?.status
      const data = err.response?.data

      if (status === 400 && data) {
        const { field, message } = data
        if (field === 'name') setNameError(message)
        else if (field === 'username') setUserIdError(message)
        else if (field === 'password') setPasswordError(message)
        else if (field === 'password_confirm') setPasswordConfirmError(message)
        else if (field === 'email') setEmailError(message)
        else if (field === 'phone') setPhoneError(message)
        else setEmailError(message)
        return
      }

      setEmailError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <div className="overflow-hidden fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-[520px] rounded-[32px] bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-custom">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-3xl text-slate-400 hover:text-slate-700"
        >
          <i className="fa-solid fa-x"></i>
        </button>

        <div className="flex justify-center">
          <img className="w-25 h-25 object-contain" src="/images/gureum/GureumAI.png" alt="구름AI" />
        </div>

        <h2 className="text-3xl font-bold text-center text-slate-800">회원가입</h2>
        <p className="mt-3 text-center text-slate-500">
          GureumTalk와 함께 따뜻한 대화를 시작해보세요.
        </p>

        {/* 이름 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700">이름</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="이름을 입력해주세요"
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition focus:border-violet-400 ${
                nameError ? 'border-red-400 focus:border-red-400' : 'border-slate-200'
              }`}
            />
            <i className="fa-regular fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {nameError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {nameError}
            </p>
          )}
        </div>

        {/* 전화번호 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700">전화번호</label>
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="전화번호를 입력해주세요"
              onChange={handlePhoneChange}
              value={phone}
              maxLength={13}
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition focus:border-violet-400 ${
                phoneError ? 'border-red-400 focus:border-red-400' : 'border-slate-200'
              }`}
            />
            <i className="fa-solid fa-phone-flip absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {phoneError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {phoneError}
            </p>
          )}
        </div>

        {/* 아이디 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700">아이디</label>
          <div className="flex gap-3">
            <div className="relative flex-[7.5]">
              <input
                type="text"
                value={userId}
                onChange={handleUserIdChange}
                placeholder="아이디를 입력해주세요"
                maxLength={15}
                className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition ${
                  userIdError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-violet-400'
                }`}
              />
              <i className="fa-regular fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={handleCheckUserId}
              disabled={checkingUserId}
              className="flex-[2.5] h-14 rounded-2xl bg-gradient-to-r from-violet-100 to-indigo-100 font-semibold text-violet-600 shadow-sm shadow-violet-100 transition hover:-translate-y-0.5 hover:from-violet-600 hover:to-indigo-400 hover:text-white hover:shadow-lg hover:shadow-violet-200 whitespace-nowrap disabled:opacity-50"
            >
              {checkingUserId ? '확인 중...' : '중복 체크'}
            </button>
          </div>

          {userIdError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {userIdError}
            </p>
          )}

          {userIdChecked && !userIdError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-violet-500">
              <i className="bi bi-check-circle" />
              사용 가능한 아이디입니다.
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700">비밀번호</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
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
          {passwordError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {passwordError}
            </p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700">비밀번호 확인</label>
          <div className="relative">
            <input
              type={showPasswordConfirm ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              placeholder="비밀번호를 다시 입력해주세요"
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition focus:border-violet-400 ${
                passwordConfirmError ? 'border-red-400 focus:border-red-400' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
            >
              <i className={showPasswordConfirm ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'} />
            </button>
          </div>
          {passwordConfirmError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {passwordConfirmError}
            </p>
          )}
        </div>

        {/* 이메일 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700">이메일</label>
          <div className="relative">
            <input
              type="text"
              value={email}
              onChange={handleEmailChange}
              placeholder="이메일을 입력해주세요"
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition ${
                emailError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-violet-400'
              }`}
            />
            <i className="fa-regular fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          </div>
          {emailError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {emailError}
            </p>
          )}
        </div>

        {/* 동의 체크 박스 */}
        <div>
          <label className="mt-4 flex items-center gap-3 text-base text-slate-500">
            <input type="checkbox" className="peer hidden" />
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-white peer-checked:border-violet-500 peer-checked:bg-violet-500">
              <i className="fa-solid fa-check text-xs" />
            </span>
            <span>
              <button type="button" className="font-semibold text-violet-500 hover:underline">이용약관</button>
              {' '}및{' '}
              <button type="button" className="font-semibold text-violet-500 hover:underline">개인정보처리방침</button>
              에 동의합니다.
            </span>
          </label>
        </div>

        {/* 회원가입 버튼 */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleRegister}
            disabled={!isFormValid}
            className={`h-14 w-full rounded-2xl font-semibold text-white shadow-lg transition ${
              isFormValid
                ? 'bg-gradient-to-r from-violet-600 to-indigo-400 shadow-violet-200 hover:-translate-y-0.5 hover:shadow-xl'
                : 'cursor-not-allowed bg-slate-300 shadow-none'
            }`}
          >
            회원가입
          </button>

          <div className="mt-5 text-center text-sm text-slate-500">
            이미 계정이 있으신가요?{' '}
            <button type="button" onClick={onSwitchToLogin} className="font-semibold text-violet-500 hover:underline">
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default UserRegisterModal