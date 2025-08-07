/**
 * Navigation composable - Manages navigation modules
 */

import { ref, onMounted } from 'vue'
import { navigationService } from '@/services/navigation.service'
import type { NavigationModule } from '@/types/ui'

export function useNavigation() {
  // State
  const mainModules = ref<NavigationModule[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Methods
  const fetchMainModules = async () => {
    try {
      const modules = await navigationService.getMainModules()
      mainModules.value = modules
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load navigation'
    }
  }

  // Load data on mount
  onMounted(() => {
    fetchMainModules()
  })

  return {
    // State
    mainModules,
    isLoading,
    error,

    // Methods
    fetchMainModules
  }
}