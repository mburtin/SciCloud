import { ref, nextTick, onMounted } from 'vue'

export interface ScrollConfig {
  businessStartHour?: number
  businessEndHour?: number
  defaultScrollHour?: number // Hour to scroll to by default
  hourHeight?: number // Height in pixels for each hour
}

export function useSchedulerScroll(config: ScrollConfig = {}) {
  const {
    businessStartHour = 8,
    businessEndHour = 18,
    defaultScrollHour = 7, // Start view at 7:00 AM by default
    hourHeight = 64 // 4rem = 64px
  } = config

  // Calendar container ref for scrolling
  const calendarContainer = ref<HTMLElement | null>(null)

  // Business hours utility functions
  const isBusinessHour = (hour: number): boolean => {
    return hour >= businessStartHour && hour < businessEndHour
  }

  const isMorningHours = (hour: number): boolean => {
    return hour >= 6 && hour < 12
  }

  const isAfternoonHours = (hour: number): boolean => {
    return hour >= 12 && hour < 18
  }

  const isEveningHours = (hour: number): boolean => {
    return hour >= 18 && hour < 22
  }

  const isNightHours = (hour: number): boolean => {
    return hour >= 22 || hour < 6
  }

  // Get time period label for accessibility
  const getTimePeriodLabel = (hour: number): string => {
    if (isMorningHours(hour)) return 'Morning'
    if (isAfternoonHours(hour)) return 'Afternoon'
    if (isEveningHours(hour)) return 'Evening'
    return 'Night'
  }

  // Scroll to default hour on mount (7:00 AM)
  const scrollToDefaultHour = async () => {
    await nextTick()
    if (calendarContainer.value) {
      const scrollPosition = defaultScrollHour * hourHeight
      calendarContainer.value.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      })
    }
  }

  // Alias for backward compatibility
  const scrollToBusinessHours = scrollToDefaultHour

  // Scroll to specific time
  const scrollToTime = async (hour: number, smooth = true) => {
    await nextTick()
    if (calendarContainer.value) {
      const scrollPosition = hour * hourHeight
      calendarContainer.value.scrollTo({
        top: scrollPosition,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  }

  // Handle scroll events for performance optimizations
  const handleScroll = () => {
    // Future: Could implement virtual scrolling or performance optimizations here
  }

  // Auto-scroll to business hours on mount
  onMounted(() => {
    scrollToBusinessHours()
  })

  return {
    calendarContainer,
    isBusinessHour,
    isMorningHours,
    isAfternoonHours,
    isEveningHours,
    isNightHours,
    getTimePeriodLabel,
    scrollToDefaultHour,
    scrollToBusinessHours, // Alias for backward compatibility
    scrollToTime,
    handleScroll,
    businessStartHour,
    businessEndHour,
    defaultScrollHour
  }
}