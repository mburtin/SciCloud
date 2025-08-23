<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t('projects.members.add') }}</DialogTitle>
        <DialogDescription>
          {{ t('projects.members.addDescription') }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="email">{{ t('common.labels.email') }}</Label>
          <Input id="email" v-model="email" type="email" :placeholder="t('projects.members.emailPlaceholder')" />
        </div>
        <div class="grid gap-2">
          <Label for="role">{{ t('projects.members.role') }}</Label>
          <Select v-model="role">
            <SelectTrigger>
              <SelectValue :placeholder="t('projects.members.selectRole')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Co-Investigator">
                {{ t('projects.roles.coInvestigator') }}
              </SelectItem>
              <SelectItem value="Lab Technician">
                {{ t('projects.roles.labTechnician') }}
              </SelectItem>
              <SelectItem value="PhD Student">
                {{ t('projects.roles.phdStudent') }}
              </SelectItem>
              <SelectItem value="Collaborator">
                {{ t('projects.roles.collaborator') }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('update:open', false)">
          {{ t('common.actions.cancel') }}
        </Button>
        <Button type="button" :disabled="!email || !role" @click="handleSubmit">
          {{ t('projects.members.add') }}
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
const emit = defineEmits(['update:open', 'member-added']);

const { t } = useTranslation();

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
