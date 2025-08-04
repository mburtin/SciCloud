/**
 * Laboratory composable - Manages lab equipment and consumables
 * Note: Animals are now managed through the dedicated animals store
 */

import { ref, computed } from 'vue'
import { labService } from '@/services/lab.service'
import type { Instrument, Consumable, StockLevel } from '@/types/lab'

export function useLab() {
  // State
  const instruments = ref<Instrument[]>([])
  const consumables = ref<Consumable[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed

  const lowStockConsumables = computed(() => 
    consumables.value.filter(consumable => consumable.stock <= consumable.minStock)
  )

  // Methods

  const fetchConsumables = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await labService.getConsumables()
      consumables.value = data.map(item => ({
        ...item,
        stock: item.quantity, // Assuming `quantity` maps to `stock`
        minStock: 0, // Default value, adjust as needed
        created_by: '', // Default value, adjust as needed
        updated_by: '', // Default value, adjust as needed
        version: 1, // Default value, adjust as needed
        stockLevel: item.stockLevel as StockLevel // Explicitly cast to `StockLevel`
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load consumables'
    } finally {
      isLoading.value = false
    }
  }

  const updateConsumableStock = async (id: string, newStock: number) => {
    try {
      const updatedConsumable = await labService.updateConsumableStock(id, newStock)
      
      const index = consumables.value.findIndex(c => c.id === id)
      if (index !== -1 && updatedConsumable) {
        consumables.value[index] = updatedConsumable
      }
      
      return updatedConsumable
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update stock'
      throw err
    }
  }

  const getStockVariant = (stock: number, minStock: number): 'default' | 'destructive' | 'outline' | 'secondary' => {
    if (stock <= 0) return 'destructive'
    if (stock <= minStock) return 'outline'
    return 'default'
  }

  return {
    // State
    instruments,
    consumables,
    isLoading,
    error,

    lowStockConsumables,

    // Methods
    fetchConsumables,
    updateConsumableStock,

    // Utilities
    getStockVariant
  }
}