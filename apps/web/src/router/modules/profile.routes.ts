import type { RouteRecordRaw } from 'vue-router';

const profileRoutes: RouteRecordRaw[] = [
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/profile/ProfilePage.vue'),
  },
  {
    path: '/profile/notifications',
    name: 'NotificationSettings',
    component: () => import('@/pages/profile/NotificationsPage.vue'),
  },
  {
    path: '/profile/security',
    name: 'Security',
    component: () => import('@/pages/profile/SecurityPage.vue'),
  },
];

export default profileRoutes;
