<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            Notes
          </h1>
          <p class="text-muted-foreground mt-1">
            Your personal and project notes
          </p>
        </div>
        <Button>
          <Plus class="h-4 w-4 mr-2" />
          Create Note
        </Button>
      </div>
    </div>

    <!-- Notes Content -->
    <div class="border-2 border-dashed border-border rounded-lg p-12 text-center">
      <FileText class="h-12 w-12 mx-auto text-muted-foreground" />
      <h3 class="mt-4 text-lg font-medium text-muted-foreground">
        No notes yet
      </h3>
      <p class="mt-1 text-sm text-muted-foreground">
        Create your first note to get started.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-vue-next';
</script>
