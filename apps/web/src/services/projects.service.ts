/**
 * Projects service - Handles project data operations
 * Currently using mock data, will be replaced with Supabase calls
 */

import { mockProjects } from '@/mocks/projects.mock'
import type { Project } from '@/types/projects'

export class ProjectsService {
  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('projects')
    //   .select(`
    //     *,
    //     members(*, user:users(*)),
    //     tasks(*),
    //     documents(*)
    //   `)
    await new Promise(resolve => setTimeout(resolve, 200)) // Simulate API delay
    return mockProjects
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('projects')
    //   .select(`
    //     *,
    //     members(*, user:users(*)),
    //     tasks(*),
    //     documents(*)
    //   `)
    //   .eq('id', id)
    //   .single()
    await new Promise(resolve => setTimeout(resolve, 150))
    return mockProjects.find(project => project.id === id) || null
  }

  /**
   * Create new project
   */
  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('projects')
    //   .insert(projectData)
    //   .select()
    //   .single()
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return newProject
  }

  /**
   * Update project
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('projects')
    //   .update({ ...updates, updated_at: new Date().toISOString() })
    //   .eq('id', id)
    //   .select()
    //   .single()
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const projectIndex = mockProjects.findIndex(p => p.id === id)
    if (projectIndex === -1) throw new Error('Project not found')
    
    const updatedProject = { 
      ...mockProjects[projectIndex], 
      ...updates, 
      updated_at: new Date().toISOString() 
    }
    
    // Update the mock data in place
    mockProjects[projectIndex] = updatedProject
    
    return updatedProject
  }

  /**
   * Delete project
   */
  async deleteProject(): Promise<void> {
    // TODO: Replace with Supabase call
    // const { error } = await supabase
    //   .from('projects')
    //   .delete()
    //   .eq('id', id)
    await new Promise(resolve => setTimeout(resolve, 150))
  }

  /**
   * Toggle project favorite status
   */
  async toggleFavorite(id: string): Promise<Project> {
    const project = await this.getProjectById(id)
    if (!project) throw new Error('Project not found')
    
    return this.updateProject(id, { isFavorite: !project.isFavorite })
  }

  /**
   * Toggle project archive status
   */
  async toggleArchive(id: string): Promise<Project> {
    const project = await this.getProjectById(id)
    if (!project) throw new Error('Project not found')
    
    return this.updateProject(id, { isArchived: !project.isArchived })
  }
}

export const projectsService = new ProjectsService()