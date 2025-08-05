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
      <p class="text-muted-foreground">Loading projects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-destructive">{{ error }}</p>
      <button 
        @click="projectsStore.fetchProjects"
        class="mt-2 text-sm text-primary hover:underline"
      >
        Try again
      </button>
    </div>

    <!-- Projects Content -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery" 
              placeholder="Search projects..."
              class="w-64 pl-10"
            />
          </div>
        </div>
        <Button v-if="pageInfo.showCreateButton" @click="handleNewProject">
          <Plus class="h-4 w-4 mr-2" />
          New Project
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
                Total
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
                Active
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
                Planning
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
                Completed
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
                Paused
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
                Archived
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
              Create your first project
            </Button>
          </div>
          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="project in filteredProjects"
                :key="project.id"
                class="cursor-pointer hover:bg-muted/50"
                @click="handleProjectClick(project.id)"
              >
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
                    <span>{{ formatDate((project as any).deadline || project.created_at) }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(project.budget) }}
                  </div>
                </TableCell>
                <TableCell>
                  <span class="text-sm">{{ project.responsible }}</span>
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
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem @click.stop="handleProjectAction('favorite', project.id)">
                        {{ project.is_favorite ? 'Remove from favorites' : 'Add to favorites' }}
                      </DropdownMenuItem>
                      <DropdownMenuItem @click.stop="handleProjectAction('archive', project.id)">
                        {{ project.status === 'archived' ? 'Restore' : 'Archive' }}
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
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project to start organizing your work.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="name">Project Name *</Label>
            <Input
              id="name"
              v-model="newProjectForm.name"
              placeholder="Enter project name"
              :disabled="isCreatingProject"
            />
          </div>
          <div class="grid gap-2">
            <Label for="category">Category *</Label>
            <Input
              id="category"
              v-model="newProjectForm.category"
              placeholder="e.g., Research, Development, Analysis"
              :disabled="isCreatingProject"
            />
          </div>
          <div class="grid gap-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="newProjectForm.description"
              placeholder="Optional project description"
              :disabled="isCreatingProject"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="priority">Priority</Label>
              <Select v-model="newProjectForm.priority" :disabled="isCreatingProject">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label for="budget">Budget ($)</Label>
              <Input
                id="budget"
                v-model.number="newProjectForm.budget"
                type="number"
                min="0"
                step="100"
                placeholder="0"
                :disabled="isCreatingProject"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            @click="showNewProjectDialog = false"
            :disabled="isCreatingProject"
          >
            Cancel
          </Button>
          <Button 
            @click="handleCreateProject"
            :disabled="isCreatingProject || !newProjectForm.name.trim() || !newProjectForm.category.trim()"
          >
            <Plus v-if="!isCreatingProject" class="h-4 w-4 mr-2" />
            {{ isCreatingProject ? 'Creating...' : 'Create Project' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Search, 
  Plus, 
  Calendar, 
  MoreHorizontal,
  Star,
  Archive,
  Folder
} from 'lucide-vue-next';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjectsStore } from '@/stores/projects.store'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'

// Reactive state
const router = useRouter();
const route = useRoute();
const searchQuery = ref('');

// Use projects store
const projectsStore = useProjectsStore()
const { projects, loading: isLoading, error } = storeToRefs(projectsStore)

// Utility functions for status display
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'active': 'Active',
    'planning': 'Planning',
    'completed': 'Completed',
    'paused': 'Paused',
    'archived': 'Archived'
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
        title: 'Favorite Projects',
        description: 'Your projects marked as favorites',
        icon: Star,
        emptyTitle: 'No favorite projects',
        emptyDescription: 'Add projects to your favorites by clicking the star',
        showCreateButton: false
      }
    case 'projects-archived':
      return {
        title: 'Archived Projects', 
        description: 'Completed or archived projects',
        icon: Archive,
        emptyTitle: 'No archived projects',
        emptyDescription: 'Archived projects will appear here',
        showCreateButton: false
      }
    default:
      return {
        title: 'Projects',
        description: 'Manage and track all your scientific projects',
        icon: Folder,
        emptyTitle: 'No active projects',
        emptyDescription: 'Create your first project to get started',
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
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// New project dialog state
const showNewProjectDialog = ref(false)
const newProjectForm = ref({
  name: '',
  description: '',
  category: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  budget: 0
})
const isCreatingProject = ref(false)

const handleNewProject = () => {
  showNewProjectDialog.value = true
}

const resetNewProjectForm = () => {
  newProjectForm.value = {
    name: '',
    description: '',
    category: '',
    priority: 'medium',
    budget: 0
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
      responsible: user.id,
      created_by: user.id,
      updated_by: user.id
    }

    const newProject = await projectsStore.createProject(projectData)
    
    if (newProject) {
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

// Load projects on mount
onMounted(() => {
  projectsStore.fetchProjects()
})
</script>
