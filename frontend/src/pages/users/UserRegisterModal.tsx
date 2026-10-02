import { translateMessage } from '../../i18n'
import { Trans, useTranslation } from 'react-i18next'
import { useState } from 'react'
import axios from 'axios'
import apiClient from '../../api/axios'

type UserRegisterModalProps = {
  onClose: () => void
  onSwitchToLogin: () => void
}

type RegisterErrorResponse = {
  field?: string
  message?: string
}

function UserRegisterModal({ onClose, onSwitchToLogin }: UserRegisterModalProps) {
  const { t } = useTranslation()

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
    let formatted: string
    if (raw.length <= 3) formatted = raw
    else if (raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`
    else formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`
    setPhone(formatted)
    setPhoneError('')
  }

  const validateUserId = (value: string) => {
    if (value.length === 0) return ''
    if (!/^[a-z0-9]+$/.test(value)) return t('lowercaseNumbersOnly')
    if (value.length < 5) return t('minFive')
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
      setUserIdError(t('usernameRequired'))
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
        setUserIdError(t('usernameTaken'))
        setUserIdChecked(false)
      }
    } catch {
      setUserIdError(t('checkFailed'))
    } finally {
      setCheckingUserId(false)
    }
  }

  const validatePassword = (value: string) => {
    if (value.length === 0) return ''
    if (!/^[a-z0-9]+$/.test(value)) return t('lowercaseNumbersOnly')
    if (value.length < 5 || value.length > 15) return t('lengthFiveFifteen')
    return ''
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').slice(0, 15)
    setPassword(value)
    setPasswordError(validatePassword(value))

    //비밀번호 확인란에 이미 값이 있는 경우, 비밀번호를 다시 칠 때도 실시간으로 일치 여부 재검사
    if (passwordConfirm) {
      setPasswordConfirmError(value !== passwordConfirm ? t('passwordMismatch') : '')
    }
  }

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '')
    setPasswordConfirm(value)

    //비밀번호 확인란 입력 중 실시간으로 비밀번호와 일치하는지 검사
    setPasswordConfirmError(value && value !== password ? t('passwordMismatch') : '')
  }

  const validateEmail = (value: string) => {
    if (value.length === 0) return ''
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return t('invalidEmail')
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

    if (!name.trim()) { setNameError(t('nameRequired')); valid = false }
    if (!phone.trim()) { setPhoneError(t('phoneRequired')); valid = false }
    if (!userId.trim()) { setUserIdError(t('usernameRequired')); valid = false }
    if (!password.trim()) { setPasswordError(t('passwordRequired')); valid = false }
    if (!passwordConfirm.trim()) { setPasswordConfirmError(t('confirmPasswordRequired')); valid = false }
    if (!email.trim()) { setEmailError(t('emailRequired')); valid = false }

    if (userIdError) valid = false
    if (passwordError) valid = false
    if (emailError) valid = false

    if (password && passwordConfirm && password !== passwordConfirm) {
      setPasswordConfirmError(t('passwordMismatch'))
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
    } catch (err: unknown) {
      if (!axios.isAxiosError<RegisterErrorResponse>(err)) {
        setEmailError(t('serverUnavailable'))
        return
      }

      const status = err.response?.status
      const data = err.response?.data

      if (status === 400 && data) {
        const { field, message } = data
        if (!message) {
          setEmailError(t('registrationFailed'))
          return
        }
        if (field === 'name') setNameError(message)
        else if (field === 'username') setUserIdError(message)
        else if (field === 'password') setPasswordError(message)
        else if (field === 'password_confirm') setPasswordConfirmError(message)
        else if (field === 'email') setEmailError(message)
        else if (field === 'phone') setPhoneError(message)
        else setEmailError(message)
        return
      }

      setEmailError(t('serverUnavailable'))
    }
  }

  return (
    <div className="overflow-hidden fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-[520px] rounded-[32px] bg-white dark:bg-[#151c35] p-8 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-custom">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-3xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <i className="fa-solid fa-x"></i>
        </button>

        <div className="flex justify-center">
          <img className="w-25 h-25 object-contain" src="/images/gureum/GureumAI.png" alt={t('gureumAI')} />
        </div>

        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100">{t('register')}</h2>
        <p className="mt-3 text-center text-slate-500 dark:text-slate-400">
          {t('authIntro')}</p>

        {/* 이름 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700 dark:text-slate-200">{t('name')}</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder={t('namePlaceholder')}
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition focus:border-violet-400 ${
                nameError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700/70'
              }`}
            />
            <i className="fa-regular fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {nameError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {translateMessage(nameError)}
            </p>
          )}
        </div>

        {/* 전화번호 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700 dark:text-slate-200">{t('phone')}</label>
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder={t('phonePlaceholder')}
              onChange={handlePhoneChange}
              value={phone}
              maxLength={13}
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition focus:border-violet-400 ${
                phoneError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700/70'
              }`}
            />
            <i className="fa-solid fa-phone-flip absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {phoneError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {translateMessage(phoneError)}
            </p>
          )}
        </div>

        {/* 아이디 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700 dark:text-slate-200">{t('username')}</label>
          <div className="flex gap-3">
            <div className="relative flex-[7.5]">
              <input
                type="text"
                value={userId}
                onChange={handleUserIdChange}
                placeholder={t('usernamePlaceholder')}
                maxLength={15}
                className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition ${
                  userIdError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700/70 focus:border-violet-400'
                }`}
              />
              <i className="fa-regular fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={handleCheckUserId}
              disabled={checkingUserId}
              className="flex-[2.5] h-14 rounded-2xl bg-gradient-to-r from-violet-100 dark:from-violet-500/25 to-indigo-100 dark:to-indigo-500/25 font-semibold text-violet-600 dark:text-violet-300 shadow-sm shadow-violet-100 dark:shadow-black/20 transition hover:-translate-y-0.5 hover:from-violet-600 hover:to-indigo-400 hover:text-white hover:shadow-lg hover:shadow-violet-200 dark:hover:shadow-violet-950/40 whitespace-nowrap disabled:opacity-50"
            >
              {checkingUserId ? t('checking') : t('checkAvailability')}
            </button>
          </div>

          {userIdError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {translateMessage(userIdError)}
            </p>
          )}

          {userIdChecked && !userIdError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-violet-500 dark:text-violet-300">
              <i className="bi bi-check-circle" />
              {t('usernameAvailable')}</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700 dark:text-slate-200">{t('password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
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
          {passwordError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {translateMessage(passwordError)}
            </p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700 dark:text-slate-200">{t('confirmPassword')}</label>
          <div className="relative">
            <input
              type={showPasswordConfirm ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              placeholder={t('confirmPasswordPlaceholder')}
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition focus:border-violet-400 ${
                passwordConfirmError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700/70'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 dark:hover:text-violet-300"
            >
              <i className={showPasswordConfirm ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'} />
            </button>
          </div>
          {passwordConfirmError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {translateMessage(passwordConfirmError)}
            </p>
          )}
        </div>

        {/* 이메일 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700 dark:text-slate-200">{t('email')}</label>
          <div className="relative">
            <input
              type="text"
              value={email}
              onChange={handleEmailChange}
              placeholder={t('emailPlaceholder')}
              className={`h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition ${
                emailError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 dark:border-slate-700/70 focus:border-violet-400'
              }`}
            />
            <i className="fa-regular fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          </div>
          {emailError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" />
              {translateMessage(emailError)}
            </p>
          )}
        </div>

        {/* 동의 체크 박스 */}
        <div>
          <label className="mt-4 flex items-center gap-3 text-base text-slate-500 dark:text-slate-400">
            <input type="checkbox" className="peer hidden" />
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700/70 bg-white dark:bg-[#151c35] text-white dark:text-[#151c35] peer-checked:border-violet-500 peer-checked:bg-violet-500 dark:peer-checked:bg-violet-500 dark:peer-checked:text-white">
              <i className="fa-solid fa-check text-xs" />
            </span>
            <span>
              <Trans i18nKey="consent" components={{
                terms: <button type="button" className="font-semibold text-violet-500 dark:text-violet-300 hover:underline" />,
                privacy: <button type="button" className="font-semibold text-violet-500 dark:text-violet-300 hover:underline" />,
              }} />
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
                ? 'bg-gradient-to-r from-violet-600 to-indigo-400 shadow-violet-200 dark:shadow-violet-950/40 hover:-translate-y-0.5 hover:shadow-xl'
                : 'cursor-not-allowed bg-slate-300 dark:bg-slate-600 shadow-none'
            }`}
          >
            {t('register')}</button>

          <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('alreadyAccount')}{' '}
            <button type="button" onClick={onSwitchToLogin} className="font-semibold text-violet-500 dark:text-violet-300 hover:underline">
              {t('login')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default UserRegisterModal
