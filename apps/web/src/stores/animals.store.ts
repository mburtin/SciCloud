import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { animalsService } from '@/services/animals.service'
import type { Animal, AnimalStatus, AnimalInsert, AnimalUpdate, HealthStatus } from '@/types/supabase'
import type { AnimalDocument, MedicalRecord, Measurement } from '@/types/lab'

export const useAnimalsStore = defineStore('animals', () => {
  // State
  const animals = ref<Animal[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)
  
  // Filters and search
  const searchQuery = ref('')
  const statusFilter = ref<AnimalStatus | 'all'>('all')
  const speciesFilter = ref<string | 'all'>('all')
  const healthStatusFilter = ref<HealthStatus | 'all'>('all')
  const veterinarianFilter = ref<string | 'all'>('all')

  // Computed
  const filteredAnimals = computed(() => {
    let filtered = animals.value

    // Search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(animal => 
        animal.identifier.toLowerCase().includes(query) ||
        animal.species.toLowerCase().includes(query) ||
        animal.strain.toLowerCase().includes(query) ||
        animal.veterinarian.toLowerCase().includes(query) ||
        animal.notes.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(animal => animal.status === statusFilter.value)
    }

    // Species filter
    if (speciesFilter.value !== 'all') {
      filtered = filtered.filter(animal => animal.species === speciesFilter.value)
    }

    // Health status filter
    if (healthStatusFilter.value !== 'all') {
      filtered = filtered.filter(animal => animal.health_status === healthStatusFilter.value)
    }

    // Veterinarian filter
    if (veterinarianFilter.value !== 'all') {
      filtered = filtered.filter(animal => animal.veterinarian === veterinarianFilter.value)
    }

    return filtered
  })

  const animalsByStatus = computed(() => {
    const grouped: Record<AnimalStatus, Animal[]> = {
      alive: [],
      deceased: [],
      transferred: [],
      experimental: []
    }

    filteredAnimals.value.forEach(animal => {
      if (grouped[animal.status]) {
        grouped[animal.status].push(animal)
      }
    })

    return grouped
  })

  const animalsByHealthStatus = computed(() => {
    const grouped: Record<HealthStatus, Animal[]> = {
      excellent: [],
      good: [],
      concerning: [],
      critical: []
    }

    filteredAnimals.value.forEach(animal => {
      if (grouped[animal.health_status]) {
        grouped[animal.health_status].push(animal)
      }
    })

    return grouped
  })

  const species = computed(() => {
    const speciesSet = new Set(animals.value.map(a => a.species))
    return Array.from(speciesSet).sort()
  })

  const veterinarians = computed(() => {
    const vetSet = new Set(animals.value.map(a => a.veterinarian))
    return Array.from(vetSet).sort()
  })

  const activeAnimals = computed(() => 
    animals.value.filter(animal => animal.status === 'alive')
  )

  const criticalAnimals = computed(() => 
    animals.value.filter(animal => animal.health_status === 'critical' && animal.status === 'alive')
  )

  const concerningAnimals = computed(() => 
    animals.value.filter(animal => animal.health_status === 'concerning' && animal.status === 'alive')
  )

  const stats = computed(() => ({
    total: animals.value.length,
    alive: animals.value.filter(a => a.status === 'alive').length,
    deceased: animals.value.filter(a => a.status === 'deceased').length,
    experimental: animals.value.filter(a => a.status === 'experimental').length,
    transferred: animals.value.filter(a => a.status === 'transferred').length,
    excellent: animals.value.filter(a => a.health_status === 'excellent').length,
    good: animals.value.filter(a => a.health_status === 'good').length,
    concerning: animals.value.filter(a => a.health_status === 'concerning').length,
    critical: animals.value.filter(a => a.health_status === 'critical').length
  }))

  // Actions
  async function fetchAnimals(force = false) {
    if (loading.value || (isInitialized.value && !force)) {
      return
    }

    try {
      loading.value = true
      error.value = null
      
      const fetchedAnimals = await animalsService.getAnimals()
      animals.value = fetchedAnimals
      isInitialized.value = true
    } catch {
      error.value = 'Failed to fetch animals'
    } finally {
      loading.value = false
    }
  }

  async function getAnimalById(id: string): Promise<Animal | null> {
    // Check if animal is already in store
    const existingAnimal = animals.value.find(a => a.id === id)
    if (existingAnimal) {
      return existingAnimal
    }

    try {
      const animal = await animalsService.getAnimalById(id)
      if (animal) {
        // Add to store if not exists
        const index = animals.value.findIndex(a => a.id === id)
        if (index === -1) {
          animals.value.push(animal)
        }
      }
      return animal
    } catch {
      return null
    }
  }

  async function getAnimalByIdentifier(identifier: string): Promise<Animal | null> {
    // Check if animal is already in store
    const existingAnimal = animals.value.find(a => a.identifier === identifier)
    if (existingAnimal) {
      return existingAnimal
    }

    try {
      const animal = await animalsService.getAnimalByIdentifier(identifier)
      if (animal) {
        // Add to store if not exists
        const index = animals.value.findIndex(a => a.id === animal.id)
        if (index === -1) {
          animals.value.push(animal)
        }
      }
      return animal
    } catch {
      return null
    }
  }

  async function createAnimal(animalData: AnimalInsert): Promise<Animal | null> {
    try {
      loading.value = true
      error.value = null

      const newAnimal = await animalsService.createAnimal(animalData)
      animals.value.unshift(newAnimal) // Add to beginning of array
      return newAnimal
    } catch {
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateAnimal(id: string, updates: AnimalUpdate): Promise<Animal | null> {
    try {
      const updatedAnimal = await animalsService.updateAnimal(id, updates)
      
      // Update in store
      const index = animals.value.findIndex(a => a.id === id)
      if (index !== -1) {
        animals.value[index] = updatedAnimal
      }
      
      return updatedAnimal
    } catch {
      return null
    }
  }

  async function deleteAnimal(id: string): Promise<boolean> {
    try {
      await animalsService.deleteAnimal(id)
      
      // Remove from store
      const index = animals.value.findIndex(a => a.id === id)
      if (index !== -1) {
        animals.value.splice(index, 1)
      }
      
      return true
    } catch {
      return false
    }
  }

  // Quick update methods
  async function updateAnimalWeight(id: string, weight: number): Promise<boolean> {
    try {
      const updatedAnimal = await animalsService.updateAnimalWeight(id, weight)
      
      // Update in store
      const index = animals.value.findIndex(a => a.id === id)
      if (index !== -1) {
        animals.value[index] = updatedAnimal
      }
      
      return true
    } catch {
      return false
    }
  }

  async function updateAnimalStatus(id: string, status: AnimalStatus): Promise<boolean> {
    try {
      const updatedAnimal = await animalsService.updateAnimalStatus(id, status)
      
      // Update in store
      const index = animals.value.findIndex(a => a.id === id)
      if (index !== -1) {
        animals.value[index] = updatedAnimal
      }
      
      return true
    } catch {
      return false
    }
  }

  async function updateAnimalHealthStatus(id: string, healthStatus: HealthStatus): Promise<boolean> {
    try {
      const updatedAnimal = await animalsService.updateAnimalHealthStatus(id, healthStatus)
      
      // Update in store
      const index = animals.value.findIndex(a => a.id === id)
      if (index !== -1) {
        animals.value[index] = updatedAnimal
      }
      
      return true
    } catch {
      return false
    }
  }

  // Document management
  async function addDocument(id: string, document: AnimalDocument): Promise<boolean> {
    try {
      const updatedAnimal = await animalsService.addDocument(id, document)
      
      // Update in store
      const index = animals.value.findIndex(a => a.id === id)
      if (index !== -1) {
        animals.value[index] = updatedAnimal
      }
      
      return true
    } catch {
      return false
    }
  }

  async function removeDocument(id: string, documentId: string): Promise<boolean> {
    try {
      const updatedAnimal = await animalsService.removeDocument(id, documentId)
      
      // Update in store
      const index = animals.value.findIndex(a => a.id === id)
      if (index !== -1) {
        animals.value[index] = updatedAnimal
      }
      
      return true
    } catch {
      return false
    }
  }

  // Medical record management
  async function addMedicalRecord(id: string, record: MedicalRecord): Promise<boolean> {
    try {
      const updatedAnimal = await animalsService.addMedicalRecord(id, record)
      
      // Update in store
      const index = animals.value.findIndex(a => a.id === id)
      if (index !== -1) {
        animals.value[index] = updatedAnimal
      }
      
      return true
    } catch {
      return false
    }
  }

  // Measurement management
  async function addMeasurement(id: string, measurement: Measurement): Promise<boolean> {
    try {
      const updatedAnimal = await animalsService.addMeasurement(id, measurement)
      
      // Update in store
      const index = animals.value.findIndex(a => a.id === id)
      if (index !== -1) {
        animals.value[index] = updatedAnimal
      }
      
      return true
    } catch {
      return false
    }
  }

  // Search functionality
  async function searchAnimals(query: string): Promise<Animal[]> {
    try {
      return await animalsService.searchAnimals(query)
    } catch {
      return []
    }
  }

  // Filter and search actions
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setStatusFilter(status: AnimalStatus | 'all') {
    statusFilter.value = status
  }

  function setSpeciesFilter(species: string | 'all') {
    speciesFilter.value = species
  }

  function setHealthStatusFilter(healthStatus: HealthStatus | 'all') {
    healthStatusFilter.value = healthStatus
  }

  function setVeterinarianFilter(veterinarian: string | 'all') {
    veterinarianFilter.value = veterinarian
  }

  function clearFilters() {
    searchQuery.value = ''
    statusFilter.value = 'all'
    speciesFilter.value = 'all'
    healthStatusFilter.value = 'all'
    veterinarianFilter.value = 'all'
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    animals,
    loading,
    error,
    isInitialized,
    searchQuery,
    statusFilter,
    speciesFilter,
    healthStatusFilter,
    veterinarianFilter,

    // Computed
    filteredAnimals,
    animalsByStatus,
    animalsByHealthStatus,
    species,
    veterinarians,
    activeAnimals,
    criticalAnimals,
    concerningAnimals,
    stats,

    // Actions
    fetchAnimals,
    getAnimalById,
    getAnimalByIdentifier,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    updateAnimalWeight,
    updateAnimalStatus,
    updateAnimalHealthStatus,
    addDocument,
    removeDocument,
    addMedicalRecord,
    addMeasurement,
    searchAnimals,
    setSearchQuery,
    setStatusFilter,
    setSpeciesFilter,
    setHealthStatusFilter,
    setVeterinarianFilter,
    clearFilters,
    clearError
  }
})