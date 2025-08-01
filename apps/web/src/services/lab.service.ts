/**
 * Laboratory service - Handles lab equipment, consumables and animals data
 * Currently using mock data, will be replaced with Supabase calls
 */

import { mockInstruments } from '@/mocks/instruments.mock'
import { mockConsumables } from '@/mocks/consumables.mock'
import { mockAnimals } from '@/mocks/animals.mock'

export class LabService {
  /**
   * Get all instruments
   */
  async getInstruments() {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('instruments')
    //   .select('*')
    //   .order('name')
    await new Promise(resolve => setTimeout(resolve, 150))
    return mockInstruments
  }

  /**
   * Get all consumables
   */
  async getConsumables() {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('consumables')
    //   .select('*')
    //   .order('name')
    await new Promise(resolve => setTimeout(resolve, 150))
    return mockConsumables
  }

  /**
   * Get all animals
   */
  async getAnimals() {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('animals')
    //   .select('*')
    //   .order('created_at', { ascending: false })
    await new Promise(resolve => setTimeout(resolve, 150))
    return mockAnimals
  }

  /**
   * Update consumable stock
   */
  async updateConsumableStock(id: string, newStock: number) {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('consumables')
    //   .update({ stock: newStock, updated_at: new Date().toISOString() })
    //   .eq('id', id)
    //   .select()
    //   .single()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const consumable = mockConsumables.find(c => c.id === id) as any
    if (consumable) {
      consumable.stock = newStock
    }
    return consumable
  }

  /**
   * Update instrument status
   */
  async updateInstrumentStatus(id: string, status: 'available' | 'in-use' | 'maintenance' | 'broken') {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('instruments')
    //   .update({ status, updated_at: new Date().toISOString() })
    //   .eq('id', id)
    //   .select()
    //   .single()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const instrument = mockInstruments.find(i => i.id === id)
    if (instrument) {
      instrument.status = status
    }
    return instrument
  }
}

export const labService = new LabService()