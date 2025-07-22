<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="outline" size="icon" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-foreground">
            {{ project?.name || 'Project not found' }}
          </h1>
          <div class="flex items-center gap-2 mt-1">
            <Badge variant="outline">
              {{ project?.category || 'Unknown' }}
            </Badge>
            <Badge :variant="getStatusVariant(project?.status || 'active')">
              {{ project?.status || 'active' }}
            </Badge>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm">
          <span class="text-muted-foreground">Progress</span>
          <Progress :model-value="project?.progress || 0" class="w-32 mt-1" />
        </div>
        <span class="text-lg font-semibold">{{ project?.progress || 0 }}%</span>
      </div>
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-vue-next';
import { mockProjects, type Project } from '@/mocks/projects.mock';

// Use centralized mock data
const projects = mockProjects;

const route = useRoute();
const router = useRouter();

const project = computed((): Project | undefined => {
  const projectId = route.params.id as string;
  return projects.find(p => p.id === projectId);
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
</script>
