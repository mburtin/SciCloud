<template>
  <div>
    <NewMemberDialog :open="isNewMemberDialogOpen" @update:open="isNewMemberDialogOpen = $event"
      @member-added="handleMemberAdded" />
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">
          {{ t('projects.members.title') }}
        </h3>
        <Button size="sm" @click="isNewMemberDialogOpen = true">
          <UserPlus class="h-4 w-4 mr-2" />
          {{ t('projects.members.add') }}
        </Button>
      </div>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="member in team" :key="member.id">
          <CardHeader class="flex flex-row items-center gap-4">
            <Avatar>
              <AvatarImage :src="member.avatar" :alt="member.name" />
              <AvatarFallback>{{ member.name.charAt(0) }}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle class="text-base">
                {{ member.name }}
              </CardTitle>
              <CardDescription>{{ member.role }}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div class="flex items-center text-sm text-muted-foreground">
              <Mail class="h-4 w-4 mr-2" />
              <span>{{ member.email }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/composables/useLocale';
import { Mail, UserPlus } from 'lucide-vue-next';
import { ref } from 'vue';
import NewMemberDialog from './NewMemberDialog.vue';

const isNewMemberDialogOpen = ref(false);
const { t } = useTranslation();

const handleMemberAdded = (newMember: any) => {
  team.value.unshift(newMember);
};

const team = ref([
  {
    id: '1',
    name: 'Dr. Evelyn Reed',
    role: 'Principal Investigator',
    email: 'e.reed@scicloud.dev',
    avatar: '/avatars/01.png',
  },
  {
    id: '2',
    name: 'Dr. Samuel Green',
    role: 'Co-Investigator',
    email: 's.green@scicloud.dev',
    avatar: '/avatars/02.png',
  },
  {
    id: '3',
    name: 'Jenna Miles',
    role: 'Lab Technician',
    email: 'j.miles@scicloud.dev',
    avatar: '/avatars/03.png',
  },
  {
    id: '4',
    name: 'Leo Maxwell',
    role: 'PhD Student',
    email: 'l.maxwell@scicloud.dev',
    avatar: '/avatars/04.png',
  },
]);
</script>
