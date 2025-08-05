<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Stethoscope class="h-5 w-5" />
          New medical exam
          <span v-if="animalIdentifier" class="text-sm font-normal text-muted-foreground">
            - {{ animalIdentifier }}
          </span>
        </DialogTitle>
        <DialogDescription>
          Record a new veterinary examination or intervention. All fields marked with an asterisk (*) are required.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Date et Type -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="date">Exam date *</Label>
            <Input
              id="date"
              type="date"
              v-model="formData.date"
              :max="today"
            />
          </div>

          <div class="space-y-2">
            <Label for="type">Exam type *</Label>
            <Select v-model="formData.type">
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="type in examTypes"
                  :key="type.value"
                  :value="type.value"
                >
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
          <Label for="veterinarian">Attending veterinarian *</Label>
          <Select v-model="formData.veterinarian">
            <SelectTrigger>
              <SelectValue placeholder="Select a veterinarian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="vet in veterinarians"
                :key="vet"
                :value="vet"
              >
                {{ vet }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">Exam description *</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Describe the purpose and context of the exam..."
            :rows="3"
          />
        </div>

        <!-- Observations cliniques -->
        <div class="space-y-2">
          <Label for="findings">Clinical findings</Label>
          <Textarea
            id="findings"
            v-model="formData.findings"
            placeholder="Describe clinical findings, results, and observations..."
            :rows="3"
          />
        </div>

        <!-- Traitement et Suivi -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="treatment">Treatment administered</Label>
            <Textarea
              id="treatment"
              v-model="formData.treatment"
              placeholder="Medications, procedures, interventions..."
              :rows="3"
            />
          </div>

          <div class="space-y-2">
            <Label for="followUp">Follow-up required</Label>
            <Textarea
              id="followUp"
              v-model="formData.followUp"
              placeholder="Follow-up instructions, next exam..."
              :rows="3"
            />
          </div>
        </div>

        <!-- Niveau de gravité -->
        <div class="space-y-2">
          <Label for="severity">Severity level *</Label>
          <Select v-model="formData.severity">
            <SelectTrigger>
              <SelectValue placeholder="Assess severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="level in severityLevels"
                :key="level.value"
                :value="level.value"
              >
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
            Exam preview
          </h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <component 
                v-if="selectedExamType?.icon" 
                :is="selectedExamType.icon" 
                class="h-4 w-4 text-muted-foreground" 
              />
              <span class="font-medium">{{ selectedExamType?.label }}</span>
              <span class="text-muted-foreground">
                • {{ formatDateSimple(formData.date) }}
              </span>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="font-medium">Veterinarian:</span>
              <span>{{ formData.veterinarian }}</span>
            </div>
            
            <div>
              <span class="font-medium">Description:</span>
              <p class="text-muted-foreground mt-1">"{{ formData.description }}"</p>
            </div>
            
            <div v-if="formData.findings">
              <span class="font-medium">Observations:</span>
              <p class="text-muted-foreground mt-1">"{{ formData.findings }}"</p>
            </div>
            
            <div class="flex items-center gap-2 pt-2">
              <span class="font-medium">Severity:</span>
              <div class="flex items-center gap-1">
                <component 
                  v-if="selectedSeverity?.icon" 
                  :is="selectedSeverity.icon" 
                  class="h-4 w-4" 
                />
                <span :class="`px-2 py-1 rounded text-xs font-medium ${selectedSeverity?.color}`">
                  {{ selectedSeverity?.label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save exam' }}
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
  Stethoscope,
  Syringe,
  Scissors,
  Eye,
  ClipboardList,
  FlaskConical,
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle
} from 'lucide-vue-next'
import type { MedicalRecord } from '@/types/lab'
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
import { formatDateSimple } from '@/utils/format.utils'

interface Props {
  open: boolean
  animalIdentifier?: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [medicalRecord: Omit<MedicalRecord, 'id'>]
}>()

const isSubmitting = ref(false)
const today = new Date().toISOString().split('T')[0]

const examTypes = [
  { 
    value: 'examination', 
    label: 'Routine examination', 
    icon: Stethoscope,
    description: 'General medical examination'
  },
  { 
    value: 'vaccination', 
    label: 'Vaccination', 
    icon: Syringe,
    description: 'Vaccine administration'
  },
  { 
    value: 'treatment', 
    label: 'Medical treatment', 
    icon: ClipboardList,
    description: 'Administration of a treatment'
  },
  { 
    value: 'surgery', 
    label: 'Surgical procedure', 
    icon: Scissors,
    description: 'Surgical procedure'
  },
  { 
    value: 'sampling', 
    label: 'Sampling', 
    icon: FlaskConical,
    description: 'Sample collection'
  },
  { 
    value: 'observation', 
    label: 'Behavioral observation', 
    icon: Eye,
    description: 'Behavioral observation'
  }
] as const

const severityLevels = [
  { 
    value: 'normal', 
    label: 'Normal', 
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    description: 'Normal result, no intervention needed'
  },
  { 
    value: 'minor', 
    label: 'Minor', 
    icon: Info,
    color: 'bg-blue-100 text-blue-800',
    description: 'Minor anomaly, monitoring recommended'
  },
  { 
    value: 'moderate', 
    label: 'Moderate', 
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800',
    description: 'Moderate problem, intervention needed'
  },
  { 
    value: 'severe', 
    label: 'Severe', 
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800',
    description: 'Severe problem, urgent intervention required'
  }
] as const

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
  examTypes.find(t => t.value === formData.type)
)

const selectedSeverity = computed(() => 
  severityLevels.find(s => s.value === formData.severity)
)


const handleSubmit = async () => {
  isSubmitting.value = true

  try {
    // Validation
    if (!formData.type) {
      toast.error('Please select an exam type')
      return
    }
    if (!formData.veterinarian.trim()) {
      toast.error('Please select a veterinarian')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description')
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
    
    toast.success('Medical exam successfully added')
  } catch (error) {
    toast.error('Error adding medical exam')
  } finally {
    isSubmitting.value = false
  }
}
</script>