<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? t('calendar.eventDialog.titles.edit') : t('calendar.eventDialog.titles.create') }}
        </DialogTitle>
        <DialogDescription>
          {{ isEditing ? t('calendar.eventDialog.descriptions.edit') : t('calendar.eventDialog.descriptions.create') }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Title -->
        <div class="space-y-2">
          <Label for="title">{{ t('calendar.eventDialog.fields.title') }} *</Label>
          <Input
            id="title"
            v-model="formData.title"
            :placeholder="t('calendar.eventDialog.placeholders.title')"
            :class="getFieldErrorClass('title')"
            required
          />
          <div v-if="getFieldError('title')" class="text-sm text-destructive">
            {{ getFieldError('title') }}
          </div>
        </div>


        <!-- Date and Time -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="date">{{ t('calendar.eventDialog.fields.date') }} *</Label>
            <Input
              id="date"
              v-model="formData.date"
              type="date"
              :class="getFieldErrorClass('date')"
              required
            />
            <div v-if="getFieldError('date')" class="text-sm text-destructive">
              {{ getFieldError('date') }}
            </div>
          </div>

          <div class="space-y-2">
            <Label for="category">{{ t('calendar.eventDialog.fields.category') }} *</Label>
            <Select v-model="formData.category" required>
              <SelectTrigger :class="getFieldErrorClass('category')">
                <SelectValue :placeholder="t('calendar.eventDialog.placeholders.category')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="category in eventCategories"
                  :key="category.value"
                  :value="category.value"
                >
                  <div class="flex items-center gap-2">
                    <div 
                      class="w-3 h-3 rounded-full border"
                      :class="category.color.badge"
                    />
                    {{ category.label }}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- All Day Toggle -->
        <div class="flex items-center space-x-3">
          <input
            id="allDay"
            v-model="formData.allDay"
            type="checkbox"
            class="rounded border-input"
          />
          <Label for="allDay" class="text-sm font-normal cursor-pointer">
            {{ t('calendar.eventDialog.fields.allDay') }}
          </Label>
        </div>

        <!-- Time Fields (shown only if not all day) -->
        <div v-if="!formData.allDay" class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="startTime">{{ t('calendar.eventDialog.fields.startTime') }} *</Label>
            <Input
              id="startTime"
              v-model="formData.startTime"
              type="time"
              :class="getFieldErrorClass('startTime')"
              required
            />
            <div v-if="getFieldError('startTime')" class="text-sm text-destructive">
              {{ getFieldError('startTime') }}
            </div>
          </div>

          <div class="space-y-2">
            <Label for="endTime">{{ t('calendar.eventDialog.fields.endTime') }} *</Label>
            <Input
              id="endTime"
              v-model="formData.endTime"
              type="time"
              :class="getFieldErrorClass('endTime')"
              required
            />
            <div v-if="getFieldError('endTime')" class="text-sm text-destructive">
              {{ getFieldError('endTime') }}
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="space-y-2">
          <Label for="location">{{ t('calendar.eventDialog.fields.location') }}</Label>
          <Input
            id="location"
            v-model="formData.location"
            :placeholder="t('calendar.eventDialog.placeholders.location')"
          />
        </div>

        <!-- Attendees -->
        <div class="space-y-2">
          <Label for="attendees">{{ t('calendar.eventDialog.fields.attendees') }}</Label>
          <div class="space-y-2">
            <Input
              v-model="newAttendee"
              :placeholder="t('calendar.eventDialog.placeholders.attendee')"
              @keyup.enter="addAttendee"
            />
            <div v-if="formData.attendees.length > 0" class="space-y-1">
              <div 
                v-for="(attendee, index) in formData.attendees" 
                :key="index"
                class="flex items-center justify-between bg-muted px-2 py-1 rounded-md text-sm"
              >
                <span>{{ attendee }}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                  @click="removeAttendee(index)"
                >
                  <X class="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="generalError" class="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {{ generalError }}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel">
            {{ t('calendar.eventDialog.buttons.cancel') }}
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? t('calendar.eventDialog.buttons.saving') : (isEditing ? t('calendar.eventDialog.buttons.update') : t('calendar.eventDialog.buttons.create')) }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/composables/useLocale'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-vue-next'
import type { 
  SchedulerEvent, 
  EventFormData, 
  EventCategory,
  EventValidationError 
} from '@/types/scheduler'

interface EventCategoryOption {
  value: EventCategory
  label: string
  color: {
    bg: string
    border: string
    text: string
    badge: string
  }
}

interface Props {
  open: boolean
  event?: SchedulerEvent | null
  eventCategories: EventCategoryOption[]
  isEditing?: boolean
  initialDate?: string
  initialTime?: string
}

const props = withDefaults(defineProps<Props>(), {
  event: null,
  isEditing: false,
  initialDate: '',
  initialTime: ''
})

