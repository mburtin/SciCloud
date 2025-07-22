/**
 * Document types
 */

import type { DatabaseEntity } from './base'

export interface Documents extends DatabaseEntity {
  name: string
  type: string
  description: string
  uploadDate: string
  uploader: string
  size: string
  tags: string[]
  icon?: any
}
