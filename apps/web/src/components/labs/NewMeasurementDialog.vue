<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Stethoscope class="h-5 w-5" />
          {{ t('labs.animals.measurement.newMeasurement') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('labs.animals.measurement.newMeasurementDescription') }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Date -->
        <div class="space-y-2">
          <Label for="date">{{ t('labs.animals.measurement.date') }} *</Label>
          <Input id="date" type="date" v-model="formData.date" :max="today" />
        </div>

        <!-- Type de mesure -->
        <div class="space-y-2">
          <Label for="type">{{ t('labs.animals.measurement.type') }} *</Label>
          <Select v-model="formData.type" @update:model-value="handleTypeChange">
            <SelectTrigger>
              <SelectValue :placeholder="t('labs.animals.measurement.selectType')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="type in measurementTypes" :key="type.value" :value="type.value">
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
              {{ t('labs.animals.measurement.value') }} *
              <component v-if="selectedTypeInfo?.icon" :is="selectedTypeInfo.icon" class="h-4 w-4 inline ml-1" />
            </Label>
            <Input id="value" type="number" step="0.01" v-model="formData.value"
              :placeholder="selectedTypeInfo?.placeholder || '0'" :disabled="!formData.type" />
          </div>
          <div class="space-y-2">
            <Label for="unit">{{ t('labs.animals.measurement.unit') }} *</Label>
            <Select v-model="formData.unit" :disabled="!formData.type">
              <SelectTrigger>
                <SelectValue :placeholder="t('labs.animals.measurement.selectUnit')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="unit in availableUnits" :key="unit" :value="unit">
                  {{ unit === 'none' ? t('labs.animals.measurement.noUnit') : unit }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Personne ayant effectué la mesure -->
        <div class="space-y-2">
          <Label for="measuredBy">{{ t('labs.animals.measurement.measuredBy') }} *</Label>
          <Select v-model="formData.measuredBy">
            <SelectTrigger>
              <SelectValue :placeholder="t('labs.animals.measurement.selectPerson')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="person in measurementPersonnel" :key="person" :value="person">
                {{ person }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">{{ t('labs.animals.measurement.notes') }}</Label>
          <Textarea id="notes" v-model="formData.notes" :placeholder="t('labs.animals.measurement.notesPlaceholder')"
            :rows="3" />
        </div>

        <!-- Aperçu de la mesure -->
        <div v-if="formData.type && formData.value && formData.unit" class="bg-muted p-4 rounded-lg">
          <h4 class="font-medium mb-2">{{ t('labs.animals.measurement.preview') }}</h4>
          <div class="flex items-center gap-2 text-sm">
            <component v-if="selectedTypeInfo?.icon" :is="selectedTypeInfo.icon"
              class="h-4 w-4 text-muted-foreground" />
            <span class="font-medium">{{ selectedTypeInfo?.label }}:</span>
            <span class="text-lg font-bold">{{ formData.value }} {{ formData.unit === 'none' ? '' : formData.unit
              }}</span>
            <span class="text-muted-foreground">
              • {{ formatDateSimple(formData.date) }}
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
            {{ t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? t('common.adding') : t('labs.animals.measurement.addMeasurement') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from '@/composables/useLocale'
import { formatDateSimple } from '@/lib/format.utils'
import type { Measurement } from '@/types/lab'
import {
  Activity,
  FlaskConical,
  Heart,
  Scale,
  Stethoscope,
  Thermometer
} from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'

interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [measurement: Omit<Measurement, 'id'>]
}>()

const { t } = useTranslation()
const isSubmitting = ref(false)
const today = new Date().toISOString().split('T')[0]

const measurementTypes = computed(() => [
  {
    value: 'weight',
    label: t('labs.animals.measurement.types.weight'),
    icon: Scale,
    defaultUnit: 'g',
    placeholder: '28.5'
  },
  {
    value: 'temperature',
    label: t('labs.animals.measurement.types.temperature'),
    icon: Thermometer,
    defaultUnit: '°C',
    placeholder: '37.2'
  },
  {
    value: 'blood-pressure',
    label: t('labs.animals.measurement.types.bloodPressure'),
    icon: Heart,
    defaultUnit: 'mmHg',
    placeholder: '120'
  },
  {
    value: 'behavior',
    label: t('labs.animals.measurement.types.behavior'),
    icon: Activity,
    defaultUnit: 'score',
    placeholder: '8'
  },
  {
    value: 'other',
    label: t('labs.animals.measurement.types.other'),
    icon: FlaskConical,
    defaultUnit: '',
    placeholder: '0'
  }
])

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
  measurementTypes.value.find(t => t.value === formData.type)
)

const availableUnits = computed(() => {
  if (!formData.type) return []
  return commonUnits[formData.type] || []
})

const handleTypeChange = (type: unknown) => {
  if (typeof type !== 'string' || !measurementTypes.value.some(t => t.value === type)) return // Ensure type is valid
  const selectedType = measurementTypes.value.find(t => t.value === type)
  formData.unit = selectedType?.defaultUnit || 'none'
  formData.value = ''
}


const handleSubmit = async () => {
  isSubmitting.value = true

  try {
    // Validation
    if (!formData.type) {
      toast.error(t('labs.animals.measurement.validation.typeRequired'))
      return
    }
    if (!formData.value || parseFloat(formData.value) < 0) {
      toast.error(t('labs.animals.measurement.validation.valueRequired'))
      return
    }
    if (!formData.unit.trim()) {
      toast.error(t('labs.animals.measurement.validation.unitRequired'))
      return
    }
    if (!formData.measuredBy.trim()) {
      toast.error(t('labs.animals.measurement.validation.measuredByRequired'))
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

    toast.success(t('labs.animals.measurement.measurementAdded'))
  } catch (error) {
    toast.error(t('labs.animals.measurement.measurementError'))
  } finally {
    isSubmitting.value = false
  }
}
</script>
