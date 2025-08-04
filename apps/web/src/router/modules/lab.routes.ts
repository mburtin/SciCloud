import type { RouteRecordRaw } from 'vue-router'

// Lazy-loaded components for lab pages
const AnimalsPage = () => import('@/pages/labs/animals/AnimalsPage.vue');
const AnimalDetailPage = () => import('@/pages/labs/animals/AnimalDetailPage.vue');
const InstrumentsPage = () => import('@/pages/labs/instruments/InstrumentsPage.vue');
const ConsumablesPage = () => import('@/pages/labs/consumables/ConsumablesPage.vue');

export const labRoutes: RouteRecordRaw[] = [
  {
    path: '/lab/animals',
    name: 'lab-animals',
    component: AnimalsPage,
    meta: { title: 'Animals' }
  },
  {
    path: '/lab/animals/:id',
    name: 'lab-animal-detail',
    component: AnimalDetailPage,
    meta: { title: 'Animal Details' }
  },
  {
    path: '/lab/instruments',
    name: 'lab-instruments',
    component: InstrumentsPage,
    meta: { title: 'Instruments' }
  },
  {
    path: '/lab/consumables',
    name: 'lab-consumables',
    component: ConsumablesPage,
    meta: { title: 'Consumables' }
  }
]
