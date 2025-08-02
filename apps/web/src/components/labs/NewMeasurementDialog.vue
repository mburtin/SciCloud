<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Stethoscope class="h-5 w-5" />
          New measurement
        </DialogTitle>
        <DialogDescription>
          Add a new measurement for this animal. All fields marked with an asterisk (*) are required.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Date -->
        <div class="space-y-2">
          <Label for="date">Measurement date *</Label>
          <Input
            id="date"
            type="date"
            v-model="formData.date"
            :max="today"
          />
        </div>

        <!-- Type de mesure -->
        <div class="space-y-2">
          <Label for="type">Measurement type *</Label>
          <Select v-model="formData.type" @update:model-value="handleTypeChange">
            <SelectTrigger>
              <SelectValue placeholder="Select a measurement type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="type in measurementTypes"
                :key="type.value"
                :value="type.value"
              >
                <div class="flex items-center gap-2">
                  <component :is="type.icon" class="h-4 w-4" />
                  {{ type.label }}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Valeur et unité -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="value">
              Value *
              <component 
                v-if="selectedTypeInfo?.icon" 
                :is="selectedTypeInfo.icon" 
                class="h-4 w-4 inline ml-1" 
              />
            </Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              v-model="formData.value"
              :placeholder="selectedTypeInfo?.placeholder || '0'"
              :disabled="!formData.type"
            />
          </div>
          <div class="space-y-2">
            <Label for="unit">Unit *</Label>
            <Select 
              v-model="formData.unit"
              :disabled="!formData.type"
            >
              <SelectTrigger>
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="unit in availableUnits"
                  :key="unit"
                  :value="unit"
                >
                  {{ unit === 'none' ? 'No unit' : unit }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Personne ayant effectué la mesure -->
        <div class="space-y-2">
          <Label for="measuredBy">Measured by *</Label>
          <Select v-model="formData.measuredBy">
            <SelectTrigger>
              <SelectValue placeholder="Select a person" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="person in measurementPersonnel"
                :key="person"
                :value="person"
              >
                {{ person }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes and observations</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Additional notes about the measurement..."
            :rows="3"
          />
        </div>

        <!-- Aperçu de la mesure -->
        <div v-if="formData.type && formData.value && formData.unit" class="bg-muted p-4 rounded-lg">
          <h4 class="font-medium mb-2">Measurement preview</h4>
          <div class="flex items-center gap-2 text-sm">
            <component 
              v-if="selectedTypeInfo?.icon" 
              :is="selectedTypeInfo.icon" 
              class="h-4 w-4 text-muted-foreground" 
            />
            <span class="font-medium">{{ selectedTypeInfo?.label }}:</span>
            <span class="text-lg font-bold">{{ formData.value }} {{ formData.unit === 'none' ? '' : formData.unit }}</span>
            <span class="text-muted-foreground">
              • {{ formatDate(formData.date) }}
            </span>
            <span v-if="formData.measuredBy" class="text-muted-foreground">
              • {{ formData.measuredBy }}
            </span>
          </div>
          <p v-if="formData.notes" class="text-sm text-muted-foreground mt-2 italic">
            "{{ formData.notes }}"
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Adding...' : 'Add measurement' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { toast } from 'vue-sonner'
import { 
  Scale,
  Thermometer,
  Heart,
  Activity,
  Stethoscope,
  FlaskConical
} from 'lucide-vue-next'
import type { Measurement } from '@/types/lab'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [measurement: Omit<Measurement, 'id'>]
}>()

const isSubmitting = ref(false)
const today = new Date().toISOString().split('T')[0]

const measurementTypes = [
  { 
    value: 'weight', 
    label: 'Weight', 
    icon: Scale,
    defaultUnit: 'g',
    placeholder: '28.5'
  },
  { 
    value: 'temperature', 
    label: 'Temperature', 
    icon: Thermometer,
    defaultUnit: '°C',
    placeholder: '37.2'
  },
  { 
    value: 'blood-pressure', 
    label: 'Blood pressure', 
    icon: Heart,
    defaultUnit: 'mmHg',
    placeholder: '120'
  },
  { 
    value: 'behavior', 
    label: 'Behavioral score', 
    icon: Activity,
    defaultUnit: 'score',
    placeholder: '8'
  },
  { 
    value: 'other', 
    label: 'Other measurement', 
    icon: FlaskConical,
    defaultUnit: '',
    placeholder: '0'
  }
] as const

const commonUnits = {
  weight: ['g', 'kg', 'mg'],
  temperature: ['°C', '°F'],
  'blood-pressure': ['mmHg', 'kPa'],
  behavior: ['score', 'points'],
  other: ['none', 'g', 'ml', 'cm', 'mm', 'mg', 'μg', 'UI', '%']
} as const

const measurementPersonnel = [
  'Dr. Marie Dubois',
  'Dr. Jean Moreau',
  'Dr. Sophie Laurent',
  'Dr. Pierre Martin',
  'Tech. Sarah Lucas',
  'Tech. Paul Martin',
  'Tech. Emma Bernard',
  'Tech. Lucas Petit'
]

const formData = reactive({
  date: today,
  type: '' as Measurement['type'],
  value: '',
  unit: '',
  measuredBy: '',
  notes: ''
})

const selectedTypeInfo = computed(() => 
  measurementTypes.find(t => t.value === formData.type)
)

const availableUnits = computed(() => {
  if (!formData.type) return []
  return commonUnits[formData.type] || []
})

const handleTypeChange = (type: unknown) => {
  if (typeof type !== 'string' || !measurementTypes.some(t => t.value === type)) return // Ensure type is valid
  const selectedType = measurementTypes.find(t => t.value === type)
  formData.unit = selectedType?.defaultUnit || 'none'
  formData.value = ''
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '' // Handle undefined case
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US')
}

const handleSubmit = async () => {
  isSubmitting.value = true

  try {
    // Validation
    if (!formData.type) {
      toast.error('Please select a measurement type')
      return
    }
    if (!formData.value || parseFloat(formData.value) < 0) {
      toast.error('Please enter a valid value')
      return
    }
    if (!formData.unit.trim()) {
      toast.error('Please select a unit')
      return
    }
    if (!formData.measuredBy.trim()) {
      toast.error('Please select who performed the measurement')
      return
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newMeasurement: Omit<Measurement, 'id'> = {
      date: formData.date,
      type: formData.type,
      value: parseFloat(formData.value),
      unit: formData.unit === 'none' ? '' : formData.unit,
      measuredBy: formData.measuredBy,
      notes: formData.notes || undefined
    }

    emit('save', newMeasurement)
    emit('update:open', false)
    
    // Reset form
    Object.assign(formData, {
      date: today,
      type: '' as Measurement['type'],
      value: '',
      unit: '',
      measuredBy: '',
      notes: ''
    })
    
    toast.success('Measurement successfully added')
  } catch (error) {
    toast.error('Error adding measurement')
  } finally {
    isSubmitting.value = false
  }
}
</script>