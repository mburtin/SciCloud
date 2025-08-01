/**
 * Device and browser utilities
 * Extracted from session service for proper separation of concerns
 */

/**
 * Parse user agent to get readable device info
 */
export function parseUserAgent(userAgent: string): string {
  // Simple user agent parsing - in production, use a proper library
  if (userAgent.includes('Chrome')) {
    if (userAgent.includes('Edg')) return 'Microsoft Edge'
    if (userAgent.includes('OPR')) return 'Opera'
    return 'Chrome'
  }
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
  
  // Platform detection
  let platform = 'Unknown'
  if (userAgent.includes('Windows')) platform = 'Windows'
  else if (userAgent.includes('Mac')) platform = 'macOS'
  else if (userAgent.includes('Linux')) platform = 'Linux'
  else if (userAgent.includes('iPhone')) platform = 'iPhone'
  else if (userAgent.includes('Android')) platform = 'Android'
  
  return `${userAgent.includes('Chrome') ? 'Chrome' : 'Browser'} on ${platform}`
}

/**
 * Get current location (simplified for demo)
 */
export async function getCurrentLocation(): Promise<string> {
  // In a real app, you might use IP geolocation or browser geolocation API
  // For now, return a placeholder
  try {
    // Simple timezone-based location approximation
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const city = timezone.split('/').pop()?.replace('_', ' ') || 'Unknown'
    return `${city}`
  } catch {
    return 'Unknown Location'
  }
}