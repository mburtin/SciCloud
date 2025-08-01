import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// Pages
// Pages are imported dynamically (lazy-loaded) to improve initial load time.
const DashboardPage = () => import('@/pages/dashboard/DashboardPage.vue')
const ProjectsPage = () => import('@/pages/projects/ProjectsPage.vue')
const ProjectDetailPage = () => import('@/pages/projects/ProjectDetailPage.vue')
const ProjectSummaryPage = () => import('@/pages/projects/ProjectSummaryPage.vue')
const ProjectDocumentsPage = () => import('@/pages/projects/ProjectDocumentsPage.vue')
const ProjectNotebookPage = () => import('@/pages/projects/ProjectNotebookPage.vue')
const CalendarPage = () => import('@/pages/CalendarPage.vue')
const NotesPage = () => import('@/pages/NotesPage.vue')


const LoginPage = () => import('@/pages/LoginPage.vue')
const ErrorPage = () => import('@/pages/ErrorPage.vue')

// Authentication is now handled by the Pinia auth store.
import { useAuthStore } from '@/stores/auth.store'

// Import route modules
import { labRoutes } from './modules/lab.routes';
import profileRoutes from './modules/profile.routes';

// Route meta type extensions
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
  }
}

// The logic for login and logout has been moved to the auth.store.ts file.
// You can now import `useAuthStore` in any component to access `login` and `logout` actions.

// Application routes
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardPage,
        meta: { title: 'Dashboard' }
      },
      {
        path: '/projects',
        name: 'projects',
        component: ProjectsPage,
        meta: { title: 'Projects' }
      },
      {
        path: '/projects/favorites',
        name: 'projects-favorites',
        component: ProjectsPage,
        meta: { title: 'Favorite Projects' }
      },
      {
        path: '/projects/archived',
        name: 'projects-archived',
        component: ProjectsPage,
        meta: { title: 'Archived Projects' }
      },
      {
        path: '/projects/:id',
        component: ProjectDetailPage,
        meta: { title: 'Project Details' },
        children: [
          {
            path: '',
            redirect: 'summary'
          },
          {
            path: 'summary',
            name: 'project-summary',
            component: ProjectSummaryPage,
            meta: { title: 'Project Summary' }
          },
          {
            path: 'documents',
            name: 'project-documents',
            component: ProjectDocumentsPage,
            meta: { title: 'Project Documents' }
          },
          {
            path: 'notebook',
            name: 'project-notebook',
            component: ProjectNotebookPage,
            meta: { title: 'Project Notebook' }
          }
        ]
      },
      {
        path: '/calendar',
        name: 'calendar',
        component: CalendarPage,
        meta: { title: 'Calendar' }
      },
      {
        path: '/notes',
        name: 'notes',
        component: NotesPage,
        meta: { title: 'Notes' }
      },
      ...labRoutes,
      ...profileRoutes,

    ]
  },
  {
    path: '/error/:errorCode',
    name: 'error',
    component: ErrorPage,
        props: (route: RouteLocationNormalized) => ({ errorCode: route.params.errorCode as string }),
    meta: { requiresAuth: false }
  },
  // Route for not found page (404)
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: ErrorPage,
    // Use a function to pass static props in a type-safe way
    props: () => ({ errorCode: '404' }),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Check if the route requires authentication
  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth !== false)

  if (requiresAuth) {
    // Initialize auth if not already done
    if (!authStore.isInitialized) {
      await authStore.initialize()
    }
    
    // Simple authentication check - trust the store state
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    next()
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // Redirect authenticated users away from login page
    next('/')
  } else {
    // Public route, allow navigation
    next()
  }
})



export default router
