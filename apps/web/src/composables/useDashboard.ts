/**
 * Dashboard composable - Manages dashboard data and state
 */

import { ref, computed } from 'vue'
import { dashboardService } from '@/services/dashboard.service'
import type { StatCard } from '@/types/ui'
import type { RecentProject, Deadline } from '@/types/projects'

export function useDashboard() {
  // State
  const statCards = ref<StatCard[]>([])
  const recentProjects = ref<RecentProject[]>([])
  const upcomingDeadlines = ref<Deadline[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasData = computed(() => 
    statCards.value.length > 0 || 
    recentProjects.value.length > 0 || 
    upcomingDeadlines.value.length > 0
  )

  const activeProjectsCount = computed(() => 
    statCards.value.find(card => card.title === 'Active projects')?.value || '0'
  )

  // Methods
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
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load dashboard data'
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    statCards,
    recentProjects,
    upcomingDeadlines,
    isLoading,
    error,
    
    // Computed
    hasData,
    activeProjectsCount,

    // Methods
    fetchDashboardData
  }
}