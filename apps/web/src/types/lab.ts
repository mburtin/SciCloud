/**
 * Laboratory management types
 */

import type { Timestamp, DatabaseEntity } from './base'

export type StockLevel = 'high' | 'normal' | 'low' | 'outofstock'

// Laboratory entity types
export interface Animal extends DatabaseEntity {
  id: string
  species: string
  strain: string
  age: number
  sex: 'male' | 'female'
  status: 'active' | 'quarantine' | 'experiment' | 'archived'
  project: string
  lastUpdated: string
  healthMonitoring: boolean
  upcomingExams: boolean
}

export interface Instrument extends DatabaseEntity {
  id: string
  name: string
  model: string
  category: string
  manufacturer: string
  serial_number?: string
  status: 'available' | 'in-use' | 'maintenance' | 'broken'
  location?: string
  maintenanceDue: boolean
}

export interface Consumable extends DatabaseEntity {
  reference: string
  name: string
  supplier: string
  category: string
  quantity: number
  unit: string
  stock: number
  minStock: number
  stockLevel: StockLevel
  location: string
  lastOrder: string | null
  expiryDate: Timestamp
}