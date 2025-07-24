<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            Projects
          </h1>
          <p class="text-muted-foreground mt-1">
            Manage and track all your scientific projects
          </p>
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
        @click="fetchProjects"
        class="mt-2 text-sm text-primary hover:underline"
      >
        Try again
      </button>
    </div>

    <!-- Projects Content -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Input
            v-model="searchQuery" 
            placeholder="Search projects..."
            class="w-64"
          >
            <template #prefix>
              <Search class="h-4 w-4" />
            </template>
          </Input>
          <Select v-model="filterStatus">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Projects
              </SelectItem>
              <SelectItem value="active">
                Active
              </SelectItem>
              <SelectItem value="planning">
                Planning
              </SelectItem>
              <SelectItem value="completed">
                Completed
              </SelectItem>
              <SelectItem value="paused">
                Paused
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button @click="handleNewProject">
          <Plus class="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <Card>
        <CardContent class="p-0">
          <Table>
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
                  <div class="font-medium">
                    {{ project.name }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{ project.category }}
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
                    <span>{{ formatDate(project.deadline) }}</span>
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
                        {{ project.isFavorite ? 'Remove from favorites' : 'Add to favorites' }}
                      </DropdownMenuItem>
                      <DropdownMenuItem @click.stop="handleProjectAction('archive', project.id)">
                        {{ project.isArchived ? 'Restore' : 'Archive' }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Search, 
  Plus, 
  Calendar, 
  MoreHorizontal 
} from 'lucide-vue-next';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjects } from '@/composables/useProjects'

// Reactive state
const router = useRouter();
const searchQuery = ref('');
const filterStatus = ref('all');

// Use projects composable
const {
  isLoading,
  error,
  fetchProjects,
  toggleFavorite,
  toggleArchive,
  getStatusLabel,
  getStatusVariant,
  getFilteredProjects
} = useProjects()

// Filtered projects
const filteredProjects = computed(() => {
  return getFilteredProjects(searchQuery.value, filterStatus.value)
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const handleNewProject = () => {
  // TODO: Implement New Project Dialog
  console.log('Create a new project')
}

const handleProjectClick = (projectId: string) => {
  router.push(`/projects/${projectId}/summary`);
}

const handleProjectAction = async (action: string, projectId: string) => {
  try {
    if (action === 'favorite') {
      await toggleFavorite(projectId)
    } else if (action === 'archive') {
      await toggleArchive(projectId)
    } else if (action === 'view') {
      handleProjectClick(projectId)
    }
  } catch (err) {
    console.error(`Failed to ${action} project:`, err)
  }
}

// Load projects on mount
onMounted(() => {
  fetchProjects()
})
</script>
