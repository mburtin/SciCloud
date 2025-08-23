<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          {{ t('profile.security.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ t('profile.security.subtitle') }}
        </p>
      </div>
      <Button @click="saveAllSettings">
        {{ t('profile.security.saveSettings') }}
      </Button>
    </div>

    <!-- Password and Email Change -->
    <div class="grid grid-cols-1 lg:grid-cols-2 layout-section-gap">
      <!-- Password Change -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Key class="h-5 w-5" /> {{ t('profile.security.changePassword') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="current-password">{{ t('profile.security.currentPassword') }}</Label>
            <Input id="current-password" v-model="passwordForm.current" type="password"
              :class="{ 'border-red-500': passwordForm.current.length > 0 && !passwordValidation.currentNotEmpty }" />
          </div>
          <div class="space-y-2">
            <Label for="new-password">{{ t('profile.security.newPassword') }}</Label>
            <Input id="new-password" v-model="passwordForm.new" type="password" :class="{
              'border-red-500': passwordMessages.newPassword.error,
              'border-green-500': passwordMessages.newPassword.success && passwordForm.new.length > 0
            }" />
            <p v-if="passwordMessages.newPassword.error" class="text-sm text-red-500">
              {{ passwordMessages.newPassword.error }}
            </p>
            <p v-if="passwordMessages.newPassword.success && !passwordMessages.newPassword.error"
              class="text-sm text-green-600">
              {{ passwordMessages.newPassword.success }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="confirm-password">{{ t('profile.security.confirmNewPassword') }}</Label>
            <Input id="confirm-password" v-model="passwordForm.confirm" type="password" :class="{
              'border-red-500': passwordMessages.confirmPassword.error,
              'border-green-500': passwordMessages.confirmPassword.success && passwordForm.confirm.length > 0
            }" />
            <p v-if="passwordMessages.confirmPassword.error" class="text-sm text-red-500">
              {{ passwordMessages.confirmPassword.error }}
            </p>
            <p v-if="passwordMessages.confirmPassword.success && !passwordMessages.confirmPassword.error"
              class="text-sm text-green-600">
              {{ passwordMessages.confirmPassword.success }}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button @click="handlePasswordChange"
            :disabled="isUpdatingPassword || !passwordValidation.currentNotEmpty || !passwordValidation.newMinLength || !passwordValidation.passwordsMatch || !passwordValidation.newDifferentFromCurrent">
            {{ isUpdatingPassword ? t('profile.security.updating') : t('profile.security.updatePassword') }}
          </Button>
        </CardFooter>
      </Card>

      <!-- Email Change -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Mail class="h-5 w-5" /> {{ t('profile.security.changeEmail') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="new-email">{{ t('profile.security.newEmail') }}</Label>
            <Input id="new-email" v-model="emailForm.new" type="email" :class="{
              'border-red-500': emailMessages.newEmail.error,
              'border-green-500': emailMessages.newEmail.success && emailForm.new.length > 0
            }" />
            <p v-if="emailMessages.newEmail.error" class="text-sm text-red-500">
              {{ emailMessages.newEmail.error }}
            </p>
            <p v-if="emailMessages.newEmail.success && !emailMessages.newEmail.error" class="text-sm text-green-600">
              {{ emailMessages.newEmail.success }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="confirm-email">{{ t('profile.security.confirmNewEmail') }}</Label>
            <Input id="confirm-email" v-model="emailForm.confirm" type="email" :class="{
              'border-red-500': emailMessages.confirmEmail.error,
              'border-green-500': emailMessages.confirmEmail.success && emailForm.confirm.length > 0
            }" />
            <p v-if="emailMessages.confirmEmail.error" class="text-sm text-red-500">
              {{ emailMessages.confirmEmail.error }}
            </p>
            <p v-if="emailMessages.confirmEmail.success && !emailMessages.confirmEmail.error"
              class="text-sm text-green-600">
              {{ emailMessages.confirmEmail.success }}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button @click="handleEmailChange"
            :disabled="isUpdatingEmail || !emailValidation.newValidFormat || !emailValidation.emailsMatch">
            {{ isUpdatingEmail ? t('profile.security.updating') : t('profile.security.updateEmail') }}
          </Button>
        </CardFooter>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 layout-section-gap">
      <!-- 2FA and Security Settings -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Fingerprint class="h-5 w-5" /> {{ t('profile.security.twoFactorAuth') }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="space-y-1">
                <Label for="2fa-switch">{{ t('profile.security.enable2FA') }}</Label>
                <p class="text-sm text-muted-foreground">
                  {{ t('profile.security.twoFactorDescription') }}
                </p>
              </div>
              <Switch id="2fa-switch" :checked="securitySettings.twoFactorEnabled"
                @update:checked="securitySettings.twoFactorEnabled = $event" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield class="h-5 w-5" /> {{ t('profile.security.securitySettings') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="session-timeout">{{ t('profile.security.sessionTimeout') }}</Label>
              <Select v-model="securitySettings.sessionTimeout">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">
                    {{ t('profile.security.sessionTimeouts.15') }}
                  </SelectItem>
                  <SelectItem value="30">
                    {{ t('profile.security.sessionTimeouts.30') }}
                  </SelectItem>
                  <SelectItem value="60">
                    {{ t('profile.security.sessionTimeouts.60') }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="space-y-1">
                <Label>{{ t('profile.security.loginNotifications') }}</Label>
                <p class="text-sm text-muted-foreground">
                  {{ t('profile.security.loginNotificationsDescription') }}
                </p>
              </div>
              <Switch :checked="securitySettings.loginNotifications"
                @update:checked="securitySettings.loginNotifications = $event" />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Active Sessions -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Monitor class="h-5 w-5" /> {{ t('profile.security.activeSessions') }}
          </CardTitle>
          <p class="text-sm text-muted-foreground">
            {{ t('profile.security.manageSessionsDescription') }}
          </p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="currentSession" class="flex items-center justify-between p-3 border rounded-lg">
            <div class="flex items-center gap-3">
              <Monitor class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="font-medium">
                  {{ t('profile.security.currentBrowserSession') }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ t('profile.security.expires') }}: {{ new Date(currentSession.expires_at || 0).toLocaleString() }}
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <Badge variant="secondary">
                {{ t('profile.security.current') }}
              </Badge>
            </div>
          </div>
          <div v-else class="text-center py-4 text-muted-foreground">
            {{ t('profile.security.noActiveSessions') }}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useNotification } from '@/composables/useNotification';
import { useAuthStore } from '@/stores/auth.store';
import { useUserStore } from '@/stores/user.store';
import { Fingerprint, Key, Mail, Monitor, Shield } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useTranslation } from '@/composables/useLocale';

const { t } = useTranslation();

// State for password change form
const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
});

// State for email change form
const emailForm = ref({
  new: '',
  confirm: ''
});

// Loading states
const isUpdatingPassword = ref(false);
const isUpdatingEmail = ref(false);

// Password validation computed properties
const passwordValidation = computed(() => {
  const form = passwordForm.value;
  return {
    currentNotEmpty: form.current.length > 0,
    newNotEmpty: form.new.length > 0,
    newMinLength: form.new.length >= 6,
    passwordsMatch: form.new === form.confirm && form.new.length > 0,
    confirmNotEmpty: form.confirm.length > 0,
    newDifferentFromCurrent: form.current !== form.new || form.current.length === 0
  };
});

// Email validation computed properties
const emailValidation = computed(() => {
  const form = emailForm.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    newNotEmpty: form.new.length > 0,
    newValidFormat: emailRegex.test(form.new),
    emailsMatch: form.new === form.confirm && form.new.length > 0,
    confirmNotEmpty: form.confirm.length > 0
  };
});

// Password validation messages
const passwordMessages = computed(() => ({
  newPassword: {
    error: passwordValidation.value.newNotEmpty && !passwordValidation.value.newMinLength
      ? t('profile.security.validation.passwordMinLength')
      : passwordValidation.value.newNotEmpty && !passwordValidation.value.newDifferentFromCurrent
        ? t('profile.security.validation.passwordMustDiffer')
        : '',
    success: passwordValidation.value.newMinLength && passwordValidation.value.newDifferentFromCurrent ? t('profile.security.validation.validPassword') : ''
  },
  confirmPassword: {
    error: passwordValidation.value.confirmNotEmpty && !passwordValidation.value.passwordsMatch
      ? t('profile.security.validation.passwordsNoMatch')
      : '',
    success: passwordValidation.value.passwordsMatch ? t('profile.security.validation.passwordsMatch') : ''
  }
}));

// Email validation messages
const emailMessages = computed(() => ({
  newEmail: {
    error: emailValidation.value.newNotEmpty && !emailValidation.value.newValidFormat
      ? t('profile.security.validation.invalidEmail')
      : '',
    success: emailValidation.value.newValidFormat ? t('profile.security.validation.validEmail') : ''
  },
  confirmEmail: {
    error: emailValidation.value.confirmNotEmpty && !emailValidation.value.emailsMatch
      ? t('profile.security.validation.emailsNoMatch')
      : '',
    success: emailValidation.value.emailsMatch ? t('profile.security.validation.emailsMatch') : ''
  }
}));

// State for other security settings
const securitySettings = ref({
  twoFactorEnabled: false,
  sessionTimeout: '30', // in minutes
  loginNotifications: true,
});

// Get stores
const authStore = useAuthStore();
const userStore = useUserStore();
const notification = useNotification();

const currentSession = computed(() => authStore.session);
const currentUser = computed(() => authStore.user);

// --- Handlers ---
const handlePasswordChange = async () => {
  // Use real-time validation instead of manual checks
  const validation = passwordValidation.value;

  if (!validation.currentNotEmpty) {
    notification.error(t('profile.security.notifications.currentPasswordRequired'), t('profile.security.notifications.currentPasswordRequiredDesc'));
    return;
  }
  if (!validation.newNotEmpty) {
    notification.error(t('profile.security.notifications.newPasswordRequired'), t('profile.security.notifications.newPasswordRequiredDesc'));
    return;
  }
  if (!validation.newMinLength) {
    notification.error(t('profile.security.notifications.passwordTooShort'), t('profile.security.notifications.passwordTooShortDesc'));
    return;
  }
  if (!validation.newDifferentFromCurrent) {
    notification.warning(t('profile.security.notifications.samePassword'), t('profile.security.notifications.samePasswordDesc'));
    return;
  }
  if (!validation.passwordsMatch) {
    notification.error(t('profile.security.notifications.passwordsDontMatch'), t('profile.security.notifications.passwordsDontMatchDesc'));
    return;
  }

  if (!currentUser.value?.email) {
    notification.error(t('profile.security.notifications.userError'), t('profile.security.notifications.userErrorDesc'));
    return;
  }

  isUpdatingPassword.value = true;

  try {
    const result = await userStore.updatePassword(
      passwordForm.value.current,
      passwordForm.value.new,
      currentUser.value.email
    );

    if (result.success) {
      notification.success(t('profile.security.notifications.success'), t('profile.security.notifications.passwordUpdatedSuccess'));
      // Reset form
      passwordForm.value = { current: '', new: '', confirm: '' };
    } else {
      notification.error(t('profile.security.notifications.updateFailed'), result.error || t('profile.security.notifications.passwordUpdateFailed'));
    }
  } catch (error) {
    notification.error(t('profile.security.notifications.unexpectedError'), t('profile.security.notifications.unexpectedErrorDesc'));
  } finally {
    isUpdatingPassword.value = false;
  }
};

const handleEmailChange = async () => {
  // Use real-time validation instead of manual checks
  const validation = emailValidation.value;

  if (!validation.newNotEmpty) {
    notification.error(t('profile.security.notifications.emailRequired'), t('profile.security.notifications.emailRequiredDesc'));
    return;
  }
  if (!validation.newValidFormat) {
    notification.error(t('profile.security.notifications.invalidEmail'), t('profile.security.notifications.invalidEmailDesc'));
    return;
  }
  if (!validation.emailsMatch) {
    notification.error(t('profile.security.notifications.emailsDontMatch'), t('profile.security.notifications.emailsDontMatchDesc'));
    return;
  }

  isUpdatingEmail.value = true;

  try {
    const result = await userStore.updateEmail(emailForm.value.new);

    if (result.success) {
      notification.success(t('profile.security.notifications.emailUpdated'), t('profile.security.notifications.emailUpdatedDesc'));
      // Reset form
      emailForm.value = { new: '', confirm: '' };
    } else {
      notification.error(t('profile.security.notifications.updateFailed'), result.error || t('profile.security.notifications.emailUpdateFailed'));
    }
  } catch (error) {
    notification.error(t('profile.security.notifications.unexpectedError'), t('profile.security.notifications.unexpectedErrorDesc'));
  } finally {
    isUpdatingEmail.value = false;
  }
};

// Format timestamp to readable string


const saveAllSettings = () => {
  console.log('Saving security settings:', JSON.parse(JSON.stringify(securitySettings.value)));
  alert(t('profile.security.settingsSaved'));
};

</script>
