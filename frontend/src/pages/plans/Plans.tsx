import { useState } from 'react'

function Plans() {


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
        

      </>
    );
}
export default Plans