<template>
  <header class="header-bg border-b border-header-border">
    <div class="flex items-center justify-between h-16">
      <!-- Sidebar width placeholder (w-72 = 288px) -->
      <div class="layout-sidebar flex items-center gap-3 px-6">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <TestTube class="h-8 w-8 text-primary" />
          <div>
            <h1 class="text-xl font-bold text-header-foreground">
              SciCloud
            </h1>
            <p class="text-xs text-muted-foreground">
              Laboratory Manager
            </p>
          </div>
        </div>
      </div>

      <!-- Main navigation -->
      <nav class="flex items-center gap-1 bg-header-accent backdrop-blur-sm rounded-xl p-1 border border-header-border shadow-sm">
        <RouterLink
          v-for="module in mainModules"
          :key="module.id"
          v-slot="{ href, navigate }"
          :to="module.to"
          custom
        >
          <Button
            :href="href"
            variant="ghost"
            size="sm"
            :class="[
              'flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all duration-300 relative group',
              isModuleActive(module) 
                ? 'nav-active shadow-md' 
                : 'text-header-foreground hover:nav-hover'
            ]"
            @click="navigate"
          >
            <span class="font-medium">{{ module.label }}</span>
          </Button>
        </RouterLink>
      </nav>

      <div class="flex-1" />

      <!-- Right-side actions -->
      <div class="flex items-center gap-3 pr-6">
        <!-- Search -->
        <div class="relative group">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            v-model="searchQuery"
            placeholder="Search..."
            class="pl-10 layout-search-width !bg-white border-border text-foreground placeholder:text-muted-foreground focus:!bg-white focus:border-primary/50 rounded-xl transition-all duration-300"
          />
        </div>
        
        <!-- Notifications -->
        <NotificationBell />
        
        <!-- User menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button 
              variant="ghost" 
              class="relative h-10 w-10 rounded-full hover:bg-header-accent transition-all duration-300"
            >
              <Avatar class="h-10 w-10 border-2 border-header-border">
                <AvatarImage :src="user.avatar" alt="User avatar" />
                <AvatarFallback class="bg-primary text-primary-foreground font-medium">
                  {{ userInitials }}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56 border-border shadow-xl bg-popover/95 backdrop-blur-md rounded-xl">
            <DropdownMenuLabel class="px-4 py-3">
              <div v-if="authStore.loading" class="flex items-center gap-2">
                <div class="animate-pulse h-4 bg-muted rounded w-20"></div>
              </div>
              <div v-else>
                <p class="font-semibold text-popover-foreground">
                  {{ user.name || 'User' }}
                </p>
                <p class="text-sm text-muted-foreground font-normal">
                  {{ user.email || 'No email' }}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="() => router.push('/profile')">
              <User class="h-4 w-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem v-if="userStore.currentUserProfile?.role === 'admin'" @click="() => router.push('/admin/settings')">
              <Settings class="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout">
              <LogOut class="h-4 w-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  TestTube, Search, User, Settings, LogOut
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useRealtimeNotifications } from '@/composables/useRealtimeNotifications'
import NotificationBell from '@/components/notifications/NotificationBell.vue'
import type { NavigationModule } from '@/types/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()
const notificationsStore = useNotificationsStore()

// Navigation modules
const mainModules: NavigationModule[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', to: '/dashboard' },
  { id: 'laboratory', label: 'Laboratory', icon: 'test-tube', to: '/lab/animals' },
  { id: 'projects', label: 'Projects', icon: 'folder-open', to: '/projects' },
]

// Use composables
const realtimeNotifications = useRealtimeNotifications()

// Local state
const searchQuery = ref('')

// Computed - Use userProfile from useUser composable
const user = computed(() => ({
  name: userStore.currentUserProfile ? `${userStore.currentUserProfile.first_name} ${userStore.currentUserProfile.last_name}` : '',
  email: userStore.currentUserProfile?.email || '',
  avatar: userStore.currentUserProfile?.avatar_url || ''
}))

const userInitials = computed(() => {
  if (!userStore.currentUserProfile) return ''
  const firstName = userStore.currentUserProfile.first_name || ''
  const lastName = userStore.currentUserProfile.last_name || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})

// Methods
const isModuleActive = (module: NavigationModule) => {
  const currentPath = route.path
  
  // Handle special cases for modules that have multiple sub-routes
  switch (module.id) {
    case 'laboratory':
      return currentPath.startsWith('/lab/')
    case 'projects':
      return currentPath.startsWith('/projects')
    case 'dashboard':
      // Dashboard should be active for calendar, notes, and dashboard itself
      return currentPath === '/dashboard' || currentPath === '/calendar' || currentPath === '/notes'
    default:
      return currentPath === module.to
  }
}

const logout = async () => {
  try {
    await authStore.logout()
    // Navigate to login after successful logout
    router.push('/login').catch(() => {
      // If router navigation fails, force reload to login
      window.location.href = '/login'
    })
  } catch (error) {
    console.error('Logout failed:', error)
    // Redirect to error page in case of logout failure
    router.replace('/error/500')
  }
}


// Initialize user profile and notifications on mount
onMounted(async () => {
  if (!userStore.currentUserProfile) {
    await userStore.loadCurrentUserProfile()
  }
  
  // Initialize notifications store and connect to realtime if user is authenticated
  if (authStore.user?.id) {
    await notificationsStore.initialize()
    realtimeNotifications.connect(authStore.user.id)
  }
})
</script>

<style scoped>
.scrollbar-hide {
  /* Firefox */
  scrollbar-width: none;
  /* Safari and Chrome */
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
