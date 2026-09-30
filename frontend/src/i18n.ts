import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

export const LANGUAGE_STORAGE_KEY = 'gureum_language'
export const languages = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
] as const
export type Language = typeof languages[number]['code']

export function isLanguage(value: unknown): value is Language {
  return languages.some(({ code }) => code === value)
}

function readLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguage(saved) ? saved : 'ko'
  } catch {
    return 'ko'
  }
}

i18n.on('languageChanged', (language: string) => {
  document.documentElement.lang = language
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Language changes still work when browser storage is unavailable.
  }
})

void i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en }, ja: { translation: ja } },
  lng: readLanguage(),
  fallbackLng: 'ko',
  supportedLngs: languages.map(({ code }) => code),
  interpolation: { escapeValue: false },
})

window.addEventListener('storage', (event) => {
  if (event.key === LANGUAGE_STORAGE_KEY) {
    void i18n.changeLanguage(isLanguage(event.newValue) ? event.newValue : 'ko')
  }
})

// The API currently returns human-readable messages, rather than translation keys.
// Match known UI messages only; never translate user messages or AI replies.
const messageKeys = new Map<string, string>()
for (const resource of [ko, en, ja]) {
  for (const [key, message] of Object.entries(resource)) messageKeys.set(message, key)
}

export function translateMessage(message: string): string {
  const key = messageKeys.get(message)
  return key ? i18n.t(key) : message
}

export default i18n
