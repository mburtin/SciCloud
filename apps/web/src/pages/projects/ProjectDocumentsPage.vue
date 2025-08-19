<template>
  <div class="space-y-6">
    <DocumentManager v-if="projectId" title="Project Documents"
      description="Manage documents for Water Quality Analysis" owner-type="projects" :owner-id="projectId"
      :initial-documents="projectDocuments" :show-stats="true"
      :available-types="['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'csv', 'image', 'video', 'audio']" display-mode="cards"
      add-button-text="Add document" empty-state-text="Start by adding your first document to the project."
      upload-dialog-description="Upload a new document to the project. Accepted formats: PDF, DOCX, XLSX, PPTX."
      @document-uploaded="handleDocumentUploaded" @documents-updated="handleDocumentsUpdated" />
    <div v-else class="text-sm text-muted-foreground">Loading project...</div>
  </div>
</template>

<script setup lang="ts">
import DocumentManager from '@/components/shared/DocumentManager.vue'
import { listDocuments } from '@/services/documents.service'
import type { Document } from '@/types/documents'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const projectId = computed(() => {
  const id = (route.params.id as string) || ''
  console.log('ProjectDocumentsPage - route.params:', route.params, 'extracted projectId:', id)
  return id
})
const projectDocuments = ref<Document[]>([])

onMounted(async () => {
  if (!projectId.value) return
  try {
    projectDocuments.value = await listDocuments('projects', projectId.value)
    console.log('onMounted - projectDocuments loaded:', projectDocuments.value.length, projectDocuments.value)
  } catch (e) {
    console.error('Failed to load project documents', e)
  }
})

watch(projectId, async (id) => {
  if (!id) return
  try {
    projectDocuments.value = await listDocuments('projects', id)
    console.log('watch projectId - projectDocuments loaded:', projectDocuments.value.length, projectDocuments.value)
  } catch (e) {
    console.error('Failed to load project documents', e)
  }
})

const handleDocumentUploaded = async (document: Document) => {
  // Refresh the documents list from Supabase after upload
  try {
    projectDocuments.value = await listDocuments('projects', projectId.value)
  } catch (e) {
    console.error('Failed to refresh project documents', e)
    // Fallback: at least add locally
    projectDocuments.value.unshift(document)
  }
}

const handleDocumentsUpdated = (documents: Document[]) => {
  projectDocuments.value = documents
}
</script>
