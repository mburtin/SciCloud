<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
        <DialogDescription>
          Add a new user to the system. They will receive an email with login instructions.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="first_name">First Name</Label>
            <Input id="first_name" v-model="formData.first_name" placeholder="John" required />
          </div>
          <div class="space-y-2">
            <Label for="last_name">Last Name</Label>
            <Input id="last_name" v-model="formData.last_name" placeholder="Doe" required />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input id="email" v-model="formData.email" type="email" placeholder="john.doe@example.com" required />
        </div>

        <div class="space-y-2">
          <Label for="password">Temporary Password</Label>
          <Input id="password" v-model="formData.password" type="password" placeholder="Enter a temporary password"
            required />
        </div>

        <div class="space-y-2">
          <Label for="role">Role</Label>
          <Select v-model="formData.role">
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('close')">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <UserPlus class="h-4 w-4 mr-2" />
            {{ isSubmitting ? 'Creating...' : 'Create User' }}
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
