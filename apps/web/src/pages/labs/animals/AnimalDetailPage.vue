<template>
  <div class="p-4 md:p-6">
    <Card>
      <CardHeader>
        <CardTitle>Animal Details</CardTitle>
        <CardDescription>Viewing details for animal ID: {{ animalId }}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>More details about the animal will be displayed here.</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const route = useRoute();
const animalId = ref('');

onMounted(() => {
  animalId.value = route.params.id as string;
});
</script>
