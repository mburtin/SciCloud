<template>
  <div class="flex flex-col h-screen bg-background text-foreground">
    <Header />
    <div class="flex flex-1 overflow-hidden">
      <Sidebar />
      <main class="flex-1 overflow-y-auto layout-content-padding">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
</script>
