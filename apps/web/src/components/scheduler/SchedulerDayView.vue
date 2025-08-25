<template>
  <div class="flex flex-col bg-card rounded-lg border">
    <!-- Day Header - Table-like styling -->
    <div class="bg-muted/30 border-b-2 border-border p-4">
      <div class="text-center">
        <h2 class="font-semibold text-lg text-foreground">
          {{ days[0]?.label }}
        </h2>
        <p class="text-sm text-muted-foreground mt-1 font-medium">
          {{ days[0]?.events.length || 0 }} {{ (days[0]?.events.length || 0) === 1 ? t('calendar.views.common.event') : t('calendar.views.common.events') }}
        </p>
      </div>
    </div>

    <!-- Calendar Grid with 24-hour scrollable view -->
    <div 
      ref="calendarContainer"
      class="relative bg-background h-[600px] overflow-y-auto scroll-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
      role="grid"
      :aria-label="`Daily calendar grid showing ${days[0]?.label || ''} with 24-hour time slots`"
      tabindex="0"
      @scroll="handleScroll"
      @keydown="handleKeyDown"
    >
      <div class="grid grid-cols-[auto_1fr] overflow-hidden">
        <!-- Time Labels -->
        <div class="sticky left-0 w-20 border-r border-border bg-muted/10 z-10">
          <div 
            v-for="slot in timeSlots" 
            :key="slot.hour"
            class="h-20 border-b border-border flex items-start justify-end pr-3 pt-1"
            :class="{
              'bg-blue-50/50 border-blue-200': isBusinessHour(slot.hour),
              'bg-muted/5': !isBusinessHour(slot.hour)
            }"
          >
            <span 
              class="text-xs font-medium"
              :class="{
                'text-foreground font-semibold': isBusinessHour(slot.hour),
                'text-muted-foreground': !isBusinessHour(slot.hour)
              }"
            >
              {{ slot.label }}
            </span>
          </div>
        </div>

        <!-- Day Column -->
        <div class="relative">

          <!-- Time Slots Grid -->
          <div class="relative">
            <!-- Hour Slots (clickable areas) -->
            <div 
              v-for="slot in timeSlots" 
              :key="`slot-${slot.hour}`"
              class="h-20 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors focus:bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-inset"
              :class="{
                'bg-blue-50/20 hover:bg-blue-50/40': isBusinessHour(slot.hour),
                'hover:bg-muted/20': !isBusinessHour(slot.hour)
              }"
              role="gridcell"
              :aria-label="`${slot.label} on ${days[0]?.label || ''}`"
              tabindex="-1"
              @click="handleTimeSlotClick(days[0]?.date || '', slot.label)"
              @keydown="handleTimeSlotKeyDown($event, days[0]?.date || '', slot.label)"
            />

            <!-- Events -->
            <div
              v-for="event in days[0]?.events || []"
              :key="event.id"
              class="absolute left-1 right-1 px-3 py-2 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md"
              :class="[
                getEventClasses(event).container,
                selectedEvent?.id === event.id ? 'ring-2 ring-primary' : ''
              ]"
              :style="getEventStyle(event)"
              @click.stop="handleEventClick(event)"
              draggable="true"
              @dragstart="handleDragStart($event, event)"
              @dragend="handleDragEnd"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate">
                    {{ event.title }}
                  </p>
                  <div v-if="!event.allDay" class="flex items-center gap-1 text-xs mt-1">
                    <Clock class="h-3 w-3" />
                    <span>{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</span>
                  </div>
                  <div v-if="event.allDay" class="text-xs mt-1">
                    {{ t('calendar.views.common.allDay') }}
                  </div>
                  <div v-if="event.location" class="flex items-center gap-1 text-xs mt-1">
                    <MapPin class="h-3 w-3" />
                    <span class="truncate">{{ event.location }}</span>
                  </div>
                </div>
                <div class="flex items-start gap-1 ml-2">
                  <Badge :class="getEventClasses(event).badge" class="text-xs">
                    {{ eventCategoryConfigs[event.category]?.label }}
                  </Badge>
                  <!-- Event Actions -->
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm" class="h-6 w-6 p-0 hover:bg-black/10">
                        <MoreHorizontal class="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="handleEditEvent(event)">
                        <Edit class="h-4 w-4 mr-2" />
                        {{ t('calendar.views.actions.edit') }}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        @click="handleDeleteEvent(event.id)"
                        class="text-destructive focus:text-destructive"
                      >
                        <Trash class="h-4 w-4 mr-2" />
                        {{ t('calendar.views.actions.delete') }}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <!-- Event Description -->
              <div v-if="event.description" class="text-xs mt-2 text-muted-foreground line-clamp-2">
                {{ event.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
import { useSchedulerScroll } from '@/composables/useSchedulerScroll'
import { useTranslation } from '@/composables/useLocale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Clock, 
  Edit, 
  MapPin, 
  MoreHorizontal, 
  Trash 
} from 'lucide-vue-next'
import type { 
  DayView, 
  TimeSlot, 
  SchedulerEvent, 
  EventCategoryConfigs 
} from '@/types/scheduler'

interface Props {
  days: DayView[]
  timeSlots: TimeSlot[]
  selectedEvent: SchedulerEvent | null
  eventCategoryConfigs: EventCategoryConfigs
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'event:select': [event: SchedulerEvent | null]
  'event:edit': [event: SchedulerEvent]
  'event:delete': [eventId: string]
  'event:move': [eventId: string, newDate: string, newStartTime?: string]
  'time-slot:click': [date: string, time: string]
}>()

// Translation composable
const { t } = useTranslation()

// Drag and drop state
const draggedEvent = ref<SchedulerEvent | null>(null)

// Use scheduler scroll composable
const {
  calendarContainer,
  isBusinessHour,
  handleScroll,
  scrollToTime
} = useSchedulerScroll()

// Event handlers
const handleEventClick = (event: SchedulerEvent) => {
  emit('event:select', event)
}

const handleEditEvent = (event: SchedulerEvent) => {
  emit('event:edit', event)
}

const handleDeleteEvent = (eventId: string) => {
  emit('event:delete', eventId)
}

const handleTimeSlotClick = (date: string, time: string) => {
  emit('time-slot:click', date, time)
}

// Keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Home':
      event.preventDefault()
      scrollToTime(0, true)
      break
    case 'End':
      event.preventDefault()
      scrollToTime(23, true)
      break
    case 'PageUp':
      event.preventDefault()
      if (calendarContainer.value) {
        calendarContainer.value.scrollBy({ top: -320, behavior: 'smooth' }) // ~5 hours
      }
      break
    case 'PageDown':
      event.preventDefault()
      if (calendarContainer.value) {
        calendarContainer.value.scrollBy({ top: 320, behavior: 'smooth' }) // ~5 hours
      }
      break
    case '8': // Quick jump to 8 AM
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        scrollToTime(8, true)
      }
      break
  }
}

