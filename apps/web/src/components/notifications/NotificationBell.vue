<template>
  <!-- Notifications -->
  <DropdownMenu v-model:open="isOpen">
    <DropdownMenuTrigger as-child>
      <Button 
        variant="ghost" 
        size="sm" 
        class="relative p-2.5 text-header-foreground hover:bg-header-accent transition-all duration-300 rounded-xl group"
      >
        <Bell class="h-5 w-5 group-hover:text-slate-100 transition-colors" />
        <Badge 
          v-if="unreadCount > 0" 
          class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-600 border-2 border-blue-900 shadow-lg text-white rounded-full"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </Badge>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-80 overflow-hidden shadow-xl border-slate-200/60 bg-white/95 backdrop-blur-md rounded-2xl">
      <DropdownMenuLabel class="flex items-center justify-between bg-slate-50 text-slate-700 rounded-t-2xl px-4 py-3">
        <span class="font-semibold">Notifications</span>
        <Button 
          v-if="unreadCount > 0"
          variant="ghost" 
          size="sm" 
          class="h-6 text-xs hover:bg-slate-200/60 text-slate-600 px-2"
          @click="markAllAsRead"
        >
          Mark all as read
        </Button>
      </DropdownMenuLabel>
      <div class="border-t border-slate-200"></div>
      
      <div v-if="loading" class="p-6 text-center text-sm text-slate-500">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        <p class="text-sm text-muted-foreground mt-2">Loading notifications...</p>
      </div>
      
      <div v-else-if="notifications.length === 0" class="p-6 text-center text-sm text-slate-500">
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
          @click="handleNotificationClick(notification.id)"
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
                  {{ formatTimeAgo(notification.created_at) }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground line-clamp-2 break-words">
                {{ truncateText(notification.message, 60) }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-if="hasMoreNotifications" class="border-t border-slate-200">
          <button
            class="w-full p-3 text-center text-sm text-slate-600 hover:bg-slate-50/80 transition-colors flex items-center justify-center gap-2 rounded-b-2xl"
            @click="viewAll"
          >
            <MoreHorizontal class="h-4 w-4" />
            View all notifications ({{ notifications.length }})
          </button>
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Bell, 
  FolderOpen, 
  Users, 
  AlertTriangle, 
  FileText,
  MoreHorizontal 
} from 'lucide-vue-next'
import { useNotificationsStore } from '@/stores/notifications.store'
import { formatTimeAgo, truncateText } from '@/utils/format.utils'

const router = useRouter()
const notificationsStore = useNotificationsStore()

// Component state
const isOpen = ref(false)
const hasNewNotification = ref(false)

// Computed properties
const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)
const loading = computed(() => notificationsStore.loading)

const recentNotifications = computed(() => {
  return notifications.value.slice(0, 5) // Show only 5 most recent in dropdown
})

const totalCount = computed(() => notifications.value.length)

const hasMoreNotifications = computed(() => {
  return notifications.value.length > 5 // Show more button if more than 5 notifications
})

// Watch for new notifications
watch(unreadCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    hasNewNotification.value = true
    // Reset animation after 3 seconds
    setTimeout(() => {
      hasNewNotification.value = false
    }, 3000)
  }
})

// Watch for dropdown opening to fetch notifications
watch(isOpen, (newValue) => {
  if (newValue && notifications.value.length === 0) {
    notificationsStore.fetchNotifications(10, 0)
  }
})

const handleNotificationClick = (notificationId: string) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification && !notification.read) {
    handleMarkAsRead(notificationId)
  }
  
  // Navigate based on notification type or data
  if (notification?.data?.route) {
    router.push(notification.data.route)
  }
  
  // Close dropdown
  isOpen.value = false
}

const handleMarkAsRead = async (notificationId: string) => {
  try {
    await notificationsStore.markAsRead(notificationId)
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

const handleDelete = async (notificationId: string) => {
  try {
    await notificationsStore.deleteNotification(notificationId)
  } catch (error) {
    console.error('Failed to delete notification:', error)
  }
}

const markAllAsRead = async () => {
  try {
    await notificationsStore.markAllAsRead()
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}

const viewAll = () => {
  router.push('/notifications')
  isOpen.value = false
}

// Helper functions matching the original code
const getNotificationIcon = (type: string, priority: string) => {
  const baseClass = "h-4 w-4 flex-shrink-0"
  
  switch (type) {
    case 'project':
      return {
        component: FolderOpen,
        class: `${baseClass} text-blue-500`
      }
    case 'collaboration':
      return {
        component: Users,
        class: `${baseClass} text-green-500`
      }
    case 'system':
      return {
        component: AlertTriangle,
        class: `${baseClass} text-orange-500`
      }
    case 'document':
      return {
        component: FileText,
        class: `${baseClass} text-purple-500`
      }
    default:
      return {
        component: AlertTriangle,
        class: `${baseClass} text-gray-500`
      }
  }
}

</script>