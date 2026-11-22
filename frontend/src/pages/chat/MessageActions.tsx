import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type MessageActionsProps = {
  content: string
  copyText: (text: string) => Promise<void>
  onNotice: (message: string) => void
}

export default function MessageActions({ content, copyText, onNotice }: MessageActionsProps) {
  const { t, i18n } = useTranslation()
  const [reading, setReading] = useState(false)
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => () => {
    if (utteranceRef.current) {
      utteranceRef.current.onend = null
      utteranceRef.current.onerror = null
      window.speechSynthesis.cancel()
    }
  }, [])

  const copy = async () => {
    try {
      await copyText(content)
      onNotice(t('messageCopied'))
    } catch {
      onNotice(t('messageActionFailed'))
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: content })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    await copy()
  }

  const toggleReading = () => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      onNotice(t('messageSpeechUnavailable'))
      return
    }
    if (reading) {
      window.speechSynthesis.cancel()
      utteranceRef.current = null
      setReading(false)
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(content)
    utterance.lang = i18n.resolvedLanguage ?? i18n.language
    utterance.onend = () => { setReading(false); utteranceRef.current = null }
    utterance.onerror = (event) => {
      setReading(false)
      utteranceRef.current = null
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        onNotice(t('messageActionFailed'))
      }
    }
    utteranceRef.current = utterance
    setReading(true)
    window.speechSynthesis.speak(utterance)
  }

  const actions = [
    { id: 'copy', label: t('messageCopy'), icon: 'bi-copy' },
    { id: 'read', label: reading ? t('messageStopReading') : t('messageReadAloud'), icon: reading ? 'bi-stop-circle' : 'bi-volume-up', pressed: reading },
    { id: 'share', label: t('share'), icon: 'bi-share' },
    { id: 'like', label: t('messageLike'), icon: feedback === 'like' ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up', pressed: feedback === 'like' },
    { id: 'dislike', label: t('messageDislike'), icon: feedback === 'dislike' ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down', pressed: feedback === 'dislike' },
  ]

  const handleAction = (id: string) => {
    if (id === 'copy') void copy()
    if (id === 'share') void share()
    if (id === 'read') toggleReading()
    if (id === 'like' || id === 'dislike') {
      setFeedback(current => current === id ? null : id)
    }
  }

  return (
    <div className="flex items-center gap-1.5 pl-1" role="group" aria-label={t('messageActions')}>
      {actions.map(action => (
        <button
          key={action.id}
          type="button"
          title={action.label}
          aria-label={action.label}
          aria-pressed={action.pressed}
          onClick={() => handleAction(action.id)}
          className={`inline-flex h-8 w-4 cursor-pointer items-center justify-center rounded-lg text-base transition-colors hover:bg-violet-100 hover:text-violet-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:hover:bg-violet-400/15 dark:hover:text-violet-300 [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-5.5 ${action.pressed ? 'text-violet-600 dark:text-violet-300' : 'text-gray-400 dark:text-slate-400'}`}
        >
          <i className={`bi ${action.icon} ${action.id === 'read' ? 'text-[0.875em]' : 'text-[0.666667em]'}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
