/**
 * Laboratory composable - Manages lab equipment, consumables and animals
 */

import { ref, computed } from 'vue'
import { labService } from '@/services/lab.service'

export function useLab() {
  // State
  const instruments = ref<any[]>([])
  const consumables = ref<any[]>([])
  const animals = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const availableInstruments = computed(() => 
    instruments.value.filter(instrument => instrument.status === 'Available')
  )

  const lowStockConsumables = computed(() => 
    consumables.value.filter(consumable => consumable.stock <= consumable.minStock)
  )

  const activeAnimals = computed(() => 
    animals.value.filter(animal => animal.status === 'active')
  )

  // Methods
  const fetchInstruments = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await labService.getInstruments()
      instruments.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load instruments'
      console.error('Instruments fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchConsumables = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await labService.getConsumables()
      consumables.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load consumables'
      console.error('Consumables fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchAnimals = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await labService.getAnimals()
      animals.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load animals'
      console.error('Animals fetch error:', err)
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
      console.error('Stock update error:', err)
      throw err
    }
  }

  const updateInstrumentStatus = async (id: string, status: string) => {
    try {
      const updatedInstrument = await labService.updateInstrumentStatus(id, status)
      
      const index = instruments.value.findIndex(i => i.id === id)
      if (index !== -1 && updatedInstrument) {
        instruments.value[index] = updatedInstrument
      }
      
      return updatedInstrument
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update instrument status'
      console.error('Instrument status update error:', err)
      throw err
    }
  }

  // Utility functions
  const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      'Available': 'default',
      'In Use': 'secondary', 
      'Maintenance': 'destructive',
      'Calibration': 'outline'
    }
    return variants[status] || 'default'
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
    animals,
    isLoading,
    error,

    // Computed
    availableInstruments,
    lowStockConsumables,
    activeAnimals,

    // Methods
    fetchInstruments,
    fetchConsumables,
    fetchAnimals,
    updateConsumableStock,
    updateInstrumentStatus,

    // Utilities
    getStatusVariant,
    getStockVariant
  }
}