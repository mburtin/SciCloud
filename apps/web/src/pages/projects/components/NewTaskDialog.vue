<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogDescription>
          Fill in the details below to add a new task to the project.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="task-name">Task Name</Label>
          <Input id="task-name" v-model="taskName" placeholder="e.g., Analyze experiment results" />
        </div>
        <div class="grid gap-2">
          <Label for="assignee">Assign To</Label>
          <Select v-model="assignee">
            <SelectTrigger>
              <SelectValue placeholder="Select a team member" />
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
          <Label for="due-date">Due Date</Label>
          <Input id="due-date" v-model="dueDate" type="date" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button type="button" :disabled="!taskName || !assignee || !dueDate" @click="handleSubmit">
          Add Task
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

defineProps<{ open: boolean }>();
const emit = defineEmits(['update:open', 'task-added']);

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
      status: 'Not Started',
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
