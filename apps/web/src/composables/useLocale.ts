/**
 * Locale management composable for SciCloud
 * 
 * This file provides a comprehensive set of composables for internationalization (i18n)
 * and localization (l10n) management in the SciCloud application.
 * 
 * Features:
 * - Reactive locale state management
 * - Enhanced translation functions with fallbacks
 * - Locale-aware formatting utilities
 * - Browser locale detection and preferences
 * - Type-safe translation helpers
 * 
 * @author SciCloud Team
 * @version 1.0.0
 */

import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale.store'
import type { AvailableLocales } from '@/i18n/types'
import {
  formatDateLocalized,
  formatNumberLocalized,
  formatCurrencyLocalized,
  formatPercentageLocalized,
  formatFileSizeLocalized,
  formatTimeAgoLocalized,
  formatRelativeTime
} from '@/i18n/utils'

/**
 * Main locale composable - useLocale()
 * 
 * This is the primary composable for locale management. It provides:
 * - Reactive access to current locale state
 * - Locale switching functionality
 * - Integration with Pinia store and Vue I18n
 * - Computed properties for locale configuration
 * 
 * Usage:
 * ```typescript
 * const { currentLocale, setLocale, t, localeName } = useLocale()
 * ```
 * 
 * @returns Object containing locale state, actions, and translation function
 */
export const useLocale = () => {
  const localeStore = useLocaleStore()
  const { t, locale } = useI18n()

  // Reactive store state
  const {
    currentLocale,
    isLoading,
    localeConfig,
    availableLocales,
    isRTL,
    lastChanged
  } = storeToRefs(localeStore)

  // Synchronize store locale with Vue I18n locale
  // This ensures consistency between our Pinia store and Vue I18n instance
  watch(currentLocale, (newLocale) => {
    if (locale.value !== newLocale) {
      locale.value = newLocale
    }
  }, { immediate: true })

  // Actions
  const setLocale = localeStore.setLocale
  const toggleLocale = localeStore.toggleLocale
  const reset = localeStore.reset
  const isLocaleActive = localeStore.isLocaleActive
  const getLocaleByCode = localeStore.getLocaleByCode

  // Computed properties for easy access to locale configuration
  const currentLocaleConfig = computed(() => localeConfig.value)
  const localeName = computed(() => localeConfig.value.name)
  const localeFlag = computed(() => localeConfig.value.flag)
  const localeDirection = computed(() => localeConfig.value.direction)

  return {
    // State
    currentLocale,
    isLoading,
    lastChanged,
    
    // Computed
    localeConfig: currentLocaleConfig,
    localeName,
    localeFlag,
    localeDirection,
    availableLocales,
    isRTL,

    // Actions
    setLocale,
    toggleLocale,
    reset,
    isLocaleActive,
    getLocaleByCode,

    // Translation function
    t
  }
}

/**
 * Locale formatting composable - useLocaleFormat()
 * 
 * Provides locale-aware formatting functions for various data types.
 * All formatting respects the current locale settings and uses native
 * Intl APIs for consistent, localized output.
 * 
 * Supported formats:
 * - Dates (short/long formats)
 * - Numbers (with custom options)
 * - Currency (with automatic currency detection)
 * - Percentages (with configurable decimals)
 * - File sizes (bytes to human-readable)
 * - Time ago (relative time formatting)
 * 
 * Usage:
 * ```typescript
 * const { formatDate, formatCurrency, formatFileSize } = useLocaleFormat()
 * const formattedDate = formatDate('2023-12-25', 'long')
 * const price = formatCurrency(29.99, 'EUR')
 * ```
 * 
 * @returns Object containing all formatting functions
 */
export const useLocaleFormat = () => {
  const { currentLocale } = storeToRefs(useLocaleStore())

  // Date formatting with locale-aware output
  // Supports both short (12/25/2023) and long (December 25, 2023) formats
  const formatDate = (
    dateString: string | null | undefined,
    format: 'short' | 'long' = 'short'
  ): string => {
    return formatDateLocalized(dateString, currentLocale.value, format)
  }

  // Number formatting with locale-specific separators and notation
  // Uses Intl.NumberFormat for consistent cross-browser behavior
  const formatNumber = (
    value: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    return formatNumberLocalized(value, currentLocale.value, options)
  }

  // Currency formatting with automatic symbol placement and formatting
  // Defaults to EUR if no currency specified
  const formatCurrency = (
    value: number,
    currency?: string
  ): string => {
    return formatCurrencyLocalized(value, currentLocale.value, currency)
  }

  // Percentage formatting with configurable decimal places
  // Automatically adds % symbol and handles locale-specific formatting
  const formatPercentage = (
    value: number,
    decimals = 1
  ): string => {
    return formatPercentageLocalized(value, currentLocale.value, decimals)
  }

  // File size formatting from bytes to human-readable format
  // Supports KB, MB, GB, TB with appropriate locale-specific formatting
  const formatFileSize = (bytes: number): string => {
    return formatFileSizeLocalized(bytes, currentLocale.value)
  }

  // Time ago formatting for relative timestamps
  // Examples: "2 hours ago", "3 days ago", "1 week ago"
  const formatTimeAgo = (timestamp: string | Date): string => {
    return formatTimeAgoLocalized(timestamp, currentLocale.value)
  }

  // Advanced relative time formatting with more granular control
  // Provides more detailed relative time descriptions
  const formatRelativeTimeAgo = (timestamp: string | Date): string => {
    return formatRelativeTime(timestamp, currentLocale.value)
  }

  return {
    formatDate,
    formatNumber,
    formatCurrency,
    formatPercentage,
    formatFileSize,
    formatTimeAgo,
    formatRelativeTimeAgo
  }
}

