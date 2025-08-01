/**
 * Project management types
 */

import type { UUID, Timestamp, Priority, AuditableRecord } from './base'
import type { User } from './supabase'
import { Documents } from './documents'

// Project-specific enums
export type ProjectStatus = 'active' | 'planning' | 'completed' | 'paused' | 'archived'
export type ProjectMemberRole = 'owner' | 'admin' | 'member' | 'viewer'
export type TaskStatus = 'todo' | 'in-progress' | 'done'

// Project entity
export interface Project extends AuditableRecord {
  id: UUID
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
  members?: User[]
  budget: number
  isArchived: boolean
}

// Task entity
export interface Task extends AuditableRecord {
  id: UUID
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