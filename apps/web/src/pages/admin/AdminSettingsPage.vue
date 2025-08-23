<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Users class="h-8 w-8 text-primary" />
          <div>
            <h1 class="text-2xl font-semibold text-foreground">
              {{ t('admin.title') }}
            </h1>
            <p class="text-muted-foreground mt-1">
              {{ t('admin.subtitle') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-muted-foreground">{{ t('admin.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-destructive">{{ error }}</p>
      <button @click="userStore.getAllUsers()" class="mt-2 text-sm text-primary hover:underline">
        {{ t('common.actions.refresh') }}
      </button>
    </div>

    <!-- Users Content -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input v-model="searchQuery" :placeholder="t('admin.searchUsers')" class="w-64 pl-10" />
          </div>
          <Select v-model="roleFilter">
            <SelectTrigger class="w-40">
              <SelectValue :placeholder="t('admin.allRoles')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{{ t('admin.allRoles') }}</SelectItem>
              <SelectItem value="admin">{{ t('common.labels.admin') }}</SelectItem>
              <SelectItem value="user">{{ t('common.labels.user') }}</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-40">
              <SelectValue :placeholder="t('admin.allStatus')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{{ t('admin.allStatus') }}</SelectItem>
              <SelectItem value="active">{{ t('common.status.active') }}</SelectItem>
              <SelectItem value="inactive">{{ t('common.status.inactive') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button @click="showCreateUserDialog = true">
          <UserPlus class="h-4 w-4 mr-2" />
          {{ t('admin.createUser') }}
        </Button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-gray-100 p-2 rounded-lg">
              <Users class="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('admin.totalUsers') }}
              </p>
              <p class="text-xl font-bold">
                {{ stats.total }}
              </p>
            </div>
          </div>
        </Card>
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-green-100 p-2 rounded-lg">
              <div class="w-5 h-5 flex items-center justify-center">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('common.status.active') }}
              </p>
              <p class="text-xl font-bold">
                {{ stats.active }}
              </p>
            </div>
          </div>
        </Card>
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-red-100 p-2 rounded-lg">
              <Shield class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('admin.admins') }}
              </p>
              <p class="text-xl font-bold">
                {{ stats.admins }}
              </p>
            </div>
          </div>
        </Card>
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-blue-100 p-2 rounded-lg">
              <User class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('admin.users') }}
              </p>
              <p class="text-xl font-bold">
                {{ stats.users }}
              </p>
            </div>
          </div>
        </Card>
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-gray-100 p-2 rounded-lg">
              <div class="w-5 h-5 flex items-center justify-center">
                <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('common.status.inactive') }}
              </p>
              <p class="text-xl font-bold">
                {{ stats.inactive }}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardContent class="p-0">
          <!-- Show empty state if no filtered users -->
          <div v-if="filteredUsers.length === 0" class="text-center py-12">
            <Users class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="font-medium mb-2">{{ t('admin.noUsers') }}</h3>
            <p class="text-sm text-muted-foreground mb-4">{{ t('admin.tryAdjusting') }}</p>
            <Button @click="showCreateUserDialog = true" class="gap-2">
              <UserPlus class="h-4 w-4" />
              {{ t('admin.createUser') }}
            </Button>
          </div>
          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t('common.labels.user') }}</TableHead>
                <TableHead>{{ t('common.labels.email') }}</TableHead>
                <TableHead>{{ t('common.labels.role') }}</TableHead>
                <TableHead>{{ t('common.labels.status') }}</TableHead>
                <TableHead>{{ t('common.labels.location') }}</TableHead>
                <TableHead>{{ t('common.labels.created') }}</TableHead>
                <TableHead>{{ t('admin.lastLogin') }}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="user in filteredUsers" :key="user.id" class="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div class="flex items-center gap-3">
                    <Avatar class="h-8 w-8">
                      <AvatarImage v-if="user.avatar_url" :src="user.avatar_url"
                        :alt="`${user.first_name} ${user.last_name}`" />
                      <AvatarFallback>{{ `${user.first_name[0]}${user.last_name[0]}` }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div class="font-medium">
                        {{ user.first_name }} {{ user.last_name }}
                      </div>
                      <div class="text-sm text-muted-foreground" v-if="user.phone">
                        {{ user.phone }}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    {{ user.email }}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getRoleVariant(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(getUserStatus(user))">
                    {{ t(`common.status.${getUserStatus(user)}`) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="text-sm" v-if="user.location">
                    {{ user.location }}
                  </div>
                  <div class="text-sm text-muted-foreground" v-else>
                    -
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm" v-if="user.created_at">
                    {{ formatDate(user.created_at) }}
                  </div>
                  <div class="text-sm text-muted-foreground" v-else>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm" v-if="user.updated_at">
                    {{ formatDate(user.updated_at) }}
                  </div>
                  <div class="text-sm text-muted-foreground" v-else>
                    {{ t('admin.never') }}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem @click="handleUserAction('edit', user)">
                        {{ t('admin.editRole') }}
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="handleUserAction('toggle-status', user)">
                        {{ getUserStatus(user) === 'active' ? t('admin.deactivate') : t('admin.activate') }}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="handleUserAction('delete', user)" class="text-destructive">
                        {{ t('admin.deleteUser') }}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    <!-- Create User Dialog -->
    <CreateUserDialog :open="showCreateUserDialog" @close="showCreateUserDialog = false"
      @user-created="handleUserCreated" />

    <!-- Edit User Role Dialog -->
    <EditUserRoleDialog :open="showEditRoleDialog" :user="selectedUser" @close="showEditRoleDialog = false"
      @role-updated="handleRoleUpdated" />
  </div>
</template>

<script setup lang="ts">
import CreateUserDialog from '@/components/admin/CreateUserDialog.vue'
import EditUserRoleDialog from '@/components/admin/EditUserRoleDialog.vue'
import { useTranslation } from '@/composables/useLocale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { calculateUserStats, formatDate, getRoleLabel, getRoleVariant, getStatusVariant, getUserStatus } from '@/lib/user.utils'
import { useUserStore } from '@/stores/user.store'
import type { User as UserType } from '@/types/supabase'
import {
  MoreHorizontal,
  Search,
  Shield,
  User,
  UserPlus,
  Users
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

// Translation
const { t } = useTranslation()

// Store initialization
const userStore = useUserStore()
const { loading: isLoading, error } = storeToRefs(userStore)

// Local reactive state
const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const selectedUser = ref<UserType | null>(null)
const showCreateUserDialog = ref(false)
const showEditRoleDialog = ref(false)

// Computed properties
const stats = computed(() => calculateUserStats(userStore.allUsers))

const filteredUsers = computed(() => {
  let filtered = userStore.allUsers

  // Filter by search query (name, email)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(query) ||
      (user.email && user.email.toLowerCase().includes(query))
    )
  }

  // Filter by role
  if (roleFilter.value !== 'all') {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(user => getUserStatus(user) === statusFilter.value)
  }

  return filtered
})


const handleUserAction = async (action: string, user: UserType) => {
  try {
    if (action === 'edit') {
      selectedUser.value = user
      showEditRoleDialog.value = true
    } else if (action === 'toggle-status') {
      // todo: toggle statut activate / desactivate user account
      // await userStore.getAllUsers() // Refresh the user list
    } else if (action === 'delete') {
      if (confirm(t('admin.confirmDelete', { name: `${user.first_name} ${user.last_name}` }))) {
        await userStore.deleteUser(user.id)
        await userStore.getAllUsers() // Refresh the user list
      }
    }
  } catch (err) {
    console.error(`Failed to ${action} user:`, err)
  }
}

const handleUserCreated = () => {
  showCreateUserDialog.value = false
  userStore.getAllUsers() // Refresh the user list
}

const handleRoleUpdated = () => {
  showEditRoleDialog.value = false
  selectedUser.value = null
  userStore.getAllUsers() // Refresh the user list
}

// Load users on mount
onMounted(() => {
  userStore.getAllUsers()
})
</script>
