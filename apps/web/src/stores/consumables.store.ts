import { consumablesService } from '@/services/consumables.service'
import type { Consumable, ConsumableInsert, ConsumableUpdate, StockLevel } from '@/types/supabase'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useConsumablesStore = defineStore('consumables', () => {
  // State
  const consumables = ref<Consumable[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Filters and search
  const searchQuery = ref('')
  const stockLevelFilter = ref<StockLevel | 'all'>('all')
  const categoryFilter = ref<string | 'all'>('all')
  const supplierFilter = ref<string | 'all'>('all')
  const locationFilter = ref<string | 'all'>('all')

  // Computed
  const filteredConsumables = computed(() => {
    let filtered = consumables.value

    // Search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(consumable =>
        consumable.name.toLowerCase().includes(query) ||
        consumable.reference.toLowerCase().includes(query) ||
        consumable.supplier.toLowerCase().includes(query) ||
        consumable.category.toLowerCase().includes(query) ||
        consumable.location.toLowerCase().includes(query) ||
        consumable.unit.toLowerCase().includes(query)
      )
    }

    // Stock level filter
    if (stockLevelFilter.value !== 'all') {
      filtered = filtered.filter(consumable => consumable.stock_level === stockLevelFilter.value)
    }

    // Category filter
    if (categoryFilter.value !== 'all') {
      filtered = filtered.filter(consumable => consumable.category === categoryFilter.value)
    }

    // Supplier filter
    if (supplierFilter.value !== 'all') {
      filtered = filtered.filter(consumable => consumable.supplier === supplierFilter.value)
    }

    // Location filter
    if (locationFilter.value !== 'all') {
      filtered = filtered.filter(consumable => consumable.location === locationFilter.value)
    }

    return filtered
  })

  const consumablesByStockLevel = computed(() => {
    const grouped: Record<StockLevel, Consumable[]> = {
      high: [],
      normal: [],
      low: [],
      outofstock: []
    }

    filteredConsumables.value.forEach(consumable => {
      if (grouped[consumable.stock_level]) {
        grouped[consumable.stock_level].push(consumable)
      }
    })

    return grouped
  })

  const categories = computed(() => {
    const categorySet = new Set(consumables.value.map(c => c.category))
    return Array.from(categorySet).sort()
  })

  const suppliers = computed(() => {
    const supplierSet = new Set(consumables.value.map(c => c.supplier))
    return Array.from(supplierSet).sort()
  })

  const locations = computed(() => {
    const locationSet = new Set(consumables.value.map(c => c.location))
    return Array.from(locationSet).sort()
  })

  const units = computed(() => {
    const unitSet = new Set(consumables.value.map(c => c.unit))
    return Array.from(unitSet).sort()
  })

  const lowStockConsumables = computed(() =>
    consumables.value.filter(consumable => consumable.stock_level === 'low')
  )

  const outOfStockConsumables = computed(() =>
    consumables.value.filter(consumable => consumable.stock_level === 'outofstock')
  )

  const highStockConsumables = computed(() =>
    consumables.value.filter(consumable => consumable.stock_level === 'high')
  )

  const normalStockConsumables = computed(() =>
    consumables.value.filter(consumable => consumable.stock_level === 'normal')
  )

  const expiredConsumables = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return consumables.value.filter(consumable =>
      consumable.expiry_date !== '9999-12-31' && consumable.expiry_date < today
    )
  })

  const expiringSoonConsumables = computed(() => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    const todayStr = today.toISOString().split('T')[0]
    const futureStr = thirtyDaysFromNow.toISOString().split('T')[0]

    return consumables.value.filter(consumable =>
      consumable.expiry_date !== '9999-12-31' &&
      consumable.expiry_date >= todayStr &&
      consumable.expiry_date <= futureStr
    )
  })

  const stats = computed(() => ({
    total: consumables.value.length,
    high: consumables.value.filter(c => c.stock_level === 'high').length,
    normal: consumables.value.filter(c => c.stock_level === 'normal').length,
    low: consumables.value.filter(c => c.stock_level === 'low').length,
    outofstock: consumables.value.filter(c => c.stock_level === 'outofstock').length,
    expired: expiredConsumables.value.length,
    expiringSoon: expiringSoonConsumables.value.length,
    totalStock: consumables.value.reduce((sum, c) => sum + c.stock, 0),
    totalValue: consumables.value.reduce((sum, c) => sum + (c.stock * c.quantity), 0)
  }))

  // Actions
  async function fetchConsumables(force = false) {
    if (loading.value || (isInitialized.value && !force)) {
      return
    }

    try {
      loading.value = true
      error.value = null

      const fetchedConsumables = await consumablesService.getConsumables()
      consumables.value = fetchedConsumables
      isInitialized.value = true
    } catch {
      error.value = 'Failed to fetch consumables'
    } finally {
      loading.value = false
    }
  }

  async function getConsumableById(id: string): Promise<Consumable | null> {
    // Check if consumable is already in store
    const existingConsumable = consumables.value.find(c => c.id === id)
    if (existingConsumable) {
      return existingConsumable
    }

    try {
      const consumable = await consumablesService.getConsumableById(id)
      if (consumable) {
        // Add to store if not exists
        const index = consumables.value.findIndex(c => c.id === id)
        if (index === -1) {
          consumables.value.push(consumable)
        }
      }
      return consumable
    } catch {
      return null
    }
  }

  async function getConsumableByReference(reference: string): Promise<Consumable | null> {
    // Check if consumable is already in store
    const existingConsumable = consumables.value.find(c => c.reference === reference)
    if (existingConsumable) {
      return existingConsumable
    }

    try {
      const consumable = await consumablesService.getConsumableByReference(reference)
      if (consumable) {
        // Add to store if not exists
        const index = consumables.value.findIndex(c => c.id === consumable.id)
        if (index === -1) {
          consumables.value.push(consumable)
        }
      }
      return consumable
    } catch {
      return null
    }
  }

  async function createConsumable(consumableData: ConsumableInsert): Promise<Consumable | null> {
    try {
      loading.value = true
      error.value = null

      const newConsumable = await consumablesService.createConsumable(consumableData)
      consumables.value.unshift(newConsumable) // Add to beginning of array
      return newConsumable
    } catch {
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateConsumable(id: string, updates: ConsumableUpdate): Promise<Consumable | null> {
    try {
      const updatedConsumable = await consumablesService.updateConsumable(id, updates)

      // Update in store
      const index = consumables.value.findIndex(c => c.id === id)
      if (index !== -1) {
        consumables.value[index] = updatedConsumable
      }

      return updatedConsumable
    } catch {
      return null
    }
  }

  async function deleteConsumable(id: string): Promise<boolean> {
    try {
      await consumablesService.deleteConsumable(id)

      // Remove from store
      const index = consumables.value.findIndex(c => c.id === id)
      if (index !== -1) {
        consumables.value.splice(index, 1)
      }

      return true
    } catch {
      return false
    }
  }

  // Quick update methods
  async function updateConsumableStock(id: string, newStock: number): Promise<boolean> {
    try {
      const updatedConsumable = await consumablesService.updateConsumableStock(id, newStock)

      // Update in store
      const index = consumables.value.findIndex(c => c.id === id)
      if (index !== -1) {
        consumables.value[index] = updatedConsumable
      }

      return true
    } catch {
      return false
    }
  }

  // Search functionality
  async function searchConsumables(query: string): Promise<Consumable[]> {
    try {
      return await consumablesService.searchConsumables(query)
    } catch {
      return []
    }
  }

  // Filter and search actions
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setStockLevelFilter(stockLevel: StockLevel | 'all') {
    stockLevelFilter.value = stockLevel
  }

  function setCategoryFilter(category: string | 'all') {
    categoryFilter.value = category
  }

  function setSupplierFilter(supplier: string | 'all') {
    supplierFilter.value = supplier
  }

  function setLocationFilter(location: string | 'all') {
    locationFilter.value = location
  }

  function clearFilters() {
    searchQuery.value = ''
    stockLevelFilter.value = 'all'
    categoryFilter.value = 'all'
    supplierFilter.value = 'all'
    locationFilter.value = 'all'
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    consumables,
    loading,
    error,
    isInitialized,
    searchQuery,
    stockLevelFilter,
    categoryFilter,
    supplierFilter,
    locationFilter,

    // Computed
    filteredConsumables,
    consumablesByStockLevel,
    categories,
    suppliers,
    locations,
    units,
    lowStockConsumables,
    outOfStockConsumables,
    highStockConsumables,
    normalStockConsumables,
    expiredConsumables,
    expiringSoonConsumables,
    stats,

    // Actions
    fetchConsumables,
    getConsumableById,
    getConsumableByReference,
    createConsumable,
    updateConsumable,
    deleteConsumable,
    updateConsumableStock,
    searchConsumables,
    setSearchQuery,
    setStockLevelFilter,
    setCategoryFilter,
    setSupplierFilter,
    setLocationFilter,
    clearFilters,
    clearError
  }
})
