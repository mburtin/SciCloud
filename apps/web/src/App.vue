<script setup lang="ts">
import { provide } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { Toaster } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()

provide('router', router)
provide('authStore', authStore)
</script>

<template>
  <div class="min-h-screen bg-background font-sans antialiased">
    <router-view />
    <Toaster />
  </div>
</template>

<style>
@import './style/main.css';
</style>
