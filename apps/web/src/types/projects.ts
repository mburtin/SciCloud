/**
 * Project management types
 */

import type { UUID, Timestamp, Priority, DatabaseEntity } from './base'
import type { User } from './user'
import { Documents } from './documents'

// Project-specific enums
export type ProjectStatus = 'active' | 'planning' | 'completed' | 'paused' | 'archived'
export type ProjectMemberRole = 'owner' | 'admin' | 'member' | 'viewer'
export type TaskStatus = 'todo' | 'in-progress' | 'done'

// Project entity
export interface Project extends DatabaseEntity {
  id: string
  name: string
  description?: string
  category: string
  status: ProjectStatus
  priority: Priority
  progress: number
  responsible: UUID // User ID of the project owner or manager
  created_by: UUID
  tags?: string[]
  // Relations (optional for populated queries)
  members?: ProjectMember[]
  documents?: Documents[]
  tasks?: Task[]
  deadline: string
  budget: number
  isFavorite: boolean
  isArchived: boolean
}

// Project member entity
export interface ProjectMember extends DatabaseEntity {
  project_id: UUID
  user_id: UUID
  role: ProjectMemberRole
  joined_at: Timestamp
  // Relations
  user?: User
  project?: Project
}

// Task entity
export interface Task extends DatabaseEntity {
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  assigned_to?: UUID
  due_date?: Timestamp
  project_id: UUID
  // Relations
  assignee?: User
  project?: Project
}

// Dashboard and UI-specific types
export interface RecentProject {
  initials: string
  name: string
  category: string
  progress: number
}

export interface Deadline {
  task: string
  time: string
  status: string
  variant: 'destructive' | 'secondary' | 'outline' | 'default'
}