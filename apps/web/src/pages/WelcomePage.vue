<template>
  <div class="min-h-screen bg-background flex">
    <!-- Left side - Illustration -->
    <div class="hidden lg:block lg:w-1/2 relative" style="background-color: #1e3a8a">
      <img src="@/assets/login_background.jpg" alt="Laboratory illustration" class="w-full h-full object-cover">
    </div>

    <!-- Right side - Content -->
    <div class="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div class="w-full max-w-md">
        <!-- Loading State -->
        <div v-if="isLoading" class="bg-white rounded-lg p-8 shadow-sm text-center">
          <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Beaker class="h-6 w-6 text-white" />
          </div>
          <h1 class="text-2xl font-medium text-gray-900 mb-4">
            LabManager Pro
          </h1>
          <div class="flex items-center justify-center space-x-2">
            <div class="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          <p class="text-gray-600 text-sm mt-4">
            Checking system status...
          </p>
        </div>

        <!-- Welcome Screen - No Users -->
        <div v-else-if="!hasUsers && !showCreateAdmin" class="bg-white rounded-lg p-8 shadow-sm">
          <!-- Header -->
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Beaker class="h-8 w-8 text-white" />
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-4">
              Welcome to LabManager Pro
            </h1>
            <p class="text-gray-600 text-lg leading-relaxed">
              Your comprehensive scientific laboratory management platform
            </p>
          </div>

          <!-- Features -->
          <div class="space-y-4 mb-8">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check class="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Project Management</h3>
                <p class="text-sm text-gray-600">Organize and track your research projects</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check class="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Equipment Tracking</h3>
                <p class="text-sm text-gray-600">Monitor instruments and consumables</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check class="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Team Collaboration</h3>
                <p class="text-sm text-gray-600">Work together with your research team</p>
              </div>
            </div>
          </div>

          <!-- Get Started Button -->
          <Button @click="showCreateAdmin = true"
            class="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-lg py-3">
            Get Started
            <ArrowRight class="h-5 w-5 ml-2" />
          </Button>
        </div>

        <!-- Success Message -->
        <div v-else-if="showSuccess" class="bg-white rounded-lg p-8 shadow-sm text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check class="h-8 w-8 text-green-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-4">
            Administrator Account Created!
          </h1>
          <p class="text-gray-600 mb-8">
            Your administrator account has been successfully created. You can now log in to access LabManager Pro.
          </p>
          <Button @click="goToLogin"
            class="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
            Go to Login
            <ArrowRight class="h-4 w-4 ml-2" />
          </Button>
        </div>

        <!-- Create Admin Form -->
        <div v-else-if="showCreateAdmin" class="bg-white rounded-lg p-8 shadow-sm">
          <!-- Back Button -->
          <div class="mb-6">
            <Button variant="ghost" class="mb-4 p-0 h-auto hover:bg-transparent" @click="showCreateAdmin = false">
              <ArrowLeft class="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <UserPlus class="h-6 w-6 text-white" />
            </div>
            <h1 class="text-2xl font-medium text-gray-900 mb-2">
              Create Administrator Account
            </h1>
            <p class="text-gray-600 text-sm">
              Set up the first admin account to get started
            </p>
          </div>

          <!-- Form -->
          <form class="space-y-4" @submit.prevent="handleCreateAdmin">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="firstName" class="text-gray-700">First name</Label>
                <Input id="firstName" v-model="adminForm.firstName" type="text" required placeholder="John"
                  class="mt-1" />
              </div>
              <div>
                <Label for="lastName" class="text-gray-700">Last name</Label>
                <Input id="lastName" v-model="adminForm.lastName" type="text" required placeholder="Doe" class="mt-1" />
              </div>
            </div>

            <div>
              <Label for="email" class="text-gray-700">Email</Label>
              <Input id="email" v-model="adminForm.email" type="email" required placeholder="admin@laboratory.com"
                class="mt-1" />
            </div>

            <div>
              <Label for="password" class="text-gray-700">Password</Label>
              <Input id="password" v-model="adminForm.password" type="password" required placeholder="••••••••"
                class="mt-1" />
              <p class="text-xs text-gray-500 mt-1">
                Minimum 8 characters required
              </p>
            </div>

            <div>
              <Label for="confirmPassword" class="text-gray-700">Confirm password</Label>
              <Input id="confirmPassword" v-model="adminForm.confirmPassword" type="password" required
                placeholder="••••••••" class="mt-1" />
            </div>

            <Button type="submit" class="w-full mt-6" :disabled="isCreatingAdmin">
              <span v-if="isCreatingAdmin" class="flex items-center">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating account...
              </span>
              <span v-else>Create Administrator Account</span>
            </Button>
          </form>

          <div class="text-center mt-6">
            <p class="text-sm text-gray-500">
              This account will have full system access
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/stores/user.store';
import { ArrowLeft, ArrowRight, Beaker, Check, UserPlus } from 'lucide-vue-next';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Composables
const router = useRouter();
const userStore = useUserStore();

// Component state
const isLoading = ref(true);
const hasUsers = ref(false);
const showCreateAdmin = ref(false);
const showSuccess = ref(false);
const isCreatingAdmin = ref(false);
const skipUserCheck = ref(false); // Flag to prevent auto-redirect after creation
const error = ref<string | null>(null);

const adminForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Check if users exist
const checkUsersExist = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const usersExist = await userStore.checkUsersExist();
    hasUsers.value = usersExist;

    // If users exist, redirect to login (but not if we're showing success message or should skip check)
    if (hasUsers.value && !showSuccess.value && !skipUserCheck.value) {
      router.push('/login');
    }
  } catch (err) {
    error.value = 'Failed to check system status. Please refresh the page.';
    console.error('Error checking users:', err);
  } finally {
    isLoading.value = false;
  }
};

// Create admin user
const handleCreateAdmin = async () => {
  // Validation
  if (adminForm.value.password !== adminForm.value.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }

  if (adminForm.value.password.length < 8) {
    error.value = 'Password must be at least 8 characters long';
    return;
  }

  try {
    isCreatingAdmin.value = true;
    error.value = null;

    const result = await userStore.createUser({
      email: adminForm.value.email,
      password: adminForm.value.password,
      first_name: adminForm.value.firstName,
      last_name: adminForm.value.lastName,
      role: 'admin'
    });

    if (result.success) {
      // Show success message instead of immediate redirect
      showCreateAdmin.value = false;
      showSuccess.value = true;
      // Update hasUsers to true to reflect the new state without re-checking
      hasUsers.value = true;
      // Skip any future user checks to prevent auto-redirect
      skipUserCheck.value = true;
    } else {
      error.value = result.error || 'Failed to create administrator account';
    }
  } catch (err) {
    error.value = 'An unexpected error occurred';
    console.error('Error creating admin:', err);
  } finally {
    isCreatingAdmin.value = false;
  }
};

// Navigate to login page
const goToLogin = () => {
  console.log('goToLogin called - attempting redirect to /login');
  router.push('/login');
};

// Initialize on mount
onMounted(() => {
  checkUsersExist();
});

// Watch route changes to trigger redirect check even on manual navigation
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/welcome' && !showSuccess.value && !skipUserCheck.value) {
    checkUsersExist();
  }
}, { immediate: true });
</script>
