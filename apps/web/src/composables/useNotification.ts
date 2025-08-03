import { ref } from 'vue'

interface NotificationState {
  open: boolean
  title: string
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
}

// Global notification state
const notificationState = ref<NotificationState>({
  open: false,
  title: '',
  message: '',
  variant: 'info'
})

export function useNotification() {
  const showNotification = (
    title: string, 
    message: string, 
    variant: NotificationState['variant'] = 'info'
  ) => {
    notificationState.value = {
      open: true,
      title,
      message,
      variant
    }
  }

  const hideNotification = () => {
    notificationState.value.open = false
  }

  const success = (title: string, message: string) => {
    showNotification(title, message, 'success')
  }

  const error = (title: string, message: string) => {
    showNotification(title, message, 'error')
  }

  const warning = (title: string, message: string) => {
    showNotification(title, message, 'warning')
  }

  const info = (title: string, message: string) => {
    showNotification(title, message, 'info')
  }

  return {
    notificationState,
    showNotification,
    hideNotification,
    success,
    error,
    warning,
    info
  }
}