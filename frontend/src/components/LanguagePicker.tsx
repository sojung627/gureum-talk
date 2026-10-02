import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { languages } from '../i18n'

export default function LanguagePicker() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const current = languages.find(({ code }) => code === i18n.resolvedLanguage) ?? languages[0]

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${t('language')}: ${current.label}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-3 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition-colors hover:bg-violet-50 hover:text-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
      >
        <span lang={current.code}>{current.label}</span>
        <i aria-hidden="true" className={`fa-solid fa-chevron-right text-xs transition-transform ${open ? 'rotate-90 text-violet-400' : 'text-slate-300'}`} />
      </button>
      {open && (
        <div id={panelId} className="absolute right-0 top-full z-20 mt-2 w-36 rounded-2xl border border-violet-100 bg-white p-1.5 shadow-lg shadow-violet-100/60">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              lang={code}
              aria-pressed={code === current.code}
              onClick={() => {
                void i18n.changeLanguage(code)
                setOpen(false)
                triggerRef.current?.focus()
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${code === current.code ? 'bg-violet-50 font-medium text-violet-500' : 'text-slate-600 hover:bg-violet-50/60 hover:text-violet-500'}`}
            >
              {label}
              {code === current.code && <i aria-hidden="true" className="fa-solid fa-check text-xs" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
