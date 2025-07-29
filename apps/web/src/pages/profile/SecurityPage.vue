<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          Security
        </h1>
        <p class="text-muted-foreground">
          Manage your account's security settings
        </p>
      </div>
      <Button @click="saveAllSettings">
        Save Changes
      </Button>
    </div>

    <!-- Password Change -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Key class="h-5 w-5" /> Change Password
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="current-password">Current Password</Label>
          <Input id="current-password" v-model="passwordForm.current" type="password" />
        </div>
        <div class="space-y-2">
          <Label for="new-password">New Password</Label>
          <Input id="new-password" v-model="passwordForm.new" type="password" />
        </div>
        <div class="space-y-2">
          <Label for="confirm-password">Confirm New Password</Label>
          <Input id="confirm-password" v-model="passwordForm.confirm" type="password" />
        </div>
      </CardContent>
      <CardFooter>
        <Button @click="handlePasswordChange">
          Update Password
        </Button>
      </CardFooter>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 layout-section-gap">
      <!-- 2FA and Security Settings -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Fingerprint class="h-5 w-5" /> Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="space-y-1">
                <Label for="2fa-switch">Enable 2FA</Label>
                <p class="text-sm text-muted-foreground">
                  Protect your account with a second factor.
                </p>
              </div>
              <Switch id="2fa-switch" :checked="securitySettings.twoFactorEnabled" @update:checked="securitySettings.twoFactorEnabled = $event" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield class="h-5 w-5" /> Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="session-timeout">Session Timeout</Label>
              <Select v-model="securitySettings.sessionTimeout">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">
                    15 minutes
                  </SelectItem>
                  <SelectItem value="30">
                    30 minutes
                  </SelectItem>
                  <SelectItem value="60">
                    1 hour
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="space-y-1">
                <Label>Login Notifications</Label>
                <p class="text-sm text-muted-foreground">
                  Be alerted for new logins.
                </p>
              </div>
              <Switch :checked="securitySettings.loginNotifications" @update:checked="securitySettings.loginNotifications = $event" />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Active Sessions -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Monitor class="h-5 w-5" /> Active Sessions
          </CardTitle>
          <p class="text-sm text-muted-foreground">
            Manage sessions on other devices.
          </p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-for="session in activeSessions" :key="session.id" class="flex items-center justify-between p-3 border rounded-lg">
            <div class="flex items-center gap-3">
              <Monitor class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="font-medium">
                  {{ session.device }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ session.location }} • Last active {{ session.lastActive }}
                </p>
              </div>
            </div>
            <Button
              v-if="!session.isCurrent"
              variant="outline"
              size="sm"
              @click="terminateSession(session.id)"
            >
              Terminate
            </Button>
            <Badge v-else variant="secondary">
              Current
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Key, Fingerprint, Shield, Monitor } from 'lucide-vue-next';
import { mockActiveSessions } from '@/mocks/security.mock';

// State for password change form
const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
});

// State for other security settings
const securitySettings = ref({
  twoFactorEnabled: false,
  sessionTimeout: '30', // in minutes
  loginNotifications: true,
});

// Active sessions data
const activeSessions = ref(mockActiveSessions);

// --- Handlers ---
const handlePasswordChange = () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    alert('New passwords do not match.');
    return;
  }
  if (!passwordForm.value.new) {
    alert('New password cannot be empty.');
    return;
  }
  console.log('Changing password...', JSON.parse(JSON.stringify(passwordForm.value)));
  alert('Password change request sent!');
  // Reset form
  passwordForm.value = { current: '', new: '', confirm: '' };
};

const terminateSession = (sessionId: string) => {
  console.log('Terminating session:', sessionId);
  activeSessions.value = activeSessions.value.filter(s => s.id !== sessionId);
  alert(`Session ${sessionId} terminated.`);
};

const saveAllSettings = () => {
  console.log('Saving security settings:', JSON.parse(JSON.stringify(securitySettings.value)));
  alert('Security settings saved!');
};

</script>
