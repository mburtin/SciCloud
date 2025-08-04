<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? `Edit animal ${animal?.identifier}` : 'Add New Animal' }}</DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Edit the animal information.' : 'Fill in the details for the new animal.' }} Fields marked with an asterisk (*) are required.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Basic information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="identifier">Identifier *</Label>
              <Input
                id="identifier"
                v-model="formData.identifier"
                placeholder="M001-2024"
              />
            </div>
            <div class="space-y-2">
              <Label for="sex">Sex *</Label>
              <Select v-model="formData.sex">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="species">Species *</Label>
              <Select v-model="formData.species">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in speciesOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="strain">Strain *</Label>
              <Input
                id="strain"
                v-model="formData.strain"
                placeholder="C57BL/6J"
              />
            </div>
            <div class="space-y-2">
              <Label for="line">Line</Label>
              <Input
                id="line"
                v-model="formData.line"
                placeholder="Wild Type"
              />
            </div>
            <div class="space-y-2">
              <Label for="supplier">Supplier *</Label>
              <Input
                id="supplier"
                v-model="formData.supplier"
                placeholder="Charles River Laboratories"
              />
            </div>
          </div>
        </div>

        <!-- Dates and weight -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Dates and measurements</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="birthDate">Birth date *</Label>
              <Input
                id="birthDate"
                type="date"
                v-model="formData.birth_date"
              />
            </div>
            <div class="space-y-2">
              <Label for="arrivalDate">Arrival date *</Label>
              <Input
                id="arrivalDate"
                type="date"
                v-model="formData.arrival_date"
              />
            </div>
            <div class="space-y-2">
              <Label for="currentWeight">Current weight (g) *</Label>
              <Input
                id="currentWeight"
                type="number"
                step="0.1"
                v-model.number="formData.current_weight"
                placeholder="28.5"
              />
            </div>
          </div>
        </div>

        <!-- Status and health -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Status and health</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="status">Status *</Label>
              <Select v-model="formData.status">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in statusOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="healthStatus">Health status *</Label>
              <Select v-model="formData.health_status">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in healthStatusOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="veterinarian">Attending veterinarian *</Label>
              <Select v-model="formData.veterinarian">
                <SelectTrigger>
                  <SelectValue />
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
          </div>
        </div>

        <!-- Housing -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Housing</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="facility">Facility *</Label>
              <Select v-model="formData.location.facility">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="facility in facilities"
                    :key="facility"
                    :value="facility"
                  >
                    {{ facility }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="room">Room *</Label>
              <Input
                id="room"
                v-model="formData.location.room"
                placeholder="Room 205"
              />
            </div>
            <div class="space-y-2">
              <Label for="rack">Rack *</Label>
              <Input
                id="rack"
                v-model="formData.location.rack"
                placeholder="R-12"
              />
            </div>
            <div class="space-y-2">
              <Label for="cage">Cage *</Label>
              <Input
                id="cage"
                v-model="formData.location.cage"
                placeholder="C-034"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="housingType">Housing type *</Label>
              <Select v-model="formData.housing_type">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in housingTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div v-if="formData.housing_type === 'pair' || formData.housing_type === 'group'" class="space-y-2">
              <Label for="groupSize">Group size</Label>
              <Input
                id="groupSize"
                type="number"
                min="2"
                v-model.number="formData.group_size"
                placeholder="4"
              />
            </div>
          </div>
        </div>

        <!-- Protocols and ethics -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Protocols and ethics</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="ethicsApproval">Ethics approval *</Label>
              <Input
                id="ethicsApproval"
                v-model="formData.ethics_approval"
                placeholder="CE-2024-008"
              />
            </div>
            <div class="space-y-2">
              <Label for="experimentalGroup">Experimental group</Label>
              <Input
                id="experimentalGroup"
                v-model="formData.experimental_group"
                placeholder="Control group"
              />
            </div>
          </div>
        </div>

        <!-- Medical follow-up (only for editing) -->
        <div v-if="isEditing" class="space-y-4">
          <h3 class="text-lg font-medium">Medical follow-up</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="lastExamDate">Last exam</Label>
              <Input
                id="lastExamDate"
                type="date"
                v-model="formData.last_exam_date"
              />
            </div>
            <div class="space-y-2">
              <Label for="nextExamDate">Next exam</Label>
              <Input
                id="nextExamDate"
                type="date"
                v-model="formData.next_exam_date"
              />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Notes and observations</h3>
          <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea
              id="notes"
              v-model="formData.notes"
              placeholder="Notes and observations about the animal..."
              :rows="4"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save changes' : 'Save Animal') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { Animal, AnimalInsert } from '@/types/supabase'
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

const isSubmitting = ref(false)
const isEditing = computed(() => props.mode === 'edit')

const speciesOptions = [
  { value: 'Mus musculus', label: 'Mouse (Mus musculus)' },
  { value: 'Rattus norvegicus', label: 'Rat (Rattus norvegicus)' },
  { value: 'Oryctolagus cuniculus', label: 'Rabbit (Oryctolagus cuniculus)' },
  { value: 'Cavia porcellus', label: 'Guinea pig (Cavia porcellus)' },
]

const statusOptions = [
  { value: 'alive', label: 'Alive' },
  { value: 'experimental', label: 'In experiment' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'deceased', label: 'Deceased' },
]

const healthStatusOptions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'concerning', label: 'Concerning' },
  { value: 'critical', label: 'Critical' },
]

const housingTypeOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'pair', label: 'Pair' },
  { value: 'group', label: 'Group' },
]

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
      toast.error('Identifier is required')
      return
    }
    if (!formData.current_weight || formData.current_weight <= 0) {
      toast.error('Weight must be greater than 0')
      return
    }
    if (!formData.species?.trim()) {
      toast.error('Species is required')
      return
    }
    if (!formData.strain?.trim()) {
      toast.error('Strain is required')
      return
    }
    if (!formData.supplier?.trim()) {
      toast.error('Supplier is required')
      return
    }
    if (!formData.ethics_approval?.trim()) {
      toast.error('Ethics approval is required')
      return
    }
    if (!formData.veterinarian?.trim()) {
      toast.error('Veterinarian is required')
      return
    }
    if (!formData.location?.facility?.trim()) {
      toast.error('Facility is required')
      return
    }
    if (!formData.location?.room?.trim()) {
      toast.error('Room is required')
      return
    }
    if (!formData.location?.rack?.trim()) {
      toast.error('Rack is required')
      return
    }
    if (!formData.location?.cage?.trim()) {
      toast.error('Cage is required')
      return
    }

    emit('save', { ...formData })
    emit('update:open', false)
    toast.success(`Animal ${isEditing.value ? 'updated' : 'created'} successfully`)
  } catch (error) {
    toast.error(`Error ${isEditing.value ? 'updating' : 'creating'} animal`)
  } finally {
    isSubmitting.value = false
  }
}
</script>