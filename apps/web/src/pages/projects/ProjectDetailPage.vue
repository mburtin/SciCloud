<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="outline" size="icon" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-foreground">
            {{ project?.name || t('projects.projectNotFound') }}
          </h1>
          <div class="flex items-center gap-2 mt-1">
            <Badge variant="outline">
              {{ project?.category || t('common.labels.unknown') }}
            </Badge>
            <Badge :variant="getStatusVariant(project?.status || 'active')">
              {{ getStatusLabel(project?.status || 'active') }}
            </Badge>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm">
          <span class="text-muted-foreground">{{ t('projects.progress') }}</span>
          <Progress :model-value="project?.progress || 0" class="w-32 mt-1" />
        </div>
        <span class="text-lg font-semibold">{{ project?.progress || 0 }}%</span>
      </div>
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/composables/useLocale';
import { useProjectsStore } from '@/stores/projects.store';
import type { Project } from '@/types/supabase';
import { ArrowLeft } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { t } = useTranslation();

// Use projects store
const projectsStore = useProjectsStore();
const { projects } = storeToRefs(projectsStore);

const project = computed((): Project | undefined => {
  const projectId = route.params.id as string;
  return projects.value.find(p => p.id === projectId);
});

// Load projects if not already loaded
onMounted(() => {
  if (!projectsStore.isInitialized) {
    projectsStore.fetchProjects();
  }
});

const goBack = () => {
  router.push('/projects');
};

const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    active: 'default',
    completed: 'outline',
    paused: 'destructive',
    planning: 'secondary',
  };
  return variants[status] || 'default';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'active': t('projects.status.active'),
    'planning': t('projects.status.planning'),
    'completed': t('projects.status.completed'),
    'paused': t('projects.status.onHold'),
    'archived': t('projects.status.archived')
  }
  return labels[status] || status
}
</script>
