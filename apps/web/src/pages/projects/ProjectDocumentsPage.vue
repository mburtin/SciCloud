<template>
  <div class="space-y-6">
    <DocumentManager
      title="Project Documents"
      description="Manage documents for Water Quality Analysis"
      :initial-documents="projectDocuments"
      :show-stats="true"
      :available-types="['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'csv', 'image', 'video', 'audio']"
      display-mode="cards"
      add-button-text="Add document"
      empty-state-text="Start by adding your first document to the project."
      upload-dialog-description="Upload a new document to the project. Accepted formats: PDF, DOCX, XLSX, PPTX."
      @document-uploaded="handleDocumentUploaded"
      @documents-updated="handleDocumentsUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Document } from '@/types/documents'
import DocumentManager from '@/components/shared/DocumentManager.vue'
import { mockProjectDocuments } from '@/mocks/project-documents.mock';

// Convert Documents to Document format
const projectDocuments = computed((): Document[] => {
  return mockProjectDocuments.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.type.toLowerCase(),
    uploadDate: doc.uploadDate,
    size: doc.size,
    uploadedBy: doc.uploader,
    description: doc.description,
    tags: doc.tags
  }))
})

const handleDocumentUploaded = (document: Document) => {
  // Handle document upload - could save to store or API
  console.log('Document uploaded:', document)
}

const handleDocumentsUpdated = (documents: Document[]) => {
  // Handle documents update - could sync with store or API
  console.log('Documents updated:', documents)
}
</script>
