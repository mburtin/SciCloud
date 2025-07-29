/**
 * UI-specific types (navigation, pages, components)
 */

export type PageType = 
  | 'dashboard' 
  | 'dashboard-planning' 
  | 'dashboard-deadlines' 
  | 'laboratoire' 
  | 'laboratoire-instruments' 
  | 'laboratoire-consommables' 
  | 'laboratoire-animaux' 
  | 'animal-detail' 
  | 'projets' 
  | 'projects-favorites' 
  | 'projects-archived' 
  | 'project-detail' 
  | 'project-summary' 
  | 'project-documents' 
  | 'project-notebook' 
  | 'profile' 
  | 'profile-user' 
  | 'profile-notifications' 
  | 'profile-security' 
  | 'settings'
  | 'animals'
  | 'instruments'
  | 'consumables'
  | 'empty'
  | 'error-400' 
  | 'error-401' 
  | 'error-403' 
  | 'error-404' 
  | 'error-408' 
  | 'error-500'

  export interface NavigationModule {
  id: string
  label: string
  icon: string
  to: string
}

export interface StatCard {
  title: string
  value: string
  icon: string
  trendText: string
  trendIcon: string
  trendClass: string
}
