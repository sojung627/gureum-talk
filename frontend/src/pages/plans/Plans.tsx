import { Trans, useTranslation } from 'react-i18next'
import { useState } from 'react'

type BillingCycle = 'monthly' | 'yearly'

type Plan = {
    id: string
    name: string
    description: string
    price: number
    image: string
    content: string[]
    button: string
}

function Plans() {
  const { t } = useTranslation()

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [selectedPlan, setSelectedPlan] = useState('premium')

  const getDisplayPrice = (price: number) => {
    if (price === 0) return 0
    return billingCycle === 'yearly'
    ? Math.round(price * 0.8) * 12
    : price
  }

  const plans: Plan[] = [
    {
        id: 'free',
        name: t('free'),
        description: t('casualConnection'),
        price: 0,
        image: '/images/gureum/GureumAI.png',
        content: [t('aiTenDaily'), t('voiceTen'), t('historySeven'), t('filesThree'), t('aiMemory'), t('withAds')],
        button: t('startFree')
    },
    {
        id: 'basic',
        name: t('basic'),
        description: t('warmerConnection'),
        price: 4900,
        image: '/images/gureum/GureumAI_basic.png',
        content: [t('unlimitedAi'), t('voice300'), t('historyThirty'), t('filesTen'), t('aiMemory'), t('adFree')],
        button: t('startBasic')
    },
    {
        id: 'premium',
        name: t('premium'),
        description: t('warmestConnection'),
        price: 9900,
        image: '/images/gureum/GureumAI_premium.png',
        content: [t('unlimitedAi'), t('voice600'), t('unlimitedHistory'), t('filesFifteen'), t('aiMemory'), t('adFree')],
        button: t('startPremium')
    },
    {
        id: 'pro',
        name: t('pro'),
        description: t('lastingConnection'),
        price: 19900,
        image: '/images/gureum/GureumAI_pro.png',
        content: [t('unlimitedAi'), t('unlimitedVoice'), t('unlimitedHistory'), t('unlimitedFiles'), t('aiMemory'), t('adFree')],
        button: t('startPro')
    },
  ]

  return (
    <>
      {/* 제목 */}
      <div className="text-center mt-12 text-5xl font-semibold leading-[1.4] tracking-tight text-slate-800 dark:text-slate-100 lg:text-5xl">
        <span className="text-4xl font-medium block mb-1 text-slate-700 dark:text-slate-200">{t('perfectForYou')}</span>
        <Trans i18nKey="plansHeadline" components={{
          brand: <span className="font-semibold" />,
          accent: <span className="text-violet-500 dark:text-violet-300" />,
          plain: <span className="font-medium" />,
        }} />
      </div>

      <div className="text-center">
        <p className="mt-3 text-lg leading-9 text-slate-600 dark:text-slate-300">{t('plansIntro')}</p>
      </div>

      {/* 버튼 */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-1 rounded-full bg-violet-50 dark:bg-violet-400/10 p-1">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-400 text-white shadow'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('monthlyBilling')}</button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-400 text-white shadow'
                  : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('yearlyBilling')}</button>
        </div>
      </div>

      {/* 요금제 */}
      <div className="grid grid-cols-1 gap-6 mt-10 px-6 md:grid-cols-2 lg:grid-cols-4 max-w-[1200px] mx-auto">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative flex min-w-0 flex-col cursor-pointer rounded-2xl border-2 bg-white dark:bg-[#151c35] p-6 transition ${
                isSelected ? 'border-violet-500 shadow-lg' : 'border-slate-100 dark:border-slate-700/70'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">
                  {t('recommended')}</span>
              )}
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-400/10">
                <img src={plan.image} alt={plan.name} className="h-12 w-12 object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
              <div className="mt-6 flex items-center gap-1.5">
                <div className="shrink-0 whitespace-nowrap text-xl font-bold text-violet-600 dark:text-violet-300 sm:text-2xl lg:text-3xl">
                  {getDisplayPrice(plan.price).toLocaleString()}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 font-medium text-slate-400">
                  <span className="text-xs">{t('won')}</span>
                  <div className="flex items-baseline gap-1 whitespace-nowrap text-[10px]">
                    <span>/ {billingCycle === 'yearly' ? t('year') : t('month')}</span>
                    {billingCycle === 'yearly' && plan.price > 0 && (
                      <span className="text-[8px] line-through">
                        {(plan.price * 12).toLocaleString()}{t('won')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex-1 space-y-2">
                {plan.content.map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <i className="fa-solid fa-check text-violet-500 dark:text-violet-300" />
                    {item}
                  </p>
                ))}
              </div>
              <button
                type="button"
                className={`mt-6 w-full shrink-0 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  isSelected
                    ? 'border-transparent bg-gradient-to-r from-violet-600 to-indigo-400 text-white shadow'
                    : 'border-violet-300 dark:border-violet-400/20 text-violet-600 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-400/10'
                }`}
              >
                {plan.button}
              </button>
            </div>
          )
        })}
      </div>

      {/* 안내 박스 */}
      <div className="mt-12 mx-6 max-w-[1200px] rounded-3xl bg-white/70 dark:bg-[#151c35]/85 shadow-sm p-10 lg:mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="relative flex items-center gap-5 pl-40">
            <img
              src="/images/gureum/Gureum_img01.png"
              alt={t('gureum')}
              className="absolute left-0 top-1/2 h-36 w-36 -translate-y-1/2 object-contain"
            />
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{t('changeAnytime')}</h4>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t('subscriptionFlexible')}<br />
                {t('nextBillingCycle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50/30 dark:bg-violet-400/5">
              <i className="fa-solid fa-shield-heart text-violet-500 dark:text-violet-300 text-4xl" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{t('securePayments')}</h4>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t('securePaymentIntro')}<br />
                {t('trustedPaymentSystem')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Plans
