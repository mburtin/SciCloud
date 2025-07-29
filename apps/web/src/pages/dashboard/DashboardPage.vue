<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-bold">
        Dashboard
      </h1>
      <p class="text-muted-foreground">
        Overview of your laboratory activity
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-muted-foreground">Loading dashboard data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-destructive">{{ error }}</p>
      <button 
        @click="fetchDashboardData"
        class="mt-2 text-sm text-primary hover:underline"
      >
        Try again
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- Stat Cards -->
      <div class="grid layout-standard-grid layout-section-gap">
        <Card v-for="stat in statCards" :key="stat.title">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium">
              {{ stat.title }}
            </CardTitle>
            <component :is="stat.icon" class="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">
              {{ stat.value }}
            </div>
            <p class="text-xs text-muted-foreground flex items-center gap-1">
              <component :is="stat.trendIcon" class="h-4 w-4" :class="stat.trendClass" />
              {{ stat.trendText }}
            </p>
          </CardContent>
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
import { onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  FolderOpen, Calendar
} from 'lucide-vue-next'
import { useDashboard } from '@/composables/useDashboard'

// Use dashboard composable
const {
  statCards,
  recentProjects,
  upcomingDeadlines,
  isLoading,
  error,
  fetchDashboardData
} = useDashboard()

// Load dashboard data on mount
onMounted(() => {
  fetchDashboardData()
})
</script>