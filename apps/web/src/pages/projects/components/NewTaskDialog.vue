<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>{{ t('projects.tasks.add') }}</DialogTitle>
        <DialogDescription>
          {{ t('projects.tasks.addDescription') }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="task-name">{{ t('projects.tasks.name') }}</Label>
          <Input id="task-name" v-model="taskName" :placeholder="t('projects.tasks.namePlaceholder')" />
        </div>
        <div class="grid gap-2">
          <Label for="assignee">{{ t('projects.tasks.assignee') }}</Label>
          <Select v-model="assignee">
            <SelectTrigger>
              <SelectValue :placeholder="t('projects.tasks.selectMember')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="e.reed@scicloud.dev">
                Dr. Evelyn Reed
              </SelectItem>
              <SelectItem value="s.green@scicloud.dev">
                Dr. Samuel Green
              </SelectItem>
              <SelectItem value="j.miles@scicloud.dev">
                Jenna Miles
              </SelectItem>
              <SelectItem value="l.maxwell@scicloud.dev">
                Leo Maxwell
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2">
          <Label for="due-date">{{ t('projects.tasks.dueDate') }}</Label>
          <Input id="due-date" v-model="dueDate" type="date" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('update:open', false)">
          {{ t('common.actions.cancel') }}
        </Button>
        <Button type="button" :disabled="!taskName || !assignee || !dueDate" @click="handleSubmit">
          {{ t('projects.tasks.add') }}
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/composables/useLocale';
import { ref } from 'vue';

defineProps<{ open: boolean }>();
const emit = defineEmits(['update:open', 'task-added']);

const { t } = useTranslation();

const taskName = ref('');
const assignee = ref('');
const dueDate = ref('');

const team = [
  { email: 'e.reed@scicloud.dev', name: 'Dr. Evelyn Reed' },
  { email: 's.green@scicloud.dev', name: 'Dr. Samuel Green' },
  { email: 'j.miles@scicloud.dev', name: 'Jenna Miles' },
  { email: 'l.maxwell@scicloud.dev', name: 'Leo Maxwell' },
];

const handleSubmit = () => {
  if (taskName.value && assignee.value && dueDate.value) {
    const selectedMember = team.find(member => member.email === assignee.value);
    const newTask = {
      id: Date.now().toString(),
      name: taskName.value,
      assignee: selectedMember ? selectedMember.name : 'Unassigned',
      dueDate: dueDate.value,
      status: t('projects.tasks.notStarted'),
    };
    emit('task-added', newTask);
    emit('update:open', false);
    // Reset form
    taskName.value = '';
    assignee.value = '';
    dueDate.value = '';
  }
};
</script>
