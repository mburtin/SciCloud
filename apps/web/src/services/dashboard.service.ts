/**
 * Dashboard service - Handles dashboard data operations
 * Computes dashboard stats client-side from existing project data
 * (no extra Supabase tables, no mocks)
 */

import type { StatCard } from '@/types/ui'
import type { RecentProject, Deadline } from '@/types/projects'
import { projectsService } from '@/services/projects.service'

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStatCards(): Promise<StatCard[]> {
    // Fetch projects and compute stats client-side (no extra tables)
    const projects = await projectsService.getProjects()

    const activeStatuses = new Set(['active', 'planning', 'paused'])
    const activeCount = projects.filter(p => activeStatuses.has(p.status)).length
    const completedCount = projects.filter(p => p.status === 'completed').length

    // Basic approximations for dashboard without historical tables
    const analysesOngoing = projects.filter(p => p.progress > 0 && p.progress < 100).length

    // Team activity cannot be derived without members loaded; use distinct responsible users as proxy
    const uniqueResponsibles = new Set(projects.map(p => p.responsible))
    const activeTeam = uniqueResponsibles.size

    const statCards: StatCard[] = [
      {
        title: 'Active projects',
        value: String(activeCount),
        icon: 'folder-open',
        trendText: `Completed: ${completedCount}`,
        trendIcon: 'check-circle',
        trendClass: 'text-green-500'
      },
      {
        title: 'Ongoing analyses',
        value: String(analysesOngoing),
        icon: 'alert-triangle',
        trendText: 'Based on project progress',
        trendIcon: 'bar-chart',
        trendClass: 'text-blue-500'
      },
      {
        title: 'Active team',
        value: String(activeTeam),
        icon: 'users',
        trendText: 'Distinct responsibles',
        trendIcon: 'user-check',
        trendClass: 'text-muted-foreground'
      },
      {
        title: 'Deadlines',
        value: '0', // No tasks table yet; show 0
        icon: 'clock',
        trendText: 'No task deadlines available',
        trendIcon: 'minus',
        trendClass: 'text-muted-foreground'
      }
    ]

    return statCards
  }

  /**
   * Get recent projects
   */
  async getRecentProjects(): Promise<RecentProject[]> {
    const projects = await projectsService.getProjects()
    // Sort by updated_at desc and take top 3
    const recent = [...projects]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3)

    const toInitials = (name: string) => {
      const trimmed = (name || '').trim()
      if (!trimmed) return 'PR'
      const parts = trimmed.split(/\s+/)
      const a = parts[0]?.[0] ?? 'P'
      const b = parts[1]?.[0] ?? parts[0]?.[1] ?? 'R'
      return (a + b).toUpperCase()
    }

    const mapped: RecentProject[] = recent.map(p => ({
      initials: toInitials(p.name),
      name: p.name,
      category: p.category,
      progress: p.progress ?? 0
    }))
    return mapped
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(): Promise<Deadline[]> {
    // No task/due_date table available yet. Return empty array.
    // When tasks are introduced, compute from client-fetched tasks here.
    return []
  }
}

export const dashboardService = new DashboardService()