/**
 * Enhanced translation composable - useTranslation()
 * 
 * This composable wraps Vue I18n's translation functions with additional
 * safety features and development aids. It's the recommended way to handle
 * translations throughout the SciCloud application.
 * 
 * Key features:
 * - Automatic fallback handling for missing translations
 * - Development warnings for missing keys
 * - Enhanced plural support
 * - Type-safe translation checking
 * - Custom fallback text support
 * 
 * Usage:
 * ```typescript
 * const { t, tp, te } = useTranslation()
 * 
 * // Basic translation with fallback
 * const text = t('common.save', {}, 'Save')
 * 
 * // Plural translation
 * const items = tp('items.count', itemCount, { count: itemCount })
 * 
 * // Check if translation exists
 * if (te('optional.key')) {
 *   // Use translation
 * }
 * ```
 * 
 * @returns Object containing enhanced translation functions
 */
export const useTranslation = () => {
  const { t, te } = useI18n()

  /**
   * Enhanced translation function with automatic fallback handling
   * 
   * @param key - Translation key to look up
   * @param values - Interpolation values for the translation
   * @param fallback - Optional fallback text if translation is missing
   * @returns Translated text, fallback, or key (in development)
   */
  const translate = (key: string, values?: Record<string, unknown>, fallback?: string): string => {
    if (te(key)) {
      return t(key, values || {})
    }
    
    if (fallback) {
      return fallback
    }

    // In development, return the key itself to help identify missing translations
    // This makes it easy to spot untranslated content during development
    console.warn(`Missing translation for key: ${key}`)
    return key
  }

  /**
   * Plural-aware translation function
   * 
   * Automatically handles singular/plural forms based on count value.
   * Uses Vue I18n's built-in pluralization rules for the current locale.
   * 
   * @param key - Base translation key (should have plural forms defined)
   * @param count - Number to determine singular/plural form
   * @param values - Additional interpolation values
   * @returns Appropriately pluralized translation
   */
  const translatePlural = (
    key: string,
    count: number,
    values?: Record<string, unknown>
  ): string => {
    return t(key, { count, ...values }, count)
  }

  /**
   * Check if a translation key exists
   * 
   * Useful for conditional rendering or fallback logic.
   * 
   * @param key - Translation key to check
   * @returns True if translation exists, false otherwise
   */
  const hasTranslation = (key: string): boolean => {
    return te(key)
  }

  return {
    t: translate,
    tp: translatePlural,
    te: hasTranslation,
    // Direct access to original Vue I18n functions when needed
    // Use these for advanced cases or when you need the raw i18n behavior
    $t: t,
    $te: te
  }
}

/**
 * Locale preferences composable - useLocalePreferences()
 * 
 * Handles browser locale detection and user preference management.
 * This composable helps provide a seamless localization experience by
 * automatically detecting the user's preferred language and setting
 * the application locale accordingly.
 * 
 * Features:
 * - Browser language detection
 * - Best-match algorithm for supported locales
 * - Automatic locale setting based on browser preferences
 * - Fallback to default locale when no match is found
 * 
 * Usage:
 * ```typescript
 * const { autoDetectLocale, getBestMatchingLocale } = useLocalePreferences()
 * 
 * // Auto-detect and set best locale on app startup
 * await autoDetectLocale()
 * 
 * // Get best matching locale without setting it
 * const bestLocale = getBestMatchingLocale()
 * ```
 * 
 * @returns Object containing preference detection and management functions
 */
export const useLocalePreferences = () => {
  const localeStore = useLocaleStore()
  const { currentLocale, availableLocales } = storeToRefs(localeStore)

  /**
   * Get browser's preferred languages
   * 
   * Returns an array of language codes in order of preference.
   * Falls back to navigator.language if navigator.languages is not available.
   * 
   * @returns Array of language codes (e.g., ['en-US', 'en', 'fr'])
   */
  const getBrowserLocales = (): string[] => {
    return [...(navigator.languages || [navigator.language])]
  }

  /**
   * Find the best matching locale from browser preferences
   * 
   * Compares browser language preferences against supported locales
   * and returns the best match. Uses language code matching (ignoring
   * country codes) for broader compatibility.
   * 
   * @returns Best matching locale code or 'en' as fallback
   */
  const getBestMatchingLocale = (): AvailableLocales => {
    const browserLocales = getBrowserLocales()
    const supportedCodes = availableLocales.value.map(l => l.code)

    for (const browserLocale of browserLocales) {
      const code = browserLocale.split('-')[0] as AvailableLocales
      if (supportedCodes.includes(code)) {
        return code
      }
    }

    return 'en' // Default fallback when no browser locale matches our supported locales
  }

  /**
   * Auto-detect and set the best matching locale
   * 
   * Analyzes browser preferences, finds the best match, and automatically
   * sets the application locale if it differs from the current one.
   * This is typically called during application initialization.
   * 
   * @returns Promise that resolves when locale is set
   */
  const autoDetectLocale = async (): Promise<void> => {
    const bestLocale = getBestMatchingLocale()
    if (bestLocale !== currentLocale.value) {
      await localeStore.setLocale(bestLocale)
    }
  }

  return {
    getBrowserLocales,
    getBestMatchingLocale,
    autoDetectLocale
  }
}