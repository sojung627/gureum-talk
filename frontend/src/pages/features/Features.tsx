import { useTranslation } from 'react-i18next'
import LanguagePicker from '../../components/LanguagePicker'
import { useState } from 'react'
import { VoiceWave } from '../HomePage'

function Features() {
  const { t } = useTranslation()


const [darkModeOn, setDarkModeOn] = useState(true)
const [notificationsOn, setNotificationsOn] = useState(true)
const [shortcutsOn, setShortcutsOn] = useState(true)
const features = [
  {
    id: '01',
    icon: <i className="fa-solid fa-comment-dots text-2xl text-violet-500" />,
    title: t('aiChat'),
    content: [t('chatAnytime'), t('unspokenFeelings'), t('shareFreely')],
    preview: (
       <div className="min-h-0 overflow-hidden px-7 pb-2 pt-7">
         <div className="rounded-2xl bg-violet-50 p-4">
             <div className="flex items-start gap-3">
               <img className="w-11 h-11 object-contain" src="/images/gureum/GureumAI.png" alt={t('gureumAI')} />
               <div>
                 <div className="max-w-[360px] rounded-[20px] rounded-tl-md bg-white/80 shadow-sm px-5 py-4 text-[15px] leading-7 text-slate-700">
                   {t('previewHello')}<br />
                   {t('previewHowAreYou')}</div>
               </div>
             </div>

             <div className="ml-auto mt-3 w-fit max-w-[310px]">
               <div className="rounded-[20px] rounded-tr-md bg-gradient-to-br from-violet-100 to-indigo-100 px-5 py-3.5 text-[15px] font-medium leading-7 text-indigo-700">
                 {t('previewTired')}</div>
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
    title: t('voiceChat'),
    content: [t('voiceFeelings'), t('beyondWriting'), t('sayItAloud')],
    preview: (
        <div className="flex justify-center">
          <VoiceWave size={230} />
        </div>
    ),
  },
  {
    id: '03',
    icon: <i className="fa-solid fa-folder text-2xl text-violet-500" />,
    title: t('chatHistory'),
    content: [t('momentsToKeep'), t('rememberForYou'), t('revisitAnytime')],
    preview: (
       <div className="rounded-2xl bg-white border border-slate-200 p-4">
         {[
           { title: t('todayWorries'), time: t('todayTime') },
           { title: t('travelPlanning'), time: t('yesterday') },
           { title: t('introHelp'), time: t('twoDaysAgo') },
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
           {t('viewAll')}<i className="fa-solid fa-chevron-right text-xs" />
         </button>
       </div>
    ),
  },
  {
    id: '04',
    icon: <i className="fa-solid fa-heart text-2xl text-violet-500" />,
    title: t('personalizedReplies'),
    content: [t('rememberYourStyle'), t('rightWords'), t('oldFriends')],
    preview: (
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="grid grid-cols-2 gap-3">
            {[t('friendlyTone'), t('comfortingTone'), t('conciseReplies'), t('empatheticReplies'), t('warmWords'), t('useEmoji')].map((tag) => (
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
            {t('setPreferences')}<i className="fa-solid fa-chevron-right text-xs" />
          </button>
        </div>
      ),
  },
  {
    id: '05',
    icon: <i className="fa-solid fa-shield text-2xl text-violet-500" />,
    title: t('safeEnvironment'),
    content: [t('whatYouShare'), t('staysHere'), t('openUp')],
    preview: (
        <div className="rounded-2xl p-4">
          <div className="flex justify-center h-30 w-30 mx-auto -mt-10">
            <img
              alt={t('gureum')}
              src="/images/gureum/Gureum_locked.png"
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[t('friendlyTone'), t('comfortingTone'), t('conciseReplies'), t('useEmoji')].map((tag) => (
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
    title: t('convenientFeatures'),
    content: [t('modeAlertsShortcuts'), t('withoutDistractions'), t('focusOnChat')],
    preview: (
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <i className="fa-regular fa-moon text-slate-400" />
              {t('darkMode')}</div>
            <button
              type="button"
              role="switch"
              aria-label={t('darkMode')}
              aria-checked={darkModeOn}
              onClick={() => setDarkModeOn((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition ${
                darkModeOn ? 'bg-violet-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  darkModeOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <i className="fa-regular fa-bell text-slate-400" />
              {t('notifications')}</div>
            <button
              type="button"
              role="switch"
              aria-label={t('notifications')}
              aria-checked={notificationsOn}
              onClick={() => setNotificationsOn((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition ${
                notificationsOn ? 'bg-violet-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  notificationsOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <i className="fa-regular fa-keyboard text-slate-400" />
              {t('shortcuts')}</div>
            <button
              type="button"
              role="switch"
              aria-label={t('shortcuts')}
              aria-checked={shortcutsOn}
              onClick={() => setShortcutsOn((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition ${
                shortcutsOn ? 'bg-violet-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  shortcutsOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <i className="fa-solid fa-earth-asia text-slate-400" />
              {t('language')}</div>
            <LanguagePicker />
          </div>
        </div>
      ),
  },
]

//안내박스 - 사용 단계 데이터
const steps = [
  { iconClass: 'fa-regular fa-comment-dots', iconBg: 'bg-violet-100 text-violet-500', title: t('startConversation'), desc: [t('chooseAi'), t('chooseVoice'), t('startTalking')] },
  { iconClass: 'fa-solid fa-microphone text-2xl text-violet-500', iconBg: 'bg-violet-100 text-violet-500', title: t('askAndConnect'), desc: [t('askQuestions'), t('shareYourDay'), t('talkFreely')] },
  { iconClass: 'fa-solid fa-heart', iconBg: 'bg-violet-100 text-violet-500', title: t('getReplies'), desc: [t('gureumWill'), t('tailoredReplies'), t('justForYou')] },
  { iconClass: 'fa-solid fa-folder', iconBg: 'bg-violet-100 text-violet-500', title: t('reviewHistory'), desc: [t('saveImportant'), t('comeBack'), t('wheneverYouLike')] },
  { iconClass: 'fa-solid fa-star', iconBg: 'bg-violet-100 text-violet-500', title: t('makeItYours'), desc: [t('exploreSettings'), t('yourGureumTalk'), t('yourOwn')] },
]

  return (
    <>
      {/* 제목 */}
      <div className="flex justify-center mt-5">
        <div className="inline-flex items-center px-4 py-1 rounded-full bg-violet-200/40 text-slate-700 text-sm">
          {t('allFeatures')}</div>
      </div>
      <div className="text-center mt-4 text-5xl font-semibold leading-[1.4] tracking-tight text-slate-800 lg:text-5xl">
        <span className="text-4xl font-medium block mb-1 text-slate-700">{t('togetherWith')}</span>
        <span className="text-violet-500">{t('warmerEasier')}{' '}</span>
        <span className="font-semibold">{t('conversation')}</span>
      </div>

      <div className="text-center">
        <div className="mt-3 text-center text-lg leading-7 text-slate-600">
          {t('featuresIntro')}<br />
          <span className="font-medium text-slate-700">
            {t('hereForYou')}</span>
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
            {t('howToUse')}</div>
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
