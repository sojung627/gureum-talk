import { useState } from 'react'

const navigationItems = ['홈', '기능', '요금제', '도움말']

function Header() {
  const [activeMenu, setActiveMenu] = useState('홈')

  return (
    <header className="relative z-50 bg-transparent">
      <div className="mx-auto flex h-24 max-w-[1480px] items-center justify-between px-6 lg:px-12">
        <button
          type="button"
          className="flex items-center gap-3"
          onClick={() => setActiveMenu('홈')}
        >
          <img className="w-15 h-15 object-contain" src="/images/gureum/GureumAI.png" alt="구름AI" />
          <span className="text-2xl font-bold tracking-tight text-slate-800">
            Gureum<span className="text-violet-500">Talk</span>
          </span>
        </button>

        <nav className="hidden items-center gap-12 md:flex">
          {navigationItems.map((item) => {
            const isActive = activeMenu === item

            return (
              <button
                key={item}
                type="button"
                onClick={() => setActiveMenu(item)}
                className={`relative py-4 text-[15px] font-medium transition-colors ${
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-violet-500'
                }`}
              >
                {item}

                {isActive && (
                  <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-violet-500" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-2xl border border-slate-100 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            로그인
          </button>

          <button
            type="button"
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
          >
            회원가입
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header