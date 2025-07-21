<template>
  <div>
    <DocumentUploadDialog :open="isUploadDialogOpen" @update:open="isUploadDialogOpen = $event" @file-uploaded="handleFileUploaded" />
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">
          Project Documents
        </h3>
        <Button size="sm" @click="isUploadDialogOpen = true">
          <Upload class="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
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
              <TableRow v-for="doc in documents" :key="doc.id">
                <TableCell class="font-medium">
                  {{ doc.name }}
                </TableCell>
                <TableCell>{{ doc.type }}</TableCell>
                <TableCell>{{ doc.size }}</TableCell>
                <TableCell>{{ doc.uploadedOn }}</TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow v-if="documents.length === 0">
                <TableCell colspan="5" class="text-center text-muted-foreground py-8">
                  No documents yet.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, MoreHorizontal } from 'lucide-vue-next';
import DocumentUploadDialog from './DocumentUploadDialog.vue';

const isUploadDialogOpen = ref(false);

const documents = ref([
  {
    id: '1',
    name: 'protocol_v1.pdf',
    type: 'PDF',
    size: '2.3 MB',
    uploadedOn: '2024-07-15',
  },
  {
    id: '2',
    name: 'research_data.xlsx',
    type: 'Excel',
    size: '5.1 MB',
    uploadedOn: '2024-07-12',
  },
  {
    id: '3',
    name: 'presentation_slides.pptx',
    type: 'PowerPoint',
    size: '10.8 MB',
    uploadedOn: '2024-07-10',
  },
]);

const handleFileUploaded = (file: File) => {
  const newDocument = {
    id: (documents.value.length + 1).toString(),
    name: file.name,
    type: file.type.split('/')[1]?.toUpperCase() || 'File',
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    uploadedOn: new Date().toISOString().split('T')[0],
  };
  documents.value.unshift(newDocument);
};
</script>
