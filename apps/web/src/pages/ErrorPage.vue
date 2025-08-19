<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Clock, Lock, Server, ShieldX, XCircle } from 'lucide-vue-next';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  errorCode: string
}>()

const router = useRouter()

const onBackToLogin = () => {
  router.push('/login')
}

const errorDetails = computed(() => {
  switch (props.errorCode) {
    case '400':
      return {
        icon: XCircle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100',
        title: 'Bad Request',
        message: 'The request sent to the server is incorrect or malformed. Please check the entered data and try again.'
      }
    case '401':
      return {
        icon: Lock,
        iconColor: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        title: 'Unauthorized',
        message: 'You must authenticate to access this resource. Your credentials are required or have expired.'
      }
    case '403':
      return {
        icon: ShieldX,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100',
        title: 'Forbidden',
        message: 'You do not have the necessary permissions to access this page. Contact your administrator if necessary.'
      }
    case '404':
      return {
        icon: AlertTriangle,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-100',
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist or has been moved. Check the URL or use the navigation to continue.'
      }
    case '408':
      return {
        icon: Clock,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-100',
        title: 'Request Timeout',
        message: 'The request took too long to be processed. Please try again or check your internet connection.'
      }
    case '500':
      return {
        icon: Server,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100',
        title: 'Server Error',
        message: 'An internal server error has occurred. We are working to resolve this issue. Please try again later.'
      }
    default:
      return {
        icon: AlertTriangle,
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-100',
        title: 'Unknown Error',
        message: 'An unexpected error has occurred.'
      }
  }
})
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-8">
    <div class="text-center max-w-md">
      <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" :class="errorDetails.bgColor">
        <component :is="errorDetails.icon" class="h-10 w-10" :class="errorDetails.iconColor" />
      </div>
      <h1 class="text-6xl font-medium text-gray-900 mb-4">
        {{ errorCode }}
      </h1>
      <h2 class="text-2xl font-medium text-gray-900 mb-4">
        {{ errorDetails.title }}
      </h2>
      <p class="text-gray-600 mb-8">
        {{ errorDetails.message }}
      </p>
      <Button class="w-full" @click="onBackToLogin">
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Login
      </Button>
    </div>
  </div>
</template>
