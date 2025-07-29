<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          Notifications
        </h1>
        <p class="text-muted-foreground">
          Manage your notification preferences
        </p>
      </div>
      <Button @click="saveSettings">
        Save Changes
      </Button>
    </div>

    <div class="grid layout-content-grid layout-section-gap">
      <!-- Left Column: Notification Types -->
      <div class="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Bell class="h-5 w-5" />
              Notification Types
            </CardTitle>
            <p class="text-sm text-muted-foreground">
              Select the types of notifications you want to receive.
            </p>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-for="(type, key) in settings.types" :key="key" class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center gap-4">
                <component :is="type.icon" class="h-6 w-6 text-muted-foreground" />
                <div>
                  <Label :for="key">{{ type.label }}</Label>
                  <p class="text-sm text-muted-foreground">
                    {{ type.description }}
                  </p>
                </div>
              </div>
              <Switch :id="key" :checked="type.enabled" @update:checked="type.enabled = $event" />
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
              Notification Methods
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-for="(method, key) in settings.methods" :key="key" class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label :for="key">{{ method.label }}</Label>
              </div>
              <Switch :id="key" :checked="method.enabled" @update:checked="method.enabled = $event" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Clock class="h-5 w-5" />
              Quiet Hours
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label for="quiet-hours">Enable quiet hours</Label>
                <p class="text-sm text-muted-foreground">
                  Pause notifications during specific times.
                </p>
              </div>
              <Switch id="quiet-hours" :checked="settings.quietHours.enabled" @update:checked="settings.quietHours.enabled = $event" />
            </div>
            <div v-if="settings.quietHours.enabled" class="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label for="quiet-start">Start</Label>
                <Select v-model="settings.quietHours.start">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="hour in 24" :key="`start-${hour-1}`" :value="`${(hour-1).toString().padStart(2, '0')}:00`">
                      {{ (hour-1).toString().padStart(2, '0') }}:00
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label for="quiet-end">End</Label>
                <Select v-model="settings.quietHours.end">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="hour in 24" :key="`end-${hour-1}`" :value="`${(hour-1).toString().padStart(2, '0')}:00`">
                      {{ (hour-1).toString().padStart(2, '0') }}:00
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
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Bell, Clock } from 'lucide-vue-next';
import { mockNotificationSettings } from '@/mocks/notification-settings.mock';

const settings = ref(mockNotificationSettings);

const saveSettings = () => {
  // In a real app, you would send this to your backend.
  console.log('Saving settings:', JSON.parse(JSON.stringify(settings.value)));
  // Here you can add a toast notification for feedback
  alert('Settings saved!');
};
</script>
