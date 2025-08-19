import { projectsService } from '@/services/projects.service'
import type { Project, ProjectInsert, ProjectMemberRole, ProjectStatus, ProjectUpdate } from '@/types/supabase'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Filters and search
  const searchQuery = ref('')
  const statusFilter = ref<ProjectStatus | 'all'>('all')
  const categoryFilter = ref<string | 'all'>('all')
  const showArchivedOnly = ref(false)
  const showFavoritesOnly = ref(false)

  // Computed
  const filteredProjects = computed(() => {
    let filtered = projects.value

    // Search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter.value)
    }

    // Category filter
    if (categoryFilter.value !== 'all') {
      filtered = filtered.filter(project => project.category === categoryFilter.value)
    }

    // Archive filter
    if (showArchivedOnly.value) {
      filtered = filtered.filter(project => project.status === 'archived')
    } else {
      filtered = filtered.filter(project => project.status !== 'archived')
    }

    // Favorites filter
    if (showFavoritesOnly.value) {
      filtered = filtered.filter(project => project.is_favorite)
    }

    return filtered
  })

  const projectsByStatus = computed(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      active: [],
      planning: [],
      completed: [],
      paused: [],
      archived: []
    }

    filteredProjects.value.forEach(project => {
      if (grouped[project.status]) {
        grouped[project.status].push(project)
      }
    })

    return grouped
  })

  const categories = computed(() => {
    const cats = new Set(projects.value.map(p => p.category))
    return Array.from(cats).sort()
  })

  const stats = computed(() => ({
    total: projects.value.length,
    active: projects.value.filter(p => p.status === 'active').length,
    completed: projects.value.filter(p => p.status === 'completed').length,
    archived: projects.value.filter(p => p.status === 'archived').length,
    favorites: projects.value.filter(p => p.is_favorite && p.status !== 'archived').length
  }))

  // Actions
  async function fetchProjects(force = false) {
    if (loading.value || (isInitialized.value && !force)) {
      return
    }

    try {
      loading.value = true
      error.value = null

      const fetchedProjects = await projectsService.getProjects()
      projects.value = fetchedProjects
      isInitialized.value = true
    } catch {
      error.value = 'Failed to fetch projects'
    } finally {
      loading.value = false
    }
  }

  async function getProjectById(id: string): Promise<Project | null> {
    // Check if project is already in store
    const existingProject = projects.value.find(p => p.id === id)
    if (existingProject) {
      return existingProject
    }

    try {
      const project = await projectsService.getProjectById(id)
      if (project) {
        // Add to store if not exists
        const index = projects.value.findIndex(p => p.id === id)
        if (index === -1) {
          projects.value.push(project)
        }
      }
      return project
    } catch {
      return null
    }
  }

  async function createProject(projectData: ProjectInsert): Promise<Project | null> {
    try {
      loading.value = true
      error.value = null

      const newProject = await projectsService.createProject(projectData)
      projects.value.unshift(newProject) // Add to beginning of array
      return newProject
    } catch {
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id: string, updates: ProjectUpdate): Promise<Project | null> {
    try {
      const updatedProject = await projectsService.updateProject(id, updates)

      // Update in store
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      return updatedProject
    } catch {
      return null
    }
  }

  async function deleteProject(id: string): Promise<boolean> {
    try {
      await projectsService.deleteProject(id)

      // Remove from store
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value.splice(index, 1)
      }

      return true
    } catch {
      return false
    }
  }

  async function toggleFavorite(id: string): Promise<boolean> {
    try {
      const updatedProject = await projectsService.toggleFavorite(id)

      // Update in store
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      return true
    } catch {
      return false
    }
  }

  async function toggleArchive(id: string): Promise<boolean> {
    try {
      const updatedProject = await projectsService.toggleArchive(id)

      // Update in store
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      return true
    } catch {
      return false
    }
  }

  // Project Members Management
  async function addProjectMember(projectId: string, userId: string, role: ProjectMemberRole = 'member'): Promise<boolean> {
    try {
      await projectsService.addProjectMember(projectId, userId, role)

      // Refresh the specific project to get updated members
      await getProjectById(projectId)

      return true
    } catch {
      return false
    }
  }

  async function removeProjectMember(projectId: string, userId: string): Promise<boolean> {
    try {
      await projectsService.removeProjectMember(projectId, userId)

      // Refresh the specific project to get updated members
      await getProjectById(projectId)

      return true
    } catch {
      return false
    }
  }

  async function updateProjectMemberRole(projectId: string, userId: string, role: ProjectMemberRole): Promise<boolean> {
    try {
      await projectsService.updateProjectMemberRole(projectId, userId, role)

      // Refresh the specific project to get updated members
      await getProjectById(projectId)

      return true
    } catch {
      return false
    }
  }

  // Filter and search actions
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setStatusFilter(status: ProjectStatus | 'all') {
    statusFilter.value = status
  }

  function setCategoryFilter(category: string | 'all') {
    categoryFilter.value = category
  }

  function toggleArchivedFilter() {
    showArchivedOnly.value = !showArchivedOnly.value
  }

  function toggleFavoritesFilter() {
    showFavoritesOnly.value = !showFavoritesOnly.value
  }

  function clearFilters() {
    searchQuery.value = ''
    statusFilter.value = 'all'
    categoryFilter.value = 'all'
    showArchivedOnly.value = false
    showFavoritesOnly.value = false
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    projects,
    loading,
    error,
    isInitialized,
    searchQuery,
    statusFilter,
    categoryFilter,
    showArchivedOnly,
    showFavoritesOnly,

    // Computed
    filteredProjects,
    projectsByStatus,
    categories,
    stats,

    // Actions
    fetchProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    toggleFavorite,
    toggleArchive,
    addProjectMember,
    removeProjectMember,
    updateProjectMemberRole,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    toggleArchivedFilter,
    toggleFavoritesFilter,
    clearFilters,
    clearError
  }
})
