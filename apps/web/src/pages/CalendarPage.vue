<template>
  <div class="space-y-6">
    <!-- SchedulerCalendar is now fully self-contained - no duplicate event handlers -->
    <SchedulerCalendar />
  </div>
</template>

<script setup lang="ts">
import SchedulerCalendar from '@/components/scheduler/SchedulerCalendar.vue'

// SchedulerCalendar is now fully self-contained with its own useCalendar instance
// No need for duplicate event handlers that were causing database duplicates
</script>