const handleTimeSlotKeyDown = (event: KeyboardEvent, date: string, time: string) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleTimeSlotClick(date, time)
  }
}

// Drag and drop handlers
const handleDragStart = (dragEvent: DragEvent, event: SchedulerEvent) => {
  if (!dragEvent.dataTransfer) return
  draggedEvent.value = event
  dragEvent.dataTransfer.effectAllowed = 'move'
  dragEvent.dataTransfer.setData('text/plain', event.id)
}

const handleDragEnd = () => {
  draggedEvent.value = null
}

// Utility functions
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  if (hours === undefined || minutes === undefined) return 0
  return hours * 60 + minutes
}

const getEventStyle = (event: SchedulerEvent) => {
  if (event.allDay) {
    return {
      top: '0.25rem', // Small offset from top of first time slot
      height: '2rem'
    }
  }

  // Calculate position from start of day (00:00)
  const startMinutes = timeToMinutes(event.startTime)
  const endMinutes = timeToMinutes(event.endTime)
  const durationMinutes = endMinutes - startMinutes

  // Each hour slot is 5rem (80px), so position is (minutes/60) * 5rem
  const top = (startMinutes / 60) * 5
  const height = Math.max((durationMinutes / 60) * 5, 1.5) // Minimum 1.5rem height

  return {
    top: `${top}rem`,
    height: `${height}rem`
  }
}

const formatTime = (time: string): string => {
  // Remove seconds if present (HH:MM:SS -> HH:MM)
  return time.split(':').slice(0, 2).join(':')
}

const getEventClasses = (event: SchedulerEvent) => {
  const config = props.eventCategoryConfigs[event.category]
  return {
    container: `${config.color.bg} border-l-4 ${config.color.border}`,
    badge: config.color.badge,
    text: config.color.text
  }
}
</script>