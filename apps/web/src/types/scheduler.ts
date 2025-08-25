export type ViewType = 'day' | 'week'

export type EventCategory = 'maintenance' | 'experiment' | 'training' | 'meeting' | 'custom'

export interface SchedulerEvent {
  id: string
  title: string
  startTime: string // ISO string or time format HH:mm
  endTime: string // ISO string or time format HH:mm
  date: string // ISO date string YYYY-MM-DD
  category: EventCategory
  color?: string
  allDay?: boolean
  location?: string
  attendees?: string[]
}

export interface TimeSlot {
  hour: number
  label: string
  minutes: number
}

export interface DayView {
  date: string
  label: string
  events: SchedulerEvent[]
  isToday: boolean
  isWeekend: boolean
}

export interface SchedulerState {
  currentDate: Date
  view: ViewType
  events: SchedulerEvent[]
  selectedEvent: SchedulerEvent | null
  isLoading: boolean
  error: string | null
}

export interface EventFormData {
  title: string
  startTime: string
  endTime: string
  date: string
  category: EventCategory
  location: string
  attendees: string[]
  allDay: boolean
}

export interface EventCategoryConfig {
  label: string
  color: {
    bg: string
    border: string
    text: string
    badge: string
  }
}

export type EventCategoryConfigs = Record<EventCategory, EventCategoryConfig>

export interface SchedulerEmits {
  'event:create': [event: SchedulerEvent]
  'event:update': [event: SchedulerEvent]
  'event:delete': [eventId: string]
  'event:select': [event: SchedulerEvent | null]
  'date:change': [date: Date]
  'view:change': [view: ViewType]
}

export interface EventValidationError {
  field: keyof EventFormData
  message: string
}

export interface DragDropData {
  eventId: string
  originalDate: string
  originalStartTime: string
  newDate: string
  newStartTime: string
}