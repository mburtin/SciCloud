/**
 * Laboratory management types
 */

import type { Timestamp, AuditableRecord, UUID } from './base'

export type StockLevel = 'high' | 'normal' | 'low' | 'outofstock'

// Animal document types
export interface AnimalDocument {
  id: string
  name: string
  type: 'health-certificate' | 'protocol' | 'report' | 'photo' | 'analysis' | 'authorization' | 'other'
  uploadDate: string
  size: string
  uploadedBy: string
}

// Medical record types
export interface MedicalRecord {
  id: string
  date: string
  type: 'examination' | 'vaccination' | 'treatment' | 'surgery' | 'sampling' | 'observation'
  veterinarian: string
  description: string
  findings?: string
  treatment?: string
  followUp?: string
  severity: 'normal' | 'minor' | 'moderate' | 'severe'
}

// Measurement types
export interface Measurement {
  id: string
  date: string
  type: 'weight' | 'temperature' | 'blood-pressure' | 'behavior' | 'other'
  value: number
  unit: string
  measuredBy: string
  notes?: string
}

// Laboratory entity types
export interface Animal extends AuditableRecord {
  id: UUID
  identifier: string
  species: string
  strain: string
  line?: string
  sex: 'male' | 'female'
  birthDate: string
  arrivalDate: string
  currentWeight: number
  supplier: string
  status: 'alive' | 'deceased' | 'transferred' | 'experimental'
  location: {
    facility: string
    room: string
    rack: string
    cage: string
  }
  housingType: 'individual' | 'pair' | 'group'
  groupSize?: number
  protocols: string[]
  experimentalGroup?: string
  veterinarian: string
  lastExamDate?: string
  nextExamDate?: string
  healthStatus: 'excellent' | 'good' | 'concerning' | 'critical'
  notes: string
  ethicsApproval: string
  documents: AnimalDocument[]
  medicalHistory: MedicalRecord[]
  measurements: Measurement[]
}

// Utility constants and labels
export const speciesLabels = {
  'Mus musculus': 'Mouse',
  'Rattus norvegicus': 'Rat',
  'Oryctolagus cuniculus': 'Rabbit',
  'Cavia porcellus': 'Guinea Pig',
  'autre': 'Other'
} as const

export const statusLabels = {
  alive: 'Alive',
  deceased: 'Deceased',
  transferred: 'Transferred',
  experimental: 'Under experimentation'
} as const

export const healthStatusLabels = {
  excellent: 'Excellent',
  good: 'Good',
  concerning: 'Concerning',
  critical: 'Critical'
} as const

export const documentTypeLabels = {
  'health-certificate': 'Health certificate',
  'protocol': 'Protocol',
  'report': 'Report',
  'photo': 'Photo',
  'analysis': 'Analysis',
  'authorization': 'Authorization',
  'other': 'Other'
} as const

export interface Instrument extends AuditableRecord {
  id: UUID
  name: string
  model: string
  category: string
  manufacturer: string
  serial_number?: string
  status: 'available' | 'in-use' | 'maintenance' | 'broken'
  location?: string
  maintenanceDue: boolean
}

export interface Consumable extends AuditableRecord {
  id: UUID
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