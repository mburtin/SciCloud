import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style/main.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Initialize auth store after pinia
const authStore = useAuthStore()
authStore.initialize()

app
  .use(router)
  .mount('#app')
