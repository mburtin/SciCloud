<template>
  <aside class="layout-sidebar h-full flex flex-col layout-content-padding sidebar-bg border-r border-sidebar-border">
    <div class="flex-grow overflow-y-auto pr-2">
      <div class="space-y-8">
        <div v-for="section in sidebarSections" :key="section.title">
          <h3 class="px-4 mb-2 text-sm font-semibold tracking-wider uppercase sidebar-section">
            {{ section.title }}
          </h3>
          <div class="space-y-1">
            <RouterLink
              v-for="item in section.items"
              :key="item.id"
              v-slot="{ href, navigate, isActive }"
              :to="item.to"
              custom
            >
              <a
                :href="href"
                :class="[
                  'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'sidebar-active shadow-lg'
                    : 'text-sidebar-foreground hover:sidebar-hover'
                ]"
                @click="navigate"
              >
                <component :is="item.icon" class="h-5 w-5 mr-3 text-sidebar-section-foreground group-hover:text-sidebar-primary transition-colors" />
                <span class="flex-1">{{ item.label }}</span>
                <Badge v-if="item.count" variant="secondary" class="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard, Folder, Star, Archive, Lock, Calendar, FileText, Eye, Book, Microscope, Package, Activity, User, Bell
} from 'lucide-vue-next'

const route = useRoute()

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

const settingsSection: SidebarSection = {
  title: 'Settings',
  items: [
    { id: 'profile', label: 'Profile', icon: User, to: '/profile' },
    { id: 'notifications', label: 'Notifications', icon: Bell, to: '/profile/notifications' },
    { id: 'security', label: 'Security', icon: Lock, to: '/profile/security' }
  ]
};

const myProjectsSection: SidebarSection = {
  title: 'MY PROJECTS',
  items: [
    { id: 'active-projects', label: 'Active projects', icon: Folder, to: '/projects' },
    { id: 'favorites', label: 'Favorites', icon: Star, to: '/projects/favorites' },
    { id: 'archived', label: 'Archived', icon: Archive, to: '/projects/archived' }
  ]
};

const labSection: SidebarSection = {
  title: 'Laboratory',
  items: [
    { id: 'animals', label: 'Animals', icon: Activity, to: '/lab/animals' },
    { id: 'instruments', label: 'Instruments', icon: Microscope, to: '/lab/instruments' },
    { id: 'consumables', label: 'Consumables', icon: Package, to: '/lab/consumables' }
  ]
};

// Sidebar sections based on the active module
const sidebarSections = computed<SidebarSection[]>(() => {
  const path = route.path;

  // Project Detail View
  if (path.startsWith('/projects/') && route.params.id) {
    const projectId = route.params.id as string;
    const projectDetailSection: SidebarSection = {
      title: 'PROJECT WQA',
      items: [
        { id: 'summary', label: 'Summary', icon: Eye, to: `/projects/${projectId}/summary` },
        { id: 'documents', label: 'Documents', icon: FileText, to: `/projects/${projectId}/documents` },
        { id: 'notebook', label: 'Laboratory notebook', icon: Book, to: `/projects/${projectId}/notebook` },
      ]
    };
    return [myProjectsSection, projectDetailSection];
  }

  // Main sections - order is important, from most specific to least
  if (path.startsWith('/projects')) {
    return [myProjectsSection];
  }
  if (path.startsWith('/lab')) {
    return [labSection];
  }
  if (path.startsWith('/profile')) {
    return [settingsSection];
  }
  if (path.startsWith('/dashboard') || path.startsWith('/calendar') || path.startsWith('/notes') || path === '/') {
    return [
      {
        title: 'Workspace',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
          { id: 'calendar', label: 'Calendar', icon: Calendar, to: '/calendar' },
          { id: 'notes', label: 'Notes', icon: FileText, to: '/notes' }
        ]
      }
    ];
  }

  // Default fallback
  return [];
});
</script>
