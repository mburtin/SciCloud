/**
 * Vue I18n configuration for SciCloud
 * Main i18n setup with TypeScript support and locale management
 */

import { createI18n } from 'vue-i18n'
import type { 
  AvailableLocales, 
  LocaleConfig, 
  DateTimeFormat, 
  NumberFormat,
  I18nConfig
} from './types'

// Import locale files
import en from './locales/en.json'
import fr from './locales/fr.json'

// Locale configuration
export const localeConfigs: LocaleConfig[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    direction: 'ltr'
  }
]

// Date and time formats for each locale
const datetimeFormats: Record<AvailableLocales, DateTimeFormat> = {
  en: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    },
    time: {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    },
    datetime: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }
  },
  fr: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    },
    time: {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    },
    datetime: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }
  }
}

// Number formats for each locale
const numberFormats: Record<AvailableLocales, NumberFormat> = {
  en: {
    currency: {
      style: 'currency',
      currency: 'USD',
      notation: 'standard'
    },
    decimal: {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    },
    percent: {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }
  },
  fr: {
    currency: {
      style: 'currency',
      currency: 'EUR',
      notation: 'standard'
    },
    decimal: {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    },
    percent: {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }
  }
}

// Default i18n configuration
export const i18nConfig: I18nConfig = {
  defaultLocale: 'en',
  fallbackLocale: 'en',
  availableLocales: localeConfigs,
  storage: {
    key: 'scicloud-locale',
    storage: 'localStorage'
  },
  lazy: false,
  detectBrowserLanguage: true
}

// Detect browser language with fallback
export const detectBrowserLocale = (): AvailableLocales => {
  if (!i18nConfig.detectBrowserLanguage) {
    return i18nConfig.defaultLocale
  }

  const browserLanguage = navigator.language.split('-')[0] as AvailableLocales
  const supportedLocales = localeConfigs.map(config => config.code)
  
  return supportedLocales.includes(browserLanguage) 
    ? browserLanguage 
    : i18nConfig.defaultLocale
}

// Get stored locale from localStorage
export const getStoredLocale = (): AvailableLocales | null => {
  try {
    const stored = localStorage.getItem(i18nConfig.storage.key)
    if (stored && localeConfigs.some(config => config.code === stored)) {
      return stored as AvailableLocales
    }
  } catch (error) {
    console.warn('Failed to get stored locale:', error)
  }
  return null
}

// Store locale in localStorage
export const setStoredLocale = (locale: AvailableLocales): void => {
  try {
    localStorage.setItem(i18nConfig.storage.key, locale)
  } catch (error) {
    console.warn('Failed to store locale:', error)
  }
}

// Determine initial locale
export const getInitialLocale = (): AvailableLocales => {
  // Priority: stored locale > browser locale > default locale
  return getStoredLocale() || detectBrowserLocale()
}

// Create and configure Vue I18n instance
export const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: getInitialLocale(),
  fallbackLocale: i18nConfig.fallbackLocale,
  messages: {
    en,
    fr
  },
  datetimeFormats,
  numberFormats,
  globalInjection: true,
  warnHtmlMessage: false
})

// Export the i18n instance type for use in components
export type I18nInstance = typeof i18n

// Helper function to get locale configuration
export const getLocaleConfig = (locale: AvailableLocales): LocaleConfig => {
  return localeConfigs.find(config => config.code === locale) || localeConfigs[0]
}

// Helper function to check if locale is supported
export const isLocaleSupported = (locale: string): locale is AvailableLocales => {
  return localeConfigs.some(config => config.code === locale)
}

export default i18n