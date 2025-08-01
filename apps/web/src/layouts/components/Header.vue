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
            <component 
              :is="module.icon" 
              :class="[
                'h-4 w-4 transition-transform duration-300',
                isModuleActive(module) ? 'scale-110' : 'group-hover:scale-105'
              ]" 
            />
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
        <DropdownMenu v-model:open="notificationsOpen">
          <DropdownMenuTrigger as-child>
            <Button 
              variant="ghost" 
              size="sm" 
              class="relative p-2.5 text-header-foreground hover:bg-header-accent transition-all duration-300 rounded-xl group"
            >
              <Bell class="h-5 w-5 group-hover:text-slate-100 transition-colors" />
              <Badge 
                v-if="unreadNotifications > 0" 
                class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-600 border-2 border-blue-900 shadow-lg text-white rounded-full"
              >
                {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-80 overflow-hidden shadow-xl border-slate-200/60 bg-white/95 backdrop-blur-md rounded-2xl">
            <DropdownMenuLabel class="flex items-center justify-between bg-slate-50 text-slate-700 rounded-t-2xl px-4 py-3">
              <span class="font-semibold">Notifications</span>
              <Button 
                v-if="unreadNotifications > 0"
                variant="ghost" 
                size="sm" 
                class="h-6 text-xs hover:bg-slate-200/60 text-slate-600 px-2"
                @click="markAllAsRead"
              >
                Mark all as read
              </Button>
            </DropdownMenuLabel>
            <div class="border-t border-slate-200"></div>
            
            <div v-if="recentNotifications.length === 0" class="p-6 text-center text-sm text-slate-500">
              <Bell class="h-8 w-8 mx-auto mb-2 text-slate-300" />
              No notifications
            </div>
            
            <div v-else class="max-h-96 overflow-y-auto scrollbar-hide">
              <div 
                v-for="notification in recentNotifications" 
                :key="notification.id"
                class="p-3 hover:bg-muted/50 cursor-pointer border-l-2 transition-colors"
                :class="[
                  notification.read ? 'border-l-transparent' : 'border-l-primary',
                  !notification.read ? 'bg-accent/20' : ''
                ]"
                @click="markAsRead(notification.id)"
              >
                <div class="flex items-start gap-3 min-w-0">
                  <component 
                    :is="getNotificationIcon(notification.type, notification.priority).component" 
                    :class="getNotificationIcon(notification.type, notification.priority).class"
                  />
                  <div class="flex-1 space-y-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p :class="[
                        'text-sm truncate pr-2',
                        !notification.read ? 'font-medium' : ''
                      ]">
                        {{ notification.title }}
                      </p>
                      <span class="text-xs text-muted-foreground whitespace-nowrap">
                        {{ formatTimestamp(notification.timestamp) }}
                      </span>
                    </div>
                    <p class="text-xs text-muted-foreground line-clamp-2 break-words">
                      {{ truncateMessage(notification.message, 60) }}
                    </p>
                  </div>
                </div>
              </div>
              
              <div v-if="hasMoreNotifications" class="border-t border-slate-200">
                <button
                  class="w-full p-3 text-center text-sm text-slate-600 hover:bg-slate-50/80 transition-colors flex items-center justify-center gap-2 rounded-b-2xl"
                  @click="showAllNotifications"
                >
                  <MoreHorizontal class="h-4 w-4" />
                  View all notifications ({{ notifications.length }})
                </button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
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
            <DropdownMenuItem @click="() => router.push('/settings')">
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
  TestTube, Search, Bell, User, Settings, LogOut,
  FolderOpen, UserPlus, AlertCircle, FileText, Info,
  MoreHorizontal, CheckCircle, Clock
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth.store'
import { useNavigation } from '@/composables/useNavigation'
import { useUser } from '@/composables/useUser'
import type { NavigationModule } from '@/types/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { userProfile, fetchUserProfile } = useUser()

// Use composables
const { 
  mainModules, 
  notifications, 
  unreadNotifications, 
  markAsRead, 
  markAllAsRead,
  formatTimestamp 
} = useNavigation()

// Local state
const searchQuery = ref('')
const notificationsOpen = ref(false)

// Computed - Use userProfile from useUser composable
const user = computed(() => ({
  name: userProfile.value ? `${userProfile.value.firstName} ${userProfile.value.lastName}` : '',
  email: userProfile.value?.email || '',
  avatar: userProfile.value?.avatar_url || ''
}))

const userInitials = computed(() => {
  if (!userProfile.value) return ''
  const firstName = userProfile.value.firstName || ''
  const lastName = userProfile.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})

const recentNotifications = computed(() => notifications.value.slice(0, 5))
const hasMoreNotifications = computed(() => notifications.value.length > 5)

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
    // Force navigation immediately after logout
    window.location.href = '/login'
  } catch (error) {
    console.error('Logout failed:', error)
    // Redirect to error page in case of logout failure
    router.replace('/error/500')
  }
}

const showAllNotifications = () => {
  notificationsOpen.value = false
  // Navigate to full notifications page
  router.push('/notifications')
}

const getNotificationIcon = (type: string, priority: string) => {
  const iconClass = priority === 'high' ? 'text-red-500' : 
                   priority === 'medium' ? 'text-orange-500' : 
                   'text-blue-500'
  
  switch (type) {
    case 'project':
      return { component: FolderOpen, class: `h-4 w-4 ${iconClass}` }
    case 'collaboration':
      return { component: UserPlus, class: `h-4 w-4 ${iconClass}` }
    case 'system':
      return { component: AlertCircle, class: `h-4 w-4 ${iconClass}` }
    case 'document':
      return { component: FileText, class: `h-4 w-4 ${iconClass}` }
    default:
      return { component: Info, class: `h-4 w-4 ${iconClass}` }
  }
}

const truncateMessage = (message: string, maxLength: number) => {
  return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message
}

// Initialize user profile on mount
onMounted(async () => {
  if (!userProfile.value) {
    await fetchUserProfile()
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
