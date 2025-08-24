<template>
  <div class="markdown-editor border border-border rounded-lg overflow-hidden">
    <!-- Toolbar -->
    <div class="border-b border-border bg-muted/30 p-2 flex items-center gap-1 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'bg-muted': editor?.isActive('bold') }"
        :disabled="!editor"
      >
        <Bold class="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="{ 'bg-muted': editor?.isActive('italic') }"
        :disabled="!editor"
      >
        <Italic class="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleStrike().run()"
        :class="{ 'bg-muted': editor?.isActive('strike') }"
        :disabled="!editor"
      >
        <Strikethrough class="h-4 w-4" />
      </Button>
      
      <div class="w-px h-6 bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'bg-muted': editor?.isActive('heading', { level: 1 }) }"
        :disabled="!editor"
      >
        <Heading1 class="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-muted': editor?.isActive('heading', { level: 2 }) }"
        :disabled="!editor"
      >
        <Heading2 class="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'bg-muted': editor?.isActive('heading', { level: 3 }) }"
        :disabled="!editor"
      >
        <Heading3 class="h-4 w-4" />
      </Button>
      
      <div class="w-px h-6 bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-muted': editor?.isActive('bulletList') }"
        :disabled="!editor"
      >
        <List class="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'bg-muted': editor?.isActive('orderedList') }"
        :disabled="!editor"
      >
        <ListOrdered class="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleBlockquote().run()"
        :class="{ 'bg-muted': editor?.isActive('blockquote') }"
        :disabled="!editor"
      >
        <Quote class="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleCodeBlock().run()"
        :class="{ 'bg-muted': editor?.isActive('codeBlock') }"
        :disabled="!editor"
      >
        <Code class="h-4 w-4" />
      </Button>
      
      <div class="w-px h-6 bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().undo().run()"
        :disabled="!editor?.can().undo()"
      >
        <Undo class="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().redo().run()"
        :disabled="!editor?.can().redo()"
      >
        <Redo class="h-4 w-4" />
      </Button>
    </div>
    
    <!-- Editor Content -->
    <div class="min-h-[300px] max-h-[600px] overflow-y-auto">
      <EditorContent 
        :editor="editor" 
        class="prose prose-sm max-w-none p-4 focus:outline-none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo
} from 'lucide-vue-next'
import { watch } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  editable?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Commencez à écrire votre note...',
  editable: true
})

const emit = defineEmits<Emits>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      }
    })
  ],
  editable: props.editable,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none',
      placeholder: props.placeholder
    }
  }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue)
  }
})

// Watch for editable changes
watch(() => props.editable, (newValue) => {
  if (editor.value) {
    editor.value.setEditable(newValue)
  }
})

// Expose editor instance for parent components
defineExpose({
  editor
})
</script>

<style scoped>
:deep(.ProseMirror) {
  outline: none;
  min-height: 300px;
  padding: 1rem;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(placeholder);
  float: left;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  height: 0;
}

:deep(.ProseMirror h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror h3) {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror ul, .ProseMirror ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

:deep(.ProseMirror blockquote) {
  border-left: 3px solid hsl(var(--border));
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: hsl(var(--muted-foreground));
}

:deep(.ProseMirror pre) {
  background: hsl(var(--muted));
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin: 0.5rem 0;
  overflow-x: auto;
}

:deep(.ProseMirror code) {
  background: hsl(var(--muted));
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-size: 0.875rem;
}
</style>
