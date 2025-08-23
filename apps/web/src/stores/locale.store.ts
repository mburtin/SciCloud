/**
 * Locale store for SciCloud
 * Manages application locale state with persistence
 */

import { defineStore } from 'pinia'
import { ref, computed, watch, readonly } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AvailableLocales, LocaleConfig } from '@/i18n/types'
import { 
  localeConfigs, 
  getInitialLocale, 
  setStoredLocale, 
  getLocaleConfig,
  isLocaleSupported
} from '@/i18n'

export const useLocaleStore = defineStore('locale', () => {
  // State
  const currentLocale = ref<AvailableLocales>(getInitialLocale())
  const isLoading = ref(false)
  const lastChanged = ref<Date | null>(null)

  // Computed
  const localeConfig = computed((): LocaleConfig => getLocaleConfig(currentLocale.value))
  const availableLocales = computed((): LocaleConfig[] => localeConfigs)
  const isRTL = computed((): boolean => localeConfig.value.direction === 'rtl')

  // Get the i18n instance for reactive locale changes
  let i18nInstance: ReturnType<typeof useI18n> | null = null

  // Initialize i18n integration
  const initializeI18n = () => {
    try {
      i18nInstance = useI18n()
      
      // Sync store with i18n locale
      if (i18nInstance.locale.value !== currentLocale.value) {
        i18nInstance.locale.value = currentLocale.value
      }

      // Watch for locale changes and sync with i18n
      watch(currentLocale, (newLocale) => {
        if (i18nInstance && i18nInstance.locale.value !== newLocale) {
          i18nInstance.locale.value = newLocale
        }
      })
    } catch (error) {
      console.warn('Failed to initialize i18n integration:', error)
    }
  }

  // Actions
  const setLocale = async (locale: AvailableLocales): Promise<void> => {
    if (!isLocaleSupported(locale)) {
      console.warn(`Unsupported locale: ${locale}`)
      return
    }

    if (currentLocale.value === locale) {
      return
    }

    isLoading.value = true

    try {
      // Update reactive locale
      currentLocale.value = locale
      
      // Update i18n instance if available
      if (i18nInstance) {
        i18nInstance.locale.value = locale
      }

      // Persist to storage
      setStoredLocale(locale)

      // Update document language attribute
      document.documentElement.lang = locale

      // Update document direction for RTL support
      document.documentElement.dir = getLocaleConfig(locale).direction

      // Track when locale was changed
      lastChanged.value = new Date()

      console.log(`Locale changed to: ${locale}`)
    } catch (error) {
      console.error('Failed to set locale:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const toggleLocale = async (): Promise<void> => {
    const currentIndex = availableLocales.value.findIndex(
      config => config.code === currentLocale.value
    )
    const nextIndex = (currentIndex + 1) % availableLocales.value.length
    const nextLocale = availableLocales.value[nextIndex].code
    
    await setLocale(nextLocale)
  }

  const reset = async (): Promise<void> => {
    await setLocale('en') // Reset to default English
  }

  // Initialize document attributes on store creation
  const initialize = () => {
    // Set initial document attributes
    document.documentElement.lang = currentLocale.value
    document.documentElement.dir = localeConfig.value.direction

    // Initialize i18n integration
    initializeI18n()

    console.log(`Locale store initialized with: ${currentLocale.value}`)
  }

  // Getters
  const getLocaleByCode = (code: string): LocaleConfig | undefined => {
    return availableLocales.value.find(locale => locale.code === code)
  }

  const isLocaleActive = (code: AvailableLocales): boolean => {
    return currentLocale.value === code
  }

  // Export store interface
  return {
    // State
    currentLocale: readonly(currentLocale),
    isLoading: readonly(isLoading),
    lastChanged: readonly(lastChanged),

    // Computed
    localeConfig,
    availableLocales,
    isRTL,

    // Actions
    setLocale,
    toggleLocale,
    reset,
    initialize,

    // Getters
    getLocaleByCode,
    isLocaleActive
  }
})

// Type helpers for external usage
export type LocaleStore = ReturnType<typeof useLocaleStore>