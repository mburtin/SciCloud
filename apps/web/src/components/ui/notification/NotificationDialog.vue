<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader class="text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <CheckCircle v-if="variant === 'success'" class="h-8 w-8 text-green-500" />
          <XCircle v-else-if="variant === 'error'" class="h-8 w-8 text-red-500" />
          <AlertTriangle v-else-if="variant === 'warning'" class="h-8 w-8 text-yellow-500" />
          <Info v-else class="h-8 w-8 text-blue-500" />
        </div>
        <DialogTitle :class="titleClasses">
          {{ title }}
        </DialogTitle>
        <DialogDescription class="mt-2 text-sm text-muted-foreground">
          {{ message }}
        </DialogDescription>
      </DialogHeader>
      <div class="flex justify-center gap-3 mt-6">
        <Button @click="$emit('close')" :variant="buttonVariant" class="px-8">
          OK
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-vue-next'

interface Props {
  open: boolean
  title: string
  message: string
  variant?: 'success' | 'error' | 'warning' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info'
})

const emit = defineEmits<{
  close: []
}>()

const titleClasses = computed(() => ({
  'text-green-700': props.variant === 'success',
  'text-red-700': props.variant === 'error',
  'text-yellow-700': props.variant === 'warning',
  'text-blue-700': props.variant === 'info'
}))

const buttonVariant = computed(() => {
  switch (props.variant) {
    case 'success': return 'default'
    case 'error': return 'destructive'
    case 'warning': return 'outline'
    default: return 'default'
  }
})
</script>