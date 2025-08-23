<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Stethoscope class="h-5 w-5" />
          {{ t('labs.animals.medical.newExam') }}
          <span v-if="animalIdentifier" class="text-sm font-normal text-muted-foreground">
            - {{ animalIdentifier }}
          </span>
        </DialogTitle>
        <DialogDescription>
          {{ t('labs.animals.medical.newExamDescription') }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Date et Type -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="date">{{ t('labs.animals.medical.examDate') }} *</Label>
            <Input id="date" type="date" v-model="formData.date" :max="today" />
          </div>

          <div class="space-y-2">
            <Label for="type">{{ t('labs.animals.medical.examType') }} *</Label>
            <Select v-model="formData.type">
              <SelectTrigger>
                <SelectValue :placeholder="t('labs.animals.medical.selectType')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in examTypes" :key="type.value" :value="type.value">
                  <SelectItemText class="sr-only">{{ type.label }}</SelectItemText>
                  <div class="flex items-center gap-2">
                    <component :is="type.icon" class="h-4 w-4" />
                    <div>
                      <div class="font-medium">{{ type.label }}</div>
                      <div class="text-xs text-muted-foreground">{{ type.description }}</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Veterinarian -->
        <div class="space-y-2">
          <Label for="veterinarian">{{ t('labs.animals.form.veterinarian') }} *</Label>
          <Select v-model="formData.veterinarian">
            <SelectTrigger>
              <SelectValue :placeholder="t('labs.animals.medical.selectVeterinarian')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="vet in veterinarians" :key="vet" :value="vet">
                {{ vet }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">{{ t('labs.animals.medical.examDescription') }} *</Label>
          <Textarea id="description" v-model="formData.description"
            :placeholder="t('labs.animals.medical.examDescriptionPlaceholder')" :rows="3" />
        </div>

        <!-- Observations cliniques -->
        <div class="space-y-2">
          <Label for="findings">{{ t('labs.animals.medical.clinicalFindings') }}</Label>
          <Textarea id="findings" v-model="formData.findings"
            :placeholder="t('labs.animals.medical.clinicalFindingsPlaceholder')" :rows="3" />
        </div>

        <!-- Traitement et Suivi -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="treatment">{{ t('labs.animals.medical.treatmentAdministered') }}</Label>
            <Textarea id="treatment" v-model="formData.treatment"
              :placeholder="t('labs.animals.medical.treatmentPlaceholder')" :rows="3" />
          </div>

          <div class="space-y-2">
            <Label for="followUp">{{ t('labs.animals.medical.followUpRequired') }}</Label>
            <Textarea id="followUp" v-model="formData.followUp" :placeholder="t('labs.animals.medical.followUpPlaceholder')"
              :rows="3" />
          </div>
        </div>

        <!-- Niveau de gravité -->
        <div class="space-y-2">
          <Label for="severity">{{ t('labs.animals.medical.severityLevel') }} *</Label>
          <Select v-model="formData.severity">
            <SelectTrigger>
              <SelectValue :placeholder="t('labs.animals.medical.assessSeverity')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="level in severityLevels" :key="level.value" :value="level.value">
                <SelectItemText class="sr-only">{{ level.label }}</SelectItemText>
                <div class="flex items-center gap-2">
                  <component :is="level.icon" class="h-4 w-4" />
                  <div>
                    <div class="font-medium">{{ level.label }}</div>
                    <div class="text-xs text-muted-foreground">{{ level.description }}</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Aperçu de l'examen -->
        <div v-if="formData.type && formData.description && formData.veterinarian" class="bg-muted p-4 rounded-lg">
          <h4 class="font-medium mb-3 flex items-center gap-2">
            <Eye class="h-4 w-4" />
            {{ t('labs.animals.medical.examPreview') }}
          </h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <component v-if="selectedExamType?.icon" :is="selectedExamType.icon"
                class="h-4 w-4 text-muted-foreground" />
              <span class="font-medium">{{ selectedExamType?.label }}</span>
              <span class="text-muted-foreground">
                • {{ formatDateSimple(formData.date) }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="font-medium">{{ t('labs.animals.form.veterinarian') }}:</span>
              <span>{{ formData.veterinarian }}</span>
            </div>

            <div>
              <span class="font-medium">{{ t('labs.animals.medical.examDescription') }}:</span>
              <p class="text-muted-foreground mt-1">"{{ formData.description }}"</p>
            </div>

            <div v-if="formData.findings">
              <span class="font-medium">{{ t('labs.animals.medical.observations') }}:</span>
              <p class="text-muted-foreground mt-1">"{{ formData.findings }}"</p>
            </div>

            <div class="flex items-center gap-2 pt-2">
              <span class="font-medium">{{ t('labs.animals.medical.severity') }}:</span>
              <div class="flex items-center gap-1">
                <component v-if="selectedSeverity?.icon" :is="selectedSeverity.icon" class="h-4 w-4" />
                <span :class="`px-2 py-1 rounded text-xs font-medium ${selectedSeverity?.color}`">
                  {{ selectedSeverity?.label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            {{ t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? t('common.saving') : t('labs.animals.medical.saveExam') }}
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
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from '@/composables/useLocale'
import { formatDateSimple } from '@/lib/format.utils'
import type { MedicalRecord } from '@/types/lab'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Eye,
  FlaskConical,
  Info,
  Scissors,
  Stethoscope,
  Syringe
} from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'

interface Props {
  open: boolean
  animalIdentifier?: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [medicalRecord: Omit<MedicalRecord, 'id'>]
}>()

const { t } = useTranslation()
const isSubmitting = ref(false)
const today = new Date().toISOString().split('T')[0]

const examTypes = computed(() => [
  {
    value: 'examination',
    label: t('labs.animals.medical.types.examination'),
    icon: Stethoscope,
    description: t('labs.animals.medical.types.examinationDesc')
  },
  {
    value: 'vaccination',
    label: t('labs.animals.medical.types.vaccination'),
    icon: Syringe,
    description: t('labs.animals.medical.types.vaccinationDesc')
  },
  {
    value: 'treatment',
    label: t('labs.animals.medical.types.treatment'),
    icon: ClipboardList,
    description: t('labs.animals.medical.types.treatmentDesc')
  },
  {
    value: 'surgery',
    label: t('labs.animals.medical.types.surgery'),
    icon: Scissors,
    description: t('labs.animals.medical.types.surgeryDesc')
  },
  {
    value: 'sampling',
    label: t('labs.animals.medical.types.sampling'),
    icon: FlaskConical,
    description: t('labs.animals.medical.types.samplingDesc')
  },
  {
    value: 'observation',
    label: t('labs.animals.medical.types.observation'),
    icon: Eye,
    description: t('labs.animals.medical.types.observationDesc')
  }
])

const severityLevels = computed(() => [
  {
    value: 'normal',
    label: t('labs.animals.medical.severity.normal'),
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    description: t('labs.animals.medical.severity.normalDesc')
  },
  {
    value: 'minor',
    label: t('labs.animals.medical.severity.minor'),
    icon: Info,
    color: 'bg-blue-100 text-blue-800',
    description: t('labs.animals.medical.severity.minorDesc')
  },
  {
    value: 'moderate',
    label: t('labs.animals.medical.severity.moderate'),
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800',
    description: t('labs.animals.medical.severity.moderateDesc')
  },
  {
    value: 'severe',
    label: t('labs.animals.medical.severity.severe'),
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800',
    description: t('labs.animals.medical.severity.severeDesc')
  }
])

const veterinarians = [
  'Dr. Marie Dubois',
  'Dr. Jean Moreau',
  'Dr. Sophie Laurent',
  'Dr. Pierre Martin',
  'Dr. Emma Bernard',
  'Dr. Lucas Petit'
]

const formData = reactive({
  date: today,
  type: '' as MedicalRecord['type'],
  veterinarian: '',
  description: '',
  findings: '',
  treatment: '',
  followUp: '',
  severity: 'normal' as MedicalRecord['severity']
})

const selectedExamType = computed(() =>
  examTypes.value.find(type => type.value === formData.type)
)

const selectedSeverity = computed(() =>
  severityLevels.value.find(s => s.value === formData.severity)
)


const handleSubmit = async () => {
  isSubmitting.value = true

  try {
    // Validation
    if (!formData.type) {
      toast.error(t('labs.animals.medical.validation.typeRequired'))
      return
    }
    if (!formData.veterinarian.trim()) {
      toast.error(t('labs.animals.medical.validation.veterinarianRequired'))
      return
    }
    if (!formData.description.trim()) {
      toast.error(t('labs.animals.medical.validation.descriptionRequired'))
      return
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newMedicalRecord: Omit<MedicalRecord, 'id'> = {
      date: formData.date,
      type: formData.type,
      veterinarian: formData.veterinarian,
      description: formData.description,
      findings: formData.findings || undefined,
      treatment: formData.treatment || undefined,
      followUp: formData.followUp || undefined,
      severity: formData.severity
    }

    emit('save', newMedicalRecord)
    emit('update:open', false)

    // Reset form
    Object.assign(formData, {
      date: today,
      type: '' as MedicalRecord['type'],
      veterinarian: '',
      description: '',
      findings: '',
      treatment: '',
      followUp: '',
      severity: 'normal' as MedicalRecord['severity']
    })

    toast.success(t('labs.animals.medical.examAdded'))
  } catch (error) {
    toast.error(t('labs.animals.medical.examError'))
  } finally {
    isSubmitting.value = false
  }
}
</script>
