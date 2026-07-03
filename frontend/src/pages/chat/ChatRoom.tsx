import { useState } from 'react'

function ChatRoom () {



    return (
        <div className="mt-12 grid grid-cols-1 gap-6 px-6 md:grid-cols-9 lg:px-24 max-w-[1480px] mx-auto">
          <div className="md:col-span-2 rounded-2xl bg-white border border-violet-100 shadow-sm p-5">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate('/chat')}
                className="w-[300px] h-[40px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-400 px-7 py-4 font-semibold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-plus" />
                새 대화
              </button>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="font-semibold">
                대화 목록
              </span>
            </div>
            <div>
              제목 리스트들 출력 예정
            </div>
            <div className="flex justify-center items-center">
              <img
                alt="구름이"
                src="/images/gureum/Gureum_img01.png"
                className="w-[150px] h-[150px] object-contain"
              />
            </div>
            <div className="md:col-span-2 text-center rounded-2xl bg-violet-100 shadow-sm p-5">
              구름이와 함께 <br />
              하루를 보내세요 <i className="fa-solid fa-heart text-violet-500" />
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  className="w-[300px] h-[40px] border border-violet-500 text-violet-500 rounded-xl"
                >
                  더 알아보기
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 rounded-2xl bg-white border border-violet-100 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/images/gureum/GureumAI.png" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">Gureum AI</span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Online
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                <i className="fa-solid fa-ellipsis text-gray-400" />
              </div>
            </div>
            <hr className="border-gray-200 mt-3 -mx-4" />
          </div>

          <div className="md:col-span-2 rounded-2xl bg-white border border-violet-100 shadow-sm">
            카드 3
          </div>
        </div>
    );
}
export default ChatRoom;