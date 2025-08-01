import type { NavigationModule } from '@/types/ui'

export const mockMainModules: NavigationModule[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', to: '/dashboard' },
  { id: 'laboratory', label: 'Laboratory', icon: 'test-tube', to: '/lab/animals' },
  { id: 'projects', label: 'Projects', icon: 'folder-open', to: '/projects' },
]