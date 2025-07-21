import { LayoutDashboard, TestTube, FolderOpen } from 'lucide-vue-next'

export interface NavigationModule {
  id: string
  label: string
  icon: any
  to: string
}

export const mockMainModules: NavigationModule[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { id: 'laboratory', label: 'Laboratory', icon: TestTube, to: '/lab/animals' },
  { id: 'projects', label: 'Projects', icon: FolderOpen, to: '/projects' },
]