/**
 * Animals service - Handles animal data operations
 */

import { supabase } from '@/lib/supabase'
import type { AnimalDocument, Measurement, MedicalRecord } from '@/types/lab'
import type { Animal, AnimalInsert, AnimalUpdate } from '@/types/supabase'

export class AnimalsService {
  /**
   * Get all animals
   */
  async getAnimals(): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch animals: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get animal by ID
   */
  async getAnimalById(id: string): Promise<Animal | null> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Animal not found
      }
      throw new Error(`Failed to fetch animal: ${error.message}`)
    }

    return data
  }

  /**
   * Get animal by identifier
   */
  async getAnimalByIdentifier(identifier: string): Promise<Animal | null> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('identifier', identifier)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Animal not found
      }
      throw new Error(`Failed to fetch animal: ${error.message}`)
    }

    return data
  }

  /**
   * Create new animal
   */
  async createAnimal(animalData: AnimalInsert): Promise<Animal> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to create animals')
    }

    // Prepare animal data for database
    const dbAnimalData = {
      identifier: animalData.identifier,
      species: animalData.species,
      strain: animalData.strain,
      line: animalData.line,
      sex: animalData.sex,
      age_weeks: animalData.age_weeks,
      birth_date: animalData.birth_date,
      arrival_date: animalData.arrival_date,
      current_weight: animalData.current_weight,
      supplier: animalData.supplier,
      status: animalData.status || 'alive',
      location: animalData.location,
      housing_type: animalData.housing_type || 'individual',
      group_size: animalData.group_size,
      protocols: animalData.protocols || [],
      experimental_group: animalData.experimental_group,
      ethics_approval: animalData.ethics_approval,
      veterinarian: animalData.veterinarian,
      last_exam_date: animalData.last_exam_date,
      next_exam_date: animalData.next_exam_date,
      health_status: animalData.health_status || 'good',
      documents: animalData.documents || [],
      medical_history: animalData.medical_history || [],
      measurements: animalData.measurements || [],
      notes: animalData.notes || '',
      created_by: user.id,
      updated_by: user.id
    }

    const { data, error } = await supabase
      .from('animals')
      .insert(dbAnimalData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create animal: ${error.message}`)
    }

    return data
  }

  /**
   * Update animal
   */
  async updateAnimal(id: string, updates: AnimalUpdate): Promise<Animal> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to update animals')
    }

    // Filter out undefined values and prepare for database
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    )

    const dbUpdates: Partial<AnimalUpdate> & { updated_by: string } = {
      ...filteredUpdates,
      updated_by: user.id
    }

    // Remove fields that shouldn't be updated directly
    delete dbUpdates.id
    delete dbUpdates.created_at
    delete dbUpdates.created_by
    delete dbUpdates.version

    // First check if animal exists and user has permission
    const { error: checkError } = await supabase
      .from('animals')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        throw new Error('Animal not found or access denied')
      }
      throw new Error(`Failed to check animal: ${checkError.message}`)
    }

    const { data, error } = await supabase
      .from('animals')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Animal not found or access denied after update')
      }
      throw new Error(`Failed to update animal: ${error.message}`)
    }

    return data
  }

  /**
   * Delete animal
   */
  async deleteAnimal(id: string): Promise<void> {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete animal: ${error.message}`)
    }
  }

  /**
   * Update animal weight (quick update)
   */
  async updateAnimalWeight(id: string, weight: number): Promise<Animal> {
    return this.updateAnimal(id, { current_weight: weight })
  }

  /**
   * Update animal status
   */
  async updateAnimalStatus(id: string, status: 'alive' | 'deceased' | 'transferred' | 'experimental'): Promise<Animal> {
    return this.updateAnimal(id, { status })
  }

  /**
   * Update animal health status
   */
  async updateAnimalHealthStatus(id: string, healthStatus: 'excellent' | 'good' | 'concerning' | 'critical'): Promise<Animal> {
    return this.updateAnimal(id, { health_status: healthStatus })
  }

  /**
   * Add document to animal
   */
  async addDocument(id: string, document: AnimalDocument): Promise<Animal> {
    const animal = await this.getAnimalById(id)
    if (!animal) throw new Error('Animal not found')

    const updatedDocuments = [...animal.documents, document]
    return this.updateAnimal(id, { documents: updatedDocuments })
  }

  /**
   * Remove document from animal
   */
  async removeDocument(id: string, documentId: string): Promise<Animal> {
    const animal = await this.getAnimalById(id)
    if (!animal) throw new Error('Animal not found')

    const updatedDocuments = animal.documents.filter(doc => doc.id !== documentId)
    return this.updateAnimal(id, { documents: updatedDocuments })
  }

  /**
   * Add medical record to animal
   */
  async addMedicalRecord(id: string, record: MedicalRecord): Promise<Animal> {
    const animal = await this.getAnimalById(id)
    if (!animal) throw new Error('Animal not found')

    const updatedHistory = [...animal.medical_history, record]
    return this.updateAnimal(id, { medical_history: updatedHistory })
  }

  /**
   * Add measurement to animal
   */
  async addMeasurement(id: string, measurement: Measurement): Promise<Animal> {
    const animal = await this.getAnimalById(id)
    if (!animal) throw new Error('Animal not found')

    const updatedMeasurements = [...animal.measurements, measurement]
    return this.updateAnimal(id, { measurements: updatedMeasurements })
  }

  /**
   * Get animals by status
   */
  async getAnimalsByStatus(status: 'alive' | 'deceased' | 'transferred' | 'experimental'): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('status', status)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch animals by status: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get animals by veterinarian
   */
  async getAnimalsByVeterinarian(veterinarian: string): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('veterinarian', veterinarian)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch animals by veterinarian: ${error.message}`)
    }

    return data || []
  }

  /**
   * Search animals by identifier, species, or strain
   */
  async searchAnimals(query: string): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .or(`identifier.ilike.%${query}%,species.ilike.%${query}%,strain.ilike.%${query}%`)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search animals: ${error.message}`)
    }

    return data || []
  }
}

export const animalsService = new AnimalsService()
