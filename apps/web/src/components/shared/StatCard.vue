<template>
  <Card>
    <CardContent class="flex items-center gap-4 p-4">
      <div class="p-3 rounded-lg bg-primary/10 text-primary">
        <component :is="icon" class="h-6 w-6" />
      </div>
      <div>
        <p class="text-sm text-muted-foreground">
          {{ label }}
        </p>
        <p class="text-xl font-bold">
          {{ value }}
        </p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card';
import type { FunctionalComponent, HTMLAttributes, VNodeProps } from 'vue';

defineProps<{
  icon: FunctionalComponent<HTMLAttributes & VNodeProps>;
  label: string;
  value: number | string;
}>();
</script>
