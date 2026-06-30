import { useState } from 'react'

function Features() {

const features = [
  {
    id: '01',
    icon: <i className="fa-solid fa-comment-dots text-2xl text-violet-500" />,
    title: 'AI 채팅',
    content: ['구름이와 언제든지 대화해요.', '말하지 못했던 마음도', '여기선 편하게 꺼내놓아도 괜찮아요.'],
  },
  {
    id: '02',
    icon: <i className="fa-solid fa-microphone text-2xl text-violet-500" />,
    title: '음성 채팅',
    content: ['목소리에 담긴 마음까지 들어요.', '글로 다 못할 이야기는', '말로 편하게 전해주세요.'],
  },
  {
    id: '03',
    icon: <i class="fa-solid fa-folder text-2xl text-violet-500" />,
    title: '대화 히스토리',
    content: ['흘려보내고 싶지 않은 순간들을', '구름이 대신 기억해둘게요.', '언제든 다시 꺼내볼 수 있도록.'],
  },
  {
    id: '04',
    icon: <i className="fa-solid fa-heart text-2xl text-violet-500" />,
    title: '맞춤형 응답',
    content: ['당신의 말투와 마음을 기억해서', '꼭 맞는 말을 건네드려요.', '오래 알던 사이처럼.'],
  },
  {
    id: '05',
    icon: <i className="fa-solid fa-shield text-2xl text-violet-500" />,
    title: '안전한 대화 환경',
    content: ['여기서 한 이야기는', '여기에만 머물러요.', '마음 놓고 털어놓으셔도 괜찮아요.'],
  },
  {
    id: '06',
    icon: <i className="fa-solid fa-star text-2xl text-violet-500" />,
    title: '다양한 편의 기능',
    content: ['다크 모드, 알림, 단축키까지', '사소한 불편함 없이', '온전히 대화에만 집중하도록.'],
  },
]

  return (
    <>
      {/* 제목 */}
      <div className="flex justify-center">
        <div className="inline-flex items-center px-4 py-1 rounded-full bg-violet-200/40 text-slate-700 text-sm">
          구름톡의 모든 기능
        </div>
      </div>
      <div className="text-center mt-4 text-5xl font-semibold leading-[1.4] tracking-tight text-slate-800 lg:text-5xl">
        <span className="text-4xl font-medium block mb-1 text-slate-700">구름톡과 함께 하는</span>
        <span className="text-violet-500">더 편리하고 따뜻한{' '}</span>
        <span className="font-semibold">대화</span>
      </div>

      <div className="text-center">
        <div className="mt-3 text-center text-lg leading-7 text-slate-600">
          구름이와의 대화, 음성채팅, 다양한 편의 기능까지<br />
          <span className="font-medium text-slate-700">
            구름톡이 당신과 함께 합니다.
          </span>
        </div>
      </div>

      {/* 기능 6가지 */}
      <div className="mt-12 grid grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-24">
        {features.map((feature) => (
            <div
              key={feature.id}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-400">
                {feature.id}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-200 mx-auto">
                {feature.icon}
              </div>
              <div className="mt-2 text-center font-semibold text-2xl">
                {feature.title}
              </div>
              <div className="text-center mt-2 text-slate-500 text-sm">
                {feature.content.map((line, index) => (
                  <span key={index} className="block">
                    {line}
                  </span>
                ))}
              </div>
            </div>
        ))}
      </div>


    </>
  )
}
export default Features