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
    const { data, error } = await supabase
      .from('instruments')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch instruments: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get instrument by ID
   */
  async getInstrumentById(id: string): Promise<Instrument | null> {
    const { data, error } = await supabase
      .from('instruments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Instrument not found
      }
      throw new Error(`Failed to fetch instrument: ${error.message}`)
    }

    return data
  }

  /**
   * Get instrument by serial number
   */
  async getInstrumentBySerialNumber(serialNumber: string): Promise<Instrument | null> {
    const { data, error } = await supabase
      .from('instruments')
      .select('*')
      .eq('serial_number', serialNumber)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Instrument not found
      }
      throw new Error(`Failed to fetch instrument: ${error.message}`)
    }

    return data
  }

  /**
   * Create new instrument
   */
  async createInstrument(instrumentData: InstrumentInsert): Promise<Instrument> {
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
      throw new Error(`Failed to create instrument: ${error.message}`)
    }

    return data
  }

  /**
   * Update instrument
   */
  async updateInstrument(id: string, updates: InstrumentUpdate): Promise<Instrument> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to update instruments')
    }

    // Filter out undefined values and prepare for database
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    )

    const dbUpdates: Partial<InstrumentUpdate> & { updated_by: string } = {
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
      if (error.code === 'PGRST116') {
        throw new Error('Instrument not found or access denied after update')
      }
      throw new Error(`Failed to update instrument: ${error.message}`)
    }

    return data
  }

  /**
   * Delete instrument
   */
  async deleteInstrument(id: string): Promise<void> {
    const { error } = await supabase
      .from('instruments')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete instrument: ${error.message}`)
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
    const { data, error } = await supabase
      .from('instruments')
      .select('*')
      .eq('status', status)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch instruments by status: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get instruments by category
   */
  async getInstrumentsByCategory(category: string): Promise<Instrument[]> {
    const { data, error } = await supabase
      .from('instruments')
      .select('*')
      .eq('category', category)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch instruments by category: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get instruments requiring maintenance
   */
  async getInstrumentsRequiringMaintenance(): Promise<Instrument[]> {
    const { data, error } = await supabase
      .from('instruments')
      .select('*')
      .eq('maintenance_due', true)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch instruments requiring maintenance: ${error.message}`)
    }

    return data || []
  }

  /**
   * Search instruments by name, model, manufacturer, serial number, or location
   */
  async searchInstruments(query: string): Promise<Instrument[]> {
    const { data, error } = await supabase
      .from('instruments')
      .select('*')
      .or(`name.ilike.%${query}%,model.ilike.%${query}%,manufacturer.ilike.%${query}%,serial_number.ilike.%${query}%,location.ilike.%${query}%`)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search instruments: ${error.message}`)
    }

    return data || []
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