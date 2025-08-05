/**
 * Format utility functions
 * Centralized formatting logic for consistent data display
 */

/**
 * Format date for display with robust null/undefined handling
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    
    // Check for invalid date
    if (isNaN(date.getTime())) return ''
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Format date with simplified format (no year abbreviations)
 */
export const formatDateSimple = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    
    // Check for invalid date
    if (isNaN(date.getTime())) return ''
    
    return date.toLocaleDateString('en-US')
  } catch {
    return ''
  }
}

/**
 * Format file size from bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Format number with locale-specific formatting
 */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('en-US', options).format(value)
}

/**
 * Format currency value
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return formatNumber(value, {
    style: 'currency',
    currency,
  })
}

/**
 * Format percentage value
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return formatNumber(value, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}