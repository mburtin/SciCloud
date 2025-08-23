<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? t('labs.instruments.form.editInstrument', { name: instrument?.name }) : t('labs.instruments.form.addNewInstrument') }}</DialogTitle>
        <DialogDescription>
          {{ isEditing ? t('labs.instruments.form.editInformation') : t('labs.instruments.form.fillDetails') }} {{ t('labs.instruments.form.requiredFields') }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">{{ t('labs.instruments.form.basicInformation') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">{{ t('labs.instruments.form.name') }} *</Label>
              <Input id="name" v-model="formData.name" :placeholder="t('labs.instruments.form.namePlaceholder')" required />
            </div>
            <div class="space-y-2">
              <Label for="model">{{ t('labs.instruments.form.model') }} *</Label>
              <Input id="model" v-model="formData.model" :placeholder="t('labs.instruments.form.modelPlaceholder')" required />
            </div>
            <div class="space-y-2">
              <Label for="manufacturer">{{ t('labs.instruments.form.manufacturer') }} *</Label>
              <Input id="manufacturer" v-model="formData.manufacturer" :placeholder="t('labs.instruments.form.manufacturerPlaceholder')" required />
            </div>
            <div class="space-y-2">
              <Label for="category">{{ t('labs.instruments.form.category') }} *</Label>
              <Select v-model="formData.category">
                <SelectTrigger>
                  <SelectValue :placeholder="t('labs.instruments.form.selectCategory')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="category in categoryOptions" :key="category" :value="category">
                    {{ category }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="serialNumber">{{ t('labs.instruments.form.serialNumber') }}</Label>
              <Input id="serialNumber" v-model="formData.serial_number" :placeholder="t('labs.instruments.form.serialNumberPlaceholder')" />
            </div>
            <div class="space-y-2">
              <Label for="location">{{ t('labs.instruments.form.location') }}</Label>
              <Input id="location" v-model="formData.location" :placeholder="t('labs.instruments.form.locationPlaceholder')" />
            </div>
          </div>
        </div>

        <!-- Status and maintenance -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">{{ t('labs.instruments.form.statusAndMaintenance') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="status">{{ t('labs.instruments.form.status') }} *</Label>
              <Select v-model="formData.status">
                <SelectTrigger>
                  <SelectValue :placeholder="t('labs.instruments.form.selectStatus')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex items-center space-x-2">
              <input id="maintenanceDue" type="checkbox" v-model="formData.maintenance_due"
                class="rounded border-gray-300 text-primary focus:ring-primary" />
              <Label for="maintenanceDue">{{ t('labs.instruments.form.maintenanceDue') }}</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            {{ t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? t('common.saving') : (isEditing ? t('common.saveChanges') : t('labs.instruments.form.saveInstrument')) }}
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
import { useTranslation } from '@/composables/useLocale'
import type { Instrument, InstrumentInsert } from '@/types/supabase'
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

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

const { t } = useTranslation()
const isSubmitting = ref(false)
const isEditing = computed(() => props.mode === 'edit')

const categoryOptions = computed(() => [
  t('labs.instruments.categories.microscopes'),
  t('labs.instruments.categories.centrifuges'),
  t('labs.instruments.categories.spectrophotometers'),
  t('labs.instruments.categories.pcr'),
  t('labs.instruments.categories.incubators'),
  t('labs.instruments.categories.balances'),
  t('labs.instruments.categories.pipettes'),
  t('labs.instruments.categories.autoclave'),
  t('labs.instruments.categories.freezers'),
  t('labs.instruments.categories.fumeHoods'),
  t('labs.instruments.categories.other')
])

const statusOptions = computed(() => [
  { value: 'available', label: t('labs.instruments.status.available') },
  { value: 'in-use', label: t('labs.instruments.status.inUse') },
  { value: 'maintenance', label: t('labs.instruments.status.maintenance') },
  { value: 'broken', label: t('labs.instruments.status.broken') },
])

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
      toast.error(t('labs.instruments.validation.nameRequired'))
      return
    }
    if (!formData.model?.trim()) {
      toast.error(t('labs.instruments.validation.modelRequired'))
      return
    }
    if (!formData.manufacturer?.trim()) {
      toast.error(t('labs.instruments.validation.manufacturerRequired'))
      return
    }
    if (!formData.category?.trim()) {
      toast.error(t('labs.instruments.validation.categoryRequired'))
      return
    }

    emit('save', { ...formData })
    emit('update:open', false)
    toast.success(isEditing.value ? t('labs.instruments.instrumentUpdated') : t('labs.instruments.instrumentCreated'))
  } catch (error) {
    toast.error(isEditing.value ? t('labs.instruments.instrumentUpdateError') : t('labs.instruments.instrumentCreateError'))
  } finally {
    isSubmitting.value = false
  }
}
</script>
