import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { defineConfig } from 'vite'

// Function to display Supabase Studio address
const displaySupabaseStudioAddress = () => {
  return {
    name: 'supabase-studio',
    buildStart() {
      setTimeout(() => {
        console.log('  \x1b[32m➜\x1b[0m  \x1b[1mSupabase Studio:\x1b[0m \x1b[36mhttp://localhost:54323/\x1b[0m')
      }, 1000)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    displaySupabaseStudioAddress()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
})
