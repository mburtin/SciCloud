/**
 * Calendar service - Handles calendar event operations with Supabase
 * Following SciCloud architecture patterns and S.O.L.I.D. principles
 */

import { supabase } from '@/lib/supabase'
import type { SchedulerEvent, EventCategory } from '@/types/scheduler'

// Database interface matching the user_calendar table
export interface CalendarEventDB {
  id: string
  title: string
  description?: string | null
  event_date: string // YYYY-MM-DD format
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  all_day: boolean
  category: EventCategory
  color?: string | null
  location?: string | null
  attendees?: string[] | null
  user_id: string
  created_at: string
  updated_at: string
  version: number
}

// Insert interface for creating events
export interface CalendarEventInsert {
  title: string
  description?: string
  event_date: string
  start_time: string
  end_time: string
  all_day?: boolean
  category: EventCategory
  color?: string
  location?: string
  attendees?: string[]
}

// Update interface for modifying events
export interface CalendarEventUpdate {
  title?: string
  description?: string
  event_date?: string
  start_time?: string
  end_time?: string
  all_day?: boolean
  category?: EventCategory
  color?: string
  location?: string
  attendees?: string[]
}

// Query options for filtering events
export interface CalendarQueryOptions {
  startDate?: string
  endDate?: string
  category?: EventCategory
  limit?: number
  offset?: number
}

export class CalendarService {
  /**
   * Get events for the current user within a date range
   * Optimized for calendar view queries (day/week)
   */
  async getEvents(options: CalendarQueryOptions = {}): Promise<SchedulerEvent[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let query = supabase
      .from('user_calendar')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true })

    // Apply date range filter for performance
    if (options.startDate) {
      query = query.gte('event_date', options.startDate)
    }
    if (options.endDate) {
      query = query.lte('event_date', options.endDate)
    }
    
    // Apply category filter
    if (options.category) {
      query = query.eq('category', options.category)
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
      if (options.offset) {
        query = query.range(options.offset, options.offset + options.limit - 1)
      }
    }

    const { data, error } = await query

    if (error) throw error
    if (!data) return []

    // Transform database format to frontend format
    return data.map(this.transformDBToFrontend)
  }

  /**
   * Get events for a specific date (optimized for day view)
   */
  async getEventsByDate(date: string): Promise<SchedulerEvent[]> {
    return this.getEvents({ startDate: date, endDate: date })
  }

  /**
   * Get events for a week range (optimized for week view)
   */
  async getEventsByWeek(startDate: string, endDate: string): Promise<SchedulerEvent[]> {
    return this.getEvents({ startDate, endDate })
  }

  /**
   * Get a single event by ID
   */
  async getEvent(id: string): Promise<SchedulerEvent | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_calendar')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }

    return this.transformDBToFrontend(data)
  }

  /**
   * Create a new calendar event
   */
  async createEvent(eventData: CalendarEventInsert): Promise<SchedulerEvent> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Validate time order for non-all-day events
    if (!eventData.all_day && eventData.start_time >= eventData.end_time) {
      throw new Error('Start time must be before end time')
    }

    const insertData = {
      ...eventData,
      user_id: user.id,
      all_day: eventData.all_day || false
    }

    const { data, error } = await supabase
      .from('user_calendar')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error
    return this.transformDBToFrontend(data)
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(id: string, updates: CalendarEventUpdate): Promise<SchedulerEvent> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Validate time order if times are being updated
    if (!updates.all_day && updates.start_time && updates.end_time && 
        updates.start_time >= updates.end_time) {
      throw new Error('Start time must be before end time')
    }

    const { data, error } = await supabase
      .from('user_calendar')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return this.transformDBToFrontend(data)
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('user_calendar')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  /**
   * Get events by category for filtering
   */
  async getEventsByCategory(category: EventCategory, limit?: number): Promise<SchedulerEvent[]> {
    return this.getEvents({ category, limit })
  }

  /**
   * Get upcoming events (next 7 days)
   */
  async getUpcomingEvents(limit: number = 10): Promise<SchedulerEvent[]> {
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
    
    return this.getEvents({ 
      startDate: today, 
      endDate: nextWeek, 
      limit 
    })
  }

  /**
   * Search events by title or description
   */
  async searchEvents(query: string, options: CalendarQueryOptions = {}): Promise<SchedulerEvent[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let dbQuery = supabase
      .from('user_calendar')
      .select('*')
      .eq('user_id', user.id)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true })

    // Apply additional filters
    if (options.startDate) {
      dbQuery = dbQuery.gte('event_date', options.startDate)
    }
    if (options.endDate) {
      dbQuery = dbQuery.lte('event_date', options.endDate)
    }
    if (options.category) {
      dbQuery = dbQuery.eq('category', options.category)
    }
    if (options.limit) {
      dbQuery = dbQuery.limit(options.limit)
    }

    const { data, error } = await dbQuery

    if (error) throw error
    if (!data) return []

    return data.map(this.transformDBToFrontend)
  }

  /**
   * Transform database format to frontend SchedulerEvent format
   */
  private transformDBToFrontend(dbEvent: CalendarEventDB): SchedulerEvent {
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description || undefined,
      startTime: dbEvent.start_time,
      endTime: dbEvent.end_time,
      date: dbEvent.event_date,
      category: dbEvent.category,
      color: dbEvent.color || undefined,
      allDay: dbEvent.all_day,
      location: dbEvent.location || undefined,
      attendees: dbEvent.attendees || undefined
    }
  }

  /**
   * Transform frontend format to database insert format
   */
  private transformFrontendToDB(event: Omit<SchedulerEvent, 'id'>): CalendarEventInsert {
    return {
      title: event.title,
      description: event.description,
      event_date: event.date,
      start_time: event.startTime,
      end_time: event.endTime,
      category: event.category,
      color: event.color,
      all_day: event.allDay,
      location: event.location,
      attendees: event.attendees
    }
  }
}

// Export singleton instance following SciCloud patterns
export const calendarService = new CalendarService()
export default calendarService