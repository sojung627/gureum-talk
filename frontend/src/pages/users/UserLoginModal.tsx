import { useState } from 'react'

type UserLoginModalProps = {
  onClose: () => void // 닫힘 버튼
  onSwitchToRegister: () => void // 로그인 글자 버튼
  onSwitchToPasswordReset: () => void // 비밀번호 글자 버튼
}

function UserLoginModal({ onClose, onSwitchToRegister, onSwitchToPasswordReset }: UserLoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)

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
          <img
            className="w-25 h-25 object-contain"
            src="/images/gureum/GureumAI.png"
            alt="구름AI"
          />
        </div>

        <h2 className="text-center text-3xl font-bold text-slate-800">
          로그인
        </h2>

        <p className="mt-3 text-center text-slate-500">
          GureumTalk와 함께 따뜻한 대화를 시작해보세요.
        </p>

        {/* 아이디 */}
        <div className="mt-8">
          <label className="mb-1 block text-base font-semibold text-slate-700">
            아이디
          </label>

          <div className="relative">
            <input
              type="text"
              placeholder="아이디를 입력해주세요"
              className="h-14 w-full rounded-2xl border border-slate-200 pl-5 pr-14 text-sm outline-none transition focus:border-violet-400"
            />

            <i className="fa-regular fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="regular mt-2">
            <label className="group flex cursor-pointer items-center gap-3 text-base text-slate-500">
              <input
                type="checkbox"
                className="peer hidden"
              />

              <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 transition peer-checked:border-violet-500 peer-checked:bg-violet-500">
                <i className="fa-solid fa-check text-xs text-white opacity-0 transition group-has-[:checked]:opacity-100"></i>
              </div>

              <span>아이디 저장</span>
            </label>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="mt-4">
          <label className="mb-1 block text-base font-semibold text-slate-700">
            비밀번호
          </label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력해주세요"
              className="h-14 w-full rounded-2xl border border-slate-200 pl-5 pr-14 text-sm outline-none transition focus:border-violet-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
            >
              <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'} />
            </button>
          </div>
        </div>

        {/* 로그인 버튼 */}
        <div className="mt-6">
          <button
            type="button"
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-400 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            로그인
          </button>

          {/* 회원가입 / 비밀번호 이동 */}
          <div className="mt-5 text-center text-sm text-slate-500">
            아직 계정이 없으신가요?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-violet-500 hover:underline"
            >
              회원가입
            </button>
          </div>
          <div className="mt-5 text-center text-sm text-slate-500">
            비밀번호를 잊으셨나요?{' '}
            <button
              type="button"
              onClick={onSwitchToPasswordReset}
              className="font-semibold text-violet-500 hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLoginModal