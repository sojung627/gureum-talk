import { useState } from 'react'

function ChatRoom () {



    return (
        <div className="mt-12 grid grid-cols-1 gap-6 px-6 md:grid-cols-9 lg:px-24 max-w-[1480px] mx-auto">
          <div className="md:col-span-2 rounded-2xl bg-white border border-violet-100 shadow-sm">
            <div className="mt-2 flex justify-center flex-wrap gap-4">
              <button
                type="button"
                onClick={() => navigate('/chat')}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-400 px-7 py-4 font-semibold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5"
              >
                  <i className="fa-solid fa-plus" />
                  새 대화
              </button>
            </div>
          </div>

          <div className="md:col-span-5 rounded-2xl bg-white border border-violet-100 shadow-sm">
            카드 2
          </div>

          <div className="md:col-span-2 rounded-2xl bg-white border border-violet-100 shadow-sm">
            카드 3
          </div>
        </div>
    );
}
export default ChatRoom;