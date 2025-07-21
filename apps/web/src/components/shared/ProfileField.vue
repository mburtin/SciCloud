<template>
  <div class="group relative">
    <div v-if="!isEditing" class="flex justify-between items-start">
      <div>
        <label class="text-sm text-muted-foreground">{{ label }}</label>
        <p v-if="!multiline" class="text-base font-medium text-foreground">
          {{ value }}
        </p>
        <p v-else class="text-base font-medium text-foreground whitespace-pre-wrap">
          {{ value }}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        @click="startEditing"
      >
        <Pencil class="h-4 w-4" />
      </Button>
    </div>
    <div v-else class="space-y-2">
      <label class="text-sm text-muted-foreground">{{ label }}</label>
      <div class="flex items-center gap-2">
        <Input
          v-if="!multiline"
          v-model="editedValue"
          :type="type"
          class="flex-1"
          @keyup.enter="save"
          @keyup.esc="cancel"
        />
        <Textarea
          v-else
          v-model="editedValue"
          class="flex-1"
          @keyup.esc="cancel"
        />
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7"
          @click="save"
        >
          <Check class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7"
          @click="cancel"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Check, X } from 'lucide-vue-next';

const props = defineProps<{
  label: string;
  value: string;
  multiline?: boolean;
  type?: 'text' | 'email' | 'tel';
}>();

const emit = defineEmits(['update']);

const isEditing = ref(false);
const editedValue = ref('');

const startEditing = () => {
  editedValue.value = props.value;
  isEditing.value = true;
};

const save = () => {
  emit('update', editedValue.value);
  isEditing.value = false;
};

const cancel = () => {
  isEditing.value = false;
};
</script>
