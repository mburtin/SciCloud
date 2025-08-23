/**
 * Format utility functions
 * Centralized formatting logic for consistent data display
 * Enhanced with i18n support while maintaining backward compatibility
 */

import { 
  formatDateLocalized, 
  formatNumberLocalized, 
  formatCurrencyLocalized,
  formatPercentageLocalized,
  formatFileSizeLocalized,
  formatTimeAgoLocalized
} from '@/i18n/utils'

/**
 * Format date for display with robust null/undefined handling
 * @deprecated Use useLocaleFormat().formatDate() for locale-aware formatting
 */
export const formatDate = (dateString: string | null | undefined): string => {
  // Maintain backward compatibility with default English locale
  return formatDateLocalized(dateString, 'en', 'short')
}

/**
 * Format date with simplified format (no year abbreviations)
 * @deprecated Use useLocaleFormat().formatDate() for locale-aware formatting
 */
export const formatDateSimple = (dateString: string | null | undefined): string => {
  // Maintain backward compatibility with default English locale
  return formatDateLocalized(dateString, 'en', 'short')
}

/**
 * Format file size from bytes to human-readable format
 * @deprecated Use useLocaleFormat().formatFileSize() for locale-aware formatting
 */
export const formatFileSize = (bytes: number): string => {
  // Maintain backward compatibility with default English locale
  return formatFileSizeLocalized(bytes, 'en')
}

/**
 * Format number with locale-specific formatting
 * @deprecated Use useLocaleFormat().formatNumber() for locale-aware formatting
 */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  // Maintain backward compatibility with default English locale
  return formatNumberLocalized(value, 'en', options)
}

/**
 * Format currency value
 * @deprecated Use useLocaleFormat().formatCurrency() for locale-aware formatting
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  // Maintain backward compatibility with default English locale
  return formatCurrencyLocalized(value, 'en', currency)
}

/**
 * Format percentage value
 * @deprecated Use useLocaleFormat().formatPercentage() for locale-aware formatting
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  // Maintain backward compatibility with default English locale
  return formatPercentageLocalized(value, 'en', decimals)
}

/**
 * Format timestamp as relative time (e.g., "5m ago", "2h ago")
 * @deprecated Use useLocaleFormat().formatTimeAgo() for locale-aware formatting
 */
export const formatTimeAgo = (timestamp: string | Date): string => {
  // Maintain backward compatibility with default English locale
  return formatTimeAgoLocalized(timestamp, 'en')
}

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}
