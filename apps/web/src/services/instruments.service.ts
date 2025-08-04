/**
 * Instruments service - Handles instrument data operations
 */

import { supabase } from '@/lib/supabase'
import type { Instrument, InstrumentInsert, InstrumentUpdate, InstrumentStatus } from '@/types/supabase'

export class InstrumentsService {
  /**
   * Get all instruments
   */
  async getInstruments(): Promise<Instrument[]> {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching instruments:', error)
        throw new Error(`Failed to fetch instruments: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in getInstruments:', error)
      throw error
    }
  }

  /**
   * Get instrument by ID
   */
  async getInstrumentById(id: string): Promise<Instrument | null> {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Instrument not found
        }
        console.error('Error fetching instrument:', error)
        throw new Error(`Failed to fetch instrument: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Unexpected error in getInstrumentById:', error)
      return null
    }
  }

  /**
   * Get instrument by serial number
   */
  async getInstrumentBySerialNumber(serialNumber: string): Promise<Instrument | null> {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .eq('serial_number', serialNumber)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Instrument not found
        }
        console.error('Error fetching instrument by serial number:', error)
        throw new Error(`Failed to fetch instrument: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Unexpected error in getInstrumentBySerialNumber:', error)
      return null
    }
  }

  /**
   * Create new instrument
   */
  async createInstrument(instrumentData: InstrumentInsert): Promise<Instrument> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User must be authenticated to create instruments')
      }

      // Prepare instrument data for database
      const dbInstrumentData = {
        name: instrumentData.name,
        model: instrumentData.model,
        category: instrumentData.category,
        manufacturer: instrumentData.manufacturer,
        serial_number: instrumentData.serial_number,
        status: instrumentData.status || 'available',
        location: instrumentData.location,
        maintenance_due: instrumentData.maintenance_due || false,
        created_by: user.id,
        updated_by: user.id
      }

      const { data, error } = await supabase
        .from('instruments')
        .insert(dbInstrumentData)
        .select()
        .single()

      if (error) {
        console.error('Error creating instrument:', error)
        throw new Error(`Failed to create instrument: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Unexpected error in createInstrument:', error)
      throw error
    }
  }

  /**
   * Update instrument
   */
  async updateInstrument(id: string, updates: InstrumentUpdate): Promise<Instrument> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User must be authenticated to update instruments')
      }

      // Filter out undefined values and prepare for database
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      )

      const dbUpdates: any = {
        ...filteredUpdates,
        updated_by: user.id
      }

      // Remove fields that shouldn't be updated directly
      delete dbUpdates.id
      delete dbUpdates.created_at
      delete dbUpdates.created_by
      delete dbUpdates.version

      // First check if instrument exists and user has permission
      const { error: checkError } = await supabase
        .from('instruments')
        .select('id')
        .eq('id', id)
        .single()

      if (checkError) {
        console.error('Error checking instrument existence:', checkError)
        if (checkError.code === 'PGRST116') {
          throw new Error('Instrument not found or access denied')
        }
        throw new Error(`Failed to check instrument: ${checkError.message}`)
      }

      const { data, error } = await supabase
        .from('instruments')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating instrument:', error)
        if (error.code === 'PGRST116') {
          throw new Error('Instrument not found or access denied after update')
        }
        throw new Error(`Failed to update instrument: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Unexpected error in updateInstrument:', error)
      throw error
    }
  }

  /**
   * Delete instrument
   */
  async deleteInstrument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('instruments')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting instrument:', error)
        throw new Error(`Failed to delete instrument: ${error.message}`)
      }
    } catch (error) {
      console.error('Unexpected error in deleteInstrument:', error)
      throw error
    }
  }

  /**
   * Update instrument status
   */
  async updateInstrumentStatus(id: string, status: InstrumentStatus): Promise<Instrument> {
    return this.updateInstrument(id, { status })
  }

  /**
   * Update maintenance due status
   */
  async updateMaintenanceDue(id: string, maintenanceDue: boolean): Promise<Instrument> {
    return this.updateInstrument(id, { maintenance_due: maintenanceDue })
  }

  /**
   * Get instruments by status
   */
  async getInstrumentsByStatus(status: InstrumentStatus): Promise<Instrument[]> {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .eq('status', status)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching instruments by status:', error)
        throw new Error(`Failed to fetch instruments by status: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in getInstrumentsByStatus:', error)
      throw error
    }
  }

  /**
   * Get instruments by category
   */
  async getInstrumentsByCategory(category: string): Promise<Instrument[]> {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .eq('category', category)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching instruments by category:', error)
        throw new Error(`Failed to fetch instruments by category: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in getInstrumentsByCategory:', error)
      throw error
    }
  }

  /**
   * Get instruments requiring maintenance
   */
  async getInstrumentsRequiringMaintenance(): Promise<Instrument[]> {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .eq('maintenance_due', true)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching instruments requiring maintenance:', error)
        throw new Error(`Failed to fetch instruments requiring maintenance: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in getInstrumentsRequiringMaintenance:', error)
      throw error
    }
  }

  /**
   * Search instruments by name, model, manufacturer, serial number, or location
   */
  async searchInstruments(query: string): Promise<Instrument[]> {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .or(`name.ilike.%${query}%,model.ilike.%${query}%,manufacturer.ilike.%${query}%,serial_number.ilike.%${query}%,location.ilike.%${query}%`)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error searching instruments:', error)
        throw new Error(`Failed to search instruments: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in searchInstruments:', error)
      throw error
    }
  }

  /**
   * Get available instruments
   */
  async getAvailableInstruments(): Promise<Instrument[]> {
    return this.getInstrumentsByStatus('available')
  }

  /**
   * Get instruments in use
   */
  async getInstrumentsInUse(): Promise<Instrument[]> {
    return this.getInstrumentsByStatus('in-use')
  }

  /**
   * Get instruments in maintenance
   */
  async getInstrumentsInMaintenance(): Promise<Instrument[]> {
    return this.getInstrumentsByStatus('maintenance')
  }

  /**
   * Get broken instruments
   */
  async getBrokenInstruments(): Promise<Instrument[]> {
    return this.getInstrumentsByStatus('broken')
  }
}

export const instrumentsService = new InstrumentsService()