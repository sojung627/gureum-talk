import { useState } from 'react'

type BillingCycle = 'monthly' | 'yearly'

type Plan = {
    name: string
    description: string
    price: number
    image: string
    content: string[]
    button: string
}

function Plans() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [selectedPlan, setSelectedPlan] = useState('프리미엄')

  const getDisplayPrice = (price: number) => {
    if (price === 0) return 0
    return billingCycle === 'yearly'
    ? Math.round(price * 0.8)
    : price
  }

  const plans: Plan[] = [
    {
        name: '무료',
        description: '편안한 만남을 원한다면',
        price: 0,
        image: '/images/gureum/GureumAI.png',
        content: ['AI 채팅 일일 10회', '음성 채팅 10분', '대화 히스토리 저장 7일', '파일 첨부 3개까지', 'AI 기억 기능', '광고 포함'],
        button: '무료로 시작하기'
    },
    {
        name: '베이직',
        description: '더 따뜻한 만남을 원한다면',
        price: 4900,
        image: '/images/gureum/GureumAI_basic.png',
        content: ['AI 채팅 무제한', '음성 채팅 300분', '대화 히스토리 저장 30일', '파일 첨부 10개까지', 'AI 기억 기능', '광고 미포함'],
        button: '베이직으로 시작하기'
    },
    {
        name: '프리미엄',
        description: '가장 따뜻한 만남을 원한다면',
        price: 9900,
        image: '/images/gureum/GureumAI_premium.png',
        content: ['AI 채팅 무제한', '음성 채팅 600분', '대화 히스토리 저장 무제한', '파일 첨부 15개까지', 'AI 기억 기능', '광고 미포함'],
        button: '프리미엄으로 시작하기'
    },
    {
        name: '프로',
        description: '따뜻한 관계를 원한다면',
        price: 19900,
        image: '/images/gureum/GureumAI_pro.png',
        content: ['AI 채팅 무제한', '음성 채팅 무제한', '대화 히스토리 저장 무제한', '파일 첨부 무제한', 'AI 기억 기능', '광고 미포함'],
        button: '프로로 시작하기'
    },
  ]

  return (
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
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.name

          return (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              className={`relative cursor-pointer rounded-2xl border bg-white p-6 transition ${
                isSelected ? 'border-2 border-violet-500 shadow-lg' : 'border-slate-100'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">
                  추천
                </span>
              )}
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50">
                <img src={plan.image} alt={plan.name} className="h-12 w-12 object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
              <div className="mt-6">
                { billingCycle === 'yearly' && plan.price > 0 && (
                    <span className="text-sm text-slate-400 line-through">
                      {plan.price.toLocaleString()}원
                    </span>
                )}
                <div className="text-3xl font-bold text-violet-600">
                  {getDisplayPrice(plan.price).toLocaleString()}
                  <span className="text-base font-medium text-slate-400">
                    원 /월
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {plan.content.map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm text-slate-500">
                    <i className="fa-solid fa-check text-violet-500" />
                    {item}
                  </p>
                ))}
              </div>
              <button
                type="button"
                className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-400 text-white shadow'
                    : 'border border-violet-300 text-violet-600 hover:bg-violet-50'
                }`}
              >
                {plan.button}
              </button>
            </div>
          )
        })}
      </div>

      {/* 안내 박스 */}
      <div className="mt-12 mx-6 max-w-[1200px] rounded-3xl bg-white/70 shadow-sm p-10 lg:mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="relative flex items-center gap-5 pl-40">
            <img
              src="/images/gureum/Gureum_img01.png"
              alt="구름이"
              className="absolute left-0 top-1/2 h-36 w-36 -translate-y-1/2 object-contain"
            />
            <div>
              <h4 className="text-base font-bold text-slate-800">언제든지 변경하거나 취소할 수 있어요!</h4>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                구독은 언제든지 변경 또는 취소할 수 있으며 <br />
                변경 사항은 다음 결제 주기부터 적용됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50/30">
              <i className="fa-solid fa-shield-heart text-violet-500 text-4xl" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">안전한 결제</h4>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                구름톡은 안전하고<br />
                신뢰할 수 있는 결제 시스템을 사용합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Plans