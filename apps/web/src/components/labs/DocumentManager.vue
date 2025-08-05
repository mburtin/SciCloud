<template>
  <div class="space-y-6">
    <!-- Header with statistics -->
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
              <Badge
                v-for="[type, count] in topTypes"
                :key="type"
                variant="secondary"
                class="text-xs"
              >
                {{ type }}: {{ count }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Add button -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Documents</h3>
        <p class="text-sm text-muted-foreground">
          Manage documents for {{ entityName }}
        </p>
      </div>
      <Button @click="uploadDialogOpen = true">
        <Plus class="h-4 w-4 mr-2" />
        Add document
      </Button>
    </div>

    <!-- Document list -->
    <div class="space-y-4">
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
                    {{ documentTypeLabels[document.type] }}
                  </Badge>
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ document.size }} • Uploaded {{ formatDate(document.uploadDate) }} by {{ document.uploadedBy }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="sm" @click="downloadDocument(document)">
                <Download class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="deleteDocument(document.id)">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div v-if="documents.length === 0" class="text-center py-8">
        <FileText class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 class="font-medium mb-2">No documents uploaded</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Start by adding a first document for this {{ entityType }}.
        </p>
        <Button @click="uploadDialogOpen = true">
          <Plus class="h-4 w-4 mr-2" />
          First document
        </Button>
      </div>
    </div>

    <!-- Upload dialog (simplified) -->
    <Dialog v-model:open="uploadDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document for {{ entityName }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Document Type</Label>
            <Select v-model="newDocumentType">
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="[value, label] in Object.entries(documentTypeLabels)"
                  :key="value"
                  :value="value"
                >
                  {{ label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>File Name</Label>
            <Input v-model="newDocumentName" placeholder="Document name" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="uploadDialogOpen = false">Cancel</Button>
          <Button @click="simulateUpload">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { FileText, TrendingUp, Plus, Download, Trash2 } from 'lucide-vue-next'
import type { AnimalDocument } from '@/types/lab'
import { documentTypeLabels } from '@/types/lab'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate, formatFileSize } from '@/utils/format.utils'

interface Props {
  entityType: string
  entityId: string
  entityName: string
  initialDocuments?: AnimalDocument[]
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialDocuments: () => [],
  showStats: true
})

const emit = defineEmits<{
  'add-documents': [documents: AnimalDocument[]]
}>()

const documents = ref<AnimalDocument[]>([...props.initialDocuments])
const uploadDialogOpen = ref(false)
const newDocumentType = ref('')
const newDocumentName = ref('')

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
    acc[documentTypeLabels[doc.type]] = (acc[documentTypeLabels[doc.type]] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return { total, totalSize, recentCount, byType }
})

const topTypes = computed(() => 
  Object.entries(stats.value.byType)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
)


const downloadDocument = (document: AnimalDocument) => {
  toast.info(`Downloading ${document.name}...`)
  // Simulate download
  setTimeout(() => {
    toast.success(`${document.name} downloaded successfully`)
  }, 1000)
}

const deleteDocument = (documentId: string) => {
  const index = documents.value.findIndex(doc => doc.id === documentId)
  if (index > -1) {
    const deletedDoc = documents.value[index]
    documents.value.splice(index, 1)
    toast.success(`${deletedDoc.name} deleted successfully`)
  }
}

const simulateUpload = () => {
  if (!newDocumentType.value || !newDocumentName.value) {
    toast.error('Please fill all fields')
    return
  }

  const newDoc: AnimalDocument = {
    id: `doc-${Date.now()}`,
    name: newDocumentName.value,
    type: newDocumentType.value as AnimalDocument['type'],
    uploadDate: new Date().toISOString().split('T')[0],
    size: '1.2 MB',
    uploadedBy: 'Current User'
  }

  documents.value.push(newDoc)
  emit('add-documents', [newDoc])
  
  uploadDialogOpen.value = false
  newDocumentType.value = ''
  newDocumentName.value = ''
  
  toast.success('Document uploaded successfully')
}
</script>