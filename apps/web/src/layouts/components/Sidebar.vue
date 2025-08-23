<template>
  <aside class="layout-sidebar h-full flex flex-col layout-content-padding sidebar-bg border-r border-sidebar-border">
    <div class="flex-grow overflow-y-auto pr-2">
      <div class="space-y-8">
        <div v-for="section in sidebarSections" :key="section.title">
          <h3 class="px-4 mb-2 text-sm font-semibold tracking-wider uppercase sidebar-section">
            {{ section.title }}
          </h3>
          <div class="space-y-1">
            <RouterLink v-for="item in section.items" :key="item.id" v-slot="{ href, navigate, isActive }" :to="item.to"
              custom>
              <a :href="href" :class="[
                'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
                isActive
                  ? 'sidebar-active shadow-lg'
                  : 'text-sidebar-foreground hover:sidebar-hover'
              ]" @click="navigate">
                <component :is="item.icon"
                  class="h-5 w-5 mr-3 text-sidebar-section-foreground group-hover:text-sidebar-primary transition-colors" />
                <span class="flex-1">{{ item.label }}</span>
                <Badge v-if="item.count" variant="secondary"
                  class="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                  {{ item.count }}
                </Badge>
              </a>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/stores/user.store'
import {
  Activity,
  Archive,
  Bell,
  Book,
  Calendar,
  Eye,
  FileText,
  Folder,
  LayoutDashboard,
  Lock,
  Microscope, Package,
  Star,
  User,
  Users
} from 'lucide-vue-next'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTranslation } from '@/composables/useLocale'

const route = useRoute()
const userStore = useUserStore()
const { t } = useTranslation()

// Load user profile on mount to check role
onMounted(async () => {
  if (!userStore.currentUserProfile) {
    await userStore.loadCurrentUserProfile()
  }
})

// Interface for sidebar items
interface SidebarItem {
  id: string
  label: string
  icon: any
  to: string
  count?: number
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

const settingsSection = computed((): SidebarSection => ({
  title: t('sidebar.settings'),
  items: [
    { id: 'profile', label: t('sidebar.profile'), icon: User, to: '/profile' },
    { id: 'notifications', label: t('sidebar.notifications'), icon: Bell, to: '/profile/notifications' },
    { id: 'security', label: t('sidebar.security'), icon: Lock, to: '/profile/security' }
  ]
}));

const myProjectsSection = computed((): SidebarSection => ({
  title: t('sidebar.myProjects'),
  items: [
    { id: 'active-projects', label: t('sidebar.activeProjects'), icon: Folder, to: '/projects' },
    { id: 'favorites', label: t('sidebar.favorites'), icon: Star, to: '/projects/favorites' },
    { id: 'archived', label: t('sidebar.archived'), icon: Archive, to: '/projects/archived' }
  ]
}));

const labSection = computed((): SidebarSection => ({
  title: t('sidebar.laboratory'),
  items: [
    { id: 'animals', label: t('sidebar.animals'), icon: Activity, to: '/lab/animals' },
    { id: 'instruments', label: t('sidebar.instruments'), icon: Microscope, to: '/lab/instruments' },
    { id: 'consumables', label: t('sidebar.consumables'), icon: Package, to: '/lab/consumables' }
  ]
}));

const adminSection = computed((): SidebarSection => ({
  title: t('sidebar.administration'),
  items: [
    { id: 'members', label: t('sidebar.members'), icon: Users, to: '/admin/settings' }
  ]
}));

// Sidebar sections based on the active module
const sidebarSections = computed<SidebarSection[]>(() => {
  const path = route.path;

  // Project Detail View
  if (path.startsWith('/projects/') && route.params.id) {
    const projectId = route.params.id as string;
    const projectDetailSection: SidebarSection = {
      title: t('sidebar.projectDetails'),
      items: [
        { id: 'summary', label: t('sidebar.summary'), icon: Eye, to: `/projects/${projectId}/summary` },
        { id: 'documents', label: t('sidebar.documents'), icon: FileText, to: `/projects/${projectId}/documents` },
        { id: 'notebook', label: t('sidebar.laboratoryNotebook'), icon: Book, to: `/projects/${projectId}/notebook` },
      ]
    };
    return [myProjectsSection.value, projectDetailSection];
  }

  // Main sections - order is important, from most specific to least
  if (path.startsWith('/admin')) {
    return [adminSection.value];
  }
  if (path.startsWith('/projects')) {
    return [myProjectsSection.value];
  }
  if (path.startsWith('/lab')) {
    return [labSection.value];
  }
  if (path.startsWith('/profile')) {
    return [settingsSection.value];
  }
  if (path.startsWith('/dashboard') || path.startsWith('/calendar') || path.startsWith('/notes') || path === '/') {
    return [
      {
        title: t('sidebar.workspace'),
        items: [
          { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard, to: '/dashboard' },
          { id: 'calendar', label: t('sidebar.calendar'), icon: Calendar, to: '/calendar' },
          { id: 'notes', label: t('sidebar.notes'), icon: FileText, to: '/notes' }
        ]
      }
    ];
  }

  // Default fallback
  return [];
});
</script>
