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
    try {
      const { data, error } = await supabase
        .from('consumables')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching consumables:', error)
        throw new Error(`Failed to fetch consumables: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in getConsumables:', error)
      throw error
    }
  }

  /**
   * Get consumable by ID
   */
  async getConsumableById(id: string): Promise<Consumable | null> {
    try {
      const { data, error } = await supabase
        .from('consumables')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Consumable not found
        }
        console.error('Error fetching consumable:', error)
        throw new Error(`Failed to fetch consumable: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Unexpected error in getConsumableById:', error)
      throw error
    }
  }

  /**
   * Get consumable by reference
   */
  async getConsumableByReference(reference: string): Promise<Consumable | null> {
    try {
      const { data, error } = await supabase
        .from('consumables')
        .select('*')
        .eq('reference', reference)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Consumable not found
        }
        console.error('Error fetching consumable by reference:', error)
        throw new Error(`Failed to fetch consumable by reference: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Unexpected error in getConsumableByReference:', error)
      throw error
    }
  }

  /**
   * Create new consumable
   */
  async createConsumable(consumableData: ConsumableInsert): Promise<Consumable> {
    try {
      const { data, error } = await supabase
        .from('consumables')
        .insert(consumableData)
        .select()
        .single()

      if (error) {
        console.error('Error creating consumable:', error)
        throw new Error(`Failed to create consumable: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Unexpected error in createConsumable:', error)
      throw error
    }
  }

  /**
   * Update consumable
   */
  async updateConsumable(id: string, updates: ConsumableUpdate): Promise<Consumable> {
    try {
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
        console.error('Error updating consumable:', error)
        throw new Error(`Failed to update consumable: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Unexpected error in updateConsumable:', error)
      throw error
    }
  }

  /**
   * Delete consumable
   */
  async deleteConsumable(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('consumables')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting consumable:', error)
        throw new Error(`Failed to delete consumable: ${error.message}`)
      }
    } catch (error) {
      console.error('Unexpected error in deleteConsumable:', error)
      throw error
    }
  }

  /**
   * Update consumable stock
   */
  async updateConsumableStock(id: string, newStock: number): Promise<Consumable> {
    try {
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
    } catch (error) {
      console.error('Unexpected error in updateConsumableStock:', error)
      throw error
    }
  }

  /**
   * Get consumables with low stock
   */
  async getLowStockConsumables(): Promise<Consumable[]> {
    try {
      const { data, error } = await supabase
        .from('consumables')
        .select('*')
        .in('stock_level', ['low', 'outofstock'])
        .order('stock_level', { ascending: false }) // outofstock first, then low

      if (error) {
        console.error('Error fetching low stock consumables:', error)
        throw new Error(`Failed to fetch low stock consumables: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in getLowStockConsumables:', error)
      throw error
    }
  }

  /**
   * Get expired consumables
   */
  async getExpiredConsumables(): Promise<Consumable[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('consumables')
        .select('*')
        .lt('expiry_date', today)
        .order('expiry_date', { ascending: true })

      if (error) {
        console.error('Error fetching expired consumables:', error)
        throw new Error(`Failed to fetch expired consumables: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in getExpiredConsumables:', error)
      throw error
    }
  }

  /**
   * Get consumables expiring soon (within next 30 days)
   */
  async getExpiringSoonConsumables(days: number = 30): Promise<Consumable[]> {
    try {
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
        console.error('Error fetching expiring consumables:', error)
        throw new Error(`Failed to fetch expiring consumables: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in getExpiringSoonConsumables:', error)
      throw error
    }
  }

  /**
   * Search consumables
   */
  async searchConsumables(query: string): Promise<Consumable[]> {
    try {
      const { data, error } = await supabase
        .from('consumables')
        .select('*')
        .or(`name.ilike.%${query}%,reference.ilike.%${query}%,supplier.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`)
        .order('name')

      if (error) {
        console.error('Error searching consumables:', error)
        throw new Error(`Failed to search consumables: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in searchConsumables:', error)
      throw error
    }
  }

  /**
   * Get consumables by category
   */
  async getConsumablesByCategory(category: string): Promise<Consumable[]> {
    try {
      const { data, error } = await supabase
        .from('consumables')
        .select('*')
        .eq('category', category)
        .order('name')

      if (error) {
        console.error('Error fetching consumables by category:', error)
        throw new Error(`Failed to fetch consumables by category: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in getConsumablesByCategory:', error)
      throw error
    }
  }

  /**
   * Get consumables by supplier
   */
  async getConsumablesBySupplier(supplier: string): Promise<Consumable[]> {
    try {
      const { data, error } = await supabase
        .from('consumables')
        .select('*')
        .eq('supplier', supplier)
        .order('name')

      if (error) {
        console.error('Error fetching consumables by supplier:', error)
        throw new Error(`Failed to fetch consumables by supplier: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error in getConsumablesBySupplier:', error)
      throw error
    }
  }
}

export const consumablesService = new ConsumablesService()