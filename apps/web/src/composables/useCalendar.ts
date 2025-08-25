/**
 * Calendar composable - Unified calendar logic following S.O.L.I.D. principles
 * Single Responsibility: Handle calendar-specific UI logic and state management
 * Consolidated from useScheduler and useCalendar to eliminate duplication
 */

import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCalendarStore } from '@/stores/calendar.store'
import { useTranslation, useLocale } from '@/composables/useLocale'
import { getWeekStart, getWeekEnd, isToday } from '@/utils/dateUtils'
import type { 
  SchedulerEvent, 
  EventFormData, 
  ViewType, 
  EventCategory,
  EventValidationError,
  EventCategoryConfigs,
  TimeSlot,
  DayView
} from '@/types/scheduler'
import type { CalendarEventInsert, CalendarEventUpdate } from '@/services/calendar.service'

export function useCalendar() {
  const calendarStore = useCalendarStore()
  const { t } = useTranslation()
  const { currentLocale } = useLocale()
  
  // Destructure reactive refs from store
  const {
    events,
    selectedEvent,
    currentDate,
    currentView,
    loading,
    error,
    filteredEvents,
    eventsByDate,
    eventsByCategory,
    upcomingEvents,
    hasEvents
  } = storeToRefs(calendarStore)

  // Local reactive state for UI components
  const isEventDialogOpen = ref(false)
  const eventFormData = ref<EventFormData | null>(null)
  const isEditing = ref(false)
  const draggedEvent = ref<SchedulerEvent | null>(null)

  // Event category configurations (consolidated from useScheduler)
  const eventCategoryConfigs: EventCategoryConfigs = {
    maintenance: {
      label: t('calendar.categories.maintenance'),
      color: {
        bg: 'bg-yellow-100/80 border-yellow-300/80 text-yellow-900',
        border: 'border-yellow-300',
        text: 'text-yellow-900',
        badge: 'bg-yellow-200 text-yellow-800'
      }
    },
    experiment: {
      label: t('calendar.categories.experiment'),
      color: {
        bg: 'bg-red-100/80 border-red-300/80 text-red-900',
        border: 'border-red-300',
        text: 'text-red-900',
        badge: 'bg-red-200 text-red-800'
      }
    },
    training: {
      label: t('calendar.categories.training'),
      color: {
        bg: 'bg-green-100/80 border-green-300/80 text-green-900',
        border: 'border-green-300',
        text: 'text-green-900',
        badge: 'bg-green-200 text-green-800'
      }
    },
    meeting: {
      label: t('calendar.categories.meeting'),
      color: {
        bg: 'bg-blue-100/80 border-blue-300/80 text-blue-900',
        border: 'border-blue-300',
        text: 'text-blue-900',
        badge: 'bg-blue-200 text-blue-800'
      }
    },
    custom: {
      label: t('calendar.categories.custom'),
      color: {
        bg: 'bg-purple-100/80 border-purple-300/80 text-purple-900',
        border: 'border-purple-300',
        text: 'text-purple-900',
        badge: 'bg-purple-200 text-purple-800'
      }
    }
  }

  // Computed values for UI display
  const currentDateFormatted = computed(() => {
    return currentDate.value.toLocaleDateString(currentLocale.value, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })

  const dateRangeLabel = computed(() => {
    if (currentView.value === 'day') {
      return currentDate.value.toLocaleDateString(currentLocale.value, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    // Week view
    const weekStart = getWeekStart(currentDate.value)
    const weekEnd = getWeekEnd(currentDate.value)
    
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${weekStart.toLocaleDateString(currentLocale.value, { month: 'long' })} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`
    } else {
      return `${weekStart.toLocaleDateString(currentLocale.value, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(currentLocale.value, { month: 'short', day: 'numeric' })}, ${weekStart.getFullYear()}`
    }
  })

  // Time slots for the calendar grid (consolidated from useScheduler)
  const timeSlots = computed<TimeSlot[]>(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i
      return {
        hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
        minutes: hour * 60
      }
    })
  })

  // Get current view days (enhanced from useScheduler pattern)
  const viewDays = computed<DayView[]>(() => {
    if (currentView.value === 'day') {
      const dateStr = currentDate.value.toISOString().split('T')[0]
      return [{
        date: dateStr,
        label: currentDate.value.toLocaleDateString(currentLocale.value, { weekday: 'long', month: 'long', day: 'numeric' }),
        events: eventsByDate.value[dateStr] || [],
        isToday: isToday(currentDate.value),
        isWeekend: currentDate.value.getDay() === 0 || currentDate.value.getDay() === 6
      }]
    } else {
      // Week view - get 7 days starting from Monday
      const weekStart = getWeekStart(currentDate.value)
      return Array.from({ length: 7 }, (_, i) => {
        const dayDate = new Date(weekStart)
        dayDate.setDate(weekStart.getDate() + i)
        const dateStr = dayDate.toISOString().split('T')[0]
        return {
          date: dateStr,
          label: dayDate.toLocaleDateString(currentLocale.value, { weekday: 'short', day: 'numeric' }),
          events: eventsByDate.value[dateStr] || [],
          isToday: isToday(dayDate),
          isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6
        }
      })
    }
  })

  // Legacy weekDays for backward compatibility
  const weekDays = computed(() => {
    if (currentView.value !== 'week') return []
    
    return viewDays.value.map(day => ({
      ...day,
      fullLabel: new Date(day.date).toLocaleDateString(currentLocale.value, { weekday: 'long', month: 'long', day: 'numeric' })
    }))
  })

  // Initialization
  async function initialize() {
    try {
      await calendarStore.initialize()
    } catch (err) {
      console.error('Failed to initialize calendar:', err)
    }
  }

  // Event management actions
  async function createEvent(eventData: EventFormData): Promise<void> {
    try {
      const insertData: CalendarEventInsert = {
        title: eventData.title,
        description: eventData.description || undefined,
        event_date: eventData.date,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        category: eventData.category,
        location: eventData.location || undefined,
        attendees: eventData.attendees?.length ? eventData.attendees : undefined,
        all_day: eventData.allDay || false
      }

      await calendarStore.createEvent(insertData)
      closeEventDialog()
    } catch (err) {
      console.error('Failed to create event:', err)
      throw err
    }
  }

  async function updateEvent(eventId: string, eventData: EventFormData): Promise<void> {
    try {
      const updateData: CalendarEventUpdate = {
        title: eventData.title,
        event_date: eventData.date,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        category: eventData.category,
        location: eventData.location || undefined,
        attendees: eventData.attendees?.length ? eventData.attendees : undefined,
        all_day: eventData.allDay || false
      }

      await calendarStore.updateEvent(eventId, updateData)
      closeEventDialog()
    } catch (err) {
      console.error('Failed to update event:', err)
      throw err
    }
  }

  async function deleteEvent(eventId: string): Promise<void> {
    try {
      await calendarStore.deleteEvent(eventId)
      if (selectedEvent.value?.id === eventId) {
        calendarStore.selectEvent(null)
      }
    } catch (err) {
      console.error('Failed to delete event:', err)
      throw err
    }
  }

  // Event dialog management
  function openCreateEventDialog(defaultDate?: string, defaultTime?: string) {
    const date = defaultDate || currentDate.value.toISOString().split('T')[0]
    const time = defaultTime || '09:00'
    
    eventFormData.value = {
      title: '',
      description: '',
      startTime: time,
      endTime: addHours(time, 1),
      date,
      category: 'custom',
      location: '',
      attendees: [],
      allDay: false
    }
    
    isEditing.value = false
    isEventDialogOpen.value = true
  }

  function openEditEventDialog(event: SchedulerEvent) {
    eventFormData.value = {
      title: event.title,
      description: event.description || '',
      startTime: event.startTime,
      endTime: event.endTime,
      date: event.date,
      category: event.category,
      location: event.location || '',
      attendees: event.attendees || [],
      allDay: event.allDay || false
    }
    
    isEditing.value = true
    isEventDialogOpen.value = true
    calendarStore.selectEvent(event)
  }

  function closeEventDialog() {
    isEventDialogOpen.value = false
    eventFormData.value = null
    isEditing.value = false
    calendarStore.selectEvent(null)
  }

  // View navigation
  function changeView(view: ViewType) {
    calendarStore.setView(view)
  }

  function goToDate(date: Date) {
    calendarStore.setCurrentDate(date)
  }

  function goToToday() {
    calendarStore.goToToday()
  }

  function goToPrevious() {
    calendarStore.goToPrevious()
  }

  function goToNext() {
    calendarStore.goToNext()
  }

  // Event interaction
  function selectEvent(event: SchedulerEvent | null) {
    calendarStore.selectEvent(event)
  }

  function handleEventClick(event: SchedulerEvent) {
    selectEvent(event)
    openEditEventDialog(event)
  }

  // Drag and drop support
  function startDrag(event: SchedulerEvent) {
    draggedEvent.value = event
  }

  function endDrag() {
    draggedEvent.value = null
  }

  async function handleEventDrop(eventId: string, newDate: string, newStartTime: string) {
    try {
      const event = events.value.find(e => e.id === eventId)
      if (!event) throw new Error('Event not found')

      const timeDiff = getTimeDifference(event.startTime, event.endTime)
      const newEndTime = addMinutes(newStartTime, timeDiff)

      await calendarStore.updateEvent(eventId, {
        event_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime
      })
    } catch (err) {
      console.error('Failed to move event:', err)
      throw err
    } finally {
      endDrag()
    }
  }

  // Utility functions

  function addHours(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number)
    const totalMinutes = h * 60 + m + (hours * 60)
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMinutes = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
  }

  function addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number)
    const totalMinutes = h * 60 + m + minutes
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMinutes = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
  }

  function getTimeDifference(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    return endMinutes - startMinutes
  }

  // Additional utility functions (consolidated from useScheduler)
  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  function getEventsForDate(date: string): SchedulerEvent[] {
    return eventsByDate.value[date] || []
  }

  function getEventStyle(event: SchedulerEvent) {
    if (event.allDay) {
      return {
        top: '0.5rem',
        height: '2rem'
      }
    }

    // Calculate position from start of day (00:00)
    const startMinutes = timeToMinutes(event.startTime)
    const endMinutes = timeToMinutes(event.endTime)
    const durationMinutes = endMinutes - startMinutes

    // 4rem per hour for 24-hour view (h-16 = 4rem per slot)
    const top = (startMinutes / 60) * 4
    const height = Math.max((durationMinutes / 60) * 4, 0.5) // Minimum 0.5rem height

    return {
      top: `${top}rem`,
      height: `${height}rem`
    }
  }

  function getEventClasses(event: SchedulerEvent) {
    const config = eventCategoryConfigs[event.category]
    return {
      container: `${config.color.bg} border ${config.color.border}`,
      badge: config.color.badge,
      text: config.color.text
    }
  }

  function getEventCategories() {
    return Object.entries(eventCategoryConfigs).map(([key, config]) => ({
      value: key as EventCategory,
      label: config.label,
      color: config.color
    }))
  }

  // Event validation (consolidated from useScheduler)
  function validateEventData(data: EventFormData, excludeEventId?: string): EventValidationError[] {
    const errors: EventValidationError[] = []

    if (!data.title.trim()) {
      errors.push({ field: 'title', message: t('calendar.validation.titleRequired') })
    }

    if (!data.date) {
      errors.push({ field: 'date', message: t('calendar.validation.dateRequired') })
    }

    if (!data.allDay) {
      if (!data.startTime) {
        errors.push({ field: 'startTime', message: t('calendar.validation.startTimeRequired') })
      }
      if (!data.endTime) {
        errors.push({ field: 'endTime', message: t('calendar.validation.endTimeRequired') })
      }
      
      // Check if start time is before end time
      if (data.startTime && data.endTime) {
        const startMinutes = timeToMinutes(data.startTime)
        const endMinutes = timeToMinutes(data.endTime)
        if (startMinutes >= endMinutes) {
          errors.push({ field: 'endTime', message: t('calendar.validation.endTimeAfterStart') })
        }
      }
    }

    // Check for overlapping events on the same date (excluding the event being edited)
    const existingEvents = getEventsForDate(data.date).filter(event => 
      excludeEventId ? event.id !== excludeEventId : true
    )
    const hasOverlap = existingEvents.some(event => {
      if (data.allDay && event.allDay) return true
      if (data.allDay || event.allDay) return false

      const newStart = timeToMinutes(data.startTime)
      const newEnd = timeToMinutes(data.endTime)
      const existingStart = timeToMinutes(event.startTime)
      const existingEnd = timeToMinutes(event.endTime)

      return (newStart < existingEnd && newEnd > existingStart)
    })

    if (hasOverlap) {
      errors.push({ field: 'startTime', message: t('calendar.validation.timeSlotConflict') })
    }

    return errors
  }

  // Auto-refresh functionality
  const refreshInterval = ref<number | null>(null)

  function startAutoRefresh(intervalMs = 300000) { // 5 minutes
    if (refreshInterval.value) return
    
    refreshInterval.value = setInterval(() => {
      if (!loading.value) {
        calendarStore.loadEvents(true)
      }
    }, intervalMs)
  }

  function stopAutoRefresh() {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    initialize()
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  // Watch for authentication changes
  watch(() => calendarStore.error, (newError) => {
    if (newError?.includes('authenticated')) {
      // Handle authentication errors
      calendarStore.reset()
    }
  })

  return {
    // Store state
    events,
    selectedEvent,
    currentDate,
    currentView,
    loading,
    error,
    filteredEvents,
    eventsByDate,
    eventsByCategory,
    upcomingEvents,
    hasEvents,
    
    // Local state
    isEventDialogOpen,
    eventFormData,
    isEditing,
    draggedEvent,
    
    // Computed
    currentDateFormatted,
    dateRangeLabel,
    weekDays,
    viewDays,
    timeSlots,
    eventCategoryConfigs,
    
    // Event management
    createEvent,
    updateEvent,
    deleteEvent,
    
    // Dialog management
    openCreateEventDialog,
    openEditEventDialog,
    closeEventDialog,
    
    // Navigation
    changeView,
    goToDate,
    goToToday,
    goToPrevious,
    goToNext,
    
    // Event interaction
    selectEvent,
    handleEventClick,
    
    // Drag and drop
    startDrag,
    endDrag,
    handleEventDrop,
    
    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh,
    
    // Utilities (consolidated from useScheduler)
    timeToMinutes,
    getEventsForDate,
    getEventStyle,
    getEventClasses,
    getEventCategories,
    validateEventData
  }
}