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

    <!-- Projects Content -->
    <div class="space-y-4">
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
import { ref, computed } from 'vue';
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
import { mockProjects } from '@/mocks/projects.mock'

// Reactive state
const router = useRouter();
const searchQuery = ref('');
const filterStatus = ref('all');

// Projects data
const projects = ref(mockProjects)

// Filtered projects
const filteredProjects = computed(() => {
  let filtered = projects.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.responsible.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(project => project.status === filterStatus.value)
  }

  return filtered
})

// Methods
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'active': 'Active',
    'planning': 'Planning',
    'completed': 'Completed',
    'paused': 'Paused'
  }
  return labels[status] || status
}

const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    'active': 'default',
    'planning': 'secondary',
    'completed': 'outline',
    'paused': 'destructive'
  }
  return variants[status] || 'default'
}

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

const handleProjectAction = (action: string, projectId: string) => {
  // TODO: Implement project actions (favorite, archive, etc.)
  console.log(`Action: ${action} on project ${projectId}`)
  if (action === 'favorite') {
    const project = projects.value.find(p => p.id === projectId);
    if (project) project.isFavorite = !project.isFavorite;
  } else if (action === 'archive') {
    const project = projects.value.find(p => p.id === projectId);
    if (project) project.isArchived = !project.isArchived;
  }
}
</script>
