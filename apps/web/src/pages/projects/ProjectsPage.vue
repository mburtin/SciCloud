<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <component :is="pageInfo.icon" class="h-8 w-8 text-primary" />
          <div>
            <h1 class="text-2xl font-semibold text-foreground">
              {{ pageInfo.title }}
            </h1>
            <p class="text-muted-foreground mt-1">
              {{ pageInfo.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-muted-foreground">{{ t('common.messages.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-destructive">{{ error }}</p>
      <button @click="projectsStore.fetchProjects" class="mt-2 text-sm text-primary hover:underline">
        {{ t('common.actions.refresh') }}
      </button>
    </div>

    <!-- Projects Content -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input v-model="searchQuery" :placeholder="t('common.actions.search') + ' ' + t('projects.title').toLowerCase() + '...'" class="w-64 pl-10" />
          </div>
        </div>
        <Button v-if="pageInfo.showCreateButton" @click="handleNewProject">
          <Plus class="h-4 w-4 mr-2" />
          {{ t('projects.createNew') }}
        </Button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-gray-100 p-2 rounded-lg">
              <Folder class="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('common.labels.total') }}
              </p>
              <p class="text-xl font-bold">
                {{ projectStats.total }}
              </p>
            </div>
          </div>
        </Card>
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-green-100 p-2 rounded-lg">
              <div class="w-5 h-5 flex items-center justify-center">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('projects.status.active') }}
              </p>
              <p class="text-xl font-bold">
                {{ projectStats.active }}
              </p>
            </div>
          </div>
        </Card>
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-blue-100 p-2 rounded-lg">
              <div class="w-5 h-5 flex items-center justify-center">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('projects.status.planning') }}
              </p>
              <p class="text-xl font-bold">
                {{ projectStats.planning }}
              </p>
            </div>
          </div>
        </Card>
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-gray-100 p-2 rounded-lg">
              <div class="w-5 h-5 flex items-center justify-center">
                <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('projects.status.completed') }}
              </p>
              <p class="text-xl font-bold">
                {{ projectStats.completed }}
              </p>
            </div>
          </div>
        </Card>
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-yellow-100 p-2 rounded-lg">
              <div class="w-5 h-5 flex items-center justify-center">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('projects.status.onHold') }}
              </p>
              <p class="text-xl font-bold">
                {{ projectStats.paused }}
              </p>
            </div>
          </div>
        </Card>
        <Card class="p-3">
          <div class="flex items-center gap-4">
            <div class="bg-gray-100 p-2 rounded-lg">
              <Archive class="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ t('projects.status.archived') }}
              </p>
              <p class="text-xl font-bold">
                {{ projectStats.archived }}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardContent class="p-0">
          <!-- Show empty state if no filtered projects -->
          <div v-if="filteredProjects.length === 0" class="text-center py-12">
            <component :is="pageInfo.icon" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="font-medium mb-2">{{ pageInfo.emptyTitle }}</h3>
            <p class="text-sm text-muted-foreground mb-4">{{ pageInfo.emptyDescription }}</p>
            <Button v-if="pageInfo.showCreateButton" @click="handleNewProject" class="gap-2">
              <Plus class="h-4 w-4" />
              {{ t('projects.createFirstProject') }}
            </Button>
          </div>
          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t('projects.projectForm.name') }}</TableHead>
                <TableHead>{{ t('common.labels.status') }}</TableHead>
                <TableHead>{{ t('projects.progress') }}</TableHead>
                <TableHead>{{ t('projects.deadline') }}</TableHead>
                <TableHead>{{ t('projects.budget') }}</TableHead>
                <TableHead>{{ t('projects.owner') }}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="project in filteredProjects" :key="project.id" class="cursor-pointer hover:bg-muted/50"
                @click="handleProjectClick(project.id)">
                <TableCell>
                  <div class="flex items-center gap-3">
                    <Star v-if="project.is_favorite" class="h-4 w-4 text-yellow-500 fill-current" />
                    <div>
                      <div class="font-medium">
                        {{ project.name }}
                      </div>
                      <div class="text-sm text-muted-foreground">
                        {{ project.category }}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(project.status)">
                    {{ getStatusLabel(project.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Progress :model-value="project.progress" class="w-24" />
                    <span class="text-xs text-muted-foreground">{{ project.progress }}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Calendar class="h-4 w-4 text-muted-foreground" />
                    <span>{{ project.end_date ? formatDate(project.end_date) : t('common.labels.notSpecified') }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    {{ formatCurrency(project.budget) }}
                  </div>
                </TableCell>
                <TableCell>
                  <span class="text-sm">
                    {{ project.responsible_profile
                      ? `${project.responsible_profile.first_name} ${project.responsible_profile.last_name}`
                      : t('common.labels.unknown')
                    }}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm" @click.stop>
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem @click.stop="handleProjectAction('view', project.id)">
                        {{ t('projects.viewDetails') }}
                      </DropdownMenuItem>
                      <DropdownMenuItem @click.stop="handleProjectAction('favorite', project.id)">
                        {{ project.is_favorite ? t('projects.removeFavorite') : t('projects.addFavorite') }}
                      </DropdownMenuItem>
                      <DropdownMenuItem @click.stop="handleProjectAction('archive', project.id)">
                        {{ project.status === 'archived' ? t('projects.restore') : t('projects.archive') }}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    <!-- New Project Dialog -->
    <Dialog v-model:open="showNewProjectDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ t('projects.createNew') }}</DialogTitle>
          <DialogDescription>
            {{ t('projects.createDescription') }}
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="name">{{ t('projects.projectForm.name') }} *</Label>
            <Input id="name" v-model="newProjectForm.name" :placeholder="t('projects.projectForm.namePlaceholder')"
              :disabled="isCreatingProject" />
          </div>
          <div class="grid gap-2">
            <Label for="category">{{ t('projects.category') }} *</Label>
            <Input id="category" v-model="newProjectForm.category" :placeholder="t('projects.projectForm.categoryPlaceholder')"
              :disabled="isCreatingProject" />
          </div>
          <div class="grid gap-2">
            <Label for="description">{{ t('common.labels.description') }}</Label>
            <Textarea id="description" v-model="newProjectForm.description" :placeholder="t('projects.projectForm.descriptionPlaceholder')"
              :disabled="isCreatingProject" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="startDate">{{ t('projects.projectForm.startDate') }}</Label>
              <Input id="startDate" v-model="newProjectForm.startDate" type="date" :disabled="isCreatingProject" />
            </div>
            <div class="grid gap-2">
              <Label for="endDate">{{ t('projects.projectForm.endDate') }}</Label>
              <Input id="endDate" v-model="newProjectForm.endDate" type="date" :disabled="isCreatingProject" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="priority">{{ t('projects.projectForm.priority') }}</Label>
              <Select v-model="newProjectForm.priority" :disabled="isCreatingProject">
                <SelectTrigger>
                  <SelectValue :placeholder="t('projects.projectForm.priorityPlaceholder')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{{ t('projects.priority.low') }}</SelectItem>
                  <SelectItem value="medium">{{ t('projects.priority.medium') }}</SelectItem>
                  <SelectItem value="high">{{ t('projects.priority.high') }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label for="budget">{{ t('projects.budget') }}</Label>
              <Input id="budget" v-model.number="newProjectForm.budget" type="number" min="0" step="100" placeholder="0"
                :disabled="isCreatingProject" />
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="members">{{ t('projects.projectForm.members') }}</Label>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" class="w-full justify-between">
                  <div class="flex items-center gap-2">
                    <Users class="h-4 w-4" />
                    <span>
                      {{ 
                        newProjectForm.selectedMembers.length === 0 
                          ? t('projects.projectForm.selectMembers')
                          : t('projects.projectForm.membersSelected', { count: newProjectForm.selectedMembers.length })
                      }}
                    </span>
                  </div>
                  <ChevronDown class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-full max-h-[200px] overflow-y-auto">
                <DropdownMenuLabel>{{ t('projects.projectForm.availableUsers') }}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div v-if="isLoadingUsers" class="p-2 text-center text-sm text-muted-foreground">
                  {{ t('common.messages.loading') }}
                </div>
                <div v-else-if="allUsers.length === 0" class="p-2 text-center text-sm text-muted-foreground">
                  {{ t('projects.projectForm.noUsersAvailable') }}
                </div>
                <DropdownMenuCheckboxItem
                  v-for="user in allUsers"
                  :key="user.id"
                  :checked="newProjectForm.selectedMembers.some(m => m.id === user.id)"
                  @click="toggleUserSelection(user)"
                  @select="(event) => event.preventDefault()"
                  class="cursor-pointer"
                >
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <div class="font-medium">{{ user.first_name }} {{ user.last_name }}</div>
                      <div class="text-xs text-muted-foreground">{{ user.email }}</div>
                    </div>
                  </div>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div v-if="newProjectForm.selectedMembers.length > 0" class="text-xs text-muted-foreground">
              {{ t('projects.projectForm.selectedMembersWillBeAdded') }}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showNewProjectDialog = false" :disabled="isCreatingProject">
            {{ t('common.actions.cancel') }}
          </Button>
          <Button @click="handleCreateProject"
            :disabled="isCreatingProject || !newProjectForm.name.trim() || !newProjectForm.category.trim()">
            <Plus v-if="!isCreatingProject" class="h-4 w-4 mr-2" />
            {{ isCreatingProject ? t('projects.creating') : t('projects.create') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useLocaleFormat, useTranslation } from '@/composables/useLocale';
import { formatDate } from '@/lib/format.utils';
import { supabase } from '@/lib/supabase';
import { useProjectsStore } from '@/stores/projects.store';
import { useUserStore } from '@/stores/user.store';
import {
  Archive,
  Calendar,
  ChevronDown,
  Folder,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Users
} from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { User } from '@/types/supabase';

// Reactive state
const router = useRouter();
const route = useRoute();
const searchQuery = ref('');
const { t } = useTranslation();
const { formatCurrency } = useLocaleFormat();

// Use projects store
const projectsStore = useProjectsStore()
const { projects, loading: isLoading, error } = storeToRefs(projectsStore)

// Use user store
const userStore = useUserStore()
const { allUsers, loading: isLoadingUsers } = storeToRefs(userStore)

// Utility functions for status display
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

const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    'active': 'default',
    'planning': 'secondary',
    'completed': 'outline',
    'paused': 'destructive',
    'archived': 'outline'
  }
  return variants[status] || 'default'
}

// Determine current page type based on route
const currentPageType = computed(() => {
  const routeName = route.name as string
  return routeName || 'projects'
})

// Get page information based on current route
const pageInfo = computed(() => {
  switch (currentPageType.value) {
    case 'projects-favorites':
      return {
        title: t('projects.favorites'),
        description: t('projects.favoritesDescription'),
        icon: Star,
        emptyTitle: t('projects.noFavorites'),
        emptyDescription: t('projects.addFavoritesDescription'),
        showCreateButton: false
      }
    case 'projects-archived':
      return {
        title: t('projects.archived'),
        description: t('projects.archivedDescription'),
        icon: Archive,
        emptyTitle: t('projects.noArchived'),
        emptyDescription: t('projects.archivedDescription'),
        showCreateButton: false
      }
    default:
      return {
        title: t('projects.title'),
        description: t('projects.subtitle'),
        icon: Folder,
        emptyTitle: t('projects.noProjects'),
        emptyDescription: t('projects.createFirstProject'),
        showCreateButton: true
      }
  }
})

// Filter projects based on page type and search
const filteredProjects = computed(() => {
  let filtered = projects.value

  // Filter by page type first
  switch (currentPageType.value) {
    case 'projects':
      filtered = filtered.filter(p => p.status !== 'archived')
      break
    case 'projects-favorites':
      filtered = filtered.filter(p => p.is_favorite)
      break
    case 'projects-archived':
      filtered = filtered.filter(p => p.status === 'archived')
      break
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.category.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Statistics for the current page type
const projectStats = computed(() => {
  const total = projects.value.length
  const active = projects.value.filter(p => p.status === 'active').length
  const planning = projects.value.filter(p => p.status === 'planning').length
  const completed = projects.value.filter(p => p.status === 'completed').length
  const paused = projects.value.filter(p => p.status === 'paused').length
  const favorites = projects.value.filter(p => p.is_favorite).length
  const archived = projects.value.filter(p => p.status === 'archived').length

  return { total, active, planning, completed, paused, favorites, archived }
})

// Methods

// New project dialog state
const showNewProjectDialog = ref(false)
const newProjectForm = ref({
  name: '',
  description: '',
  category: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  budget: 0,
  startDate: '',
  endDate: '',
  selectedMembers: [] as User[]
})
const isCreatingProject = ref(false)

const handleNewProject = async () => {
  showNewProjectDialog.value = true
  // Load users when dialog opens if not already loaded
  if (allUsers.value.length === 0) {
    await userStore.getAllUsers()
  }
}

const resetNewProjectForm = () => {
  newProjectForm.value = {
    name: '',
    description: '',
    category: '',
    priority: 'medium',
    budget: 0,
    startDate: '',
    endDate: '',
    selectedMembers: []
  }
}

const handleCreateProject = async () => {
  if (!newProjectForm.value.name.trim() || !newProjectForm.value.category.trim()) {
    return
  }

  try {
    isCreatingProject.value = true

    // Get current user for responsible field
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated')
    }

    const projectData = {
      name: newProjectForm.value.name.trim(),
      description: newProjectForm.value.description.trim() || null,
      category: newProjectForm.value.category.trim(),
      priority: newProjectForm.value.priority,
      budget: newProjectForm.value.budget,
      start_date: newProjectForm.value.startDate || null,
      end_date: newProjectForm.value.endDate || null,
      responsible: user.id,
      created_by: user.id,
      updated_by: user.id
    }

    const newProject = await projectsStore.createProject(projectData)

    if (newProject) {
      // Add selected members to the project
      for (const member of newProjectForm.value.selectedMembers) {
        const success = await projectsStore.addProjectMember(newProject.id, member.id, 'member')
        if (!success) {
          console.error(`Failed to add member ${member.first_name} ${member.last_name} (ID: ${member.id})`)
          // Continue adding other members even if one fails
        } else {
          console.log(`Successfully added member ${member.first_name} ${member.last_name} (ID: ${member.id})`)
        }
      }
      
      showNewProjectDialog.value = false
      resetNewProjectForm()
      // Navigate to the new project
      router.push(`/projects/${newProject.id}/summary`)
    }
  } catch (err) {
    console.error('Failed to create project:', err)
    // TODO: Show error toast/notification
  } finally {
    isCreatingProject.value = false
  }
}

const handleProjectClick = (projectId: string) => {
  router.push(`/projects/${projectId}/summary`);
}

const handleProjectAction = async (action: string, projectId: string) => {
  try {
    if (action === 'favorite') {
      await projectsStore.toggleFavorite(projectId)
    } else if (action === 'archive') {
      await projectsStore.toggleArchive(projectId)
    } else if (action === 'view') {
      handleProjectClick(projectId)
    }
  } catch (err) {
    console.error(`Failed to ${action} project:`, err)
  }
}

// Toggle user selection for project members
const toggleUserSelection = (user: User) => {
  const index = newProjectForm.value.selectedMembers.findIndex(m => m.id === user.id)
  if (index > -1) {
    newProjectForm.value.selectedMembers.splice(index, 1)
  } else {
    newProjectForm.value.selectedMembers.push(user)
  }
}

// Load projects on mount
onMounted(() => {
  projectsStore.fetchProjects()
})
</script>
