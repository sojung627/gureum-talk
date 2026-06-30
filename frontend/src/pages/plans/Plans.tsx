import { useState } from 'react'

type BillingCycle = 'monthly' | 'yearly'

type Plan = {
    name: string
    description: string
    price: number
    recommended?: boolean
    image: string
    content: string[]
}

function Plans() {

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')

  const plans: Plan[] = [
    {
        name: '무료',
        description: '구름이를 자유롭게 만나보세요',
        price: 0,
        image: '/images/gureum/GureumAI.png' ,
        content: ['AI 채팅 일일 10회', '음성 채팅 10분', '대화 히스토리 저장 7일', '파일 첨부 3개까지', 'AI 기억 기능', '광고 포함']
    },
    {
        name: '베이직',
        description: '더 따뜻한 대화를 원한다면',
        price: 4900,
        image: '/images/gureum/GureumAI_basic.png',
        content: ['AI 채팅 무제한', '음성 채팅 300분', '대화 히스토리 저장 30일', '파일 첨부 10개까지', 'AI 기억 기능', '광고 미포함']
    },
    {
        name: '프리미엄',
        description: '가장 따뜻한 대화 경험',
        price: 9900,
        recommended: true,
        image: '/images/gureum/GureumAI_premium.png',
        content: ['AI 채팅 무제한', '음성 채팅 600분', '대화 히스토리 저장 무제한', '파일 첨부 15개까지', 'AI 기억 기능', '광고 미포함']

    },
    {
        name: '프로',
        description: '보다 가까운 구름이와의 관계',
        price: 19900,
        image: '/images/gureum/GureumAI_pro.png',
        content: ['AI 채팅 무제한', '음성 채팅 무제한', '대화 히스토리 저장 무제한', '파일 첨부 무제한', 'AI 기억 기능', '광고 미포함']

    },
  ]

    return(
      <>
        {/* 제목 */}
        <div className="text-center mt-12 text-5xl font-semibold leading-[1.4] tracking-tight text-slate-800 lg:text-5xl">
          <span className="text-4xl font-medium block mb-1 text-slate-700">나에게 딱 맞는</span>
          <span className="font-semibold">구름톡{' '}</span>
          <span className="text-violet-500">요금제</span>
          <span className="font-medium">를 선택하세요</span>
        </div>

        <div className="text-center">
          <p className="mt-3 text-lg leading-9 text-slate-600">더 풍부한 대화 경험을 위한 다양한 혜택을 만나보세요.</p>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-1 rounded-full bg-violet-50 p-1">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                  billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-400 text-white shadow'
                  : 'text-slate-500'
              }`}
            >
              월간결제
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-400 text-white shadow'
                    : 'text-slate-500'
              }`}
            >
              연간결제
            </button>
          </div>
        </div>

        {/* 요금제 */}
        <div className="grid grid-cols-1 gap-6 mt-10 px-6 md:grid-cols-2 lg:grid-cols-4 max-w-[1200px] mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-white p-6 ${
                  plan.recommended ? 'border-2 border-violet-500 shadow-lg' : 'border-slate-100'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">
                  추천
                </span>
              )}
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50">
                <img src={plan.image} alt={plan.name} className="h-12 w-12 object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
              <div className="mt-6 text-3xl font-bold text-violet-600">
                {plan.price.toLocaleString()}<span className="text-base font-medium text-slate-400">원 /월</span>
              </div>
              <div className="mt-4 space-y-2">
                {plan.content.map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm text-slate-500">
                    <i className="fa-solid fa-check text-violet-500" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

      </>
    );
}
export default Plans