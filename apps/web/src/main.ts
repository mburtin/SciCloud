import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style/main.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.store'
import { useNotificationsStore } from './stores/notifications.store'
import { Toaster } from 'vue-sonner'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Register Vue Sonner Toaster component globally
app.component('Toaster', Toaster)

// Initialize stores after pinia
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

authStore.initialize()

// Initialize notifications store after auth is ready
if (authStore.user) {
  notificationsStore.initialize()
} else {
  // Watch for user login
  authStore.$subscribe(() => {
    if (authStore.user && !notificationsStore.settings) {
      notificationsStore.initialize()
    }
  })
}

app
  .use(router)
  .mount('#app')
