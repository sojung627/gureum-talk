import { useState } from 'react'
import { VoiceWave } from '../HomePage'

function Features() {

const [darkModeOn, setDarkModeOn] = useState(true)
const features = [
  {
    id: '01',
    icon: <i className="fa-solid fa-comment-dots text-2xl text-violet-500" />,
    title: 'AI 채팅',
    content: ['구름이와 언제든지 대화해요.', '말하지 못했던 마음도', '여기선 편하게 꺼내놓아도 괜찮아요.'],
    preview: (
       <div className="min-h-0 overflow-hidden px-7 pb-2 pt-7">
         <div className="rounded-2xl bg-violet-50 p-4">
             <div className="flex items-start gap-3">
               <img className="w-11 h-11 object-contain" src="/images/gureum/GureumAI.png" alt="구름AI" />
               <div>
                 <div className="max-w-[360px] rounded-[20px] rounded-tl-md bg-white/80 shadow-sm px-5 py-4 text-[15px] leading-7 text-slate-700">
                   안녕! 잘지냈어? 💜<br />
                   요즘은 어때?
                 </div>
               </div>
             </div>

             <div className="ml-auto mt-3 w-fit max-w-[310px]">
               <div className="rounded-[20px] rounded-tr-md bg-gradient-to-br from-violet-100 to-indigo-100 px-5 py-3.5 text-[15px] font-medium leading-7 text-indigo-700">
                 너무 힘들어...
               </div>
             </div>

             <div className="mt-3 flex w-fit items-center gap-1.5 rounded-2xl bg-white/80 shadow-sm px-4 py-3">
               <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
               <span className="h-2.5 w-2.5 rounded-full bg-violet-300" />
               <span className="h-2.5 w-2.5 rounded-full bg-violet-200" />
             </div>
           </div>
         </div>
    ),
  },
  {
    id: '02',
    icon: <i className="fa-solid fa-microphone text-2xl text-violet-500" />,
    title: '음성 채팅',
    content: ['목소리에 담긴 마음까지 들어요.', '글로 다 못할 이야기는', '말로 편하게 전해주세요.'],
    preview: (
        <div className="flex justify-center">
          <VoiceWave size={230} />
        </div>
    ),
  },
  {
    id: '03',
    icon: <i className="fa-solid fa-folder text-2xl text-violet-500" />,
    title: '대화 히스토리',
    content: ['흘려보내고 싶지 않은 순간들을', '구름이 대신 기억해둘게요.', '언제든 다시 꺼내볼 수 있도록.'],
    preview: (
       <div className="rounded-2xl bg-white border border-slate-200 p-4">
         {[
           { title: '오늘의 고민 상담', time: '오늘 20:30' },
           { title: '여행 계획 짜기', time: '어제' },
           { title: '자기소개 작성 도와줘', time: '2일 전' },
         ].map((item, index, array) => (
           <div
             key={item.title}
             className={`flex items-center justify-between gap-3 py-3 ${
               index !== array.length - 1 ? 'border-b border-slate-200' : ''
             }`}
           >
             <div className="flex items-center gap-3">
               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-violet-50/50">
                 <i className="fa-regular fa-pen-to-square text-sm text-violet-400" />
               </div>
               <span className="text-sm font-medium text-slate-700">{item.title}</span>
             </div>
             <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
          </div>
         ))}

         <button
           type="button"
           className="mt-2 flex w-full items-center justify-center gap-1 text-sm font-semibold text-violet-500"
         >
           전체 보기 <i className="fa-solid fa-chevron-right text-xs" />
         </button>
       </div>
    ),
  },
  {
    id: '04',
    icon: <i className="fa-solid fa-heart text-2xl text-violet-500" />,
    title: '맞춤형 응답',
    content: ['당신의 말투와 마음을 기억해서', '꼭 맞는 말을 건네드려요.', '오래 알던 사이처럼.'],
    preview: (
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="grid grid-cols-2 gap-3">
            {['친절한 말투', '감싸주는 말투', '간결한 답변', '공감 중심 답변', '따뜻한 한마디', '이모지 사용'].map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-600"
              >
                <i className="fa-solid fa-check text-xs" />
                {tag}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-1 text-sm font-semibold text-violet-500"
          >
            내 취향 설정하기 <i className="fa-solid fa-chevron-right text-xs" />
          </button>
        </div>
      ),
  },
  {
    id: '05',
    icon: <i className="fa-solid fa-shield text-2xl text-violet-500" />,
    title: '안전한 대화 환경',
    content: ['여기서 한 이야기는', '여기에만 머물러요.', '마음 놓고 털어놓으셔도 괜찮아요.'],
    preview: (
        <div className="rounded-2xl p-4">
          <div className="flex justify-center h-30 w-30 mx-auto -mt-10">
            <img
              alt="구름이"
              src="/images/gureum/Gureum_locked.png"
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['친절한 말투', '감싸주는 말투', '간결한 답변', '이모지 사용'].map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-600"
              >
                <i className="fa-solid fa-check text-xs" />
                {tag}
              </div>
            ))}
          </div>
        </div>
    ),
  },
  {
    id: '06',
    icon: <i className="fa-solid fa-star text-2xl text-violet-500" />,
    title: '다양한 편의 기능',
    content: ['다크 모드, 알림, 단축키까지', '사소한 불편함 없이', '온전히 대화에만 집중하도록.'],
    preview: (
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <i className="fa-regular fa-moon text-slate-400" />
              다크 모드
            </div>
            <button
              type="button"
              onClick={() => setDarkModeOn((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition ${
                darkModeOn ? 'bg-violet-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  darkModeOn ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <i className="fa-regular fa-bell text-slate-400" />
              알림 설정
            </div>
            <i className="fa-solid fa-chevron-right text-xs text-slate-300" />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <i className="fa-regular fa-keyboard text-slate-400" />
              단축키
            </div>
            <i className="fa-solid fa-chevron-right text-xs text-slate-300" />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <i className="fa-solid fa-earth-asia text-slate-400" />
              언어 설정
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              한국어
              <i className="fa-solid fa-chevron-right text-xs text-slate-300" />
            </div>
          </div>
        </div>
      ),
  },
]

//안내박스 - 사용 단계 데이터
const steps = [
  { iconClass: 'fa-regular fa-comment-dots', iconBg: 'bg-violet-100 text-violet-500', title: '대화 시작', desc: ['AI 채팅 또는', '음성 채팅을 선택해', '대화를 시작해요.'] },
  { iconClass: 'fa-solid fa-microphone text-2xl text-violet-500', iconBg: 'bg-violet-100 text-violet-500', title: '질문하고 소통하기', desc: ['궁금한 것을 질문하거나', '일상을 나누며', '자유롭게 대화해요.'] },
  { iconClass: 'fa-solid fa-heart', iconBg: 'bg-violet-100 text-violet-500', title: '답변 받기', desc: ['구름이가 당신에게', '맞춤형 답변을', '제공해드려요.'] },
  { iconClass: 'fa-solid fa-folder', iconBg: 'bg-violet-100 text-violet-500', title: '기록 확인하기', desc: ['중요한 대화는 저장하고', '언제든지 다시', '확인할 수 있어요.'] },
  { iconClass: 'fa-solid fa-star', iconBg: 'bg-violet-100 text-violet-500', title: '더 편리하게 사용하기', desc: ['다양한 설정과 기능으로', '나만의 구름톡을', '완성해보세요.'] },
]

  return (
    <>
      {/* 제목 */}
      <div className="flex justify-center mt-5">
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
      <div className="mt-12 grid grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-24 max-w-[1480px] mx-auto">
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
              <div className="mt-5">
                {feature.preview}
              </div>
            </div>
        ))}
      </div>

      {/* 안내박스 */}
      <div className="mt-12 max-w-[1480px] px-6 lg:px-24 mx-auto">
        <div className="rounded-3xl bg-white/70 shadow-sm p-10">
          <div className="text-base text-center font-bold text-slate-800">
            구름톡, 이렇게 사용해보세요!
          </div>
          <div className="mt-8 flex items-start justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-start">
                <div className="flex w-44 flex-col items-center text-center">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-full ${step.iconBg}`}>
                    <i className={`${step.iconClass} text-3xl`} />
                  </div>
                  <p className="mt-4 font-bold text-slate-800">{step.title}</p>
                  <div className="mt-2 text-sm text-slate-500">
                    {step.desc.map((line, lineIndex) => (
                      <span key={lineIndex} className="block">{line}</span>
                    ))}
                  </div>
                </div>
                {index !== steps.length - 1 && (
                  <i className="fa-solid fa-arrow-right mt-9 text-violet-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>


    </>
  )
}
export default Features