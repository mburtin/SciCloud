export type PageType = 
  | 'dashboard' 
  | 'dashboard-planning' 
  | 'dashboard-deadlines' 
  | 'laboratoire' 
  | 'laboratoire-instruments' 
  | 'laboratoire-consommables' 
  | 'laboratoire-animaux' 
  | 'animal-detail' 
  | 'projets' 
  | 'projects-favorites' 
  | 'projects-archived' 
  | 'project-detail' 
  | 'project-summary' 
  | 'project-documents' 
  | 'project-notebook' 
  | 'profile' 
  | 'profile-user' 
  | 'profile-notifications' 
  | 'profile-security' 
  | 'settings'
  | 'animals'
  | 'instruments'
  | 'consumables'
  | 'empty'
  | 'error-400' 
  | 'error-401' 
  | 'error-403' 
  | 'error-404' 
  | 'error-408' 
  | 'error-500'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role?: 'admin' | 'user' | 'viewer'
  createdAt?: string
  updatedAt?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  members: User[]
  tags?: string[]
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedBy: string
  uploadedAt: string
  projectId: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  projectId: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}