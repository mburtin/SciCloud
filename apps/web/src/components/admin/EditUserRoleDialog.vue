<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogDescription v-if="user">
          Change the role for {{ user.first_name }} {{ user.last_name }}
        </DialogDescription>
      </DialogHeader>
      
      <div v-if="user" class="space-y-6">
        <!-- User Info -->
        <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <Avatar class="h-12 w-12">
            <AvatarImage v-if="user.avatar_url" :src="user.avatar_url" :alt="`${user.first_name} ${user.last_name}`" />
            <AvatarFallback>{{ `${user.first_name[0]}${user.last_name[0]}` }}</AvatarFallback>
          </Avatar>
          <div>
            <div class="font-medium">{{ user.first_name }} {{ user.last_name }}</div>
            <div class="text-sm text-muted-foreground">{{ user.email }}</div>
            <Badge :variant="getRoleVariant(user.role)" class="text-xs mt-1">
              {{ getRoleLabel(user.role) }}
            </Badge>
          </div>
        </div>

        <!-- Role Selection -->
        <div class="space-y-4">
          <Label>New Role</Label>
          <div class="space-y-3">
            <div 
              v-for="role in availableRoles" 
              :key="role.value"
              class="flex items-start space-x-3"
            >
              <input
                :id="role.value"
                v-model="selectedRole"
                :value="role.value"
                type="radio"
                class="mt-1"
              />
              <div class="flex-1">
                <Label :for="role.value" class="cursor-pointer">
                  <div class="flex items-center gap-2">
                    <component :is="role.icon" class="h-4 w-4" />
                    {{ role.label }}
                  </div>
                </Label>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ role.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning for role changes -->
        <div v-if="selectedRole !== user.role && selectedRole" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start gap-2">
            <AlertTriangle class="h-4 w-4 text-yellow-600 mt-0.5" />
            <div class="text-sm">
              <p class="font-medium text-yellow-800">Role Change Warning</p>
              <p class="text-yellow-700 mt-1">
                This will change the user's permissions immediately. Make sure this is intended.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('close')">
          Cancel
        </Button>
        <Button 
          @click="handleSubmit" 
          :disabled="isSubmitting || !selectedRole || selectedRole === user?.role"
        >
          <Shield class="h-4 w-4 mr-2" />
          {{ isSubmitting ? 'Updating...' : 'Update Role' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Shield, User, AlertTriangle } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user.store'
import { getRoleLabel, getRoleVariant } from '@/utils/user.utils'
import type { User as UserType, UserRole } from '@/types/supabase'

interface Props {
  open: boolean
  user: UserType | null
}

interface Emits {
  (e: 'close'): void
  (e: 'role-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()

const isSubmitting = ref(false)
const selectedRole = ref<UserRole>('user')

const availableRoles = [
  {
    value: 'user' as UserRole,
    label: 'User',
    icon: User,
    description: 'Can create and manage their own projects and data'
  },
  {
    value: 'admin' as UserRole,
    label: 'Administrator',
    icon: Shield,
    description: 'Full access to all features including user management'
  }
]

// Reset selected role when user changes or dialog opens
watch([() => props.user, () => props.open], ([user, isOpen]) => {
  if (user && isOpen) {
    selectedRole.value = user.role
  }
})

const handleSubmit = async () => {
  if (!props.user || !selectedRole.value || selectedRole.value === props.user.role) {
    return
  }

  try {
    isSubmitting.value = true
    
    const result = await userStore.updateProfile(props.user.id, { role: selectedRole.value })
    
    if (result.success) {
      emit('role-updated')
      emit('close')
    } else {
      console.error('Failed to update user role:', result.error)
      // TODO: Show error toast/notification
    }
  } catch (error) {
    console.error('Failed to update user role:', error)
    // TODO: Show error toast/notification
  } finally {
    isSubmitting.value = false
  }
}
</script>