/**
 * Project management UI types
 * Core Project types are now in supabase.ts
 */

import type { UUID, Timestamp, Priority, AuditableRecord } from './base'
import type { User, Project } from './supabase'

// Task status (kept separate from core types)
export type TaskStatus = 'todo' | 'in-progress' | 'done'

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