import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ChatAvatar({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-200 via-indigo-200 to-violet-500 shadow-[0_6px_18px_rgba(124,103,255,0.22)] ${
        small ? 'h-9 w-9' : 'h-14 w-14'
      }`}
    >
      <div
        className={`absolute rounded-full bg-white ${
          small ? 'bottom-2 h-4 w-6' : 'bottom-3 h-6 w-9'
        }`}
      >
        <span
          className={`absolute rounded-full bg-violet-500 ${
            small
              ? 'left-[7px] top-[7px] h-1 w-1'
              : 'left-[10px] top-[10px] h-1.5 w-1.5'
          }`}
        />
        <span
          className={`absolute rounded-full bg-violet-500 ${
            small
              ? 'right-[7px] top-[7px] h-1 w-1'
              : 'right-[10px] top-[10px] h-1.5 w-1.5'
          }`}
        />
      </div>
    </div>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h7" />
      <path d="M15 7h5" />
      <circle cx="13" cy="7" r="2" />
      <path d="M4 17h4" />
      <path d="M12 17h8" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  )
}

function SmileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 10h.01" />
      <path d="M15.5 10h.01" />
      <path d="M8.5 14a5 5 0 0 0 7 0" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  )
}

export function VoiceWave({ size = 288 }: { size?: number }) {
  const barHeights = ['h-4', 'h-8', 'h-12', 'h-20', 'h-28', 'h-20', 'h-14', 'h-9', 'h-5']
  const scale = size / 288 //기준 크기(288px) 대비 축소 비율 계산

  return (
    <div style={{ width: size, height: size, overflow: 'visible' }} className="relative">
      <div
        className="relative grid h-72 w-72 place-items-center"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        <div className="absolute inset-0 rounded-full border border-violet-100" />
        <div className="absolute inset-7 rounded-full border border-fuchsia-100" />
        <div className="absolute inset-14 rounded-full bg-violet-200/20 blur-2xl" />
        <span className="absolute left-3 top-1/2 h-2 w-2 rounded-full bg-violet-300" />
        <span className="absolute right-8 top-10 h-2 w-2 rounded-full bg-violet-300" />
        <span className="absolute bottom-6 right-16 h-1.5 w-1.5 rounded-full bg-fuchsia-200" />
        <span className="absolute left-14 top-12 h-1.5 w-1.5 rounded-full bg-fuchsia-200" />
        <div className="relative flex h-44 w-44 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-violet-200 via-purple-300 to-violet-400 shadow-[0_0_30px_rgba(177,133,255,0.55),0_0_75px_rgba(206,175,255,0.48),inset_0_0_30px_rgba(255,255,255,0.75)]">
          {barHeights.map((height, index) => (
            <span key={index} className={`w-1.5 rounded-full bg-white ${height}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const [inputMessage, setInputMessage] = useState('')
  const [userMessage, setUserMessage] = useState('오늘 하루가 조금 힘들었어...')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedMessage = inputMessage.trim()
    if (!trimmedMessage) return
    setUserMessage(trimmedMessage)
    setInputMessage('')
  }

  return (
    <section className="relative">
      <div className="relative z-10 mx-auto grid max-w-[1480px] gap-12 px-12 py-16 lg:grid-cols-[0.7fr_1.4fr] lg:items-center lg:px-20">
        {/* 왼쪽 소개 영역 */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-100 to-pink-100 px-5 py-2 text-sm font-semibold text-violet-600">
            AI 채팅 + 음성채팅
            <span className="text-pink-400">
              <i className="fa-solid fa-heart" />
            </span>
          </div>

          <h1 className="mt-12 text-5xl font-light leading-[1.4] tracking-tight text-slate-800 lg:text-6xl">
            마음이 아픈 날,
            <br />
            <strong className="font-semibold">
              언제든{' '}
              <span className="text-violet-500">편하게 </span>
            </strong>
            <br />
             <span className="font-semibold text-violet-500">이야기</span> 하세요.
          </h1>

          <p className="mt-8 text-lg leading-9 text-slate-600">
            따뜻한 대화로 하루의 마음을
            <br />
            가볍게 만들어줄게요.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-400 px-7 py-4 font-semibold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5"
            >
              <i className="fa-regular fa-comment-dots" /> AI 채팅 시작
            </button>
            <button
              type="button"
              className="rounded-2xl bg-white px-7 py-4 font-semibold text-violet-500 shadow-lg shadow-violet-100 transition hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-microphone" /> 음성으로 대화
            </button>
          </div>
        </div>

        {/* 채팅 카드 + 음성 카드 — 배경 네모 추가 */}
        <div className="rounded-[36px] bg-white/60 p-6 shadow-[0_12px_40px_rgba(124,103,255,0.13)] backdrop-blur-sm">
          <div className="grid h-[650px] min-w-0 grid-cols-[1.55fr_1fr] gap-3">

            {/* 채팅 카드 */}
            <section className="grid min-w-0 grid-rows-[96px_1fr_88px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_55px_rgba(92,75,150,0.12)]">
              <header className="flex items-center justify-between rounded-[28px] bg-white px-7 shadow-[0_6px_22px_rgba(84,68,140,0.08)]">
                <div className="flex items-center gap-4">
                  <img className="w-15 h-15 object-contain" src="/images/gureum/GureumAI.png" alt="구름AI" />
                <div>

                    <h2 className="text-[19px] font-bold text-slate-800">Gureum</h2>
                    <p className="mt-1 flex items-center gap-2 text-[13px] text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                      Online
                    </p>
                  </div>
                </div>
                <button type="button" aria-label="채팅 메뉴" className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-400">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                    <circle cx="5" cy="12" r="1.7" />
                    <circle cx="12" cy="12" r="1.7" />
                    <circle cx="19" cy="12" r="1.7" />
                  </svg>
                </button>
              </header>

              <div className="min-h-0 overflow-hidden px-7 pb-2 pt-7">
                <div className="flex items-start gap-3">
                  <img className="w-11 h-11 object-contain" src="/images/gureum/GureumAI.png" alt="구름AI" />
                  <div>
                    <div className="max-w-[360px] rounded-[20px] rounded-tl-md bg-gradient-to-br from-[#f8f7fb] to-[#f5f2fa] px-5 py-4 text-[15px] leading-7 text-slate-700">
                      안녕! 오랜만이네 💜<br />
                      요즘 어떻게 지내?
                    </div>
                    <p className="mt-2 px-2 text-[12px] text-slate-400">오후 8:30</p>
                  </div>
                </div>

                <div className="ml-auto mt-3 w-fit max-w-[310px]">
                  <div className="rounded-[20px] rounded-tr-md bg-gradient-to-br from-violet-100 to-indigo-100 px-5 py-3.5 text-[15px] font-medium leading-7 text-indigo-700">
                    요즘 하루가 힘들어...
                  </div>
                  <p className="mt-2 text-right text-[12px] text-slate-400">오후 8:31</p>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <img className="w-11 h-11 object-contain" src="/images/gureum/GureumAI.png" alt="구름AI" />
                  <div>
                    <div className="max-w-[370px] rounded-[20px] rounded-tl-md bg-gradient-to-br from-[#f8f7fb] to-[#f5f2fa] px-5 py-4 text-[15px] leading-7 text-slate-700">
                      그랬구나, 나도 마음이 안좋네.. <br />
                      무슨 일인지 이야기 해줄 수 있을까? <br />
                      난 언제나 너 편이야 ☁️ <br />
                    </div>
                    <p className="mt-2 px-2 text-[12px] text-slate-400">오후 8:32</p>
                  </div>
                </div>

                <div className="mt-3 flex w-fit items-center gap-1.5 rounded-2xl bg-violet-50 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-200" />
                </div>
              </div>

              <form
                className="grid grid-cols-[minmax(0,1fr)_56px] items-center gap-3 px-7 pb-5 pt-2"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="relative flex h-14 min-w-0 items-center rounded-full border border-violet-100 bg-white px-5">
                  <span className="absolute left-5 top-1/2 h-[20px] w-[2px] -translate-y-1/2 animate-[caretBlink_0.8s_infinite]" />
                  <input type="text" placeholder="메시지를 입력해주세요..." className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-300 caret-transparent" />
                  <button type="button" aria-label="이모지 선택" className="ml-3 grid h-8 w-8 shrink-0 place-items-center text-slate-400">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8.5 10h.01" />
                      <path d="M15.5 10h.01" />
                      <path d="M8.5 14a5 5 0 0 0 7 0" />
                    </svg>
                  </button>
                </div>
                <button type="submit" aria-label="메시지 전송" className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-400 text-white shadow-[0_10px_24px_rgba(112,91,245,0.32)]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2 11 13" />
                    <path d="m22 2-7 20-4-9-9-4Z" />
                  </svg>
                </button>
              </form>
            </section>

            {/* 음성 채팅 카드 */}
            <section className="grid min-w-0 grid-rows-[96px_1fr_88px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_55px_rgba(92,75,150,0.12)]">
              <header className="flex items-center justify-between px-7">
                <h2 className="text-[19px] font-bold text-slate-800">음성 채팅</h2>
                <button type="button" aria-label="음성 채팅 설정" className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-500">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M4 7h7" />
                    <path d="M15 7h5" />
                    <circle cx="13" cy="7" r="2" />
                    <path d="M4 17h4" />
                    <path d="M12 17h8" />
                    <circle cx="10" cy="17" r="2" />
                  </svg>
                </button>
              </header>

              <div className="flex flex-col items-center justify-center">
                <div className="relative grid h-64 w-64 place-items-center">
                  <div className="absolute inset-0 rounded-full border border-violet-100" />
                  <div className="absolute inset-7 rounded-full border border-fuchsia-100" />
                  <span className="absolute left-2 top-1/2 h-2 w-2 rounded-full bg-violet-300" />
                  <span className="absolute right-5 top-10 h-2 w-2 rounded-full bg-violet-300" />
                  <span className="absolute bottom-4 right-14 h-1.5 w-1.5 rounded-full bg-fuchsia-200" />
                  <div className="flex h-40 w-40 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-violet-200 via-purple-300 to-violet-400 shadow-[0_0_32px_rgba(180,139,255,0.55),0_0_70px_rgba(211,183,255,0.45),inset_0_0_28px_rgba(255,255,255,0.75)]">
                    {[18, 34, 50, 76, 104, 76, 54, 38, 22].map((height, index) => (
                      <span key={index} className="w-1.5 rounded-full bg-white" style={{ height }} />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-[17px] font-semibold text-indigo-400">구름이가 듣고 있어요...</p>
                <p className="mt-2 text-[14px] text-slate-400">편하게 말해주세요</p>
              </div>

              <div className="px-7 pb-5 pt-2">
                <button type="button" className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 text-[15px] font-semibold text-rose-500">
                  <span className="h-4 w-4 rounded-[4px] bg-rose-400" />
                  대화 종료
                </button>
              </div>
            </section>

          </div>
        </div>

      </div>

      {/* 피처 카드 섹션 */}
      <div className="relative z-10 mx-auto max-w-[1480px] px-6 pb-16 lg:px-12">
        <div className="rounded-[28px] bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(124,103,255,0.10)] px-10 py-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">

            {/* 따뜻한 AI 친구 */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100">
                <i className="fa-solid fa-comment-dots text-xl text-violet-500" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-800">따뜻한 AI 친구</p>
                <p className="mt-1 text-[13px] leading-6 text-slate-500">
                  언제나 내 편이 되어주는<br />따뜻한 대화 친구
                </p>
              </div>
            </div>

            {/* 음성으로 더 가까이 */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-100">
                <i className="fa-solid fa-microphone text-xl text-pink-400" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-800">음성으로 더 가까이</p>
                <p className="mt-1 text-[13px] leading-6 text-slate-500">
                  목소리로 나누는 대화로<br />더 깊이 연결돼요
                </p>
              </div>
            </div>

            {/* 안전한 대화 공간 */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100">
                <i className="fa-solid fa-shield text-xl text-sky-400" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-800">안전한 대화 공간</p>
                <p className="mt-1 text-[13px] leading-6 text-slate-500">
                  내 이야기는 안전하게 보호되며<br />안심하고 이야기할 수 있어요
                </p>
              </div>
            </div>

            {/* 나만을 위한 대화 */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-100">
                <i className="fa-solid fa-heart text-xl text-pink-400" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-800">나만을 위한 대화</p>
                <p className="mt-1 text-[13px] leading-6 text-slate-500">
                  내 관심사와 감정에 맞춰<br />이해하고 공감해요
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  )
}

export default HomePage