const emit = defineEmits<{
  close: []
  save: [data: EventFormData]
}>()

// Translation composable
const { t } = useTranslation()

// Form state
const formData = reactive<EventFormData>({
  title: '',
  startTime: '09:00',
  endTime: '10:00',
  date: format(new Date(), 'yyyy-MM-dd'),
  category: 'meeting',
  location: '',
  attendees: [],
  allDay: false
})

const newAttendee = ref('')
const isSubmitting = ref(false)
const validationErrors = ref<EventValidationError[]>([])
const generalError = ref<string | null>(null)

// Computed properties
const isEditing = computed(() => props.isEditing && props.event !== null)

// Form methods
const resetForm = () => {
  formData.title = ''
  formData.startTime = props.initialTime || '09:00'
  formData.endTime = getEndTime(props.initialTime || '09:00')
  formData.date = props.initialDate || format(new Date(), 'yyyy-MM-dd')
  formData.category = 'meeting'
  formData.location = ''
  formData.attendees = []
  formData.allDay = false
  newAttendee.value = ''
  validationErrors.value = []
  generalError.value = null
}

const formatTimeToHHMM = (time: string): string => {
  return time.split(':').slice(0, 2).join(':')
}

const getEndTime = (startTime: string): string => {
  const [hours, minutes] = startTime.split(':').map(Number)
  if (hours === undefined || minutes === undefined) return '10:00'
  const endHour = Math.min(hours + 1, 23)
  return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const populateForm = (event: SchedulerEvent) => {
  formData.title = event.title
  formData.startTime = formatTimeToHHMM(event.startTime)
  formData.endTime = formatTimeToHHMM(event.endTime)
  formData.date = event.date
  formData.category = event.category
  formData.location = event.location || ''
  formData.attendees = [...(event.attendees || [])]
  formData.allDay = event.allDay || false
}

const addAttendee = () => {
  const email = newAttendee.value.trim()
  if (email && !formData.attendees.includes(email)) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(email)) {
      formData.attendees.push(email)
      newAttendee.value = ''
    }
  }
}

const removeAttendee = (index: number) => {
  formData.attendees.splice(index, 1)
}

// Validation helpers
const getFieldError = (field: keyof EventFormData) => {
  const error = validationErrors.value.find(e => e.field === field)
  return error ? error.message : null
}

const getFieldErrorClass = (field: keyof EventFormData) => {
  return getFieldError(field) ? 'border-destructive' : ''
}

// Event handlers
const handleOpenChange = (newOpen: boolean) => {
  if (!newOpen) {
    emit('close')
  }
}

const handleCancel = () => {
  emit('close')
}

const handleSubmit = async () => {
  isSubmitting.value = true
  validationErrors.value = []
  generalError.value = null

  try {
    // Client-side validation
    const errors: EventValidationError[] = []

    if (!formData.title.trim()) {
      errors.push({ field: 'title', message: t('calendar.eventDialog.validation.titleRequired') })
    }

    if (!formData.date) {
      errors.push({ field: 'date', message: t('calendar.eventDialog.validation.dateRequired') })
    }

    if (!formData.allDay) {
      if (!formData.startTime) {
        errors.push({ field: 'startTime', message: t('calendar.eventDialog.validation.startTimeRequired') })
      }
      if (!formData.endTime) {
        errors.push({ field: 'endTime', message: t('calendar.eventDialog.validation.endTimeRequired') })
      }

      // Check if start time is before end time
      if (formData.startTime && formData.endTime) {
        const startMinutes = timeToMinutes(formData.startTime)
        const endMinutes = timeToMinutes(formData.endTime)
        if (startMinutes >= endMinutes) {
          errors.push({ field: 'endTime', message: t('calendar.eventDialog.validation.endTimeAfterStart') })
        }
      }
    }

    if (errors.length > 0) {
      validationErrors.value = errors
      return
    }

    // Submit form data
    emit('save', { ...formData })
  } catch (error) {
    generalError.value = error instanceof Error ? error.message : t('calendar.eventDialog.validation.generalError')
  } finally {
    isSubmitting.value = false
  }
}

// Utility functions
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  if (hours === undefined || minutes === undefined) return 0
  return hours * 60 + minutes
}

// Watch for prop changes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.event) {
      populateForm(props.event)
    } else {
      resetForm()
    }
  }
})

watch(() => props.event, (newEvent) => {
  if (newEvent && props.open) {
    populateForm(newEvent)
  }
})

// Watch for all day toggle
watch(() => formData.allDay, (isAllDay) => {
  if (isAllDay) {
    formData.startTime = '00:00'
    formData.endTime = '23:59'
  } else {
    formData.startTime = '09:00'
    formData.endTime = '10:00'
  }
})
</script>