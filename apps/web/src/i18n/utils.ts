/**
 * I18n utility functions for SciCloud
 * Helper functions for locale management and formatting
 */

import type { AvailableLocales } from './types'

/**
 * Format date with locale-specific formatting
 * Enhanced version of the existing formatDate utility
 */
export const formatDateLocalized = (
  dateString: string | null | undefined,
  locale: AvailableLocales = 'en',
  format: 'short' | 'long' = 'short'
): string => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)

    // Check for invalid date
    if (isNaN(date.getTime())) return ''

    const options: Intl.DateTimeFormatOptions = format === 'short' 
      ? { year: 'numeric', month: 'short', day: 'numeric' }
      : { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }

    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', options)
  } catch {
    return ''
  }
}

/**
 * Format number with locale-specific formatting
 * Enhanced version of the existing formatNumber utility
 */
export const formatNumberLocalized = (
  value: number,
  locale: AvailableLocales = 'en',
  options?: Intl.NumberFormatOptions
): string => {
  const localeCode = locale === 'en' ? 'en-US' : 'fr-FR'
  return new Intl.NumberFormat(localeCode, options).format(value)
}

/**
 * Format currency with locale-specific formatting
 * Enhanced version of the existing formatCurrency utility
 */
export const formatCurrencyLocalized = (
  value: number,
  locale: AvailableLocales = 'en',
  currency?: string
): string => {
  const defaultCurrency = locale === 'en' ? 'USD' : 'EUR'
  
  return formatNumberLocalized(value, locale, {
    style: 'currency',
    currency: currency || defaultCurrency
  })
}

/**
 * Format percentage with locale-specific formatting
 */
export const formatPercentageLocalized = (
  value: number,
  locale: AvailableLocales = 'en',
  decimals = 1
): string => {
  return formatNumberLocalized(value, locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Format file size with locale-specific formatting
 * Enhanced version of the existing formatFileSize utility
 */
export const formatFileSizeLocalized = (
  bytes: number,
  locale: AvailableLocales = 'en'
): string => {
  const units = locale === 'en' 
    ? ['B', 'KB', 'MB', 'GB', 'TB']
    : ['o', 'Ko', 'Mo', 'Go', 'To']

  if (bytes === 0) return `0 ${units[0]}`

  const k = 1024
  const sizes = units
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(1))
  const formattedValue = formatNumberLocalized(value, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  })

  return `${formattedValue} ${sizes[i]}`
}

/**
 * Format time ago with locale-specific formatting
 * Enhanced version that uses i18n pluralization
 */
export const formatTimeAgoLocalized = (
  timestamp: string | Date,
  locale: AvailableLocales = 'en'
): string => {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return locale === 'en' ? 'Just now' : 'À l\'instant'
    } else if (diffInMinutes < 60) {
      return locale === 'en' 
        ? `${diffInMinutes}m ago`
        : `Il y a ${diffInMinutes}m`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return locale === 'en' 
        ? `${hours}h ago`
        : `Il y a ${hours}h`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return locale === 'en' 
        ? `${days}d ago`
        : `Il y a ${days}j`
    }
  } catch {
    return locale === 'en' ? 'Unknown time' : 'Heure inconnue'
  }
}

/**
 * Validate locale code
 */
export const isValidLocale = (locale: string): locale is AvailableLocales => {
  return ['en', 'fr'].includes(locale)
}

/**
 * Get locale direction (LTR/RTL)
 */
export const getLocaleDirection = (): 'ltr' | 'rtl' => {
  // All current locales are LTR, but this could be extended for RTL languages
  return 'ltr'
}

/**
 * Get native locale name
 */
export const getLocaleNativeName = (locale: AvailableLocales): string => {
  const names: Record<AvailableLocales, string> = {
    en: 'English',
    fr: 'Français'
  }
  return names[locale]
}

/**
 * Format relative time using Intl.RelativeTimeFormat
 */
export const formatRelativeTime = (
  timestamp: string | Date,
  locale: AvailableLocales = 'en'
): string => {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    const localeCode = locale === 'en' ? 'en-US' : 'fr-FR'
    const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' })

    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(-diffInSeconds, 'second')
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
    }
  } catch {
    return formatTimeAgoLocalized(timestamp, locale)
  }
}