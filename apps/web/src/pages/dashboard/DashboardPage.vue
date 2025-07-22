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

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  FolderOpen, Calendar
} from 'lucide-vue-next'
import { mockStatCards, mockRecentProjects, mockUpcomingDeadlines } from '@/mocks/dashboard.mock'
import type { Deadline } from '@/types/projects'

// Dashboard data
const statCards = ref(mockStatCards)
const recentProjects = ref(mockRecentProjects)
const upcomingDeadlines = ref<Deadline[]>(mockUpcomingDeadlines)

</script>
