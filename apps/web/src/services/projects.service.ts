/**
 * Projects service - Handles project data operations
 */

import { supabase } from '@/lib/supabase'
import type { Project, ProjectInsert, ProjectMemberRole, ProjectUpdate, UserFavoriteProjectInsert } from '@/types/supabase'

// Type for favorite project from Supabase
interface FavoriteProject {
  user_id: string
}

// Type for project member from Supabase
interface ProjectMember {
  user_id: string
  role: string
  user: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

export class ProjectsService {
  /**
   * Get all projects with favorite status for current user
   */
  async getProjects(): Promise<Project[]> {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        user_favorite_projects!project_id(
          user_id
        ),
        responsible_profile:user_profiles!responsible(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`)
    }

    // Transform the data to match our Project interface
    return (data || []).map(project => ({
      ...project,
      members: [], // Will be populated separately if needed
      is_favorite: user ? project.user_favorite_projects?.some((fav: FavoriteProject) => fav.user_id === user.id) || false : false
    }))
  }

  /**
   * Get project by ID with favorite status for current user
   */
  async getProjectById(id: string): Promise<Project | null> {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        user_favorite_projects!project_id(
          user_id
        ),
        responsible_profile:user_profiles!responsible(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Project not found
      }
      throw new Error(`Failed to fetch project: ${error.message}`)
    }

    // Transform the data to match our Project interface
    return {
      ...data,
      members: [], // Will be populated separately if needed
      is_favorite: user ? data.user_favorite_projects?.some((fav: FavoriteProject) => fav.user_id === user.id) || false : false
    }
  }

  /**
   * Create new project
   */
  async createProject(projectData: ProjectInsert): Promise<Project> {
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
      start_date: projectData.start_date,
      end_date: projectData.end_date,
      created_by: user.id,
      updated_by: user.id
    }

    const { data, error } = await supabase
      .from('projects')
      .insert(dbProjectData)
      .select(`
        *,
        responsible_profile:user_profiles!responsible(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    // Add the creator as an owner of the project
    console.log('Adding creator as owner:', { project_id: data.id, user_id: user.id })
    const { error: memberError, data: ownerData } = await supabase
      .from('project_members')
      .insert({
        project_id: data.id,
        user_id: user.id,
        role: 'owner',
        created_by: user.id,
        updated_by: user.id
      })
      .select()

    if (memberError) {
      console.error('Failed to add creator as owner:', memberError)
      console.error('Owner creation error details:', {
        code: memberError.code,
        message: memberError.message,
        details: memberError.details,
        hint: memberError.hint
      })
      // This is critical - if we can't add the creator as owner,
      // they won't be able to manage the project
      throw new Error(`Failed to add creator as project owner: ${memberError.message}`)
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
        console.error('Failed to add responsible user as admin:', responsibleMemberError)
        // Note: We don't throw here as the project was created successfully
        // and the responsible user can still be contacted via the responsible field
      }
    }

    // Transform the data to match our Project interface
    return {
      ...data,
      members: [] // Will be populated when needed
    }
  }

  /**
   * Update project
   */
  async updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to update projects')
    }

    // Filter out undefined values and prepare for database
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    )

    // Map legacy fields to database fields
    const dbUpdates: Partial<ProjectUpdate> & { updated_by: string } = {
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
        responsible_profile:user_profiles!responsible(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        project_members(
          user_id,
          role,
          user:user_profiles(
            id,
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Project not found or access denied after update')
      }
      throw new Error(`Failed to update project: ${error.message}`)
    }

    // Transform the data to match our Project interface
    return {
      ...data,
      members: data.project_members?.map((member: ProjectMember) => ({
        id: member.user.id,
        first_name: member.user.first_name,
        last_name: member.user.last_name,
        avatar_url: member.user.avatar_url,
        email: '', // Will be populated if needed
        role: 'user' // Default role for User type
      })) || []
    }
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`)
    }
  }

  /**
   * Toggle project favorite status for current user
   */
  async toggleFavorite(id: string): Promise<Project> {
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
  }

  /**
   * Add project to current user's favorites
   */
  async addToFavorites(projectId: string): Promise<void> {
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
        throw new Error(`Failed to add to favorites: ${error.message}`)
      }
    }
  }

  /**
   * Remove project from current user's favorites
   */
  async removeFromFavorites(projectId: string): Promise<void> {
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
      throw new Error(`Failed to remove from favorites: ${error.message}`)
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to manage project members')
    }

    console.log('Adding project member:', {
      project_id: projectId,
      user_id: userId,
      role,
      created_by: user.id,
      current_user: user.id
    })

    const { error, data } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role,
        created_by: user.id,
        updated_by: user.id
      })
      .select()

    if (error) {
      console.error('Database error adding project member:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Failed to add project member: ${error.message}`)
    }
  }

  /**
   * Remove member from project
   */
  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to remove project member: ${error.message}`)
    }
  }

  /**
   * Update project member role
   */
  async updateProjectMemberRole(projectId: string, userId: string, role: ProjectMemberRole): Promise<void> {
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
      throw new Error(`Failed to update project member role: ${error.message}`)
    }
  }

  /**
   * Get project members (basic data only)
   */
  async getProjectMembers(projectId: string): Promise<{ user_id: string; role: string }[]> {
    const { data, error } = await supabase
      .from('project_members')
      .select('user_id, role')
      .eq('project_id', projectId)
      .order('role', { ascending: true }) // owners first, then admins, etc.

    if (error) {
      throw new Error(`Failed to fetch project members: ${error.message}`)
    }

    return data || []
  }
}

export const projectsService = new ProjectsService()
