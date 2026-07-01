import { useState } from 'react'

function Help() {

// 검색창 입력값을 관리하는 상태
const [searchKeyword, setSearchKeyword] = useState('')
const handleSearchSubmit = (event) => {
  event.preventDefault()
  console.log(searchKeyword)
}

const help = [
    {
       title: '구름톡 시작하기',
       icon: <i className="fa-solid fa-rocket text-2xl text-violet-500" />,
       content: ['회원가입 부터', '기본 사용법 까지'],
    },
    {
       title: '음성 채팅 사용법',
       icon: <i className="fa-solid fa-microphone text-2xl text-violet-500" />,
       content: ['음성 채팅을 시작하고', '설정하는 방법'],
    },
    {
       title: '대화 기능 알아보기',
       icon: <i className="fa-solid fa-heart text-2xl text-violet-500" />,
       content: ['안전하고', '편리한 대화 하는 방법'],
    },
]

const help2 = [
    {
       title: '요금제 & 결제 안내',
       icon: <i className="fa-solid fa-credit-card text-2xl text-violet-500" />,
       content: ['요금제 종류와 결제 방법을', '확인해보세요'],
    },
    {
       title: '계정 보안 설정',
       icon: <i className="fa-solid fa-shield text-2xl text-violet-500" />,
       content: ['계정 보안을 강화하고', '개인정보를 보호하세요'],
    },
    {
       title: '자주 묻는 질문',
       icon: <i className="fa-solid fa-question text-2xl text-violet-500" />,
       content: ['많은 분들이 궁금해하는', '질문과 답변 모음'],
    },
]

const helpCenter = [
    {
        icon: <i className="fa-regular fa-house" />,
        title: '시작하기',
    },
    {
        icon: <i className="fa-regular fa-star" />,
        title: '주요 기능',
    },
    {
        icon: <i className="fa-regular fa-house" />,
        title: '음성 채팅',
    },
    {
        icon: <i className="fa-regular fa-credit-card" />,
        title: '요금제 안내',
    },
    {
        icon: <i className="fa-solid fa-shield-heart" />,
        title: '계정 & 보완',
    },
    {
        icon: <i className="fa-regular fa-circle-question" />,
        title: '자주 묻는 질문',
    },
    {
        icon: <i className="fa-regular fa-bell" />,
        title: '공지사항',
    },
]

const fastLink = [
    {
        content: '서비스 이용약관',
        icon: <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-violet-600 transition-colors" />,
    },
    {
        content: '개인정보처리방침',
        icon: <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-violet-600 transition-colors" />,
    },
    {
        content: '청소년 보호 정책',
        icon: <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-violet-600 transition-colors" />,
    },
    {
        content: '권리침해 신고 안내',
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
                      도움말 센터
                    </div>
                    <span className="block text-sm text-slate-600 leading-5">
                      어떻게 도와드릴까요?
                    </span>
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
                    alt="구름이"
                    src="/images/gureum/GureumNomal.png"
                    className="w-[100px] h-[100px]"
                  />
                </div>
                <div className='text-center text-[15px] font-bold'>
                  도움이 더 필요하신가요?
                </div>
                <span className="mt-1 text-center block text-sm text-slate-600 leading-5">
                  1:1 문의하기를 통해 빠르게<br />
                  도움을 받으실 수 있어요.
                </span>
                <div className="mt-2 flex justify-center">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-600 rounded-lg text-sm"
                  >
                    1:1 문의하기
                    <i className="fa-solid fa-chevron-right text-xs" />
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
                      안녕하세요! 👋
                    </h1>
                    <h2 className="mt-1 text-xl font-bold text-violet-600">
                      GureumTalk 도움말 센터<span className="text-slate-800">입니다.</span>
                    </h2>
                    <p className="mt-2 text-xs text-slate-600 leading-5">
                      GureumTalk을 더 편리하게 사용하실 수 있도록<br />
                      도움이 되는 정보를 모아두었어요.
                    </p>
                  </div>
                  <form onSubmit={handleSearchSubmit} className="relative w-80 h-9 rounded-full bg-white shadow-lg">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-[2px] h-[14px] animate-[caretBlink_0.8s_infinite]" />
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(event) => setSearchKeyword(event.target.value)}
                        placeholder="궁금한 내용을 검색해 보세요." style={{ fontSize: '11px' }}
                        className="relative -top-px block w-full h-full bg-transparent pl-4 pr-12 font-normal text-slate-400 placeholder:text-[12px] placeholder:font-normal placeholder:text-slate-400 outline-none caret-transparent"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-violet-600 transition-colors">
                      <i className="fa-solid fa-magnifying-glass text-xs" />
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-semibold">자주 찾는 도움말</span>
                <div>
                  <button
                    className="text-violet-500"
                  >
                    전체보기
                    <i className="fa-solid fa-chevron-right text-violet-500 text-xs text-slate-300" />
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
                  빠른 링크
                </div>
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
                  문제가 해결되지 않나요?
                </div>
                <span className="mt-2 block text-sm text-slate-600 leading-5">
                  문의하기를 통해 직접 질문하시면 <br />
                  더 빠르게 답변해드릴게요.
                </span>
                <button
                  type="button"
                  className="mt-5 w-[180px] h-[50px] bg-violet-500 rounded-xl text-sm leading-5 flex items-center justify-center gap-2 text-white whitespace-nowrap"
                >
                  <i className="fa-solid fa-comment-dots" />
                  <span>문의하기</span>
                </button>
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className='text-[15px] font-bold'>
                  운영 시간
                </div>
                <div className="mt-2 flex flex-col gap-1 text-sm leading-5">
                  <div className="flex justify-between">
                    <span>평일</span>
                    <span>09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>점심</span>
                    <span>12:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>주말 및 공휴일</span>
                    <span>휴무</span>
                  </div>
                </div>
                <div className="mt-2 bg-violet-50 rounded-xl px-4 py-3 text-left text-sm leading-5">
                  불편한 점이 있다면 <br />
                  편하게 연락주세요!{' '}
                  <i className="fa-solid fa-heart text-violet-500" />
                </div>
              </div>
            </div>
        </div>
    );
}
export default Help;