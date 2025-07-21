<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogDescription>
          Add a new document to the project. Accepted formats: PDF, DOCX, XLSX, PPTX.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <!-- Placeholder for a file dropzone -->
        <div class="grid gap-2">
          <Label for="file-upload">Document File</Label>
          <div 
            class="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg transition-colors"
            :class="{ 'border-primary bg-primary/10': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
          >
            <label for="file-upload" class="flex flex-col items-center justify-center w-full cursor-pointer">
              <div v-if="!selectedFile" class="text-center">
                <UploadCloud class="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p class="mb-1 text-sm text-muted-foreground"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                <p class="text-xs text-muted-foreground">Max file size: 25MB</p>
              </div>
              <div v-else class="text-center">
                <FileText class="w-8 h-8 mx-auto mb-2 text-primary" />
                <p class="text-sm font-medium">{{ selectedFile.name }}</p>
                <p class="text-xs text-muted-foreground">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
              </div>
              <input
                id="file-upload"
                type="file"
                class="hidden"
                @change="handleFileSelect"
              >
            </label>
          </div>
        </div> 
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button type="button" :disabled="!selectedFile" @click="handleSubmit">
          Upload
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ref } from 'vue';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileText } from 'lucide-vue-next';

defineProps<{ open: boolean }>();
const emit = defineEmits(['update:open', 'file-uploaded']);

const isDragging = ref(false);
const selectedFile = ref<File | null>(null);

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    isDragging.value = false;
  }
};

const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0];
  }
};

const handleSubmit = () => {
  if (selectedFile.value) {
    emit('file-uploaded', selectedFile.value);
    emit('update:open', false);
    selectedFile.value = null;
  }
};
</script>
