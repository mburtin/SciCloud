<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogDescription>
          Enter the email of the person you want to add to this project.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="m@example.com"
          />
        </div>
        <div class="grid gap-2">
          <Label for="role">Role</Label>
          <Select v-model="role">
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Co-Investigator">
                Co-Investigator
              </SelectItem>
              <SelectItem value="Lab Technician">
                Lab Technician
              </SelectItem>
              <SelectItem value="PhD Student">
                PhD Student
              </SelectItem>
              <SelectItem value="Collaborator">
                Collaborator
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button type="button" :disabled="!email || !role" @click="handleSubmit">
          Add Member
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
const emit = defineEmits(['update:open', 'member-added']);

const email = ref('');
const role = ref('');

const handleSubmit = () => {
  if (email.value && role.value) {
    // In a real app, you'd fetch user details by email.
    // Here, we'll generate a placeholder name.
    const name = email.value.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const newMember = {
      id: Date.now().toString(),
      name: name,
      role: role.value,
      email: email.value,
      avatar: `/avatars/${(Math.floor(Math.random() * 5) + 1).toString().padStart(2, '0')}.png`,
    };
    emit('member-added', newMember);
    emit('update:open', false);
    // Reset form
    email.value = '';
    role.value = '';
  }
};
</script>
