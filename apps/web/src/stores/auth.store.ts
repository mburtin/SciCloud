import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/data/types'

const AUTH_KEY = 'isAuthenticated'
const USER_KEY = 'user'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(localStorage.getItem(AUTH_KEY) === 'true')
  const user = ref<Pick<User, 'id' | 'email' | 'name'> | null>(
    localStorage.getItem(USER_KEY) 
      ? JSON.parse(localStorage.getItem(USER_KEY)!) 
      : null
  )

  const isLoggedIn = computed(() => isAuthenticated.value)

  function login(userData?: Pick<User, 'id' | 'email' | 'name'>) {
    isAuthenticated.value = true
    if (userData) {
      user.value = userData
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
    }
    localStorage.setItem(AUTH_KEY, 'true')
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(USER_KEY)
  }

  function updateUser(userData: Partial<Pick<User, 'id' | 'email' | 'name'>>) {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    }
  }

  return { 
    isAuthenticated,
    user,
    isLoggedIn,
    login, 
    logout,
    updateUser
  }
})
