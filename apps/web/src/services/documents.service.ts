import { supabase } from '@/lib/supabase'
import type { Document } from '@/types/documents'

const BUCKET = 'project-documents'

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

function pathFor(ownerType: string, ownerId: string, fileName: string) {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '')
  return `${ownerType}/${ownerId}/${ts}_${sanitizeFileName(fileName)}`
}


export async function uploadDocument(opts: { ownerType: string; ownerId: string; file: File; type?: string }) {
  const { ownerType, ownerId, file } = opts
  if (!ownerType) throw new Error('Missing ownerType')
  if (!ownerId) throw new Error('Missing ownerId')
  if (!file) throw new Error('Missing file')
  const storage = supabase.storage.from(BUCKET)
  const path = pathFor(ownerType, ownerId, file.name)

  console.log('uploadDocument debug:', { ownerType, ownerId, fileName: file.name, path, bucket: BUCKET })

  const { error } = await storage.upload(path, file, { upsert: false })
  if (error) {
    console.error('Upload error:', error)
    throw error
  }

  console.log('Upload successful:', { path })
  return { path }
}

export async function listDocuments(ownerType: string, ownerId: string): Promise<Document[]> {
  if (!ownerType) throw new Error('Missing ownerType')
  if (!ownerId) throw new Error('Missing ownerId')
  const storage = supabase.storage.from(BUCKET)
  const prefix = `${ownerType}/${ownerId}`
  // list files under the owner folder
  const { data, error } = await storage.list(prefix, { limit: 100, sortBy: { column: 'updated_at', order: 'desc' } })

  console.log('listDocuments debug:', { ownerType, ownerId, prefix, data, error })

  if (error) throw error

  const docs: Document[] = (data || []).map((obj) => ({
    id: `${prefix}/${obj.name}`,
    name: obj.name.replace(/^\d+_/, ''),
    type: inferTypeFromName(obj.name),
    uploadDate: (obj as { updated_at?: string; created_at?: string }).updated_at || 
                (obj as { updated_at?: string; created_at?: string }).created_at || 
                new Date().toISOString(),
    size: formatSize(obj.metadata?.size ?? 0),
    uploadedBy: '—'
  }))
  return docs
}

export async function deleteDocument(ownerType: string, ownerId: string, pathOrId: string) {
  if (!ownerType) throw new Error('Missing ownerType')
  if (!ownerId) throw new Error('Missing ownerId')
  if (!pathOrId) throw new Error('Missing path or id')
  const storage = supabase.storage.from(BUCKET)
  const path = normalizePath(ownerType, ownerId, pathOrId)
  const { error } = await storage.remove([path])
  if (error) throw error
}

export async function downloadDocument(ownerType: string, ownerId: string, pathOrId: string, downloadAs?: string) {
  if (!ownerType) throw new Error('Missing ownerType')
  if (!ownerId) throw new Error('Missing ownerId')
  if (!pathOrId) throw new Error('Missing path or id')
  const storage = supabase.storage.from(BUCKET)
  const path = normalizePath(ownerType, ownerId, pathOrId)
  const { data, error } = await storage.createSignedUrl(path, 60)
  if (error) throw error

  // Use fetch to get the file as blob, then create object URL for reliable download
  const response = await fetch(data.signedUrl)
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = blobUrl
  a.download = downloadAs || path.split('/').pop() || 'download'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  // Clean up the blob URL
  URL.revokeObjectURL(blobUrl)
}

export async function viewDocument(ownerType: string, ownerId: string, pathOrId: string) {
  if (!ownerType) throw new Error('Missing ownerType')
  if (!ownerId) throw new Error('Missing ownerId')
  if (!pathOrId) throw new Error('Missing path or id')
  const storage = supabase.storage.from(BUCKET)
  const path = normalizePath(ownerType, ownerId, pathOrId)
  const { data, error } = await storage.createSignedUrl(path, 3600) // 1 hour expiry for viewing
  if (error) throw error
  window.open(data.signedUrl, '_blank')
}

function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  const precision = i === 0 ? 0 : 1
  return `${size.toFixed(precision)} ${units[i]}`
}

function inferTypeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  if (!ext) return 'other'
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'docx'
  if (['xls', 'xlsx'].includes(ext)) return 'xlsx'
  if (['ppt', 'pptx'].includes(ext)) return 'pptx'
  if (ext === 'txt') return 'txt'
  if (ext === 'csv') return 'csv'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'aac', 'flac', 'ogg'].includes(ext)) return 'audio'
  return 'other'
}

function normalizePath(ownerType: string, ownerId: string, idOrPath: string) {
  return idOrPath.includes('/') ? idOrPath : `${ownerType}/${ownerId}/${idOrPath}`
}
