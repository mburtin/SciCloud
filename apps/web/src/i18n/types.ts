/**
 * Vue I18n TypeScript definitions for SciCloud
 * Provides type-safe translation keys and compile-time validation
 */

// Import the master locale (English) to use as schema
import type enLocale from './locales/en.json'

// Define the locale message schema based on English locale
export type MessageSchema = typeof enLocale

// Define available locales
export type AvailableLocales = 'en' | 'fr'

// Locale configuration
export interface LocaleConfig {
  code: AvailableLocales
  name: string
  flag: string
  direction: 'ltr' | 'rtl'
}

// Date and time format configurations
export interface DateTimeFormat {
  short: Intl.DateTimeFormatOptions
  long: Intl.DateTimeFormatOptions
  time: Intl.DateTimeFormatOptions
  datetime: Intl.DateTimeFormatOptions
}

// Number format configurations
export interface NumberFormat {
  currency: Intl.NumberFormatOptions
  decimal: Intl.NumberFormatOptions
  percent: Intl.NumberFormatOptions
}

// Vue I18n module augmentation for global properties
declare module 'vue-i18n' {
  // Define locale message interface
  export interface DefineLocaleMessage extends MessageSchema {}
  
  // Define date-time format interface
  export interface DefineDateTimeFormat extends DateTimeFormat {}
  
  // Define number format interface
  export interface DefineNumberFormat extends NumberFormat {}
}

// Utility type for extracting nested translation keys
export type TranslationKey = NestedKeyOf<MessageSchema>

// Helper type for nested object keys
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

// Locale persistence configuration
export interface LocaleStorageConfig {
  key: string
  storage: 'localStorage' | 'sessionStorage' | 'cookie'
}

// I18n configuration options
export interface I18nConfig {
  defaultLocale: AvailableLocales
  fallbackLocale: AvailableLocales
  availableLocales: LocaleConfig[]
  storage: LocaleStorageConfig
  lazy: boolean
  detectBrowserLanguage: boolean
}