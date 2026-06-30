import { useState } from 'react'

function Help() {

const help = [
    {
       title: '구름톡 시작하기',
       icon: <i className="fa-solid fa-rocket text-2xl text-violet-500" />,
       content: ['회원가입 부터', '기본 사용법 까지', '첫 사용자를 위한 가이드'],
    },
    {
       title: '음성 채팅 사용법',
       icon: <i className="fa-solid fa-microphone text-2xl text-violet-500" />,
       content: ['음성 채팅을 시작하고', '설정하는 방법'],
    },
    {
       title: '대화 기능 알아보기',
       icon: <i className="fa-solid fa-heart text-2xl text-violet-500" />,
       content: ['안전하고', '편리한 대화 기능을', '사용하는 방법'],
    },
]

const help2 = [
    {
       title: '요금제 & 결제 안내',
       icon: <i className="fa-regular fa-credit-card text-2xl text-violet-500" />,
       content: ['요금제 종류와', '결제 방법을', '확인해보세요'],
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

    return (
        <div className="mt-12 grid grid-cols-1 gap-6 px-6 md:grid-cols-9 lg:px-24 max-w-[1480px] mx-auto">
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">

            </div>
            <div className="md:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="relative w-full h-50 bg-violet-100 rounded-xl overflow-hidden">
                <img
                  src="/images/gureum/Gureum_bg.png"
                  className="w-full h-full object-cover object-right"
                />
                <div className="absolute inset-0 flex flex-col justify-center px-8">
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
                <div className="mt-2 absolute bottom-2.5 left-8 right-8">
                  <div className="w-80 h-8 rounded-xl bg-white flex items-center justify-between px-4 text-slate-400 shadow-lg">
                    <div className="text-[10px]">
                      궁금한 내용을 검색해 보세요.
                    </div>
                    <i className="fa-solid fa-magnifying-glass text-[10px]" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-semibold">자주 찾는 도움말</span>
                <div className="text-violet-500">
                  전체보기
                  <i className="fa-solid fa-chevron-right text-violet-500 text-xs text-slate-300" />
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
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">

            </div>
        </div>
    );
}
export default Help;