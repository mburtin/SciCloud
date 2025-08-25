/**
 * Calendar store - Reactive state management for calendar events
 * Following SciCloud architecture patterns and S.O.L.I.D. principles
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { calendarService, type CalendarEventInsert, type CalendarEventUpdate } from '@/services/calendar.service'
import type { SchedulerEvent, EventCategory, ViewType } from '@/types/scheduler'
import { useAuthStore } from '@/stores/auth.store'
import { getWeekStart, getWeekEnd } from '@/utils/dateUtils'

export const useCalendarStore = defineStore('calendar', () => {
  // Reactive state
  const events = ref<SchedulerEvent[]>([])
  const selectedEvent = ref<SchedulerEvent | null>(null)
  const currentDate = ref(new Date())
  const currentView = ref<ViewType>('week')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Computed getters following Vue 3 composition patterns
  const filteredEvents = computed(() => {
    if (currentView.value === 'day') {
      const dateStr = currentDate.value.toISOString().split('T')[0]
      return events.value.filter(event => event.date === dateStr)
    }
    
    if (currentView.value === 'week') {
      const weekStart = getWeekStart(currentDate.value)
      const weekEnd = getWeekEnd(currentDate.value)
      return events.value.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= weekStart && eventDate <= weekEnd
      })
    }
    
    return events.value
  })

  const eventsByDate = computed(() => {
    const grouped: Record<string, SchedulerEvent[]> = {}
    filteredEvents.value.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = []
      }
      grouped[event.date].push(event)
    })
    return grouped
  })

  const eventsByCategory = computed(() => {
    const grouped: Record<EventCategory, SchedulerEvent[]> = {
      maintenance: [],
      experiment: [],
      training: [],
      meeting: [],
      custom: []
    }
    
    filteredEvents.value.forEach(event => {
      grouped[event.category].push(event)
    })
    
    return grouped
  })

  const upcomingEvents = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return events.value
      .filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= today
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return a.startTime.localeCompare(b.startTime)
      })
      .slice(0, 5)
  })

  const hasEvents = computed(() => events.value.length > 0)

  // Actions following SciCloud service patterns
  async function initialize() {
    if (isInitialized.value) return

    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      throw new Error('User must be authenticated to access calendar')
    }

    try {
      loading.value = true
      error.value = null
      await loadEvents()
      isInitialized.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize calendar'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadEvents(forceReload = false) {
    if (loading.value && !forceReload) return

    try {
      loading.value = true
      error.value = null

      let startDate: string
      let endDate: string

      if (currentView.value === 'day') {
        const dateStr = currentDate.value.toISOString().split('T')[0]
        startDate = dateStr
        endDate = dateStr
      } else {
        // Load a month's worth of data for week view performance
        const monthStart = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
        const monthEnd = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
        startDate = monthStart.toISOString().split('T')[0]
        endDate = monthEnd.toISOString().split('T')[0]
      }

      const data = await calendarService.getEvents({ startDate, endDate })
      events.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load events'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadEventsByDate(date: string) {
    try {
      loading.value = true
      error.value = null
      const data = await calendarService.getEventsByDate(date)
      
      // Update events array with new data for this date
      events.value = events.value.filter(e => e.date !== date).concat(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load events for date'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createEvent(eventData: CalendarEventInsert): Promise<SchedulerEvent> {
    try {
      loading.value = true
      error.value = null

      const newEvent = await calendarService.createEvent(eventData)
      
      // Add to local state
      events.value.push(newEvent)
      
      // Sort events by date and time
      sortEvents()
      
      return newEvent
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEvent(eventId: string, updates: CalendarEventUpdate): Promise<SchedulerEvent> {
    try {
      loading.value = true
      error.value = null

      const updatedEvent = await calendarService.updateEvent(eventId, updates)
      
      // Update local state
      const index = events.value.findIndex(e => e.id === eventId)
      if (index !== -1) {
        events.value[index] = updatedEvent
        sortEvents()
      }
      
      // Update selected event if it's the one being updated
      if (selectedEvent.value?.id === eventId) {
        selectedEvent.value = updatedEvent
      }
      
      return updatedEvent
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEvent(eventId: string): Promise<void> {
    try {
      loading.value = true
      error.value = null

      await calendarService.deleteEvent(eventId)
      
      // Remove from local state
      events.value = events.value.filter(e => e.id !== eventId)
      
      // Clear selected event if it's the one being deleted
      if (selectedEvent.value?.id === eventId) {
        selectedEvent.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchEvents(query: string): Promise<SchedulerEvent[]> {
    try {
      loading.value = true
      error.value = null
      
      return await calendarService.searchEvents(query)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search events'
      throw err
    } finally {
      loading.value = false
    }
  }

  // View management
  function setView(view: ViewType) {
    if (currentView.value !== view) {
      currentView.value = view
      // Reload events for the new view
      loadEvents()
    }
  }

  function setCurrentDate(date: Date) {
    currentDate.value = date
    // Reload events for the new date
    loadEvents()
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  function goToPrevious() {
    const newDate = new Date(currentDate.value)
    if (currentView.value === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() - 7)
    }
    setCurrentDate(newDate)
  }

  function goToNext() {
    const newDate = new Date(currentDate.value)
    if (currentView.value === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  // Event selection
  function selectEvent(event: SchedulerEvent | null) {
    selectedEvent.value = event
  }

  // Utility functions
  function sortEvents() {
    events.value.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.startTime.localeCompare(b.startTime)
    })
  }

  function clearError() {
    error.value = null
  }

  function reset() {
    events.value = []
    selectedEvent.value = null
    currentDate.value = new Date()
    currentView.value = 'week'
    loading.value = false
    error.value = null
    isInitialized.value = false
  }


  return {
    // State
    events,
    selectedEvent,
    currentDate,
    currentView,
    loading,
    error,
    isInitialized,
    
    // Computed
    filteredEvents,
    eventsByDate,
    eventsByCategory,
    upcomingEvents,
    hasEvents,
    
    // Actions
    initialize,
    loadEvents,
    loadEventsByDate,
    createEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    
    // View management
    setView,
    setCurrentDate,
    goToToday,
    goToPrevious,
    goToNext,
    
    // Event selection
    selectEvent,
    
    // Utilities
    clearError,
    reset
  }
})