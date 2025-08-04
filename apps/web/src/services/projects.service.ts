/**
 * Projects service - Handles project data operations
 */

import { supabase } from '@/lib/supabase'
import type { Project, ProjectInsert, ProjectUpdate, ProjectMemberRole, UserFavoriteProjectInsert } from '@/types/supabase'

export class ProjectsService {
  /**
   * Get all projects with favorite status for current user
   */
  async getProjects(): Promise<Project[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          user_favorite_projects!project_id(
            user_id
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        throw new Error(`Failed to fetch projects: ${error.message}`)
      }

      // Transform the data to match our Project interface
      return (data || []).map(project => ({
        ...project,
        members: [], // Will be populated separately if needed
        is_favorite: user ? project.user_favorite_projects?.some((fav: any) => fav.user_id === user.id) || false : false
      }))
    } catch (error) {
      console.error('Unexpected error in getProjects:', error)
      throw error
    }
  }

  /**
   * Get project by ID with favorite status for current user
   */
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          user_favorite_projects!project_id(
            user_id
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Project not found
        }
        console.error('Error fetching project:', error)
        throw new Error(`Failed to fetch project: ${error.message}`)
      }

      // Transform the data to match our Project interface
      return {
        ...data,
        members: [], // Will be populated separately if needed
        is_favorite: user ? data.user_favorite_projects?.some((fav: any) => fav.user_id === user.id) || false : false
      }
    } catch (error) {
      console.error('Unexpected error in getProjectById:', error)
      return null
    }
  }

  /**
   * Create new project
   */
  async createProject(projectData: ProjectInsert): Promise<Project> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User must be authenticated to create projects')
      }

      // Prepare project data for database
      // If no responsible is provided, use the creator as responsible
      const dbProjectData = {
        name: projectData.name,
        description: projectData.description,
        category: projectData.category,
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        progress: projectData.progress || 0,
        responsible: projectData.responsible || user.id,
        tags: projectData.tags || [],
        budget: projectData.budget || 0,
        created_by: user.id,
        updated_by: user.id
      }

      const { data, error } = await supabase
        .from('projects')
        .insert(dbProjectData)
        .select(`
          *,
          responsible_profile:profiles!responsible(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('Error creating project:', error)
        throw new Error(`Failed to create project: ${error.message}`)
      }

      // Add the creator as an owner of the project
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: data.id,
          user_id: user.id,
          role: 'owner',
          created_by: user.id,
          updated_by: user.id
        })

      if (memberError) {
        console.error('Error adding creator as project member:', memberError)
        // Note: We don't throw here as the project was created successfully
        // The user might still be able to access it as the creator
      }

      // If responsible person is different from creator, add them as admin
      if (data.responsible !== user.id) {
        const { error: responsibleMemberError } = await supabase
          .from('project_members')
          .insert({
            project_id: data.id,
            user_id: data.responsible,
            role: 'admin',
            created_by: user.id,
            updated_by: user.id
          })

        if (responsibleMemberError) {
          console.error('Error adding responsible person as project member:', responsibleMemberError)
          // Note: We don't throw here as the project was created successfully
        }
      }

      // Transform the data to match our Project interface
      return {
        ...data,
        members: [] // Will be populated when needed
      }
    } catch (error) {
      console.error('Unexpected error in createProject:', error)
      throw error
    }
  }

  /**
   * Update project
   */
  async updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User must be authenticated to update projects')
      }

      // Filter out undefined values and prepare for database
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      )

      // Map legacy fields to database fields
      const dbUpdates: any = {
        ...filteredUpdates,
        updated_by: user.id
      }

      // Handle legacy field mapping
      if ('isArchived' in filteredUpdates) {
        // Convert legacy isArchived to status
        dbUpdates.status = filteredUpdates.isArchived ? 'archived' : 'active'
        delete dbUpdates.isArchived
      }

      // Remove fields that shouldn't be updated directly
      delete dbUpdates.members
      delete dbUpdates.id
      delete dbUpdates.created_at
      delete dbUpdates.created_by
      delete dbUpdates.version

      // First check if project exists and user has permission
      const { error: checkError } = await supabase
        .from('projects')
        .select('id, status')
        .eq('id', id)
        .single()

      if (checkError) {
        console.error('Error checking project existence:', checkError)
        if (checkError.code === 'PGRST116') {
          throw new Error('Project not found or access denied')
        }
        throw new Error(`Failed to check project: ${checkError.message}`)
      }

      const { data, error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          responsible_profile:profiles!responsible(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          project_members(
            user_id,
            role,
            user:profiles(
              id,
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .single()

      if (error) {
        console.error('Error updating project:', error)
        if (error.code === 'PGRST116') {
          throw new Error('Project not found or access denied after update')
        }
        throw new Error(`Failed to update project: ${error.message}`)
      }

      // Transform the data to match our Project interface
      return {
        ...data,
        members: data.project_members?.map((member: any) => ({
          id: member.user.id,
          first_name: member.user.first_name,
          last_name: member.user.last_name,
          avatar_url: member.user.avatar_url,
          email: '', // Will be populated if needed
          role: 'user' // Default role for User type
        })) || []
      }
    } catch (error) {
      console.error('Unexpected error in updateProject:', error)
      throw error
    }
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting project:', error)
        throw new Error(`Failed to delete project: ${error.message}`)
      }
    } catch (error) {
      console.error('Unexpected error in deleteProject:', error)
      throw error
    }
  }

  /**
   * Toggle project favorite status for current user
   */
  async toggleFavorite(id: string): Promise<Project> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User must be authenticated to manage favorites')
      }

      const project = await this.getProjectById(id)
      if (!project) throw new Error('Project not found')

      if (project.is_favorite) {
        // Remove from favorites
        await this.removeFromFavorites(id)
      } else {
        // Add to favorites
        await this.addToFavorites(id)
      }

      // Return updated project
      return this.getProjectById(id) as Promise<Project>
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }

  /**
   * Add project to current user's favorites
   */
  async addToFavorites(projectId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User must be authenticated to add favorites')
      }

      const favoriteData: UserFavoriteProjectInsert = {
        user_id: user.id,
        project_id: projectId
      }

      const { error } = await supabase
        .from('user_favorite_projects')
        .insert(favoriteData)

      if (error) {
        // Ignore unique constraint violations (already favorited)
        if (error.code !== '23505') {
          console.error('Error adding to favorites:', error)
          throw new Error(`Failed to add to favorites: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Unexpected error in addToFavorites:', error)
      throw error
    }
  }

  /**
   * Remove project from current user's favorites
   */
  async removeFromFavorites(projectId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User must be authenticated to remove favorites')
      }

      const { error } = await supabase
        .from('user_favorite_projects')
        .delete()
        .eq('user_id', user.id)
        .eq('project_id', projectId)

      if (error) {
        console.error('Error removing from favorites:', error)
        throw new Error(`Failed to remove from favorites: ${error.message}`)
      }
    } catch (error) {
      console.error('Unexpected error in removeFromFavorites:', error)
      throw error
    }
  }

  /**
   * Toggle project archive status
   */
  async toggleArchive(id: string): Promise<Project> {
    const project = await this.getProjectById(id)
    if (!project) throw new Error('Project not found')
    
    return this.updateProject(id, { 
      status: project.status === 'archived' ? 'active' : 'archived' 
    })
  }

  /**
   * Add member to project
   */
  async addProjectMember(projectId: string, userId: string, role: ProjectMemberRole = 'member'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User must be authenticated to manage project members')
      }

      const { error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role,
          created_by: user.id,
          updated_by: user.id
        })

      if (error) {
        console.error('Error adding project member:', error)
        throw new Error(`Failed to add project member: ${error.message}`)
      }
    } catch (error) {
      console.error('Unexpected error in addProjectMember:', error)
      throw error
    }
  }

  /**
   * Remove member from project
   */
  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error removing project member:', error)
        throw new Error(`Failed to remove project member: ${error.message}`)
      }
    } catch (error) {
      console.error('Unexpected error in removeProjectMember:', error)
      throw error
    }
  }

  /**
   * Update project member role
   */
  async updateProjectMemberRole(projectId: string, userId: string, role: ProjectMemberRole): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User must be authenticated to manage project members')
      }

      const { error } = await supabase
        .from('project_members')
        .update({
          role,
          updated_by: user.id
        })
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating project member role:', error)
        throw new Error(`Failed to update project member role: ${error.message}`)
      }
    } catch (error) {
      console.error('Unexpected error in updateProjectMemberRole:', error)
      throw error
    }
  }
}

export const projectsService = new ProjectsService()