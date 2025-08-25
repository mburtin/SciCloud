/**
 * Date utility functions for calendar operations
 * Centralized date calculations to avoid duplication
 */

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay()
  // Convert Sunday (0) to 7 for Monday-based week calculation
  const mondayBasedDay = day === 0 ? 7 : day
  const diff = start.getDate() - (mondayBasedDay - 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

/**
 * Get the end of the week (Sunday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const end = getWeekStart(date)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}