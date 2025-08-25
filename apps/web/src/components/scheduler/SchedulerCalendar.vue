<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div v-if="title" class="flex items-center gap-4">
          <div>
            <h1 class="text-2xl font-semibold text-foreground">
              {{ title }}
            </h1>
            <p class="text-muted-foreground mt-1">
              {{ dateRangeLabel }}
            </p>
          </div>
        </div>
        <div v-else class="flex items-center gap-4">
          <h1 class="text-2xl font-semibold text-foreground">
            {{ t('calendar.title') }}
          </h1>
          <p class="text-muted-foreground">
            {{ dateRangeLabel }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <!-- View Toggle -->
          <div class="flex items-center rounded-lg border bg-muted p-1">
            <Button
              :variant="state.view === 'day' ? 'default' : 'ghost'"
              size="sm"
              class="h-7 px-3"
              @click="changeView('day')"
            >
              {{ t('calendar.views.day') }}
            </Button>
            <Button
              :variant="state.view === 'week' ? 'default' : 'ghost'"
              size="sm"
              class="h-7 px-3"
              @click="changeView('week')"
            >
              {{ t('calendar.views.week') }}
            </Button>
          </div>

          <!-- Navigation -->
          <Button variant="outline" size="icon" @click="goToPrevious">
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" @click="goToToday">
            {{ t('calendar.navigation.today') }}
          </Button>
          <Button variant="outline" size="icon" @click="goToNext">
            <ChevronRight class="h-4 w-4" />
          </Button>

          <!-- Create Event -->
          <Button @click="openCreateEventDialog">
            <Plus class="h-4 w-4 mr-2" />
            {{ t('calendar.actions.newEvent') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="state.error" class="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
      {{ state.error }}
    </div>

    <!-- Calendar Content -->
    <div class="w-full">
      <!-- Day View -->
      <SchedulerDayView
        v-if="state.view === 'day'"
        :days="viewDays"
        :time-slots="timeSlots"
        :selected-event="state.selectedEvent"
        :event-category-configs="eventCategoryConfigs"
        @event:select="selectEvent"
        @event:edit="openEditEventDialog"
        @event:delete="handleDeleteEvent"
        @event:move="handleMoveEvent"
        @time-slot:click="handleTimeSlotClick"
      />

      <!-- Week View -->
      <SchedulerWeekView
        v-else
        :days="viewDays"
        :time-slots="timeSlots"
        :selected-event="state.selectedEvent"
        :event-category-configs="eventCategoryConfigs"
        @event:select="selectEvent"
        @event:edit="openEditEventDialog"
        @event:delete="handleDeleteEvent"
        @event:move="handleMoveEvent"
        @time-slot:click="handleTimeSlotClick"
      />
    </div>

    <!-- Event Form Dialog -->
    <SchedulerEventDialog
      :open="eventDialogOpen"
      :event="editingEvent"
      :event-categories="getEventCategories()"
      :is-editing="isEditingEvent"
      :initial-date="selectedDate"
      :initial-time="selectedTime"
      @close="closeEventDialog"
      @save="handleSaveEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'
import { useCalendar } from '@/composables/useCalendar'
import { useTranslation } from '@/composables/useLocale'
import SchedulerDayView from './SchedulerDayView.vue'
import SchedulerWeekView from './SchedulerWeekView.vue'
import SchedulerEventDialog from './SchedulerEventDialog.vue'
import type { SchedulerEvent, EventFormData, SchedulerEmits } from '@/types/scheduler'

interface Props {
  title?: string
  initialEvents?: SchedulerEvent[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  initialEvents: () => []
})

const emit = defineEmits<SchedulerEmits>()

// Translation composable
const { t } = useTranslation()

// Calendar composable (consolidated from useScheduler)
const {
  // State
  events,
  selectedEvent,
  currentDate,
  currentView,
  loading,
  error,
  
  // Computed
  viewDays,
  dateRangeLabel,
  timeSlots,
  eventCategoryConfigs,
  
  // Navigation
  goToPrevious,
  goToNext,
  goToToday,
  changeView,
  
  // Event management
  createEvent,
  updateEvent,
  deleteEvent,
  selectEvent,
  
  // Dialog management
  isEventDialogOpen,
  openCreateEventDialog: openCreateDialog,
  openEditEventDialog: openEditDialog,
  closeEventDialog: closeDialog,
  
  // Utilities
  getEventCategories,
  validateEventData,
  handleEventDrop
} = useCalendar()

// Legacy state mapping for backward compatibility
const state = computed(() => ({
  currentDate: currentDate.value,
  view: currentView.value,
  events: events.value,
  selectedEvent: selectedEvent.value,
  isLoading: loading.value,
  error: error.value
}))

// Dialog state - use composable state where possible
const editingEvent = ref<SchedulerEvent | null>(null)
const selectedDate = ref('')
const selectedTime = ref('')
const isEditingEvent = computed(() => editingEvent.value !== null)

// Event dialog methods
const openCreateEventDialog = (date?: string, startTime?: string) => {
  const defaultDate = date || currentDate.value.toISOString().split('T')[0]
  const defaultTime = startTime || '09:00'
  
  editingEvent.value = null
  selectedDate.value = defaultDate
  selectedTime.value = defaultTime
  openCreateDialog(defaultDate, defaultTime)
}

const openEditEventDialog = (event: SchedulerEvent) => {
  editingEvent.value = event
  openEditDialog(event)
}

const closeEventDialog = () => {
  editingEvent.value = null
  selectedDate.value = ''
  selectedTime.value = ''
  closeDialog()
}

// Use composable dialog state
const eventDialogOpen = isEventDialogOpen

// Event handlers
const handleSaveEvent = async (eventData: EventFormData) => {
  try {
    if (isEditingEvent.value && editingEvent.value) {
      // Update existing event - validate excluding the current event
      const excludeEventId = editingEvent.value.id
      
      const validationErrors = validateEventData(eventData, excludeEventId)
      if (validationErrors.length > 0) {
        console.error('Validation error:', validationErrors[0].message)
        return
      }
      
      await updateEvent(editingEvent.value.id, eventData)
      emit('event:update', editingEvent.value)
      closeEventDialog()
    } else {
      // Create new event - validate all events
      
      const validationErrors = validateEventData(eventData)
      if (validationErrors.length > 0) {
        console.error('Validation error:', validationErrors[0].message)
        return
      }
      
      await createEvent(eventData)
      const newEvent = events.value[events.value.length - 1] // Get the newly created event
      emit('event:create', newEvent)
      closeEventDialog()
    }
  } catch (err) {
    console.error('Failed to save event:', err)
  }
}

const handleDeleteEvent = async (eventId: string) => {
  try {
    await deleteEvent(eventId)
    emit('event:delete', eventId)
  } catch (err) {
    console.error('Failed to delete event:', err)
  }
}

const handleMoveEvent = async (eventId: string, newDate: string, newStartTime?: string) => {
  try {
    if (newStartTime) {
      await handleEventDrop(eventId, newDate, newStartTime)
    }
    const movedEvent = events.value.find(e => e.id === eventId)
    if (movedEvent) {
      emit('event:update', movedEvent)
    }
  } catch (err) {
    console.error('Failed to move event:', err)
  }
}

const handleTimeSlotClick = (date: string, time: string) => {
  openCreateEventDialog(date, time)
}

// Watch for external view/date changes - Note: with backend integration, initial events are loaded from server
watch(() => props.initialEvents, (newEvents) => {
  if (newEvents && newEvents.length > 0) {
    // Only use initial events if we have them and no backend events yet
    console.log('Initial events provided:', newEvents.length)
  }
}, { deep: true })

// Emit events for external listeners
watch(() => currentDate.value, (newDate) => {
  emit('date:change', newDate)
})

watch(() => currentView.value, (newView) => {
  emit('view:change', newView)
})

watch(() => selectedEvent.value, (newEvent) => {
  emit('event:select', newEvent)
})
</script>