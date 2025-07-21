<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">
      Consumable Details
    </h1>
    <p class="mt-2">
      Details for consumable with ID: {{ $route.params.id }}
    </p>
    <!-- TODO: Fetch and display full consumable details -->
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

// You would typically fetch the consumable data based on the ID
console.log('Consumable ID:', route.params.id);
</script>
