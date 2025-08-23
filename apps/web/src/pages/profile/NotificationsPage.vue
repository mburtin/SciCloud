<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          {{ t('profile.notifications.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ t('profile.notifications.subtitle') }}
        </p>
      </div>
      <Button @click="saveSettings">
        {{ t('profile.notifications.saveChanges') }}
      </Button>
    </div>

    <div class="grid layout-content-grid layout-section-gap">
      <!-- Left Column: Notification Types -->
      <div class="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Bell class="h-5 w-5" />
              {{ t('profile.notifications.notificationTypes') }}
            </CardTitle>
            <p class="text-sm text-muted-foreground">
              {{ t('profile.notifications.notificationTypesDescription') }}
            </p>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-for="(type, key) in settings.types" :key="key"
              class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center gap-4">
                <component :is="type.icon" class="h-6 w-6 text-muted-foreground" />
                <div>
                  <Label :for="key">{{ type.label }}</Label>
                  <p class="text-sm text-muted-foreground">
                    {{ type.description }}
                  </p>
                </div>
              </div>
              <Switch :id="key" :checked="settingsData.types[key].enabled" @update:checked="settingsData.types[key].enabled = $event" />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column: Methods & Quiet Hours -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Settings class="h-5 w-5" />
              {{ t('profile.notifications.notificationMethods') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-for="(method, key) in settings.methods" :key="key"
              class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label :for="key">{{ method.label }}</Label>
              </div>
              <Switch :id="key" :checked="settingsData.methods[key].enabled" @update:checked="settingsData.methods[key].enabled = $event" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Clock class="h-5 w-5" />
              {{ t('profile.notifications.quietHours') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label for="quiet-hours">{{ t('profile.notifications.enableQuietHours') }}</Label>
                <p class="text-sm text-muted-foreground">
                  {{ t('profile.notifications.quietHoursDescription') }}
                </p>
              </div>
              <Switch id="quiet-hours" :checked="settingsData.quietHours.enabled"
                @update:checked="settingsData.quietHours.enabled = $event" />
            </div>
            <div v-if="settingsData.quietHours.enabled" class="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label for="quiet-start">{{ t('profile.notifications.start') }}</Label>
                <Select v-model="settingsData.quietHours.start">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="hour in 24" :key="`start-${hour - 1}`"
                      :value="`${(hour - 1).toString().padStart(2, '0')}:00`">
                      {{ (hour - 1).toString().padStart(2, '0') }}:00
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label for="quiet-end">{{ t('profile.notifications.end') }}</Label>
                <Select v-model="settingsData.quietHours.end">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="hour in 24" :key="`end-${hour - 1}`"
                      :value="`${(hour - 1).toString().padStart(2, '0')}:00`">
                      {{ (hour - 1).toString().padStart(2, '0') }}:00
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Bell, Calendar, Clock, FileText, FolderKanban, Mail, Settings, Users } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useTranslation } from '@/composables/useLocale';

const { t } = useTranslation();

const settingsData = ref({
  methods: {
    email: { enabled: true },
    push: { enabled: true },
  },
  types: {
    projectUpdates: { icon: FolderKanban, enabled: true },
    documentUpdates: { icon: FileText, enabled: true },
    collaborationRequests: { icon: Users, enabled: true },
    systemAlerts: { icon: AlertTriangle, enabled: true },
    deadlineReminders: { icon: Calendar, enabled: false },
    weeklyDigest: { icon: Mail, enabled: false },
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
});

const settings = computed(() => ({
  methods: {
    email: { 
      label: t('profile.notifications.methods.email'), 
      enabled: settingsData.value.methods.email.enabled 
    },
    push: { 
      label: t('profile.notifications.methods.push'), 
      enabled: settingsData.value.methods.push.enabled 
    },
  },
  types: {
    projectUpdates: {
      label: t('profile.notifications.types.projectUpdates.label'),
      description: t('profile.notifications.types.projectUpdates.description'),
      icon: settingsData.value.types.projectUpdates.icon,
      enabled: settingsData.value.types.projectUpdates.enabled
    },
    documentUpdates: {
      label: t('profile.notifications.types.documentUpdates.label'),
      description: t('profile.notifications.types.documentUpdates.description'),
      icon: settingsData.value.types.documentUpdates.icon,
      enabled: settingsData.value.types.documentUpdates.enabled
    },
    collaborationRequests: {
      label: t('profile.notifications.types.collaborationRequests.label'),
      description: t('profile.notifications.types.collaborationRequests.description'),
      icon: settingsData.value.types.collaborationRequests.icon,
      enabled: settingsData.value.types.collaborationRequests.enabled
    },
    systemAlerts: {
      label: t('profile.notifications.types.systemAlerts.label'),
      description: t('profile.notifications.types.systemAlerts.description'),
      icon: settingsData.value.types.systemAlerts.icon,
      enabled: settingsData.value.types.systemAlerts.enabled
    },
    deadlineReminders: {
      label: t('profile.notifications.types.deadlineReminders.label'),
      description: t('profile.notifications.types.deadlineReminders.description'),
      icon: settingsData.value.types.deadlineReminders.icon,
      enabled: settingsData.value.types.deadlineReminders.enabled
    },
    weeklyDigest: {
      label: t('profile.notifications.types.weeklyDigest.label'),
      description: t('profile.notifications.types.weeklyDigest.description'),
      icon: settingsData.value.types.weeklyDigest.icon,
      enabled: settingsData.value.types.weeklyDigest.enabled
    },
  },
  quietHours: settingsData.value.quietHours,
}));

const saveSettings = () => {
  // In a real app, you would send this to your backend.
  console.log('Saving settings:', JSON.parse(JSON.stringify(settingsData.value)));
  // Here you can add a toast notification for feedback
  alert(t('profile.notifications.settingsSaved'));
};
</script>
