<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Users class="h-8 w-8 text-primary" />
          <div>
            <h1 class="text-2xl font-semibold text-foreground">
              User Management
            </h1>
            <p class="text-muted-foreground mt-1">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-muted-foreground">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-destructive">{{ error }}</p>
      <button 
        @click="userStore.getAllUsers()"
        class="mt-2 text-sm text-primary hover:underline"
      >
        Try again
      </button>
    </div>

    <!-- Users Content -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery" 
              placeholder="Search users..."
              class="w-64 pl-10"
            />
          </div>
          <Select v-model="roleFilter">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button @click="showCreateUserDialog = true">
          <UserPlus class="h-4 w-4 mr-2" />
          Create User
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
                Total Users
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
                Active
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
                Admins
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
                Users
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
                Inactive
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
            <h3 class="font-medium mb-2">No users found</h3>
            <p class="text-sm text-muted-foreground mb-4">Try adjusting your search criteria or create a new user.</p>
            <Button @click="showCreateUserDialog = true" class="gap-2">
              <UserPlus class="h-4 w-4" />
              Create User
            </Button>
          </div>
          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="user in filteredUsers"
                :key="user.id"
                class="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <div class="flex items-center gap-3">
                    <Avatar class="h-8 w-8">
                      <AvatarImage v-if="user.avatar_url" :src="user.avatar_url" :alt="`${user.first_name} ${user.last_name}`" />
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
                    {{ getUserStatus(user) }}
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
                    Never
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
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="handleUserAction('toggle-status', user)">
                        {{ getUserStatus(user) === 'active' ? 'Deactivate' : 'Activate' }}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="handleUserAction('delete', user)" class="text-destructive">
                        Delete User
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
    <CreateUserDialog 
      :open="showCreateUserDialog" 
      @close="showCreateUserDialog = false"
      @user-created="handleUserCreated"
    />

    <!-- Edit User Role Dialog -->
    <EditUserRoleDialog 
      :open="showEditRoleDialog"
      :user="selectedUser" 
      @close="showEditRoleDialog = false"
      @role-updated="handleRoleUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Users,
  UserPlus,
  MoreHorizontal,
  Shield,
  User
} from 'lucide-vue-next'
import CreateUserDialog from '@/components/admin/CreateUserDialog.vue'
import EditUserRoleDialog from '@/components/admin/EditUserRoleDialog.vue'
import type { User as UserType } from '@/types/supabase'
import { getUserStatus, formatDate, getRoleLabel, getRoleVariant, getStatusVariant, calculateUserStats } from '@/utils/user.utils'
import { useUserStore } from '@/stores/user.store'
import { storeToRefs } from 'pinia'

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
      if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
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