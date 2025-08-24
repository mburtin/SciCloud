<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('projects.members.addMember') }}</DialogTitle>
        <DialogDescription>
          {{ t('projects.members.selectUserAndRole') }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleAddMember" class="space-y-4">
        <!-- User Selection -->
        <div class="space-y-2">
          <Label for="user-select">{{ t('projects.members.user') }} *</Label>
          <Select v-model="selectedUserId">
            <SelectTrigger>
              <SelectValue :placeholder="t('projects.members.selectUser')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="user in availableUsers" 
                :key="user.id" 
                :value="user.id"
              >
                {{ user.first_name }} {{ user.last_name }}
                <span class="text-xs text-muted-foreground ml-2">({{ user.email }})</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Role Selection -->
        <div class="space-y-2">
          <Label for="role-select">{{ t('projects.members.role') }} *</Label>
          <Select v-model="selectedRole">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">
                <div class="flex flex-col space-y-1">
                  <SelectItemText>{{ t('projects.roles.viewer') }}</SelectItemText>
                  <span class="text-xs text-muted-foreground">{{ t('projects.roles.viewerDescription') }}</span>
                </div>
              </SelectItem>
              <SelectItem value="member">
                <div class="flex flex-col space-y-1">
                  <SelectItemText>{{ t('projects.roles.member') }}</SelectItemText>
                  <span class="text-xs text-muted-foreground">{{ t('projects.roles.memberDescription') }}</span>
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div class="flex flex-col space-y-1">
                  <SelectItemText>{{ t('projects.roles.admin') }}</SelectItemText>
                  <span class="text-xs text-muted-foreground">{{ t('projects.roles.adminDescription') }}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel">
            {{ t('common.actions.cancel') }}
          </Button>
          <Button 
            type="submit" 
            :disabled="!selectedUserId || !selectedRole || isLoading"
          >
            {{ isLoading ? t('common.status.adding') : t('common.actions.add') }}
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
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useTranslation } from '@/composables/useLocale'
import { useUserStore } from '@/stores/user.store'
import type { ProjectMemberRole } from '@/types/supabase'
import { computed, onMounted, ref, watch } from 'vue'

interface Props {
  open: boolean
  projectId: string
  existingMemberIds: string[]
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'member-added', data: { userId: string; role: ProjectMemberRole }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useTranslation()
const userStore = useUserStore()

// Form state
const selectedUserId = ref('')
const selectedRole = ref<ProjectMemberRole>('member')
const isLoading = ref(false)

// Available users (exclude existing members)
const availableUsers = computed(() => {
  return userStore.allUsers.filter(user => 
    !props.existingMemberIds.includes(user.id)
  )
})

// Load users when dialog opens
onMounted(async () => {
  await userStore.getAllUsers()
})

// Reload users when dialog opens
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await userStore.getAllUsers()
    resetForm()
  }
})

const resetForm = () => {
  selectedUserId.value = ''
  selectedRole.value = 'member'
  isLoading.value = false
}

const handleAddMember = async () => {
  if (!selectedUserId.value || !selectedRole.value) return

  try {
    isLoading.value = true
    
    emit('member-added', {
      userId: selectedUserId.value,
      role: selectedRole.value
    })

    // Dialog will be closed by parent component
  } catch (error) {
    console.error('Error adding member:', error)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('update:open', false)
  resetForm()
}
</script>