<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>{{ t('projects.summary.generalInformation') }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                {{ t('projects.summary.startDate') }}
              </p>
              <p class="flex items-center gap-2">
                <Calendar class="h-4 w-4" /> 
                {{ project?.start_date ? formatDate(project.start_date) : t('common.labels.notSpecified') }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                {{ t('projects.summary.endDate') }}
              </p>
              <p class="flex items-center gap-2">
                <Calendar class="h-4 w-4" /> 
                {{ project?.end_date ? formatDate(project.end_date) : t('common.labels.notSpecified') }}
              </p>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">
              {{ t('projects.summary.funding') }}
            </p>
            <p>{{ formatBudget(project?.budget || 0) }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">
              {{ t('projects.summary.projectSummary') }}
            </p>
            <p>{{ project?.description || t('projects.summary.noDescription') }}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{{ t('projects.summary.projectTeam') }}</CardTitle>
          <CardDescription>{{ t('projects.summary.leadersAndCollaborators') }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-for="member in team" :key="member.name" class="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{{ member.initials }}</AvatarFallback>
            </Avatar>
            <div>
              <p class="font-semibold">
                {{ member.name }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ member.role }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/composables/useLocale';
import { useProjectsStore } from '@/stores/projects.store';
import type { Project } from '@/types/supabase';
import { format } from 'date-fns';
import { Calendar } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const { t } = useTranslation();
const route = useRoute();

// Use projects store
const projectsStore = useProjectsStore();
const { projects } = storeToRefs(projectsStore);

// Get current project from route params
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

// Utility functions
const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString; // Fallback if date parsing fails
  }
};

const formatBudget = (budget: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(budget);
};

// Keep existing team mock data for now
const team = ref([
  { name: 'Dr. Marie Dubois', role: 'Principal Investigator', initials: 'MD' },
  { name: 'Prof. Jean Martin', role: 'Co-investigator', initials: 'JM' },
  { name: 'Alice Chen', role: 'PhD Student', initials: 'AC' },
]);
</script>
