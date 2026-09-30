import { useTranslation } from 'react-i18next'
import { type FormEvent, useState } from 'react'

function Help() {
  const { t } = useTranslation()


// 검색창 입력값을 관리하는 상태
const [searchKeyword, setSearchKeyword] = useState('')
const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  console.log(searchKeyword)
}

const help = [
    {
       title: t('gettingStartedGureum'),
       icon: <i className="fa-solid fa-rocket text-2xl text-violet-500" />,
       content: [t('fromSignup'), t('toBasics')],
    },
    {
       title: t('voiceGuide'),
       icon: <i className="fa-solid fa-microphone text-2xl text-violet-500" />,
       content: [t('startVoice'), t('configureVoice')],
    },
    {
       title: t('exploreChat'),
       icon: <i className="fa-solid fa-heart text-2xl text-violet-500" />,
       content: [t('safely'), t('convenientChat')],
    },
]

const help2 = [
    {
       title: t('billingGuide'),
       icon: <i className="fa-solid fa-credit-card text-2xl text-violet-500" />,
       content: [t('planTypes'), t('checkOptions')],
    },
    {
       title: t('accountSecurity'),
       icon: <i className="fa-solid fa-shield text-2xl text-violet-500" />,
       content: [t('secureAccount'), t('protectPrivacy')],
    },
    {
       title: t('faq'),
       icon: <i className="fa-solid fa-question text-2xl text-violet-500" />,
       content: [t('commonQuestions'), t('answersCollection')],
    },
]

const helpCenter = [
    {
        icon: <i className="fa-regular fa-house" />,
        title: t('gettingStarted'),
    },
    {
        icon: <i className="fa-regular fa-star" />,
        title: t('mainFeatures'),
    },
    {
        icon: <i className="fa-regular fa-house" />,
        title: t('voiceChat'),
    },
    {
        icon: <i className="fa-regular fa-credit-card" />,
        title: t('plansGuide'),
    },
    {
        icon: <i className="fa-solid fa-shield-heart" />,
        title: t('accountAndSecurity'),
    },
    {
        icon: <i className="fa-regular fa-circle-question" />,
        title: t('faq'),
    },
    {
        icon: <i className="fa-regular fa-bell" />,
        title: t('announcements'),
    },
]

