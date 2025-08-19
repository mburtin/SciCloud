/**
 * Consumables service - Handles consumable data operations
 */

import { supabase } from '@/lib/supabase'
import type { Consumable, ConsumableInsert, ConsumableUpdate, StockLevel } from '@/types/supabase'

export class ConsumablesService {
  /**
   * Get all consumables
   */
  async getConsumables(): Promise<Consumable[]> {
    const { data, error } = await supabase
      .from('consumables')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch consumables: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get consumable by ID
   */
  async getConsumableById(id: string): Promise<Consumable | null> {
    const { data, error } = await supabase
      .from('consumables')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Consumable not found
      }
      throw new Error(`Failed to fetch consumable: ${error.message}`)
    }

    return data
  }

  /**
   * Get consumable by reference
   */
  async getConsumableByReference(reference: string): Promise<Consumable | null> {
    const { data, error } = await supabase
      .from('consumables')
      .select('*')
      .eq('reference', reference)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Consumable not found
      }
      throw new Error(`Failed to fetch consumable by reference: ${error.message}`)
    }

    return data
  }

  /**
   * Create new consumable
   */
  async createConsumable(consumableData: ConsumableInsert): Promise<Consumable> {
    const { data, error } = await supabase
      .from('consumables')
      .insert(consumableData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create consumable: ${error.message}`)
    }

    return data
  }

  /**
   * Update consumable
   */
  async updateConsumable(id: string, updates: ConsumableUpdate): Promise<Consumable> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
      version: undefined // Let the database handle version increment
    }

    const { data, error } = await supabase
      .from('consumables')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update consumable: ${error.message}`)
    }

    return data
  }

  /**
   * Delete consumable
   */
  async deleteConsumable(id: string): Promise<void> {
    const { error } = await supabase
      .from('consumables')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete consumable: ${error.message}`)
    }
  }

  /**
   * Update consumable stock
   */
  async updateConsumableStock(id: string, newStock: number): Promise<Consumable> {
    // Get current consumable to calculate stock level
    const consumable = await this.getConsumableById(id)
    if (!consumable) {
      throw new Error('Consumable not found')
    }

    // Calculate stock level based on min_stock
    let stockLevel: StockLevel = 'normal'
    if (newStock === 0) {
      stockLevel = 'outofstock'
    } else if (newStock <= consumable.min_stock) {
      stockLevel = 'low'
    } else if (newStock > consumable.min_stock * 2) {
      stockLevel = 'high'
    }

    return await this.updateConsumable(id, {
      stock: newStock,
      stock_level: stockLevel
    })
  }

  /**
   * Get consumables with low stock
   */
  async getLowStockConsumables(): Promise<Consumable[]> {
    const { data, error } = await supabase
      .from('consumables')
      .select('*')
      .in('stock_level', ['low', 'outofstock'])
      .order('stock_level', { ascending: false }) // outofstock first, then low

    if (error) {
      throw new Error(`Failed to fetch low stock consumables: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get expired consumables
   */
  async getExpiredConsumables(): Promise<Consumable[]> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('consumables')
      .select('*')
      .lt('expiry_date', today)
      .order('expiry_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch expired consumables: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get consumables expiring soon (within next 30 days)
   */
  async getExpiringSoonConsumables(days: number = 30): Promise<Consumable[]> {
    const today = new Date()
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000))
    const todayStr = today.toISOString().split('T')[0]
    const futureDateStr = futureDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('consumables')
      .select('*')
      .gte('expiry_date', todayStr)
      .lte('expiry_date', futureDateStr)
      .order('expiry_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch expiring consumables: ${error.message}`)
    }

    return data || []
  }

  /**
   * Search consumables
   */
  async searchConsumables(query: string): Promise<Consumable[]> {
    const { data, error } = await supabase
      .from('consumables')
      .select('*')
      .or(`name.ilike.%${query}%,reference.ilike.%${query}%,supplier.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`)
      .order('name')

    if (error) {
      throw new Error(`Failed to search consumables: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get consumables by category
   */
  async getConsumablesByCategory(category: string): Promise<Consumable[]> {
    const { data, error } = await supabase
      .from('consumables')
      .select('*')
      .eq('category', category)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch consumables by category: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get consumables by supplier
   */
  async getConsumablesBySupplier(supplier: string): Promise<Consumable[]> {
    const { data, error } = await supabase
      .from('consumables')
      .select('*')
      .eq('supplier', supplier)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch consumables by supplier: ${error.message}`)
    }

    return data || []
  }
}

export const consumablesService = new ConsumablesService()
