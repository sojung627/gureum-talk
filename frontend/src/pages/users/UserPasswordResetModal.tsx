import { translateMessage } from '../../i18n'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import {
  PasswordResetApiError,
  changePasswordWithResetToken,
  requestPasswordResetCode,
  verifyPasswordResetCode,
} from '../../api/user'


type UserPasswordResetModalProps = {
  onClose: () => void
  onSwitchToLogin: () => void
}



function UserPasswordResetModal({
  onClose,
  onSwitchToLogin,
}: UserPasswordResetModalProps) {
  const { t } = useTranslation()
  const PASSWORD_ERROR_MESSAGE = t('passwordRule')

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [requestId, setRequestId] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isVerified, setIsVerified] = useState(false)

  const [usernameError, setUsernameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [identityMessage, setIdentityMessage] = useState('')
  const [identityMessageIsSuccess, setIdentityMessageIsSuccess] =
    useState(false)
  const [verificationCodeError, setVerificationCodeError] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [verificationMessageIsSuccess, setVerificationMessageIsSuccess] =
    useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordConfirmError, setPasswordConfirmError] = useState('')
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('')
  const [passwordChangeSucceeded, setPasswordChangeSucceeded] =
    useState(false)
  const loginRedirectTimerRef = useRef<number | null>(null)

  const sendCodeMutation = useMutation({
    mutationFn: () => requestPasswordResetCode(
      username.trim(),
      phone.trim(),
    ),
    onSuccess: (response) => {
      setRequestId(response.request_id)
      setResetToken('')
      setVerificationCode('')
      setRemainingSeconds(response.expires_in_seconds)
      setIsVerified(false)
      setIdentityMessage(response.message)
      setIdentityMessageIsSuccess(true)
      setVerificationCodeError('')
      setVerificationMessage('')
      setPasswordChangeMessage('')
    },
    onError: (error) => {
      const message = error instanceof PasswordResetApiError
        ? error.message
        : t('codeSendFailed')

      if (
        error instanceof PasswordResetApiError
        && error.field === 'identity'
      ) {
        setUsernameError(' ')
        setPhoneError(' ')
      }
      setIdentityMessage(message)
      setIdentityMessageIsSuccess(false)
    },
  })

  const verifyCodeMutation = useMutation({
    mutationFn: () => verifyPasswordResetCode(
      requestId,
      verificationCode,
    ),
    onSuccess: (response) => {
      setResetToken(response.reset_token)
      setIsVerified(true)
      setRemainingSeconds(0)
      setVerificationCodeError('')
      setVerificationMessage(response.message)
      setVerificationMessageIsSuccess(true)
    },
    onError: (error) => {
      const message = error instanceof PasswordResetApiError
        ? error.message
        : t('verificationFailed')
      setVerificationCodeError(' ')
      setVerificationMessage(message)
      setVerificationMessageIsSuccess(false)
      if (error instanceof PasswordResetApiError && error.field === 'expired') {
        setRemainingSeconds(0)
      }
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: () => changePasswordWithResetToken(
      resetToken,
      password,
      passwordConfirm,
    ),
    onSuccess: (response) => {
      setPasswordError('')
      setPasswordConfirmError('')
      setPasswordChangeMessage(response.message)
      setPasswordChangeSucceeded(true)
      loginRedirectTimerRef.current = window.setTimeout(() => {
        onSwitchToLogin()
      }, 1_200)
    },
    onError: (error) => {
      const message = error instanceof PasswordResetApiError
        ? error.message
        : t('passwordChangeFailed')
      const field = error instanceof PasswordResetApiError
        ? error.field
        : undefined

      if (field === 'password') {
        setPasswordError(message)
      } else if (field === 'password_confirm') {
        setPasswordConfirmError(message)
      } else {
        setPasswordChangeMessage(message)
      }
      setPasswordChangeSucceeded(false)
    },
  })

  useEffect(() => {
    if (remainingSeconds <= 0 || isVerified) {
      return
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => (
        Math.max(0, currentSeconds - 1)
      ))
    }, 1_000)

    return () => window.clearInterval(timer)
  }, [isVerified, remainingSeconds])

  useEffect(() => {
    return () => {
      if (loginRedirectTimerRef.current !== null) {
        window.clearTimeout(loginRedirectTimerRef.current)
      }
    }
  }, [])

  const resetVerificationState = () => {
    if (!requestId) {
      return
    }
    setRequestId('')
    setResetToken('')
    setVerificationCode('')
    setRemainingSeconds(0)
    setIsVerified(false)
    setIdentityMessage('')
    setVerificationCodeError('')
    setVerificationMessage('')
    setPasswordChangeMessage('')
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawPhone = event.target.value.replace(/\D/g, '').slice(0, 11)
    let formattedPhone: string
    if (rawPhone.length <= 3) formattedPhone = rawPhone
    else if (rawPhone.length <= 7) {
      formattedPhone = `${rawPhone.slice(0, 3)}-${rawPhone.slice(3)}`
    } else {
      formattedPhone = `${rawPhone.slice(0, 3)}-${rawPhone.slice(3, 7)}-${rawPhone.slice(7)}`
    }
    setPhone(formattedPhone)
    setPhoneError('')
    setIdentityMessage('')
    resetVerificationState()
  }

  const handleSendCode = () => {
    setUsernameError('')
    setPhoneError('')
    setIdentityMessage('')
    setIdentityMessageIsSuccess(false)

    let isValid = true
    if (!username.trim()) {
      setUsernameError(t('usernameRequired'))
      isValid = false
    }
    if (!phone.trim()) {
      setPhoneError(t('phoneRequired'))
      isValid = false
    }
    if (!isValid) {
      return
    }

    sendCodeMutation.mutate()
  }

  const handleVerificationCodeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setVerificationCode(
      event.target.value.replace(/\D/g, '').slice(0, 6),
    )
    setVerificationCodeError('')
    setVerificationMessage('')
  }

  const handleVerifyCode = () => {
    setVerificationCodeError('')
    setVerificationMessage('')
    setVerificationMessageIsSuccess(false)

    if (!requestId) {
      setVerificationCodeError(t('requestCodeFirst'))
      return
    }
    if (remainingSeconds <= 0) {
      setVerificationCodeError(' ')
      setVerificationMessage(t('codeExpired'))
      return
    }
    if (verificationCode.length !== 6) {
      setVerificationCodeError(t('codeSixRequired'))
      return
    }

    verifyCodeMutation.mutate()
  }

  const validatePassword = (value: string) => {
    if (!value) return ''
    if (!/^(?=.*[a-z])(?=.*\d)[a-z\d]{5,15}$/.test(value)) {
      return PASSWORD_ERROR_MESSAGE
    }
    return ''
  }

  const handlePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value.replace(/\s/g, '').slice(0, 15)
    setPassword(value)
    setPasswordError(validatePassword(value))
    setPasswordChangeMessage('')
    if (passwordConfirm) {
      setPasswordConfirmError(
        value === passwordConfirm ? '' : t('passwordMismatch'),
      )
    }
  }

  const handlePasswordConfirmChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value.replace(/\s/g, '').slice(0, 15)
    setPasswordConfirm(value)
    setPasswordConfirmError(
      value === password ? '' : t('passwordMismatch'),
    )
    setPasswordChangeMessage('')
  }

  const handleChangePassword = () => {
    setPasswordError('')
    setPasswordConfirmError('')
    setPasswordChangeMessage('')
    setPasswordChangeSucceeded(false)

    if (!isVerified || !resetToken) {
      setPasswordChangeMessage(t('verifyIdentityFirst'))
      return
    }

    let isValid = true
    if (!password) {
      setPasswordError(t('passwordRequired'))
      isValid = false
    } else {
      const validationError = validatePassword(password)
      if (validationError) {
        setPasswordError(validationError)
        isValid = false
      }
    }

    if (!passwordConfirm) {
      setPasswordConfirmError(t('confirmPasswordRequired'))
      isValid = false
    } else if (password !== passwordConfirm) {
      setPasswordConfirmError(t('passwordMismatch'))
      isValid = false
    }

    if (!isValid) {
      return
    }

    changePasswordMutation.mutate()
  }

  const formattedRemainingTime = `${Math.floor(remainingSeconds / 60)}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`
  const inputClassName = (hasError: boolean) => (
    `h-14 w-full rounded-2xl border pl-5 pr-14 text-sm outline-none transition ${
      hasError
        ? 'border-red-400 focus:border-red-400'
        : 'border-slate-200 focus:border-violet-400'
    }`
  )

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm">
      <div className="scrollbar-custom relative max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-3xl text-slate-400 hover:text-slate-700"
          aria-label={t('closeResetPassword')}
        >
          <i className="fa-solid fa-x" />
        </button>

        <div className="flex justify-center">
          <img
            className="h-25 w-25 object-contain"
            src="/images/gureum/GureumAI.png"
            alt={t('gureumAI')}
          />
        </div>

        <h2 className="text-center text-3xl font-bold text-slate-800">
          {t('resetPassword')}</h2>
        <p className="mt-3 text-center text-slate-500">
          {t('resetIntro')}</p>

        <div className="mt-6 font-semibold text-violet-500">
          <i className="bi bi-1-circle-fill" /> {t('verifyIdentity')}</div>

        <div className="mt-3">
          <label className="mb-1 block text-base font-semibold text-slate-700">
            {t('username')}</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              disabled={isVerified}
              onChange={(event) => {
                setUsername(event.target.value.replace(/\s/g, '').slice(0, 15))
                setUsernameError('')
                setIdentityMessage('')
                resetVerificationState()
              }}
              placeholder={t('usernamePlaceholder')}
              className={inputClassName(Boolean(usernameError))}
            />
            <i className="fa-regular fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {usernameError.trim() && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" /> {translateMessage(usernameError)}
            </p>
          )}
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-base font-semibold text-slate-700">
            {t('phone')}</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={phone}
              disabled={isVerified}
              onChange={handlePhoneChange}
              maxLength={13}
              placeholder={t('phonePlaceholder')}
              className={inputClassName(Boolean(phoneError))}
            />
            <i className="fa-solid fa-phone-flip absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {phoneError.trim() && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" /> {translateMessage(phoneError)}
            </p>
          )}
        </div>

        {identityMessage && (
          <p className={`mt-2 flex items-center gap-1.5 text-xs ${
            identityMessageIsSuccess ? 'text-emerald-500' : 'text-red-400'
          }`}>
            <i className="bi bi-info-circle" /> {translateMessage(identityMessage)}
          </p>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sendCodeMutation.isPending || isVerified}
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-100 to-indigo-100 font-semibold text-violet-600 shadow-sm shadow-violet-100 transition hover:-translate-y-0.5 hover:from-violet-600 hover:to-indigo-400 hover:text-white hover:shadow-lg hover:shadow-violet-200 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {sendCodeMutation.isPending ? t('sending') : t('getCode')}
          </button>
        </div>

        <div className="my-8 border-t border-dashed border-slate-200" />

        <div className="font-semibold text-violet-500">
          <i className="bi bi-2-circle-fill" /> {t('verifyCode')}</div>

        <div className="mt-3 flex gap-3">
          <div className="relative flex-[7.5]">
            <input
              type="text"
              inputMode="numeric"
              value={verificationCode}
              disabled={isVerified}
              onChange={handleVerificationCodeChange}
              maxLength={6}
              placeholder={t('codePlaceholder')}
              className={inputClassName(Boolean(verificationCodeError))}
            />
            <i className="fa-solid fa-shield-halved absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={verifyCodeMutation.isPending || isVerified}
            className="h-14 flex-[2.5] whitespace-nowrap rounded-2xl bg-gradient-to-r from-violet-100 to-indigo-100 font-semibold text-violet-600 shadow-sm shadow-violet-100 transition hover:-translate-y-0.5 hover:from-violet-600 hover:to-indigo-400 hover:text-white hover:shadow-lg hover:shadow-violet-200 disabled:cursor-wait disabled:opacity-60"
          >
            {verifyCodeMutation.isPending ? t('checking') : t('verify')}
          </button>
        </div>

        {verificationCodeError.trim() && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
            <i className="bi bi-info-circle" /> {translateMessage(verificationCodeError)}
          </p>
        )}
        {verificationMessage && (
          <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${
            verificationMessageIsSuccess ? 'text-emerald-500' : 'text-red-400'
          }`}>
            <i className="bi bi-info-circle" /> {translateMessage(verificationMessage)}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <span>
            <i className="bi bi-info-circle" /> {t('codeValidity')}</span>
          {requestId && !isVerified && (
            <span className={remainingSeconds > 0 ? 'text-violet-500' : 'text-red-400'}>
              {formattedRemainingTime}
            </span>
          )}
        </div>

        <div className="my-8 border-t border-dashed border-slate-200" />

        <div className="font-semibold text-violet-500">
          <i className="bi bi-3-circle-fill" /> {t('setNewPassword')}</div>

        <div className="mt-3">
          <label className="mb-1 block text-base font-semibold text-slate-700">
            {t('newPassword')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              disabled={!isVerified}
              onChange={handlePasswordChange}
              maxLength={15}
              placeholder={t('passwordPlaceholder')}
              className={inputClassName(Boolean(passwordError))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              disabled={!isVerified}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
              aria-label={t('toggleNewPassword')}
            >
              <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'} />
            </button>
          </div>
          {passwordError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" /> {translateMessage(passwordError)}
            </p>
          )}
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-base font-semibold text-slate-700">
            {t('confirmNewPassword')}</label>
          <div className="relative">
            <input
              type={showPasswordConfirm ? 'text' : 'password'}
              value={passwordConfirm}
              disabled={!isVerified}
              onChange={handlePasswordConfirmChange}
              maxLength={15}
              placeholder={t('confirmPasswordPlaceholder')}
              className={inputClassName(Boolean(passwordConfirmError))}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((current) => !current)}
              disabled={!isVerified}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
              aria-label={t('toggleConfirmPassword')}
            >
              <i className={showPasswordConfirm ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'} />
            </button>
          </div>
          {passwordConfirmError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <i className="bi bi-info-circle" /> {translateMessage(passwordConfirmError)}
            </p>
          )}
        </div>

        {passwordChangeMessage && (
          <p className={`mt-2 flex items-center gap-1.5 text-xs ${
            passwordChangeSucceeded ? 'text-emerald-500' : 'text-red-400'
          }`}>
            <i className="bi bi-info-circle" /> {translateMessage(passwordChangeMessage)}
          </p>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={changePasswordMutation.isPending || passwordChangeSucceeded}
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-400 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-60"
          >
            {changePasswordMutation.isPending ? t('changing') : t('changePassword')}
          </button>
        </div>

        <div className="mt-5 text-center text-sm text-slate-500">
          {t('rememberedPassword')}{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-violet-500 hover:underline"
          >
            {t('login')}</button>
        </div>
      </div>
    </div>
  )
}


export default UserPasswordResetModal
