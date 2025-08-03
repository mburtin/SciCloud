<script setup lang="ts">
import { provide } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useNotification } from '@/composables/useNotification'
import NotificationDialog from '@/components/ui/notification/NotificationDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const { notificationState, hideNotification } = useNotification()

provide('router', router)
provide('authStore', authStore)
</script>

<template>
  <div class="min-h-screen bg-background font-sans antialiased">
    <router-view />
    
    <!-- Global notification dialog -->
    <NotificationDialog
      :open="notificationState.open"
      :title="notificationState.title"
      :message="notificationState.message"
      :variant="notificationState.variant"
      @close="hideNotification"
    />
  </div>
</template>

<style>
@import './style/main.css';
</style>
