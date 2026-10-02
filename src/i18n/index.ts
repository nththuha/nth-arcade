import { STORAGE_KEYS, loadString, saveString } from '@/shared/storage'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import vi from './locales/vi.json'

export const LANGUAGES = [
  { code: 'vi', label: 'VI' },
  { code: 'en', label: 'EN' },
] as const

export type Language = (typeof LANGUAGES)[number]['code']

function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some(({ code }) => code === value)
}

function detectLanguage(): Language {
  const stored = loadString(STORAGE_KEYS.LANGUAGE)
  if (isLanguage(stored)) return stored
  return navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}

function applyLanguage(lng: string) {
  document.documentElement.lang = lng
  if (isLanguage(lng)) saveString(STORAGE_KEYS.LANGUAGE, lng)
}

i18n.on('languageChanged', applyLanguage)

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
