<template>
  <div>
    <div v-if="!isEditable" class="space-y-1">
      <label class="text-sm text-muted-foreground">{{ label }}</label>
      <p v-if="!multiline" class="text-base font-medium text-foreground">
        {{ value || '-' }}
      </p>
      <p v-else class="text-base font-medium text-foreground whitespace-pre-wrap">
        {{ value || '-' }}
      </p>
    </div>
    <div v-else class="space-y-2">
      <label class="text-sm text-muted-foreground">{{ label }}</label>
      <Input v-if="!multiline" :model-value="value" :type="type" :disabled="isDisabled"
        :class="isDisabled ? 'bg-muted cursor-not-allowed' : ''"
        @update:model-value="isDisabled ? undefined : $emit('update', $event)" />
      <Textarea v-else :model-value="value" :disabled="isDisabled"
        :class="isDisabled ? 'bg-muted cursor-not-allowed' : ''"
        @update:model-value="isDisabled ? undefined : $emit('update', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

defineProps<{
  label: string;
  value: string;
  multiline?: boolean;
  type?: 'text' | 'email' | 'tel';
  isEditable?: boolean;
  isDisabled?: boolean;
}>();

const emit = defineEmits(['update']);
</script>
