declare module 'vue-router' {
  import { Ref, App } from 'vue'
  
  export interface RouteLocationNormalized {
    path: string
    name?: string | null
    params: Record<string, string>
    query: Record<string, string | string[]>
    hash: string
    fullPath: string
    matched: any[]
    meta: Record<string, any>
  }
  
  export interface Router {
    currentRoute: Ref<RouteLocationNormalized>
    push(to: string | Record<string, any>): Promise<void>
    replace(to: string | Record<string, any>): Promise<void>
    go(delta: number): void
    back(): void
    forward(): void
    // Add Plugin interface for compatibility with app.use()
    install(app: App): void
  }
  
  export interface RouteRecordRaw {
    path: string
    name?: string
    component?: any
    components?: Record<string, any>
    redirect?: string | Record<string, any> | ((to: any) => string | Record<string, any>)
    children?: RouteRecordRaw[]
    meta?: Record<string, any>
  }
  
  export function createRouter(options: {
    history: any
    routes: RouteRecordRaw[]
  }): Router
  
  export function createWebHistory(base?: string): any
  
  export function useRouter(): Router
  export function useRoute(): RouteLocationNormalized
}