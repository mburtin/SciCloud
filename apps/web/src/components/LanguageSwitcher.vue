<script setup lang="ts">
import { computed } from 'vue'
import { Languages } from 'lucide-vue-next'
import { useLocale } from '@/composables/useLocale'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  variant?: 'default' | 'outline' | 'ghost' | 'icon'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  showFlag?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'default',
  showText: true,
  showFlag: true
})

const {
  currentLocale,
  availableLocales,
  localeName,
  localeFlag,
  setLocale,
  isLoading,
  t
} = useLocale()

// Computed properties for display
const buttonText = computed(() => {
  if (!props.showText) return ''
  return props.showFlag 
    ? `${localeFlag.value} ${localeName.value}`
    : localeName.value
})

const triggerVariant = computed(() => {
  return props.variant === 'icon' ? 'ghost' : props.variant
})

const triggerSize = computed(() => {
  return props.variant === 'icon' ? 'icon' : props.size
})

// Handle locale change
const handleLocaleChange = async (localeCode: string) => {
  try {
    await setLocale(localeCode as any)
  } catch (error) {
    console.error('Failed to change locale:', error)
  }
}

// Check if locale is currently active
const isActiveLocale = (localeCode: string) => {
  return currentLocale.value === localeCode
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        :variant="triggerVariant"
        :size="triggerSize"
        :disabled="isLoading"
        class="relative"
        :aria-label="t('common.labels.language')"
      >
        <!-- Icon only variant -->
        <template v-if="variant === 'icon'">
          <Languages class="h-4 w-4" />
        </template>
        
        <!-- Text + optional flag variant -->
        <template v-else>
          <Languages class="mr-2 h-4 w-4" />
          <span v-if="showText">
            {{ buttonText }}
          </span>
        </template>
        
        <!-- Loading indicator -->
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center bg-background/80"
        >
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      </Button>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuItem
        v-for="locale in availableLocales"
        :key="locale.code"
        @click="handleLocaleChange(locale.code)"
        :class="{
          'bg-accent text-accent-foreground': isActiveLocale(locale.code)
        }"
        class="cursor-pointer"
      >
        <div class="flex items-center gap-3 w-full">
          <!-- Flag -->
          <span 
            v-if="showFlag" 
            class="text-lg leading-none"
            :aria-hidden="true"
          >
            {{ locale.flag }}
          </span>
          
          <!-- Language name -->
          <span class="flex-1">{{ locale.name }}</span>
          
          <!-- Active indicator -->
          <div
            v-if="isActiveLocale(locale.code)"
            class="h-2 w-2 rounded-full bg-primary"
            :aria-label="t('common.status.active')"
          />
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>