<template>
  <div class="flex flex-col bg-card rounded-lg border">
    <!-- Week Header - Table-like styling -->
    <div class="bg-muted/30 border-b-2 border-border">
      <div class="grid grid-cols-[auto_repeat(7,1fr)]">
        <!-- Time column header -->
        <div class="w-20 h-16 border-r border-border bg-muted/50 flex items-center justify-center">
          <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">{{ t('calendar.views.common.time') }}</span>
        </div>
        
        <!-- Day Headers -->
        <div 
          v-for="day in days" 
          :key="day.date"
          class="h-16 border-r border-border last:border-r-0 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/40 transition-colors px-1"
        >
          <!-- Day name and number on same line -->
          <div class="flex items-center gap-2 mb-1">
            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {{ format(parseISO(day.date), 'EEE', { locale: getDateFnsLocale() }) }}
            </div>
            <div 
              :class="[
                'text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center',
                day.isToday ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground hover:bg-background/50',
                day.isWeekend ? 'text-muted-foreground' : ''
              ]"
            >
              {{ format(parseISO(day.date), 'd') }}
            </div>
          </div>
          <!-- Events count -->
          <div class="text-xs text-muted-foreground font-medium truncate">
            {{ day.events.length }} {{ day.events.length === 1 ? t('calendar.views.common.event') : t('calendar.views.common.events') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Grid with 24-hour scrollable view -->
    <div 
      ref="calendarContainer"
      class="relative bg-background h-[600px] overflow-y-auto scroll-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
      role="grid"
      :aria-label="`Calendar grid showing ${days.length} days with 24-hour time slots`"
      tabindex="0"
      @scroll="handleScroll"
      @keydown="handleKeyDown"
    >
      <div class="grid grid-cols-[auto_repeat(7,1fr)] min-h-full">
        <!-- Time Labels -->
        <div class="sticky left-0 w-20 border-r border-border bg-muted/10 z-10">
          <div 
            v-for="slot in timeSlots" 
            :key="slot.hour"
            class="h-16 border-b border-border flex items-start justify-end pr-3 pt-1"
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

        <!-- Day Columns -->
        <div 
          v-for="day in days" 
          :key="day.date"
          class="relative border-r border-border last:border-r-0"
          :class="{ 'bg-muted/10': day.isWeekend }"
        >
          <!-- Time Slots Grid -->
          <div class="relative">
            <!-- Hour Slots (clickable areas) -->
            <div 
              v-for="slot in timeSlots" 
              :key="`slot-${day.date}-${slot.hour}`"
              class="h-16 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors focus:bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-inset"
              :class="{
                'bg-blue-50/20 hover:bg-blue-50/40': isBusinessHour(slot.hour),
                'hover:bg-muted/20': !isBusinessHour(slot.hour)
              }"
              role="gridcell"
              :aria-label="`${slot.label} on ${format(parseISO(day.date), 'EEEE, MMMM d', { locale: getDateFnsLocale() })}`"
              tabindex="-1"
              @click="handleTimeSlotClick(day.date, slot.label)"
              @keydown="handleTimeSlotKeyDown($event, day.date, slot.label)"
              @drop="handleDrop($event, day.date, slot.label)"
              @dragover.prevent
              @dragenter.prevent
            />

            <!-- Events -->
            <div
              v-for="event in day.events"
              :key="event.id"
              class="absolute left-1 right-1 px-2 py-1 rounded-md shadow-sm border cursor-pointer transition-all hover:shadow-md z-10"
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
                  <p class="font-medium text-xs truncate">
                    {{ event.title }}
                  </p>
                  <div v-if="!event.allDay" class="flex items-center gap-1 text-xs mt-1">
                    <Clock class="h-2 w-2" />
                    <span>{{ formatTime(event.startTime) }}</span>
                  </div>
                  <div v-if="event.allDay" class="text-xs mt-1">
                    {{ t('calendar.views.common.allDay') }}
                  </div>
                </div>
                <div class="flex items-start gap-1 ml-1">
                  <Badge :class="getEventClasses(event).badge" class="text-xs scale-75">
                    {{ eventCategoryConfigs[event.category]?.label.charAt(0) }}
                  </Badge>
                  <!-- Event Actions (appears on hover) -->
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm" class="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-black/10">
                        <MoreHorizontal class="h-2 w-2" />
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
import { fr } from 'date-fns/locale'
import { useSchedulerScroll } from '@/composables/useSchedulerScroll'
import { useTranslation, useLocale } from '@/composables/useLocale'
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
const { currentLocale } = useLocale()

// Date-fns locale mapping
const getDateFnsLocale = () => {
  return currentLocale.value === 'fr' ? fr : undefined
}

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

const handleDrop = (dropEvent: DragEvent, newDate: string, newTime: string) => {
  dropEvent.preventDefault()
  if (!draggedEvent.value) return
  
  // Only move if the date or time has changed
  if (draggedEvent.value.date !== newDate || draggedEvent.value.startTime !== newTime) {
    emit('event:move', draggedEvent.value.id, newDate, newTime)
  }
  
  draggedEvent.value = null
}

// Utility functions
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  if (hours === undefined || minutes === undefined) return 0
  return hours * 60 + minutes
}

const formatTime = (time: string): string => {
  // Remove seconds if present (HH:MM:SS -> HH:MM)
  return time.split(':').slice(0, 2).join(':')
}

const getEventStyle = (event: SchedulerEvent) => {
  if (event.allDay) {
    return {
      top: '0.25rem',
      height: '1.5rem'
    }
  }

  // Calculate position from start of day (00:00)
  const startMinutes = timeToMinutes(event.startTime)
  const endMinutes = timeToMinutes(event.endTime)
  const durationMinutes = endMinutes - startMinutes

  const top = (startMinutes / 60) * 4 // 4rem per hour (h-16 = 4rem)
  const height = Math.max((durationMinutes / 60) * 4, 1) // Minimum 1rem height

  return {
    top: `${top}rem`,
    height: `${height}rem`
  }
}

const getEventClasses = (event: SchedulerEvent) => {
  const config = props.eventCategoryConfigs[event.category]
  return {
    container: `${config.color.bg} border-l-2 ${config.color.border} group`,
    badge: config.color.badge,
    text: config.color.text
  }
}
</script>