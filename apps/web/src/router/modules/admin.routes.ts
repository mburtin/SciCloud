import type { RouteRecordRaw } from 'vue-router'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('@/pages/admin/AdminSettingsPage.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
]

export default adminRoutes