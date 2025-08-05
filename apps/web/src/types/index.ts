/**
 * Central export point for all types
 * Import from specific modules or use this barrel export
 */

// Base types
export type { UUID, Timestamp, AuditableRecord, ApiResponse, PaginatedResponse, CreateInput, UpdateInput } from './base'
export type { Priority } from './base' // Use Priority from base

// Feature modules
export * from './auth'
export * from './projects'
export type { AnimalDocument, MedicalRecord, Measurement, speciesLabels, statusLabels, healthStatusLabels, documentTypeLabels } from './lab'
export type { StockLevel } from './lab' // Use StockLevel from lab
export * from './ui'
export * from './supabase'
export * from './notifications'
export * from './documents'