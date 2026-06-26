function Footer() {
  return (
    <footer className="relative z-50 bg-transparent">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <div>
          <p className="font-semibold text-slate-700">
            Gureum<span className="text-violet-500">Talk</span>
          </p>

          <p className="mt-1">
            언제든 편하게 이야기할 수 있는 AI 대화 공간
          </p>
          <p>© 2026 GureumTalk</p>
        </div>

        <div className="flex gap-6">
          <button type="button" className="hover:text-violet-500">
            이용약관
          </button>

          <button type="button" className="hover:text-violet-500">
            개인정보처리방침
          </button>

          <button type="button" className="hover:text-violet-500">
            문의하기
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer