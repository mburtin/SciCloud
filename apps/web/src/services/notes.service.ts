/**
 * Notes service - Handles notes data operations with Supabase
 */

import { supabase } from '@/lib/supabase'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  user_id: string
  project_id?: string | null
  created_at: string
  updated_at: string
}

export interface NoteInsert {
  title: string
  content: string
  tags?: string[]
  project_id?: string | null
}

export interface NoteUpdate {
  title?: string
  content?: string
  tags?: string[]
  project_id?: string | null
}

export class NotesService {
  /**
   * Get all notes for the current user
   */
  async getNotes(): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get notes for a specific project
   */
  async getProjectNotes(projectId: string): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get personal notes (not associated with any project)
   */
  async getPersonalNotes(): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .is('project_id', null)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Create a new note
   */
  async createNote(noteData: NoteInsert): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...noteData,
        user_id: user.id,
        tags: noteData.tags || []
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update an existing note
   */
  async updateNote(id: string, noteData: NoteUpdate): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .update(noteData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  /**
   * Search notes by title or content
   */
  async searchNotes(query: string): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get notes by tags
   */
  async getNotesByTags(tags: string[]): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .overlaps('tags', tags)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// Export singleton instance
export const notesService = new NotesService()
