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
          v-slot="{ href, navigate, isExactActive }"
          :to="module.to"
          custom
        >
          <Button
            :href="href"
            variant="ghost"
            size="sm"
            :class="[
              'flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all duration-300 relative group',
              isExactActive 
                ? 'nav-active shadow-md' 
                : 'text-header-foreground hover:nav-hover'
            ]"
            @click="navigate"
          >
            <component 
              :is="module.icon" 
              :class="[
                'h-4 w-4 transition-transform duration-300',
                isExactActive ? 'scale-110' : 'group-hover:scale-105'
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
            class="pl-10 layout-search-width bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:bg-accent focus:border-primary/50 rounded-xl transition-all duration-300"
          />
        </div>
        
        <!-- Notifications -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button 
              variant="ghost" 
              size="sm" 
              class="relative text-header-foreground hover:bg-header-accent rounded-xl p-2.5 transition-all duration-300"
            >
              <Bell class="h-5 w-5" />
              <Badge 
                v-if="unreadNotifications > 0" 
                class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs rounded-full animate-pulse"
              >
                {{ unreadNotifications }}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-96 max-h-[70vh] border-border shadow-2xl bg-popover/95 backdrop-blur-md rounded-2xl">
            <div class="flex items-center justify-between p-4 border-b border-border">
              <h4 class="font-semibold text-popover-foreground">
                Notifications
              </h4>
              <Button 
                v-if="unreadNotifications > 0"
                variant="ghost" 
                size="sm" 
                class="text-primary hover:bg-accent rounded-lg"
                @click="markAllAsRead"
              >
                Mark all as read
              </Button>
            </div>
            <ScrollArea class="max-h-96">
              <div v-if="notifications.length === 0" class="p-8 text-center text-muted-foreground">
                <Bell class="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
              <div v-else class="space-y-1">
                <div 
                  v-for="notification in notifications.slice(0, 5)" 
                  :key="notification.id"
                  class="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 cursor-pointer transition-colors"
                  :class="{
                    'bg-blue-50/50 border-l-4 border-l-blue-500': !notification.read
                  }"
                  @click="markAsRead(notification.id)"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 mt-1">
                      <div 
                        :class="[
                          'h-2 w-2 rounded-full',
                          notification.read ? 'bg-slate-300' : 'bg-blue-500 animate-pulse'
                        ]"
                      />
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-slate-800">
                        {{ notification.title }}
                      </p>
                      <p class="text-sm text-slate-600">
                        {{ notification.message }}
                      </p>
                      <p class="text-xs text-muted-foreground mt-2">
                        {{ formatTimestamp(notification.timestamp) }}
                      </p>
                    </div>
                  </div>
                </div>
                <div v-if="notifications.length > 5" class="p-3 text-center border-t border-border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    class="text-primary hover:bg-accent rounded-lg"
                    @click="showAllNotifications"
                  >
                    View all notifications
                  </Button>
                </div>
              </div>
            </ScrollArea>
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
              <p class="font-semibold text-popover-foreground">
                {{ user.name }}
              </p>
              <p class="text-sm text-muted-foreground font-normal">
                {{ user.email }}
              </p>
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
import { useRouter } from 'vue-router'
import { 
  TestTube, Search, Bell, User, Settings, LogOut
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
import { useUser } from '@/composables/useUser'
import { useNavigation } from '@/composables/useNavigation'

const router = useRouter()
const authStore = useAuthStore()

// Use composables
const { currentUser, userInitials, fetchCurrentUser } = useUser()
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

// Computed
const user = computed(() => ({
  name: currentUser.value ? `${currentUser.value.firstName} ${currentUser.value.lastName}` : '',
  email: currentUser.value?.email || '',
  avatar: currentUser.value?.avatar_url || ''
}))

// Methods
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
  // Navigate to full notifications page
  router.push('/notifications')
}

// Load user data on mount
onMounted(() => {
  fetchCurrentUser()
})
</script>
