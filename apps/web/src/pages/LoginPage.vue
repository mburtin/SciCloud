<template>
  <div class="min-h-screen bg-background flex">
    <!-- Test Dropdown - Fixed position -->
    <div class="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="bg-white/90 backdrop-blur-sm">
            <Settings class="h-4 w-4 mr-2" />
            Test Pages
            <ChevronDown class="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuItem 
            v-for="error in errorPages" 
            :key="error.code" 
            @click="navigateTo(error.page)"
          >
            {{ error.label }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Left side - Illustration -->
    <div class="hidden lg:block lg:w-1/2 relative" style="background-color: #1e3a8a">
      <img 
        src="@/assets/login_background.jpg" 
        alt="Laboratory illustration" 
        class="w-full h-full object-cover"
      >
    </div>

    <!-- Right side - Login Form -->
    <div v-if="!showRequestAccess && !showForgotPassword" class="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg p-8 shadow-sm">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Beaker class="h-6 w-6 text-white" />
            </div>
            <h1 class="text-2xl font-medium text-gray-900 mb-2">
              LabManager Pro
            </h1>
            <p class="text-gray-600 text-sm">
              Log in to your scientific management space
            </p>
          </div>

          <!-- Login Form -->
          <div class="mb-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Login
            </h2>
            <p class="text-sm text-gray-600 mb-6">
              Enter your credentials to access your laboratory
            </p>

            <form class="space-y-4" @submit.prevent="handleLogin">
              <div>
                <Label for="email" class="text-gray-700">Email</Label>
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="your.email@laboratory.com"
                  class="mt-1"
                />
              </div>
              
              <div>
                <Label for="password" class="text-gray-700">Password</Label>
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  class="mt-1"
                />
              </div>

              <Button type="submit" class="w-full mt-6">
                Log in
              </Button>
            </form>

            <div class="text-center mt-4">
              <button 
                type="button" 
                class="text-sm text-gray-500 hover:text-gray-700"
                @click="showForgotPassword = true"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <!-- Request Access -->
          <div class="pt-4 border-t border-gray-100">
            <p class="text-sm text-gray-600 text-center">
              Don't have an account yet?
              <button 
                type="button"
                class="text-primary hover:underline font-medium"
                @click="showRequestAccess = true"
              >
                Request access
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
          <Button
            variant="ghost"
            class="mb-4 p-0 h-auto hover:bg-transparent"
            @click="showRequestAccess = false"
          >
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to login
          </Button>
        </div>

        <div class="bg-white rounded-lg p-8 shadow-sm">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Beaker class="h-6 w-6 text-white" />
            </div>
            <h1 class="text-2xl font-medium text-gray-900 mb-2">
              LabManager Pro
            </h1>
            <p class="text-gray-600 text-sm">
              Request access to your scientific platform
            </p>
          </div>

          <!-- Form -->
          <form class="space-y-4" @submit.prevent="handleRequestAccess">
            <div>
              <Label for="firstName" class="text-gray-700">First name</Label>
              <Input
                id="firstName"
                v-model="requestForm.firstName"
                type="text"
                required
                placeholder="Your first name"
                class="mt-1"
              />
            </div>
            
            <div>
              <Label for="lastName" class="text-gray-700">Last name</Label>
              <Input
                id="lastName"
                v-model="requestForm.lastName"
                type="text"
                required
                placeholder="Your last name"
                class="mt-1"
              />
            </div>
            
            <div>
              <Label for="requestEmail" class="text-gray-700">Email</Label>
              <Input
                id="requestEmail"
                v-model="requestForm.email"
                type="email"
                required
                placeholder="your.email@example.com"
                class="mt-1"
              />
            </div>

            <Button type="submit" class="w-full mt-6">
              Send request
            </Button>
          </form>

          <div class="text-center mt-6">
            <p class="text-sm text-gray-500">
              You will receive a response within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Forgot Password Form -->
    <div v-if="showForgotPassword" class="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div class="w-full max-w-md">
        <div class="mb-6">
          <Button
            variant="ghost"
            class="mb-4 p-0 h-auto hover:bg-transparent"
            @click="showForgotPassword = false"
          >
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to login
          </Button>
        </div>

        <div class="bg-white rounded-lg p-8 shadow-sm">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Beaker class="h-6 w-6 text-white" />
            </div>
            <h1 class="text-2xl font-medium text-gray-900 mb-2">
              LabManager Pro
            </h1>
            <p class="text-gray-600 text-sm">
              Recover access to your account
            </p>
          </div>

          <!-- Form -->
          <form class="space-y-4" @submit.prevent="handleForgotPassword">
            <div>
              <Label for="forgotEmail" class="text-gray-700">Email</Label>
              <Input
                id="forgotEmail"
                v-model="forgotPasswordEmail"
                type="email"
                required
                placeholder="your.email@laboratory.com"
                class="mt-1"
              />
              <p class="text-sm text-gray-500 mt-2">
                We will send you a link to reset your password.
              </p>
            </div>

            <Button type="submit" class="w-full mt-6">
              Send recovery link
            </Button>
          </form>

          <div class="text-center mt-6">
            <p class="text-sm text-gray-500">
              You will receive the email within the next few minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Beaker, Settings, ChevronDown } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';

// Composables
const router = useRouter();
const authStore = useAuthStore();

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
  { code: '400', label: 'Error 400 - Bad Request', page: 'error-400' },
  { code: '401', label: 'Error 401 - Unauthorized', page: 'error-401' },
  { code: '403', label: 'Error 403 - Forbidden', page: 'error-403' },
  { code: '404', label: 'Error 404 - Not Found', page: 'error-404' },
  { code: '408', label: 'Error 408 - Timeout', page: 'error-408' },
  { code: '500', label: 'Error 500 - Server Error', page: 'error-500' },
];

// Event Handlers
const handleLogin = () => {
  // In a real app, you would call an authentication service here.
  // For now, we'll use the store to set the user as authenticated.
  authStore.login();

  // Navigate to the dashboard after login
  router.push('/dashboard');
};

const handleRequestAccess = () => {
  // Simulate sending request
  alert(`Access request sent for ${requestForm.value.firstName} ${requestForm.value.lastName}`);
  // Reset form and go back to login
  requestForm.value = { firstName: '', lastName: '', email: '' };
  showRequestAccess.value = false;
};

const handleForgotPassword = () => {
  // Simulate sending password reset email
  alert(`Recovery email sent to ${forgotPasswordEmail.value}`);
  // Reset form and go back to login
  forgotPasswordEmail.value = '';
  showForgotPassword.value = false;
};

const navigateTo = (page: string) => {
  router.push(`/${page}`);
};
</script>
