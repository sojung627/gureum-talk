import { FormEvent, useState } from 'react'

type UserRegisterModalProps = {
  onClose: () => void // 닫힘 버튼
  onSwitchToLogin: () => void // 로그인 글자 버튼
}

function UserRegisterModal({ onClose, onSwitchToLogin }: UserRegisterModalProps) {

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

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

                <h2 className="text-3xl font-bold text-center text-slate-800">
                  회원가입
                </h2>
                <p className="mt-3 text-center text-slate-500">
                  GureumTalk와 함께 따뜻한 대화를 시작해보세요.
                </p>

                {/* 이름 */}
                <div className="mt-4">
                    <label className="mb-1 block text-base font-semibold text-slate-700">
                      이름
                    </label>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="이름을 입력해주세요"
                      className="h-14 w-full rounded-2xl border border-slate-200 pl-5 pr-14 text-sm outline-none transition focus:border-violet-400"
                    />
                     <i className="fa-regular fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   </div>
                </div>

                {/* 전화번호 */}
                <div className="mt-4">
                  <label className="mb-1 block text-base font-semibold text-slate-700">
                    전화번호
                  </label>

                  <div className="mt-3 relative">
                    <input
                      type="text"
                      placeholder="전화번호를 입력해주세요"
                      className="h-14 w-full rounded-2xl border border-slate-200 pl-5 pr-14 text-sm outline-none transition focus:border-violet-400"
                    />
                    <i className="fa-solid fa-phone-flip absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* 아이디 */}
                <div className="mt-4">
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
                      onClick={() => setShowPassword((prev) => ! prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
                    >
                      <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'} />
                    </button>
                  </div>
                </div>

                {/* 비밀번호 확인 */}
                <div className="mt-4">
                  <label className="mb-1 block text-base font-semibold text-slate-700">
                    비밀번호 확인
                  </label>

                  <div className="relative">
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
                </div>

                {/* 이메일 */}
                <div className="mt-4">
                  <label className="mb-1 block text-base font-semibold text-slate-700">
                    이메일
                  </label>

                  <div className="relative">
                    <input
                        type="text"
                        placeholder="이메일을 입력해주세요"
                        className="h-14 w-full rounded-2xl border border-slate-200 pl-5 pr-14 text-sm outline-none transition focus:border-violet-400"
                    />
                    <i className="fa-regular fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  </div>
                </div>

                {/* 동의 체크 박스 */}
                <div>
                    <label className="mt-4 flex items-center gap-3 text-base text-slate-500">
                      <input
                        type="checkbox"
                        className="peer hidden"
                      />

                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-white peer-checked:border-violet-500 peer-checked:bg-violet-500">
                        <i className="fa-solid fa-check text-xs" />
                      </span>

                      <span>
                        <button
                          type="button"
                          className="font-semibold text-violet-500 hover:underline"
                        >
                          이용약관
                        </button>
                        {' '}및{' '}
                        <button
                          type="button"
                          className="font-semibold text-violet-500 hover:underline"
                        >
                          개인정보처리방침
                        </button>
                        에 동의합니다.
                      </span>
                    </label>
                </div>

                {/* 회원가입 버튼 */}
                <div className="mt-6">
                    <button
                        type="button"
                        className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-400 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        회원가입
                    </button>

                    {/* 로그인 이동 */}
                    <div className="mt-5 text-center text-sm text-slate-500">
                      이미 계정이 있으신가요?{' '}
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
            </div>
    );
}
export default UserRegisterModal