<template>
  <div class="space-y-6">
    <!-- Project Header with Edit Button -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">{{ project?.name || 'Project Summary' }}</h1>
        <p class="text-muted-foreground">{{ t('projects.summary.generalInformation') }} & {{ t('projects.summary.projectTeam') }}</p>
      </div>
      <div class="flex gap-2">
        <Button v-if="!isGlobalEditing" @click="startGlobalEditing" variant="outline" size="sm">
          <Pencil class="h-4 w-4 mr-2" />
          {{ t('common.actions.edit') }}
        </Button>
        <template v-else>
          <Button @click="saveAllChanges" :disabled="isSavingGlobal" size="sm">
            <Check class="h-4 w-4 mr-2" />
            {{ isSavingGlobal ? t('common.status.saving') : t('common.actions.save') }}
          </Button>
          <Button @click="cancelGlobalEditing" variant="outline" size="sm">
            <X class="h-4 w-4 mr-2" />
            {{ t('common.actions.cancel') }}
          </Button>
        </template>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>{{ t('projects.summary.generalInformation') }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProjectField 
              :label="t('projects.summary.startDate')"
              :value="isGlobalEditing ? (editedProject.start_date || '') : (project?.start_date || '')" 
              :is-editable="isGlobalEditing"
              type="date"
              @update="editedProject.start_date = $event" />
            <ProjectField 
              :label="t('projects.summary.endDate')"
              :value="isGlobalEditing ? (editedProject.end_date || '') : (project?.end_date || '')" 
              :is-editable="isGlobalEditing"
              type="date"
              @update="editedProject.end_date = $event" />
          </div>
          <ProjectField 
            :label="t('projects.summary.funding')"
            :value="isGlobalEditing ? (editedProject.budget || 0) : (project?.budget || 0)" 
            :is-editable="isGlobalEditing"
            type="currency"
            @update="editedProject.budget = Number($event)" />
          <ProjectField 
            :label="t('projects.summary.projectSummary')"
            :value="isGlobalEditing ? (editedProject.description || '') : (project?.description || '')" 
            :is-editable="isGlobalEditing"
            type="textarea"
            @update="editedProject.description = $event" />
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
          <div v-else>
            <div v-for="member in team" :key="member.name" class="flex items-center gap-4 justify-between">
              <div class="flex items-center gap-4">
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
              <div v-if="isGlobalEditing && canEditTeam" class="flex gap-2">
                <Button @click="removeMember(member)" variant="ghost" size="sm" class="text-destructive hover:text-destructive">
                  <Trash2 class="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div v-if="isGlobalEditing && canEditTeam" class="mt-4 pt-4 border-t">
              <Button @click="showAddMemberDialog = true" variant="outline" size="sm" class="w-full">
                <Plus class="h-4 w-4 mr-2" />
                {{ t('projects.members.addMember') }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Add Member Dialog -->
  <AddMemberDialog 
    :open="showAddMemberDialog" 
    @update:open="showAddMemberDialog = $event"
    :project-id="project?.id || ''"
    :existing-member-ids="existingMemberIds"
    @member-added="handleAddMember"
  />
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AddMemberDialog from '@/components/projects/AddMemberDialog.vue';
import ProjectField from '@/components/shared/ProjectField.vue';
import { useTranslation } from '@/composables/useLocale';
import { useAuthStore } from '@/stores/auth.store';
import { useProjectsStore } from '@/stores/projects.store';
import type { Project, ProjectMemberRole, ProjectUpdate } from '@/types/supabase';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const { t } = useTranslation();
const route = useRoute();
const authStore = useAuthStore();

// Use projects store
const projectsStore = useProjectsStore();
const { projects } = storeToRefs(projectsStore);

// Get current project from route params
const project = computed((): Project | undefined => {
  const projectId = route.params.id as string;
  return projects.value.find(p => p.id === projectId);
});

// Global Edit state
const isGlobalEditing = ref(false);
const isSavingGlobal = ref(false);
const editedProject = ref<Partial<ProjectUpdate>>({});
const showAddMemberDialog = ref(false);

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

// Utility functions are now handled by ProjectField component

// Team members state
const teamMembers = ref<Array<{
  user_id: string;
  role: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
  };
}>>([])
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
    const roleMap: Record<string, string> = {
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

// Global Edit functions
const startGlobalEditing = () => {
  if (!project.value) return;

  editedProject.value = {
    start_date: project.value.start_date,
    end_date: project.value.end_date,
    budget: project.value.budget,
    description: project.value.description
  };
  isGlobalEditing.value = true;
};

const cancelGlobalEditing = () => {
  isGlobalEditing.value = false;
  editedProject.value = {};
  showAddMemberDialog.value = false;
};

const saveAllChanges = async () => {
  if (!project.value || !editedProject.value) return;

  try {
    isSavingGlobal.value = true;

    const result = await projectsStore.updateProject(project.value.id, editedProject.value);

    if (!result) {
      console.error('Failed to update project');
      return;
    }

    // Refresh team members to get latest data
    await fetchTeamMembers();
    
    // If operation succeeded
    isGlobalEditing.value = false;
    editedProject.value = {};
    showAddMemberDialog.value = false;

  } catch (error) {
    console.error('Error saving changes:', error);
  } finally {
    isSavingGlobal.value = false;
  }
};

const removeMember = async (member: { name: string; role: string; initials: string }) => {
  if (!project.value?.id) return;
  
  // Find the original member data to get user_id
  const originalMember = teamMembers.value.find(tm => 
    tm.user?.first_name === member.name.split(' ')[0] && 
    tm.user?.last_name === member.name.split(' ')[1]
  );
  
  if (!originalMember) return;
  
  try {
    const success = await projectsStore.removeProjectMember(project.value.id, originalMember.user_id);
    if (success) {
      await fetchTeamMembers();
    }
  } catch (error) {
    console.error('Error removing member:', error);
  }
};

const handleAddMember = async (data: { userId: string; role: ProjectMemberRole }) => {
  if (!project.value?.id) return;
  
  try {
    const success = await projectsStore.addProjectMember(project.value.id, data.userId, data.role);
    if (success) {
      await fetchTeamMembers();
      showAddMemberDialog.value = false;
    }
  } catch (error) {
    console.error('Error adding member:', error);
  }
};

// Get existing member IDs for the dialog
const existingMemberIds = computed(() => {
  return teamMembers.value.map(member => member.user_id);
});

// Permission checks - only owners and admins can edit team members
const currentUserMembership = computed(() => {
  if (!authStore.user?.id) return null;
  return teamMembers.value.find(member => member.user_id === authStore.user?.id);
});

const canEditTeam = computed(() => {
  const membership = currentUserMembership.value;
  return membership && (membership.role === 'owner' || membership.role === 'admin');
});
</script>
