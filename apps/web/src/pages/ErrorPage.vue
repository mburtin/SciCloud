<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/composables/useLocale';
import { AlertTriangle, ArrowLeft, Clock, Lock, Server, ShieldX, XCircle } from 'lucide-vue-next';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  errorCode: string
}>()

const router = useRouter()
const { t } = useTranslation()

const onBackToLogin = () => {
  router.push('/login')
}

const errorDetails = computed(() => {
  const getErrorTranslation = (code: string) => {
    const key = `errors.${code}`
    return {
      title: t(`${key}.title`),
      message: t(`${key}.message`)
    }
  }

  switch (props.errorCode) {
    case '400':
      return {
        icon: XCircle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100',
        ...getErrorTranslation('400')
      }
    case '401':
      return {
        icon: Lock,
        iconColor: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        ...getErrorTranslation('401')
      }
    case '403':
      return {
        icon: ShieldX,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100',
        ...getErrorTranslation('403')
      }
    case '404':
      return {
        icon: AlertTriangle,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-100',
        ...getErrorTranslation('404')
      }
    case '408':
      return {
        icon: Clock,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-100',
        ...getErrorTranslation('408')
      }
    case '500':
      return {
        icon: Server,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100',
        ...getErrorTranslation('500')
      }
    default:
      return {
        icon: AlertTriangle,
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-100',
        ...getErrorTranslation('unknown')
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
        {{ t('errors.backToLogin') }}
      </Button>
    </div>
  </div>
</template>
