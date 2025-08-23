<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t('admin.createUserDialog.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('admin.createUserDialog.description') }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="first_name">{{ t('admin.createUserDialog.firstName') }}</Label>
            <Input id="first_name" v-model="formData.first_name" :placeholder="t('admin.createUserDialog.firstNamePlaceholder')" required />
          </div>
          <div class="space-y-2">
            <Label for="last_name">{{ t('admin.createUserDialog.lastName') }}</Label>
            <Input id="last_name" v-model="formData.last_name" :placeholder="t('admin.createUserDialog.lastNamePlaceholder')" required />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="email">{{ t('admin.createUserDialog.email') }}</Label>
          <Input id="email" v-model="formData.email" type="email" :placeholder="t('admin.createUserDialog.emailPlaceholder')" required />
        </div>

        <div class="space-y-2">
          <Label for="password">{{ t('admin.createUserDialog.temporaryPassword') }}</Label>
          <Input id="password" v-model="formData.password" type="password" :placeholder="t('admin.createUserDialog.passwordPlaceholder')"
            required />
        </div>

        <div class="space-y-2">
          <Label for="role">{{ t('admin.createUserDialog.role') }}</Label>
          <Select v-model="formData.role">
            <SelectTrigger>
              <SelectValue :placeholder="t('admin.createUserDialog.selectRole')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">{{ t('admin.createUserDialog.user') }}</SelectItem>
              <SelectItem value="admin">{{ t('admin.createUserDialog.administrator') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('close')">
            {{ t('admin.createUserDialog.cancel') }}
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <UserPlus class="h-4 w-4 mr-2" />
            {{ isSubmitting ? t('admin.createUserDialog.creating') : t('admin.createUserDialog.createUser') }}
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from '@/composables/useLocale'
import { useUserStore } from '@/stores/user.store'
import type { UserRole } from '@/types/supabase'
import { UserPlus } from 'lucide-vue-next'
import { reactive, ref, watch } from 'vue'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'user-created'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const userStore = useUserStore()
const { t } = useTranslation()

const isSubmitting = ref(false)

const formData = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'user' as UserRole
})

// Reset form when dialog closes
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    Object.assign(formData, {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: 'user' as UserRole
    })
  }
})

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    await userStore.createUser({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    })

    emit('user-created')
  } catch (error) {
    console.error('Failed to create user:', error)
    // TODO: Show error toast/notification
  } finally {
    isSubmitting.value = false
  }
}
</script>
