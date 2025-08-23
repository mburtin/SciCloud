import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { Toaster } from 'vue-sonner'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import { useAuthStore } from './stores/auth.store'
import { useNotificationsStore } from './stores/notifications.store'
import './style/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)

// Register Vue Sonner Toaster component globally
// eslint-disable-next-line vue/multi-word-component-names
app.component('Toaster', Toaster)

// Initialize stores after pinia
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

// Initialize locale store
const { useLocaleStore } = await import('./stores/locale.store')
const localeStore = useLocaleStore()
localeStore.initialize()

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
