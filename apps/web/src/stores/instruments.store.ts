import { instrumentsService } from '@/services/instruments.service'
import type { Instrument, InstrumentInsert, InstrumentStatus, InstrumentUpdate } from '@/types/supabase'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useInstrumentsStore = defineStore('instruments', () => {
  // State
  const instruments = ref<Instrument[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Filters and search
  const searchQuery = ref('')
  const statusFilter = ref<InstrumentStatus | 'all'>('all')
  const categoryFilter = ref<string | 'all'>('all')
  const locationFilter = ref<string | 'all'>('all')
  const manufacturerFilter = ref<string | 'all'>('all')

  // Computed
  const filteredInstruments = computed(() => {
    let filtered = instruments.value

    // Search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(instrument =>
        instrument.name.toLowerCase().includes(query) ||
        instrument.model.toLowerCase().includes(query) ||
        instrument.manufacturer.toLowerCase().includes(query) ||
        instrument.category.toLowerCase().includes(query) ||
        instrument.serial_number?.toLowerCase().includes(query) ||
        instrument.location?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(instrument => instrument.status === statusFilter.value)
    }

    // Category filter
    if (categoryFilter.value !== 'all') {
      filtered = filtered.filter(instrument => instrument.category === categoryFilter.value)
    }

    // Location filter
    if (locationFilter.value !== 'all') {
      filtered = filtered.filter(instrument => instrument.location === locationFilter.value)
    }

    // Manufacturer filter
    if (manufacturerFilter.value !== 'all') {
      filtered = filtered.filter(instrument => instrument.manufacturer === manufacturerFilter.value)
    }

    return filtered
  })

  const instrumentsByStatus = computed(() => {
    const grouped: Record<InstrumentStatus, Instrument[]> = {
      available: [],
      'in-use': [],
      maintenance: [],
      broken: []
    }

    filteredInstruments.value.forEach(instrument => {
      if (grouped[instrument.status]) {
        grouped[instrument.status].push(instrument)
      }
    })

    return grouped
  })

  const categories = computed(() => {
    const categorySet = new Set(instruments.value.map(i => i.category))
    return Array.from(categorySet).sort()
  })

  const locations = computed(() => {
    const locationSet = new Set(instruments.value.filter(i => i.location).map(i => i.location!))
    return Array.from(locationSet).sort()
  })

  const manufacturers = computed(() => {
    const manufacturerSet = new Set(instruments.value.map(i => i.manufacturer))
    return Array.from(manufacturerSet).sort()
  })

  const availableInstruments = computed(() =>
    instruments.value.filter(instrument => instrument.status === 'available')
  )

  const instrumentsInUse = computed(() =>
    instruments.value.filter(instrument => instrument.status === 'in-use')
  )

  const instrumentsInMaintenance = computed(() =>
    instruments.value.filter(instrument => instrument.status === 'maintenance')
  )

  const brokenInstruments = computed(() =>
    instruments.value.filter(instrument => instrument.status === 'broken')
  )

  const instrumentsRequiringMaintenance = computed(() =>
    instruments.value.filter(instrument => instrument.maintenance_due && instrument.status !== 'maintenance')
  )

  const stats = computed(() => ({
    total: instruments.value.length,
    available: instruments.value.filter(i => i.status === 'available').length,
    inUse: instruments.value.filter(i => i.status === 'in-use').length,
    maintenance: instruments.value.filter(i => i.status === 'maintenance').length,
    broken: instruments.value.filter(i => i.status === 'broken').length,
    maintenanceDue: instruments.value.filter(i => i.maintenance_due).length,
    operational: instruments.value.filter(i => i.status === 'available' || i.status === 'in-use').length
  }))

  // Actions
  async function fetchInstruments(force = false) {
    if (loading.value || (isInitialized.value && !force)) {
      return
    }

    try {
      loading.value = true
      error.value = null

      const fetchedInstruments = await instrumentsService.getInstruments()
      instruments.value = fetchedInstruments
      isInitialized.value = true
    } catch {
      error.value = 'Failed to fetch instruments'
    } finally {
      loading.value = false
    }
  }

  async function getInstrumentById(id: string): Promise<Instrument | null> {
    // Check if instrument is already in store
    const existingInstrument = instruments.value.find(i => i.id === id)
    if (existingInstrument) {
      return existingInstrument
    }

    try {
      const instrument = await instrumentsService.getInstrumentById(id)
      if (instrument) {
        // Add to store if not exists
        const index = instruments.value.findIndex(i => i.id === id)
        if (index === -1) {
          instruments.value.push(instrument)
        }
      }
      return instrument
    } catch {
      return null
    }
  }

  async function getInstrumentBySerialNumber(serialNumber: string): Promise<Instrument | null> {
    // Check if instrument is already in store
    const existingInstrument = instruments.value.find(i => i.serial_number === serialNumber)
    if (existingInstrument) {
      return existingInstrument
    }

    try {
      const instrument = await instrumentsService.getInstrumentBySerialNumber(serialNumber)
      if (instrument) {
        // Add to store if not exists
        const index = instruments.value.findIndex(i => i.id === instrument.id)
        if (index === -1) {
          instruments.value.push(instrument)
        }
      }
      return instrument
    } catch {
      return null
    }
  }

  async function createInstrument(instrumentData: InstrumentInsert): Promise<Instrument | null> {
    try {
      loading.value = true
      error.value = null

      const newInstrument = await instrumentsService.createInstrument(instrumentData)
      instruments.value.unshift(newInstrument) // Add to beginning of array
      return newInstrument
    } catch {
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateInstrument(id: string, updates: InstrumentUpdate): Promise<Instrument | null> {
    try {
      const updatedInstrument = await instrumentsService.updateInstrument(id, updates)

      // Update in store
      const index = instruments.value.findIndex(i => i.id === id)
      if (index !== -1) {
        instruments.value[index] = updatedInstrument
      }

      return updatedInstrument
    } catch {
      return null
    }
  }

  async function deleteInstrument(id: string): Promise<boolean> {
    try {
      await instrumentsService.deleteInstrument(id)

      // Remove from store
      const index = instruments.value.findIndex(i => i.id === id)
      if (index !== -1) {
        instruments.value.splice(index, 1)
      }

      return true
    } catch {
      return false
    }
  }

  // Quick update methods
  async function updateInstrumentStatus(id: string, status: InstrumentStatus): Promise<boolean> {
    try {
      const updatedInstrument = await instrumentsService.updateInstrumentStatus(id, status)

      // Update in store
      const index = instruments.value.findIndex(i => i.id === id)
      if (index !== -1) {
        instruments.value[index] = updatedInstrument
      }

      return true
    } catch {
      return false
    }
  }

  async function updateMaintenanceDue(id: string, maintenanceDue: boolean): Promise<boolean> {
    try {
      const updatedInstrument = await instrumentsService.updateMaintenanceDue(id, maintenanceDue)

      // Update in store
      const index = instruments.value.findIndex(i => i.id === id)
      if (index !== -1) {
        instruments.value[index] = updatedInstrument
      }

      return true
    } catch {
      return false
    }
  }

  // Search functionality
  async function searchInstruments(query: string): Promise<Instrument[]> {
    try {
      return await instrumentsService.searchInstruments(query)
    } catch {
      return []
    }
  }

  // Filter and search actions
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setStatusFilter(status: InstrumentStatus | 'all') {
    statusFilter.value = status
  }

  function setCategoryFilter(category: string | 'all') {
    categoryFilter.value = category
  }

  function setLocationFilter(location: string | 'all') {
    locationFilter.value = location
  }

  function setManufacturerFilter(manufacturer: string | 'all') {
    manufacturerFilter.value = manufacturer
  }

  function clearFilters() {
    searchQuery.value = ''
    statusFilter.value = 'all'
    categoryFilter.value = 'all'
    locationFilter.value = 'all'
    manufacturerFilter.value = 'all'
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    instruments,
    loading,
    error,
    isInitialized,
    searchQuery,
    statusFilter,
    categoryFilter,
    locationFilter,
    manufacturerFilter,

    // Computed
    filteredInstruments,
    instrumentsByStatus,
    categories,
    locations,
    manufacturers,
    availableInstruments,
    instrumentsInUse,
    instrumentsInMaintenance,
    brokenInstruments,
    instrumentsRequiringMaintenance,
    stats,

    // Actions
    fetchInstruments,
    getInstrumentById,
    getInstrumentBySerialNumber,
    createInstrument,
    updateInstrument,
    deleteInstrument,
    updateInstrumentStatus,
    updateMaintenanceDue,
    searchInstruments,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    setLocationFilter,
    setManufacturerFilter,
    clearFilters,
    clearError
  }
})
