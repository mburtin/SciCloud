<template>
  <div class="space-y-6">
    <!-- Statistics header (optional) -->
    <div v-if="showStats && documents.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <FileText class="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total documents</p>
              <p class="text-xl font-semibold">{{ stats.total }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-green-100 rounded-lg">
              <TrendingUp class="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total size</p>
              <p class="text-xl font-semibold">{{ formatFileSize(stats.totalSize) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-purple-100 rounded-lg">
              <FileText class="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Recent (7d)</p>
              <p class="text-xl font-semibold">{{ stats.recentCount }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">Popular types</p>
            <div class="flex flex-wrap gap-1">
              <Badge v-for="[type, count] in topTypes" :key="type" variant="secondary" class="text-xs">
                {{ type }}: {{ count }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Header with add button -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="text-sm text-muted-foreground">
          {{ description }}
        </p>
      </div>
      <Button :disabled="!ownerInfo" @click="uploadDialogOpen = true">
        <Plus class="h-4 w-4 mr-2" />
        {{ addButtonText }}
      </Button>
    </div>

    <!-- Documents display (cards or table) -->
    <div v-if="displayMode === 'cards'" class="space-y-4">
      <Card v-for="document in documents" :key="document.id">
        <CardContent class="p-4">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <FileText class="h-5 w-5 text-primary" />
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ document.name }}</span>
                  <Badge variant="outline" class="text-xs">
                    {{ getTypeLabel(document.type) }}
                  </Badge>
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ document.size }} • Uploaded {{ formatDate(document.uploadDate) }} by {{ document.uploadedBy }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="sm" :disabled="!ownerInfo" @click="viewDocument(document)">
                <Eye class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" :disabled="!ownerInfo" @click="downloadDocument(document)">
                <Download class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" :disabled="!ownerInfo" @click="deleteDocument(document.id)">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-else class="space-y-4">
      <Card>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded On</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="document in documents" :key="document.id">
                <TableCell class="font-medium">
                  {{ document.name }}
                </TableCell>
                <TableCell>{{ getTypeLabel(document.type) }}</TableCell>
                <TableCell>{{ document.size }}</TableCell>
                <TableCell>{{ formatDate(document.uploadDate) }}</TableCell>
                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" :disabled="!ownerInfo" @click="viewDocument(document)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" :disabled="!ownerInfo" @click="downloadDocument(document)">
                      <Download class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" :disabled="!ownerInfo" @click="deleteDocument(document.id)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    <!-- Empty state -->
    <div v-if="documents.length === 0" class="text-center py-8">
      <FileText class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="font-medium mb-2">No documents uploaded</h3>
      <p class="text-sm text-muted-foreground mb-4">
        {{ emptyStateText }}
      </p>
      <Button :disabled="!ownerInfo" @click="uploadDialogOpen = true">
        <Plus class="h-4 w-4 mr-2" />
        {{ addButtonText }}
      </Button>
    </div>

    <!-- Upload dialog with drag & drop -->
    <Dialog v-model:open="uploadDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            {{ uploadDialogDescription }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <!-- File dropzone -->
          <div class="space-y-2">
            <Label>Document File</Label>
            <div class="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg transition-colors"
              :class="{ 'border-primary bg-primary/10': isDragging }" @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false" @drop.prevent="handleFileDrop">
              <label for="file-upload" class="flex flex-col items-center justify-center w-full cursor-pointer">
                <div v-if="!selectedFile" class="text-center">
                  <UploadCloud class="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p class="mb-1 text-sm text-muted-foreground"><span class="font-semibold">Click to upload</span> or
                    drag and drop</p>
                  <p class="text-xs text-muted-foreground">Max file size: 25MB</p>
                </div>
                <div v-else class="text-center">
                  <FileText class="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p class="text-sm font-medium">{{ selectedFile.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
                </div>
                <input id="file-upload" type="file" class="hidden" @change="handleFileSelect">
              </label>
            </div>
          </div>

          <!-- Document type selector (if types provided) -->
          <div v-if="availableTypes.length > 0" class="space-y-2">
            <Label>Document Type</Label>
            <Select v-model="newDocumentType">
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in availableTypes" :key="type" :value="type">
                  {{ getTypeLabel(type) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="uploadDialogOpen = false">Cancel</Button>
          <Button :disabled="!selectedFile || !ownerInfo" @click="handleUpload">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { deleteDocument as deleteFromStorage, downloadDocument as downloadFromStorage, uploadDocument as uploadToStorage, viewDocument as viewFromStorage } from '@/services/documents.service'
import type { Document } from '@/types/documents'
import { documentTypeLabels } from '@/types/documents'
import {
  Download,
  Eye,
  FileText,
  Plus,
  Trash2,
  TrendingUp,
  UploadCloud
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
// removed unused Input import
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatFileSize } from '@/lib/format.utils'

interface Props {
  // Generic ownership (new)
  ownerType?: string
  ownerId?: string
  // Legacy (for backward compatibility)
  projectId?: string
  // UI props
  title?: string
  description?: string
  addButtonText?: string
  emptyStateText?: string
  uploadDialogDescription?: string
  initialDocuments?: Document[]
  displayMode?: 'cards' | 'table'
  showStats?: boolean
  availableTypes?: string[]
  allowedFileTypes?: string[]
  maxFileSize?: number // in MB
}

const props = withDefaults(defineProps<Props>(), {
  projectId: undefined,
  ownerType: undefined,
  ownerId: undefined,
  title: 'Documents',
  description: 'Manage your documents',
  addButtonText: 'Add document',
  emptyStateText: 'Start by adding your first document.',
  uploadDialogDescription: 'Upload a new document. Accepted formats: PDF, DOCX, XLSX, PPTX.',
  initialDocuments: () => [],
  displayMode: 'cards',
  showStats: true,
  availableTypes: () => [],
  allowedFileTypes: () => [],
  maxFileSize: 25
})

// Computed owner info (with backward compatibility)
const ownerInfo = computed(() => {
  if (props.ownerType && props.ownerId) {
    return { type: props.ownerType, id: props.ownerId }
  }
  if (props.projectId) {
    return { type: 'projects', id: props.projectId }
  }
  return null
})

const emit = defineEmits<{
  'documents-updated': [documents: Document[]]
  'document-uploaded': [document: Document]
  'document-deleted': [documentId: string]
}>()

// State
const documents = ref<Document[]>([...props.initialDocuments])
console.log('DocumentManager - initialDocuments received:', props.initialDocuments.length, props.initialDocuments)

// Watch for changes in initialDocuments prop
watch(() => props.initialDocuments, (newDocs) => {
  console.log('DocumentManager - initialDocuments changed:', newDocs.length, newDocs)
  documents.value = [...newDocs]
}, { deep: true })

const uploadDialogOpen = ref(false)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const newDocumentType = ref('')

// Computed
const stats = computed(() => {
  const total = documents.value.length
  const totalSize = documents.value.reduce((sum, doc) => {
    const sizeMatch = doc.size.match(/[\d.]+/)
    const size = sizeMatch ? parseFloat(sizeMatch[0]) : 0
    const multiplier = doc.size.includes('MB') ? 1024 * 1024 : 1024
    return sum + (size * multiplier)
  }, 0)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentCount = documents.value.filter(doc =>
    new Date(doc.uploadDate) > sevenDaysAgo
  ).length

  const byType = documents.value.reduce((acc, doc) => {
    const label = getTypeLabel(doc.type)
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return { total, totalSize, recentCount, byType }
})

const topTypes = computed(() =>
  Object.entries(stats.value.byType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
)

// Methods
const getTypeLabel = (type: string): string => {
  return documentTypeLabels[type] || type
}

const viewDocument = async (document: Document) => {
  if (!ownerInfo.value) {
    toast.error('View not available for this document type')
    return
  }
  try {
    await viewFromStorage(ownerInfo.value.type, ownerInfo.value.id, document.id)
  } catch (e: any) {
    toast.error(`View failed: ${e?.message || e}`)
  }
}

const downloadDocument = async (document: Document) => {
  if (!ownerInfo.value) {
    toast.error('Download not available for this document type')
    return
  }
  try {
    await downloadFromStorage(ownerInfo.value.type, ownerInfo.value.id, document.id, document.name)
    toast.success(`${document.name} downloaded`)
  } catch (e: any) {
    toast.error(`Download failed: ${e?.message || e}`)
  }
}

const deleteDocument = async (documentId: string) => {
  if (!ownerInfo.value) {
    toast.error('Delete not available for this document type')
    return
  }
  try {
    await deleteFromStorage(ownerInfo.value.type, ownerInfo.value.id, documentId)
    const index = documents.value.findIndex(doc => doc.id === documentId)
    if (index > -1) {
      const deletedDoc = documents.value[index]!
      documents.value.splice(index, 1)
      emit('document-deleted', documentId)
      emit('documents-updated', documents.value)
      toast.success(`${deletedDoc.name} deleted`)
    }
  } catch (e: any) {
    toast.error(`Delete failed: ${e?.message || e}`)
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    isDragging.value = false
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0]
  }
}

const detectFileType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeType = file.type.toLowerCase()

  // Try to match based on MIME type first
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('officedocument.wordprocessingml')) return 'docx'
  if (mimeType.includes('excel') || mimeType.includes('officedocument.spreadsheetml')) return 'xlsx'
  if (mimeType.includes('powerpoint') || mimeType.includes('officedocument.presentationml')) return 'pptx'
  if (mimeType.includes('text/plain')) return 'txt'
  if (mimeType.includes('text/csv')) return 'csv'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'

  // Fallback to extension
  if (extension) return extension

  return 'other'
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    toast.error('Please select a file')
    return
  }

  if (!ownerInfo.value) {
    toast.error('Upload not available for this document type')
    return
  }

  // File size validation
  if (selectedFile.value.size > props.maxFileSize * 1024 * 1024) {
    toast.error(`File size must be less than ${props.maxFileSize}MB`)
    return
  }

  // File type validation
  if (props.allowedFileTypes.length > 0) {
    const fileType = detectFileType(selectedFile.value)
    if (!props.allowedFileTypes.includes(fileType)) {
      toast.error(`File type not allowed. Accepted types: ${props.allowedFileTypes.join(', ')}`)
      return
    }
  }

  const fileType = props.availableTypes.length > 0 && newDocumentType.value
    ? newDocumentType.value
    : detectFileType(selectedFile.value)

  try {
    const { path } = await uploadToStorage({ ownerType: ownerInfo.value.type, ownerId: ownerInfo.value.id, file: selectedFile.value, type: fileType })
    const newDocument: Document = {
      id: path,
      name: selectedFile.value.name,
      type: fileType,
      uploadDate: new Date().toISOString(),
      size: `${(selectedFile.value.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedBy: 'You'
    }
    documents.value.unshift(newDocument)
    emit('document-uploaded', newDocument)
    emit('documents-updated', documents.value)

    // Reset form
    uploadDialogOpen.value = false
    selectedFile.value = null
    newDocumentType.value = ''

    toast.success('Document uploaded')
  } catch (e: any) {
    toast.error(`Upload failed: ${e?.message || e}`)
  }
}
</script>
