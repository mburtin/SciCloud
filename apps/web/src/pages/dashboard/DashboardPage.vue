<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            Dashboard
          </h1>
          <p class="text-muted-foreground mt-1">
            Overview of your laboratory activity
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-muted-foreground">Loading dashboard data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-destructive">{{ error }}</p>
      <button @click="fetchDashboardData" class="mt-2 text-sm text-primary hover:underline">
        Try again
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- Stat Cards -->
      <div class="grid layout-standard-grid layout-section-gap">
        <Card class="flex flex-col gap-2 h-40" v-for="stat in statCards" :key="stat.title">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium">
              {{ stat.title }}
            </CardTitle>
            <component :is="stat.icon" class="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent class="flex-1 flex flex-col items-center justify-center gap-1 pt-0">
            <div class="text-3xl font-bold text-center">
              {{ stat.value }}
            </div>
          </CardContent>
          <CardFooter class="justify-start pt-0 !px-0">
            <p class="text-xs text-muted-foreground flex items-center gap-1">
              <component :is="stat.trendIcon" class="h-4 w-4" :class="stat.trendClass" />
              {{ stat.trendText }}
            </p>
          </CardFooter>
        </Card>
      </div>

      <!-- Main Content -->
      <div class="grid layout-content-grid layout-section-gap">
        <!-- Recent Projects -->
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <FolderOpen class="h-5 w-5" />
              Recent projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-6">
              <div v-for="project in recentProjects" :key="project.name" class="flex items-center gap-4">
                <Avatar class="h-10 w-10">
                  <AvatarFallback>{{ project.initials }}</AvatarFallback>
                </Avatar>
                <div class="flex-1">
                  <p class="font-medium">
                    {{ project.name }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ project.category }}
                  </p>
                </div>
                <div class="w-32 text-right">
                  <Progress :model-value="project.progress" class="h-2" />
                  <span class="text-xs text-muted-foreground">{{ project.progress }}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Upcoming Deadlines -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Calendar class="h-5 w-5" />
              Upcoming deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="deadline in upcomingDeadlines" :key="deadline.task" class="flex items-start justify-between">
                <div>
                  <p class="font-medium">
                    {{ deadline.task }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ deadline.time }}
                  </p>
                </div>
                <Badge :variant="deadline.variant">
                  {{ deadline.status }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import { Progress } from '@/components/ui/progress'
import { dashboardService } from '@/services/dashboard.service'
import {
  Calendar,
  FolderOpen
} from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

// Local state
import type { Deadline, RecentProject } from '@/types/projects'
import type { StatCard } from '@/types/ui'

const statCards = ref<StatCard[]>([])
const recentProjects = ref<RecentProject[]>([])
const upcomingDeadlines = ref<Deadline[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Fetch method
const fetchDashboardData = async () => {
  if (isLoading.value) return
  isLoading.value = true
  error.value = null
  try {
    const [statsData, projectsData, deadlinesData] = await Promise.all([
      dashboardService.getStatCards(),
      dashboardService.getRecentProjects(),
      dashboardService.getUpcomingDeadlines()
    ])
    statCards.value = statsData
    recentProjects.value = projectsData
    upcomingDeadlines.value = deadlinesData
  } catch (e) {
    error.value = 'Failed to fetch dashboard data'
  } finally {
    isLoading.value = false
  }
}

// Load dashboard data on mount
onMounted(() => {
  fetchDashboardData()
})
</script>
