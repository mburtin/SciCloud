/**
 * Projects composable - Manages projects data and state
 */

import { ref, computed } from 'vue'
import { projectsService } from '@/services/projects.service'
import type { Project, ProjectStatus } from '@/types/projects'

export function useProjects() {
  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)
  const isLoadingProject = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeProjects = computed(() => 
    projects.value.filter(project => project.status === 'active')
  )

  const completedProjects = computed(() => 
    projects.value.filter(project => project.status === 'completed')
  )

  const favoriteProjects = computed(() => 
    projects.value.filter(project => project.isFavorite && !project.isArchived)
  )

  const archivedProjects = computed(() => 
    projects.value.filter(project => project.isArchived)
  )

  // Filtering
  const getFilteredProjects = (searchQuery: string, filterStatus: string) => {
    let filtered = projects.value

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.responsible.toLowerCase().includes(query)
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus)
    }

    return filtered
  }

  // Methods
  const fetchProjects = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const data = await projectsService.getProjects()
      projects.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load projects'
      console.error('Projects fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchProjectById = async (id: string) => {
    isLoadingProject.value = true
    error.value = null

    try {
      const project = await projectsService.getProjectById(id)
      currentProject.value = project
      return project
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load project'
      console.error('Project fetch error:', err)
      return null
    } finally {
      isLoadingProject.value = false
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProject = await projectsService.createProject(projectData)
      projects.value.unshift(newProject)
      return newProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create project'
      console.error('Project creation error:', err)
      throw err
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectsService.updateProject(id, updates)
      
      // Update in projects list
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      
      // Update current project if it's the same
      if (currentProject.value?.id === id) {
        currentProject.value = updatedProject
      }
      
      return updatedProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update project'
      console.error('Project update error:', err)
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await projectsService.deleteProject(id)
      projects.value = projects.value.filter(p => p.id !== id)
      
      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete project'
      console.error('Project deletion error:', err)
      throw err
    }
  }

  const toggleFavorite = async (id: string) => {
    try {
      const updatedProject = await projectsService.toggleFavorite(id)
      
      // Force reactivity by creating a new array with the updated project
      projects.value = projects.value.map(p => 
        p.id === id ? updatedProject : p
      )
      
      return updatedProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to toggle favorite'
      console.error('Toggle favorite error:', err)
      throw err
    }
  }

  const toggleArchive = async (id: string) => {
    try {
      const updatedProject = await projectsService.toggleArchive(id)
      
      // Force reactivity by creating a new array with the updated project
      projects.value = projects.value.map(p => 
        p.id === id ? updatedProject : p
      )
      
      return updatedProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to toggle archive'
      console.error('Toggle archive error:', err)
      throw err
    }
  }

  // Utility functions
  const getStatusLabel = (status: ProjectStatus) => {
    const labels: Record<ProjectStatus, string> = {
      'active': 'Active',
      'planning': 'Planning',
      'completed': 'Completed',
      'paused': 'Paused',
      'archived': 'Archived'
    }
    return labels[status] || status
  }

  const getStatusVariant = (status: ProjectStatus): 'default' | 'destructive' | 'outline' | 'secondary' => {
    const variants: Record<ProjectStatus, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      'active': 'default',
      'planning': 'secondary',
      'completed': 'outline',
      'paused': 'destructive',
      'archived': 'outline'
    }
    return variants[status] || 'default'
  }

  return {
    // State
    projects,
    currentProject,
    isLoading,
    isLoadingProject,
    error,

    // Computed
    activeProjects,
    completedProjects,
    favoriteProjects,
    archivedProjects,

    // Methods
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    toggleFavorite,
    toggleArchive,
    getFilteredProjects,

    // Utilities
    getStatusLabel,
    getStatusVariant
  }
}