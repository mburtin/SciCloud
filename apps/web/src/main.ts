import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style/main.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app
  .use(pinia)
  .use(router)
  .mount('#app')
