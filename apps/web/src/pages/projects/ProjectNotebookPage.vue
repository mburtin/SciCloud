<template>
  <div>
    <h1 class="text-2xl font-bold">
      {{ t('projects.notebook.title') }}
    </h1>
    <p class="text-muted-foreground">
      {{ t('projects.notebook.description') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/composables/useLocale'

const { t } = useTranslation()
</script>
