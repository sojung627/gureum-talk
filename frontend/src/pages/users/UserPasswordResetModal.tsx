import { useState } from 'react'

type UserRegisterModalProps = {
  onClose: () => void // 닫힘 버튼
  onSwitchToLogin: () => void // 로그인 글자 버튼
}

function UserPasswordResetModal({ onClose, onSwitchToLogin }: UserLoginModalProps) {

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

    return(
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

            <h2 className="text-3xl font-bold text-center text-slate-800">
              비밀번호 찾기
            </h2>

            <p className="mt-3 text-center text-slate-500">
              GureumTalk와 함께 안전한 비밀번호를 재설정해보세요.
            </p>

            <div className="mt-6 font-semibold text-violet-500">
              <i className="bi bi-1-circle-fill" /> 본인 확인
            </div>

            {/* 이름 */}
            <div className="mt-3 relative">
             <input
               type="text"
               placeholder="이름을 입력해주세요"
               className="h-14 w-full rounded-2xl border border-slate-200 pl-5 pr-14 text-sm outline-none transition focus:border-violet-400"
             />
               <i className="fa-regular fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
             </div>

            {/* 전화번호 */}
            <div className="mt-3 relative">
              <input
                type="text"
                placeholder="전화번호를 입력해주세요"
                className="h-14 w-full rounded-2xl border border-slate-200 pl-5 pr-14 text-sm outline-none transition focus:border-violet-400"
              />
                <i className="fa-solid fa-phone-flip absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

            <div className="mt-6">
              <button
                type="button"
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-100 to-indigo-100 font-semibold text-violet-600 shadow-sm shadow-violet-100 transition hover:-translate-y-0.5 hover:from-violet-600 hover:to-indigo-400 hover:text-white hover:shadow-lg hover:shadow-violet-200"
              >
                인증번호 받기
              </button>
            </div>

            <div className="my-8 border-t border-dashed border-slate-200" />

            <div className="font-semibold text-violet-500">
              <i className="bi bi-2-circle-fill" /> 인증번호 확인
            </div>

            {/* 인증번호 */}
            <div className="mt-3 flex gap-3">
              <div className="relative flex-[7.5]">
                <input
                  type="text"
                  placeholder="6자리 인증번호를 입력해주세요"
                  className="h-14 w-full rounded-2xl border border-slate-200 pl-5 pr-14 text-sm outline-none transition focus:border-violet-400"
                />
                <i className="fa-solid fa-shield-halved absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="button"
                className="flex-[2.5] h-14 rounded-2xl bg-gradient-to-r from-violet-100 to-indigo-100 font-semibold text-violet-600 shadow-sm shadow-violet-100 transition hover:-translate-y-0.5 hover:from-violet-600 hover:to-indigo-400 hover:text-white hover:shadow-lg hover:shadow-violet-200 whitespace-nowrap"
              >
                인증하기
              </button>
            </div>

            <div className="mt-5 text-sm text-slate-500">
              <i className="bi bi-info-circle" /> 인증번호는 3분간 유효합니다.
            </div>

            <div className="my-8 border-t border-dashed border-slate-200" />

            <div className="font-semibold text-violet-500">
              <i className="bi bi-3-circle-fill" /> 새 비밀번호 설정
            </div>

            {/* 비밀번호 */}
            <div className="mt-3 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력해주세요"
                  className="h-14 w-full rounded-2xl border border-slate-200 pl-5 pr-14 text-sm outline-none transition focus:border-violet-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => ! prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
                >
                  <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'} />
                </button>
            </div>

            {/* 비밀번호 확인 */}
            <div className="mt-3 relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력해주세요"
                className="h-14 w-full rounded-2xl border border-slate-200 pl-5 pr-14 text-sm outline-none transition focus:border-violet-400"
              />

              <button
                type="button"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
              >
                <i className={showPasswordConfirm ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'} />
              </button>
            </div>

            <div className="mt-6">
              <button
                  type="button"
                  className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-400 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                  비밀번호 변경
              </button>
            </div>

            <div className="mt-5 text-center text-sm text-slate-500">
              기억 나셨나요?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-semibold text-violet-500 hover:underline"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
    );
}
export default UserPasswordResetModal