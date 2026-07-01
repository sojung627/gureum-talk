import { useState } from 'react'

function ChatRoom () {



    return (
        <div className="mt-12 grid grid-cols-1 gap-6 px-6 md:grid-cols-9 lg:px-24 max-w-[1480px] mx-auto">
          <div className="md:col-span-2 rounded-2xl bg-white border border-violet-100 shadow-sm">
            카드 1
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