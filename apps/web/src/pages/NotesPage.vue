<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-border pb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            {{ isEditing ? (selectedNote?.title || t('notes.editNote')) : t('common.navigation.notes') }}
          </h1>
          <p class="text-muted-foreground mt-1">
            {{ isEditing ? t('notes.editingNote') : t('common.labels.personalNotes') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button v-if="isEditing" variant="outline" @click="cancelEdit">
            <ArrowLeft class="h-4 w-4 mr-2" />
            {{ t('common.actions.back') }}
          </Button>
          <Button v-if="!isEditing" @click="startCreating">
            <Plus class="h-4 w-4 mr-2" />
            {{ t('common.actions.create') }} {{ t('common.labels.note') }}
          </Button>
          <Button v-if="isEditing" @click="saveCurrentNote" :disabled="!currentNote.title.trim()">
            <Save class="h-4 w-4 mr-2" />
            {{ t('common.actions.save') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Note Editor -->
    <div v-if="isEditing" class="space-y-6">
      <!-- Note Title -->
      <div class="space-y-2">
        <Label for="note-title">{{ t('notes.title') }}</Label>
        <Input
          id="note-title"
          v-model="currentNote.title"
          :placeholder="t('notes.titlePlaceholder')"
          class="text-lg font-medium"
        />
      </div>
      
      <!-- Note Tags -->
      <div class="space-y-2">
        <Label for="note-tags">{{ t('notes.tags') }}</Label>
        <Input
          id="note-tags"
          v-model="tagsInput"
          :placeholder="t('notes.tagsPlaceholder')"
          @keydown.enter.prevent="addTag"
        />
        <div v-if="currentNote.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
          <Badge
            v-for="(tag, index) in currentNote.tags"
            :key="index"
            variant="secondary"
            class="cursor-pointer"
            @click="removeTag(index)"
          >
            {{ tag }}
            <X class="h-3 w-3 ml-1" />
          </Badge>
        </div>
      </div>
      
      <!-- Markdown Editor -->
      <div class="space-y-2">
        <Label>{{ t('notes.content') }}</Label>
        <MarkdownEditor
          v-model="currentNote.content"
          :placeholder="t('notes.contentPlaceholder')"
        />
      </div>
    </div>

    <!-- Notes List -->
    <div v-else-if="notes.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card 
        v-for="note in notes" 
        :key="note.id" 
        class="cursor-pointer hover:shadow-md transition-shadow"
        @click="editNote(note)"
      >
        <CardHeader>
          <CardTitle class="text-lg line-clamp-1">{{ note.title }}</CardTitle>
          <CardDescription class="text-sm text-muted-foreground">
            {{ formatDate(note.updated_at || note.created_at) }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="prose prose-sm max-w-none line-clamp-3" v-html="note.content"></div>
          <div v-if="note.tags.length > 0" class="flex flex-wrap gap-1 mt-3">
            <Badge 
              v-for="tag in note.tags.slice(0, 3)" 
              :key="tag" 
              variant="secondary" 
              class="text-xs"
            >
              {{ tag }}
            </Badge>
            <Badge v-if="note.tags.length > 3" variant="outline" class="text-xs">
              +{{ note.tags.length - 3 }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-else class="border-2 border-dashed border-border rounded-lg p-12 text-center">
      <FileText class="h-12 w-12 mx-auto text-muted-foreground" />
      <h3 class="mt-4 text-lg font-medium text-muted-foreground">
        {{ t('common.messages.noNotes') }}
      </h3>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ t('common.messages.createFirstNote') }}
      </p>
      <Button @click="startCreating" class="mt-4">
        <Plus class="h-4 w-4 mr-2" />
        {{ t('common.actions.create') }} {{ t('common.labels.note') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/composables/useLocale'
import { FileText, Plus, Save, ArrowLeft, X } from 'lucide-vue-next'
import MarkdownEditor from '@/components/editor/MarkdownEditor.vue'
import { format } from 'date-fns'
import { notesService, type Note, type NoteInsert } from '@/services/notes.service'

// Translation
const { t } = useTranslation()

// State
const notes = ref<Note[]>([])
const isEditing = ref(false)
const selectedNote = ref<Note | null>(null)
const currentNote = ref({
  title: '',
  content: '',
  tags: [] as string[]
})
const tagsInput = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

// Methods
const startCreating = () => {
  selectedNote.value = null
  currentNote.value = {
    title: '',
    content: '',
    tags: []
  }
  tagsInput.value = ''
  isEditing.value = true
}

const editNote = (note: Note) => {
  selectedNote.value = note
  currentNote.value = {
    title: note.title,
    content: note.content,
    tags: [...note.tags]
  }
  tagsInput.value = ''
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  selectedNote.value = null
  currentNote.value = {
    title: '',
    content: '',
    tags: []
  }
  tagsInput.value = ''
}

const addTag = () => {
  const tag = tagsInput.value.trim()
  if (tag && !currentNote.value.tags.includes(tag)) {
    currentNote.value.tags.push(tag)
    tagsInput.value = ''
  }
}

const removeTag = (index: number) => {
  currentNote.value.tags.splice(index, 1)
}

const saveCurrentNote = async () => {
  if (!currentNote.value.title.trim()) return
  
  isLoading.value = true
  error.value = null
  
  try {
    if (selectedNote.value) {
      // Update existing note
      const updatedNote = await notesService.updateNote(selectedNote.value.id, {
        title: currentNote.value.title.trim(),
        content: currentNote.value.content,
        tags: [...currentNote.value.tags]
      })
      
      const index = notes.value.findIndex(n => n.id === selectedNote.value!.id)
      if (index !== -1) {
        notes.value[index] = updatedNote
      }
    } else {
      // Create new note
      const noteData: NoteInsert = {
        title: currentNote.value.title.trim(),
        content: currentNote.value.content,
        tags: [...currentNote.value.tags]
      }
      
      const newNote = await notesService.createNote(noteData)
      notes.value.unshift(newNote)
    }
    
    // Exit editing mode
    cancelEdit()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd MMM yyyy')
}

const loadNotes = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const personalNotes = await notesService.getPersonalNotes()
    notes.value = personalNotes
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des notes'
  } finally {
    isLoading.value = false
  }
}

// Load notes on mount
onMounted(() => {
  loadNotes()
})
</script>
