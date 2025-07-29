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
