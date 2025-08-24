<template>
  <div>
    <div v-if="!isEditable" class="space-y-1">
      <label class="text-sm text-muted-foreground">{{ label }}</label>
      <p v-if="type === 'date'" class="text-base font-medium text-foreground">
        {{ formatDisplayValue() }}
      </p>
      <p v-else-if="type === 'currency'" class="text-base font-medium text-foreground">
        {{ formatDisplayValue() }}
      </p>
      <p v-else-if="type === 'textarea'" class="text-base font-medium text-foreground whitespace-pre-wrap">
        {{ value || '-' }}
      </p>
      <p v-else class="text-base font-medium text-foreground">
        {{ value || '-' }}
      </p>
    </div>
    <div v-else class="space-y-2">
      <label class="text-sm text-muted-foreground">{{ label }}</label>
      <Input v-if="type === 'date'" 
        :model-value="value" 
        type="date" 
        :disabled="isDisabled"
        :class="isDisabled ? 'bg-muted cursor-not-allowed' : ''"
        @update:model-value="isDisabled ? undefined : $emit('update', $event)" />
      <Input v-else-if="type === 'number' || type === 'currency'" 
        :model-value="value" 
        type="number" 
        :step="type === 'currency' ? '0.01' : '1'"
        :min="type === 'currency' ? '0' : undefined"
        :disabled="isDisabled"
        :class="isDisabled ? 'bg-muted cursor-not-allowed' : ''"
        @update:model-value="isDisabled ? undefined : $emit('update', $event)" />
      <Textarea v-else-if="type === 'textarea'" 
        :model-value="value" 
        :disabled="isDisabled"
        :class="isDisabled ? 'bg-muted cursor-not-allowed' : ''"
        @update:model-value="isDisabled ? undefined : $emit('update', $event)" />
      <Input v-else 
        :model-value="value" 
        :type="type" 
        :disabled="isDisabled"
        :class="isDisabled ? 'bg-muted cursor-not-allowed' : ''"
        @update:model-value="isDisabled ? undefined : $emit('update', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const props = defineProps<{
  label: string;
  value: string | number;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'currency' | 'textarea';
  isEditable?: boolean;
  isDisabled?: boolean;
}>();

const emit = defineEmits(['update']);

const formatDisplayValue = (): string => {
  if (!props.value) return '-';

  if (props.type === 'date') {
    try {
      return format(new Date(props.value), 'MMM dd, yyyy');
    } catch {
      return props.value.toString();
    }
  }

  if (props.type === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(Number(props.value));
  }

  return props.value.toString();
};
</script>