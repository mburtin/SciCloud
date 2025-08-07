/**
 * Navigation service - Handles navigation data operations
 * Currently using mock data, will be replaced with Supabase calls
 */

import { mockMainModules } from '@/mocks/navigation.mock'

export class NavigationService {
  /**
   * Get main navigation modules
   */
  async getMainModules() {
    // TODO: Replace with Supabase call for user-specific navigation
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data, error } = await supabase
    //   .from('user_navigation_modules')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .eq('is_enabled', true)
    //   .order('order_index')
    await new Promise(resolve => setTimeout(resolve, 50))
    return mockMainModules
  }
}

export const navigationService = new NavigationService()