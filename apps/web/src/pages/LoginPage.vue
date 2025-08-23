<template>
  <div class="min-h-screen bg-background flex">
    <!-- Language Switcher and Test Dropdown - Fixed position -->
    <div class="fixed top-4 right-4 z-50 flex gap-2">
      <LanguageSwitcher variant="outline" />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="bg-white/90 backdrop-blur-sm">
            <Settings class="h-4 w-4 mr-2" />
{{ t('common.labels.testPages') }}
            <ChevronDown class="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuItem v-for="error in errorPages" :key="error.code" @click="navigateTo(error.page)">
            {{ error.label }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Left side - Illustration -->
    <div class="hidden lg:block lg:w-1/2 relative" style="background-color: #1e3a8a">
      <img src="@/assets/login_background.jpg" :alt="t('app.description')" class="w-full h-full object-cover">
    </div>

    <!-- Right side - Login Form -->
    <div v-if="!showRequestAccess && !showForgotPassword"
      class="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg p-8 shadow-sm">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Beaker class="h-6 w-6 text-white" />
            </div>
            <h1 class="text-2xl font-medium text-gray-900 mb-2">
              {{ t('app.title') }}
            </h1>
            <p class="text-gray-600 text-sm">
              {{ t('auth.login.subtitle') }}
            </p>
          </div>

          <!-- Login Form -->
          <div class="mb-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              {{ t('auth.login.title') }}
            </h2>
            <p class="text-sm text-gray-600 mb-6">
              {{ t('auth.login.subtitle') }}
            </p>

            <form class="space-y-4" @submit.prevent="handleLogin">
              <div>
                <Label for="email" class="text-gray-700">{{ t('auth.login.email') }}</Label>
                <Input id="email" v-model="email" type="email" :placeholder="t('auth.login.emailPlaceholder')" class="mt-1" />
              </div>

              <div>
                <Label for="password" class="text-gray-700">{{ t('auth.login.password') }}</Label>
                <Input id="password" v-model="password" type="password" :placeholder="t('auth.login.passwordPlaceholder')" class="mt-1" />
              </div>

              <Button type="submit" class="w-full mt-6">
                {{ t('auth.login.signIn') }}
              </Button>
            </form>

            <div class="text-center mt-4">
              <button type="button" class="text-sm text-gray-500 hover:text-gray-700"
                @click="showForgotPassword = true">
                {{ t('auth.login.forgotPassword') }}
              </button>
            </div>
          </div>

          <!-- Request Access -->
          <div class="pt-4 border-t border-gray-100">
            <p class="text-sm text-gray-600 text-center">
              {{ t('auth.login.noAccount') }}
              <button type="button" class="text-primary hover:underline font-medium" @click="showRequestAccess = true">
                {{ t('auth.register.createAccount') }}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Request Access Form -->
    <div v-if="showRequestAccess" class="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div class="w-full max-w-md">
        <div class="mb-6">
          <Button variant="ghost" class="mb-4 p-0 h-auto hover:bg-transparent" @click="showRequestAccess = false">
            <ArrowLeft class="h-4 w-4 mr-2" />
            {{ t('common.actions.back') }}
          </Button>
        </div>

        <div class="bg-white rounded-lg p-8 shadow-sm">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Beaker class="h-6 w-6 text-white" />
            </div>
            <h1 class="text-2xl font-medium text-gray-900 mb-2">
              {{ t('app.title') }}
            </h1>
            <p class="text-gray-600 text-sm">
              {{ t('auth.register.subtitle') }}
            </p>
          </div>

          <!-- Form -->
          <form class="space-y-4" @submit.prevent="handleRequestAccess">
            <div>
              <Label for="firstName" class="text-gray-700">{{ t('auth.register.firstName') }}</Label>
              <Input id="firstName" v-model="requestForm.firstName" type="text" required :placeholder="t('auth.register.firstNamePlaceholder')"
                class="mt-1" />
            </div>

            <div>
              <Label for="lastName" class="text-gray-700">{{ t('auth.register.lastName') }}</Label>
              <Input id="lastName" v-model="requestForm.lastName" type="text" required :placeholder="t('auth.register.lastNamePlaceholder')"
                class="mt-1" />
            </div>

            <div>
              <Label for="requestEmail" class="text-gray-700">{{ t('auth.register.email') }}</Label>
              <Input id="requestEmail" v-model="requestForm.email" type="email" required
                :placeholder="t('auth.register.emailPlaceholder')" class="mt-1" />
            </div>

            <Button type="submit" class="w-full mt-6">
              {{ t('common.actions.submit') }}
            </Button>
          </form>

          <div class="text-center mt-6">
            <p class="text-sm text-gray-500">
              {{ t('common.messages.success') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Forgot Password Form -->
    <div v-if="showForgotPassword" class="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div class="w-full max-w-md">
        <div class="mb-6">
          <Button variant="ghost" class="mb-4 p-0 h-auto hover:bg-transparent" @click="showForgotPassword = false">
            <ArrowLeft class="h-4 w-4 mr-2" />
            {{ t('auth.forgotPassword.backToLogin') }}
          </Button>
        </div>

        <div class="bg-white rounded-lg p-8 shadow-sm">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Beaker class="h-6 w-6 text-white" />
            </div>
            <h1 class="text-2xl font-medium text-gray-900 mb-2">
              {{ t('app.title') }}
            </h1>
            <p class="text-gray-600 text-sm">
              {{ t('auth.forgotPassword.subtitle') }}
            </p>
          </div>

          <!-- Form -->
          <form class="space-y-4" @submit.prevent="handleForgotPassword">
            <div>
              <Label for="forgotEmail" class="text-gray-700">{{ t('auth.forgotPassword.email') }}</Label>
              <Input id="forgotEmail" v-model="forgotPasswordEmail" type="email" required
                :placeholder="t('auth.forgotPassword.emailPlaceholder')" class="mt-1" />
              <p class="text-sm text-gray-500 mt-2">
                {{ t('auth.forgotPassword.checkEmail') }}
              </p>
            </div>

            <Button type="submit" class="w-full mt-6">
              {{ t('auth.forgotPassword.sendInstructions') }}
            </Button>
          </form>

          <div class="text-center mt-6">
            <p class="text-sm text-gray-500">
              {{ t('auth.forgotPassword.checkEmail') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { useTranslation } from '@/composables/useLocale';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowLeft, Beaker, ChevronDown, Settings } from 'lucide-vue-next';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Composables
const router = useRouter();
const authStore = useAuthStore();
const { t } = useTranslation();

// Component state
const email = ref('');
const password = ref('');
const showRequestAccess = ref(false);
const showForgotPassword = ref(false);
const requestForm = ref({
  firstName: '',
  lastName: '',
  email: ''
});
const forgotPasswordEmail = ref('');

// Test data
const errorPages = [
  { code: '400', label: t('errors.400.label'), page: 'error/400' },
  { code: '401', label: t('errors.401.label'), page: 'error/401' },
  { code: '403', label: t('errors.403.label'), page: 'error/403' },
  { code: '404', label: t('errors.404.label'), page: 'error/404' },
  { code: '408', label: t('errors.408.label'), page: 'error/408' },
  { code: '500', label: t('errors.500.label'), page: 'error/500' },
];

// Event Handlers
const handleLogin = async () => {
  if (!email.value || !password.value) {
    alert(t('common.validation.required'));
    return;
  }

  try {
    const result = await authStore.login({
      email: email.value,
      password: password.value
    });

    if (result.success) {
      // Navigate to the dashboard after successful login
      router.push('/dashboard');
    } else {
      alert(t('common.messages.error') + ': ' + (result.error || t('common.messages.error')));
    }
  } catch (error) {
    console.error('Login error:', error);
    alert(t('common.messages.error') + ': ' + (error instanceof Error ? error.message : t('common.messages.error')));
  }
};

const handleRequestAccess = () => {
  // Simulate sending request
  alert(t('common.messages.success'));
  // Reset form and go back to login
  requestForm.value = { firstName: '', lastName: '', email: '' };
  showRequestAccess.value = false;
};

const handleForgotPassword = () => {
  // Simulate sending password reset email
  alert(t('auth.forgotPassword.checkEmail'));
  // Reset form and go back to login
  forgotPasswordEmail.value = '';
  showForgotPassword.value = false;
};

const navigateTo = (page: string) => {
  router.push(`/${page}`);
};
</script>
