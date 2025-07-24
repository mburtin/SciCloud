/**
 * Dashboard service - Handles dashboard data operations
 * Currently using mock data, will be replaced with Supabase calls
 */

import { mockStatCards, mockRecentProjects, mockUpcomingDeadlines } from '@/mocks/dashboard.mock'
import type { StatCard } from '@/types/ui'
import type { RecentProject, Deadline } from '@/types/projects'

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStatCards(): Promise<StatCard[]> {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase.rpc('get_dashboard_stats')
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate API delay
    return mockStatCards
  }

  /**
   * Get recent projects
   */
  async getRecentProjects(): Promise<RecentProject[]> {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('projects')
    //   .select('*')
    //   .order('updated_at', { ascending: false })
    //   .limit(5)
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockRecentProjects
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(): Promise<Deadline[]> {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('tasks')
    //   .select('*')
    //   .not('due_date', 'is', null)
    //   .order('due_date', { ascending: true })
    //   .limit(10)
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockUpcomingDeadlines
  }
}

export const dashboardService = new DashboardService()