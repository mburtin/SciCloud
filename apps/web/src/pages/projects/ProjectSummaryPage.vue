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
          <div v-if="loadingMembers" class="flex items-center justify-center py-4">
            <div class="text-sm text-muted-foreground">
              {{ t('common.loading') }}...
            </div>
          </div>
          <div v-else-if="team.length === 0" class="flex items-center justify-center py-4">
            <div class="text-sm text-muted-foreground">
              {{ t('projects.summary.noMembers') }}
            </div>
          </div>
          <div v-else v-for="member in team" :key="member.name" class="flex items-center gap-4">
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
import { computed, onMounted, ref, watch } from 'vue';
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
onMounted(async () => {
  if (!projectsStore.isInitialized) {
    await projectsStore.fetchProjects();
  }
  // Fetch team members for current project
  await fetchTeamMembers();
});

// Watch for project changes to refetch members
watch(project, async (newProject) => {
  if (newProject?.id) {
    await fetchTeamMembers();
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

// Team members state
const teamMembers = ref([])
const loadingMembers = ref(false)

// Transform members data for UI display
const team = computed(() => {
  return teamMembers.value.map(member => {
    const firstName = member.user?.first_name || ''
    const lastName = member.user?.last_name || ''
    const name = `${firstName} ${lastName}`.trim() || 'Unknown User'
    
    // Generate initials from name
    const initials = firstName && lastName 
      ? `${firstName.charAt(0)}${lastName.charAt(0)}` 
      : name.charAt(0).toUpperCase()
    
    // Map database roles to display roles
    const roleMap = {
      'owner': 'Principal Investigator',
      'admin': 'Co-investigator',  
      'member': 'Team Member',
      'viewer': 'Observer'
    }
    
    return {
      name,
      role: roleMap[member.role] || member.role,
      initials: initials.toUpperCase()
    }
  })
})

// Fetch team members when project changes
async function fetchTeamMembers() {
  if (!project.value?.id) return
  
  try {
    loadingMembers.value = true
    const members = await projectsStore.getProjectMembers(project.value.id)
    teamMembers.value = members
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    teamMembers.value = []
  } finally {
    loadingMembers.value = false
  }
}
</script>
