<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? `Edit instrument ${instrument?.name}` : 'Add New Instrument' }}</DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Edit the instrument information.' : 'Fill in the details for the new instrument.' }} Fields marked with an asterisk (*) are required.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Basic information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">Name *</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="Confocal Microscope"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="model">Model *</Label>
              <Input
                id="model"
                v-model="formData.model"
                placeholder="LSM 980"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                v-model="formData.manufacturer"
                placeholder="Zeiss"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="category">Category *</Label>
              <Select v-model="formData.category">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="category in categoryOptions"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                v-model="formData.serial_number"
                placeholder="MICR-001"
              />
            </div>
            <div class="space-y-2">
              <Label for="location">Location</Label>
              <Input
                id="location"
                v-model="formData.location"
                placeholder="Room A-101"
              />
            </div>
          </div>
        </div>

        <!-- Status and maintenance -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Status and maintenance</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="status">Status *</Label>
              <Select v-model="formData.status">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
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
            <div class="flex items-center space-x-2">
              <input
                id="maintenanceDue"
                type="checkbox"
                v-model="formData.maintenance_due"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label for="maintenanceDue">Maintenance due</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save changes' : 'Save Instrument') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { Instrument, InstrumentInsert } from '@/types/supabase'
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

interface Props {
  instrument?: Instrument | null
  open: boolean
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  instrument: null,
  mode: 'create'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [instrument: Instrument | InstrumentInsert]
}>()

const isSubmitting = ref(false)
const isEditing = computed(() => props.mode === 'edit')

const categoryOptions = [
  'Microscopes',
  'Centrifuges',
  'Spectrophotometers',
  'PCR',
  'Incubators',
  'Balances',
  'Pipettes',
  'Autoclave',
  'Freezers',
  'Fume Hoods',
  'Other'
]

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'in-use', label: 'In Use' },
  { value: 'maintenance', label: 'In Maintenance' },
  { value: 'broken', label: 'Broken' },
]

const getDefaultFormData = (): InstrumentInsert => ({
  name: '',
  model: '',
  category: '',
  manufacturer: '',
  serial_number: '',
  status: 'available',
  location: '',
  maintenance_due: false,
  created_by: '',
  updated_by: ''
})

const formData = reactive<InstrumentInsert | Instrument>(
  props.instrument ? { ...props.instrument } : getDefaultFormData()
)

// Watch for prop changes to update form data
watch(() => props.instrument, (newInstrument) => {
  if (newInstrument) {
    Object.assign(formData, newInstrument)
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
    if (!formData.name?.trim()) {
      toast.error('Name is required')
      return
    }
    if (!formData.model?.trim()) {
      toast.error('Model is required')
      return
    }
    if (!formData.manufacturer?.trim()) {
      toast.error('Manufacturer is required')
      return
    }
    if (!formData.category?.trim()) {
      toast.error('Category is required')
      return
    }

    emit('save', { ...formData })
    emit('update:open', false)
    toast.success(`Instrument ${isEditing.value ? 'updated' : 'created'} successfully`)
  } catch (error) {
    toast.error(`Error ${isEditing.value ? 'updating' : 'creating'} instrument`)
  } finally {
    isSubmitting.value = false
  }
}
</script>