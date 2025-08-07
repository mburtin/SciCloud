/**
 * Document types
 */

import type { AuditableRecord, UUID } from './base'

export interface Documents extends AuditableRecord {
  id: UUID
  name: string
  type: string
  description: string
  uploadDate: string
  uploader: string
  size: string
  tags: string[]
  icon?: string
}

// Generic document interface for DocumentManager component
export interface Document {
  id: string
  name: string
  type: string
  uploadDate: string
  size: string
  uploadedBy: string
  description?: string
  tags?: string[]
  icon?: string
}

// Document type labels mapping
export const documentTypeLabels: Record<string, string> = {
  'health-certificate': 'Health Certificate',
  'protocol': 'Protocol',
  'report': 'Report',
  'photo': 'Photo',
  'analysis': 'Analysis',
  'authorization': 'Authorization',
  'other': 'Other',
  'pdf': 'PDF',
  'docx': 'Word Document',
  'xlsx': 'Excel Spreadsheet',
  'pptx': 'PowerPoint Presentation',
  'txt': 'Text File',
  'csv': 'CSV File',
  'image': 'Image',
  'video': 'Video',
  'audio': 'Audio'
}