const fastLink = [
    {
        content: t('serviceTerms'),
        icon: <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-violet-600 transition-colors" />,
    },
    {
        content: t('privacy'),
        icon: <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-violet-600 transition-colors" />,
    },
    {
        content: t('youthPolicy'),
        icon: <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-violet-600 transition-colors" />,
    },
    {
        content: t('reportRights'),
        icon: <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-violet-600 transition-colors" />,
    },
]

    return (
        <div className="mt-12 grid grid-cols-1 gap-6 px-6 md:grid-cols-9 lg:px-24 max-w-[1480px] mx-auto">
            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className='text-[18px] font-bold'>
                      {t('helpCenter')}</div>
                    <span className="block text-sm text-slate-600 leading-5">
                      {t('howCanWeHelp')}</span>
                  </div>
                </div>
                <div className="mt-3 border-b border-gray-100" />
                <div className="mt-3 flex flex-col gap-1">
                  {helpCenter.map((item, index) => (
                    <button
                      key={index}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-left text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-2">
                <div className="flex justify-center">
                  <img
                    alt={t('gureum')}
                    src="/images/gureum/GureumNomal.png"
                    className="w-[100px] h-[100px]"
                  />
                </div>
                <div className='text-center text-[15px] font-bold'>
                  {t('needMoreHelp')}</div>
                <span className="mt-1 text-center block text-sm text-slate-600 leading-5">
                  {t('directSupport')}<br />
                  {t('getHelp')}</span>
                <div className="mt-2 flex justify-center">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-600 rounded-lg text-sm"
                  >
                    {t('contactSupport')}<i className="fa-solid fa-chevron-right text-xs" />
                  </button>
                </div>
              </div>
            </div>
            <div className="md:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="relative w-full h-50 bg-violet-100 rounded-xl overflow-hidden">
                <img
                  src="/images/gureum/Gureum_bg.png"
                  className="w-full h-full object-cover object-right"
                />
                <div className="absolute inset-0 flex flex-col justify-center gap-3 px-8">
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">
                      {t('hello')}</h1>
                    <h2 className="mt-1 text-xl font-bold text-violet-600">
                      {t('gureumHelpCenter')}<span className="text-slate-800">{t('welcomeSuffix')}</span>
                    </h2>
                    <p className="mt-2 text-xs text-slate-600 leading-5">
                      {t('useMoreEasily')}<br />
                      {t('usefulInformation')}</p>
                  </div>
                  <form onSubmit={handleSearchSubmit} className="relative w-80 h-9 rounded-full bg-white shadow-lg">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-[2px] h-[14px] animate-[caretBlink_0.8s_infinite]" />
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(event) => setSearchKeyword(event.target.value)}
                        placeholder={t('searchHelp')} style={{ fontSize: '11px' }}
                        className="relative -top-px block w-full h-full bg-transparent pl-4 pr-12 font-normal text-slate-400 placeholder:text-[12px] placeholder:font-normal placeholder:text-slate-400 outline-none caret-transparent"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-violet-600 transition-colors">
                      <i className="fa-solid fa-magnifying-glass text-xs" />
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-semibold">{t('popularHelp')}</span>
                <div>
                  <button
                    className="text-violet-500"
                  >
                    {t('viewAllCompact')}<i className="fa-solid fa-chevron-right text-violet-500 text-xs text-slate-300" />
                  </button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-6">
                {help.map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 min-h-40 flex flex-col items-center justify-center text-center gap-3">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-violet-100">
                     {item.icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{item.title}</span>
                    <div className="text-xs text-slate-500">
                      {item.content.map((line, lineIndex) => (
                        <span key={lineIndex} className="block">{line}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-6">
                {help2.map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 min-h-40 flex flex-col items-center justify-center text-center gap-3">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-violet-100">
                      {item.icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{item.title}</span>
                    <div className="text-xs text-slate-500">
                      {item.content.map((line, lineIndex) => (
                        <span key={lineIndex} className="block">{line}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className='text-[18px] font-bold'>
                  {t('quickLinks')}</div>
                <div className="mt-3 flex flex-col gap-1">
                    {fastLink.map((item, index) => (
                      <button
                        key={index}
                        className="group flex items-center justify-between px-2 py-2 rounded-lg text-left text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                      >
                        <span>{item.content}</span>
                        {item.icon}
                      </button>
                    ))}
                  </div>
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                <div className='text-[15px] font-bold'>
                  {t('stillNeedHelp')}</div>
                <span className="mt-2 block text-sm text-slate-600 leading-5">
                  {t('askDirectly')}<br />
                  {t('replySooner')}</span>
                <button
                  type="button"
                  className="mt-5 w-[180px] h-[50px] bg-violet-500 rounded-xl text-sm leading-5 flex items-center justify-center gap-2 text-white whitespace-nowrap"
                >
                  <i className="fa-solid fa-comment-dots" />
                  <span>{t('contact')}</span>
                </button>
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className='text-[15px] font-bold'>
                  {t('openingHours')}</div>
                <div className="mt-2 flex flex-col gap-1 text-sm leading-5">
                  <div className="flex justify-between">
                    <span>{t('weekdays')}</span>
                    <span>09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('lunch')}</span>
                    <span>12:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('weekendsHolidays')}</span>
                    <span>{t('closed')}</span>
                  </div>
                </div>
                <div className="mt-2 bg-violet-50 rounded-xl px-4 py-3 text-left text-sm leading-5">
                  {t('anyProblems')}<br />
                  {t('getInTouch')}{' '}
                  <i className="fa-solid fa-heart text-violet-500" />
                </div>
              </div>
            </div>
        </div>
    );
}
export default Help;
