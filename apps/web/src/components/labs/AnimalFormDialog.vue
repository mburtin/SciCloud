<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? t('labs.animals.form.editAnimal', { id: animal?.identifier }) :
          t('labs.animals.form.addNewAnimal') }}</DialogTitle>
        <DialogDescription>
          {{ isEditing ? t('labs.animals.form.editInformation') : t('labs.animals.form.fillDetails') }} {{
            t('labs.animals.form.requiredFields') }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">{{ t('labs.animals.form.basicInformation') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="identifier">{{ t('labs.animals.form.identifier') }} *</Label>
              <Input id="identifier" v-model="formData.identifier" placeholder="M001-2024" />
            </div>
            <div class="space-y-2">
              <Label for="sex">{{ t('labs.animals.form.sex') }} *</Label>
              <Select v-model="formData.sex">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{{ t('labs.animals.form.male') }}</SelectItem>
                  <SelectItem value="female">{{ t('labs.animals.form.female') }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="species">{{ t('labs.animals.species') }} *</Label>
              <Select v-model="formData.species">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in speciesOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="strain">{{ t('labs.animals.strain') }} *</Label>
              <Input id="strain" v-model="formData.strain" placeholder="C57BL/6J" />
            </div>
            <div class="space-y-2">
              <Label for="line">{{ t('labs.animals.form.line') }}</Label>
              <Input id="line" v-model="formData.line" placeholder="Wild Type" />
            </div>
            <div class="space-y-2">
              <Label for="supplier">{{ t('labs.animals.form.supplier') }} *</Label>
              <Input id="supplier" v-model="formData.supplier" placeholder="Charles River Laboratories" />
            </div>
          </div>
        </div>

        <!-- Dates and weight -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">{{ t('labs.animals.form.datesAndMeasurements') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="birthDate">{{ t('labs.animals.birthDate') }} *</Label>
              <Input id="birthDate" type="date" v-model="formData.birth_date" />
            </div>
            <div class="space-y-2">
              <Label for="arrivalDate">{{ t('labs.animals.form.arrivalDate') }} *</Label>
              <Input id="arrivalDate" type="date" v-model="formData.arrival_date" />
            </div>
            <div class="space-y-2">
              <Label for="currentWeight">{{ t('labs.animals.form.currentWeight') }} *</Label>
              <Input id="currentWeight" type="number" step="0.1" v-model.number="formData.current_weight"
                placeholder="28.5" />
            </div>
          </div>
        </div>

        <!-- Status and health -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">{{ t('labs.animals.form.statusAndHealth') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="status">{{ t('labs.animals.status') }} *</Label>
              <Select v-model="formData.status">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="healthStatus">{{ t('labs.animals.form.healthStatus') }} *</Label>
              <Select v-model="formData.health_status">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in healthStatusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="veterinarian">{{ t('labs.animals.form.veterinarian') }} *</Label>
              <Select v-model="formData.veterinarian">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="vet in veterinarians" :key="vet" :value="vet">
                    {{ vet }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- Housing -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">{{ t('labs.animals.form.housing') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="facility">{{ t('labs.animals.form.facility') }} *</Label>
              <Select v-model="formData.location.facility">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="facility in facilities" :key="facility" :value="facility">
                    {{ facility }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="room">{{ t('labs.animals.form.room') }} *</Label>
              <Input id="room" v-model="formData.location.room" placeholder="Room 205" />
            </div>
            <div class="space-y-2">
              <Label for="rack">{{ t('labs.animals.form.rack') }} *</Label>
              <Input id="rack" v-model="formData.location.rack" placeholder="R-12" />
            </div>
            <div class="space-y-2">
              <Label for="cage">{{ t('labs.animals.form.cage') }} *</Label>
              <Input id="cage" v-model="formData.location.cage" placeholder="C-034" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="housingType">{{ t('labs.animals.form.housingTypeLabel') }} *</Label>
              <Select v-model="formData.housing_type">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in housingTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div v-if="formData.housing_type === 'pair' || formData.housing_type === 'group'" class="space-y-2">
              <Label for="groupSize">{{ t('labs.animals.form.groupSize') }}</Label>
              <Input id="groupSize" type="number" min="2" v-model.number="formData.group_size" placeholder="4" />
            </div>
          </div>
        </div>

        <!-- Protocols and ethics -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">{{ t('labs.animals.form.protocolsAndEthics') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="ethicsApproval">{{ t('labs.animals.form.ethicsApproval') }} *</Label>
              <Input id="ethicsApproval" v-model="formData.ethics_approval" placeholder="CE-2024-008" />
            </div>
            <div class="space-y-2">
              <Label for="experimentalGroup">{{ t('labs.animals.form.experimentalGroup') }}</Label>
              <Input id="experimentalGroup" v-model="formData.experimental_group" placeholder="Control group" />
            </div>
          </div>
        </div>

        <!-- Medical follow-up (only for editing) -->
        <div v-if="isEditing" class="space-y-4">
          <h3 class="text-lg font-medium">{{ t('labs.animals.form.medicalFollowUp') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="lastExamDate">{{ t('labs.animals.form.lastExam') }}</Label>
              <Input id="lastExamDate" type="date" v-model="formData.last_exam_date" />
            </div>
            <div class="space-y-2">
              <Label for="nextExamDate">{{ t('labs.animals.form.nextExam') }}</Label>
              <Input id="nextExamDate" type="date" v-model="formData.next_exam_date" />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">{{ t('labs.animals.form.notesAndObservations') }}</h3>
          <div class="space-y-2">
            <Label for="notes">{{ t('labs.animals.notes') }}</Label>
            <Textarea id="notes" v-model="formData.notes" :placeholder="t('labs.animals.form.notesPlaceholder')"
              :rows="4" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            {{ t('common.actions.cancel') }}
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? t('labs.animals.form.saving') : (isEditing ? t('labs.animals.form.saveChanges') :
              t('labs.animals.form.saveAnimal')) }}
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
import type { Animal, AnimalInsert } from '@/types/supabase'
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

interface Props {
  animal?: Animal | null
  open: boolean
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  animal: null,
  mode: 'create'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [animal: Animal | AnimalInsert]
}>()

const { t } = useTranslation()
const isSubmitting = ref(false)
const isEditing = computed(() => props.mode === 'edit')

const speciesOptions = computed(() => [
  { value: 'Mus musculus', label: t('labs.animals.form.mouseSpecies') },
  { value: 'Rattus norvegicus', label: t('labs.animals.form.ratSpecies') },
  { value: 'Oryctolagus cuniculus', label: t('labs.animals.form.rabbitSpecies') },
  { value: 'Cavia porcellus', label: t('labs.animals.form.guineaPigSpecies') },
])

const statusOptions = computed(() => [
  { value: 'alive', label: t('labs.animals.alive') },
  { value: 'experimental', label: t('labs.animals.experimental') },
  { value: 'transferred', label: t('labs.animals.transferred') },
  { value: 'deceased', label: t('labs.animals.deceased') },
])

const healthStatusOptions = computed(() => [
  { value: 'excellent', label: t('labs.animals.healthStatus.excellent') },
  { value: 'good', label: t('labs.animals.healthStatus.good') },
  { value: 'concerning', label: t('labs.animals.healthStatus.concerning') },
  { value: 'critical', label: t('labs.animals.healthStatus.critical') },
])

const housingTypeOptions = computed(() => [
  { value: 'individual', label: t('labs.animals.form.housingType.individual') },
  { value: 'pair', label: t('labs.animals.form.housingType.pair') },
  { value: 'group', label: t('labs.animals.form.housingType.group') },
])

const veterinarians = [
  'Dr. Marie Dubois',
  'Dr. Jean Moreau',
  'Dr. Sophie Laurent',
  'Dr. Pierre Martin',
]

const facilities = [
  'Facility A',
  'Facility B',
  'Facility C',
  'Quarantine',
]

const getDefaultFormData = (): AnimalInsert => ({
  identifier: `M${(Math.random() * 1000).toFixed(0).padStart(3, '0')}-${new Date().getFullYear()}`,
  species: 'Mus musculus',
  strain: '',
  line: '',
  sex: 'male',
  age_weeks: 8,
  birth_date: new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  arrival_date: new Date().toISOString().split('T')[0],
  current_weight: 25.0,
  supplier: 'Jackson Labs',
  status: 'alive',
  location: {
    facility: 'Facility A',
    room: 'Room 101',
    rack: 'Rack A1',
    cage: 'Cage 1'
  },
  housing_type: 'individual',
  group_size: null,
  protocols: [],
  experimental_group: '',
  ethics_approval: 'IACUC-2024-001',
  veterinarian: 'Dr. Smith',
  last_exam_date: null,
  next_exam_date: null,
  health_status: 'good',
  documents: [],
  medical_history: [],
  measurements: [],
  notes: '',
  created_by: '',
  updated_by: ''
})

const formData = reactive<AnimalInsert | Animal>(
  props.animal ? { ...props.animal } : getDefaultFormData()
)

// Watch for prop changes to update form data
watch(() => props.animal, (newAnimal) => {
  if (newAnimal) {
    Object.assign(formData, newAnimal)
  } else if (props.mode === 'create') {
    Object.assign(formData, getDefaultFormData())
  }
}, { deep: true })

// Reset form when opening in create mode
watch(() => props.open, (isOpen) => {
  if (isOpen && props.mode === 'create') {
    Object.assign(formData, getDefaultFormData())
  }
})

const handleSubmit = async () => {
  isSubmitting.value = true

  try {
    // Basic validation
    if (!formData.identifier?.trim()) {
      toast.error(t('common.validation.required'))
      return
    }
    if (!formData.current_weight || formData.current_weight <= 0) {
      toast.error(t('common.validation.min', { min: 1 }))
      return
    }
    if (!formData.species?.trim()) {
      toast.error(t('common.validation.required'))
      return
    }
    if (!formData.strain?.trim()) {
      toast.error(t('common.validation.required'))
      return
    }
    if (!formData.supplier?.trim()) {
      toast.error(t('common.validation.required'))
      return
    }
    if (!formData.ethics_approval?.trim()) {
      toast.error(t('common.validation.required'))
      return
    }
    if (!formData.veterinarian?.trim()) {
      toast.error(t('common.validation.required'))
      return
    }
    if (!formData.location?.facility?.trim()) {
      toast.error(t('common.validation.required'))
      return
    }
    if (!formData.location?.room?.trim()) {
      toast.error(t('common.validation.required'))
      return
    }
    if (!formData.location?.rack?.trim()) {
      toast.error(t('common.validation.required'))
      return
    }
    if (!formData.location?.cage?.trim()) {
      toast.error(t('common.validation.required'))
      return
    }

    emit('save', { ...formData })
    emit('update:open', false)
    toast.success(t('common.messages.success'))
  } catch (error) {
    toast.error(t('common.messages.error'))
  } finally {
    isSubmitting.value = false
  }
}
</script>
