import axios, { type AxiosResponse, type AxiosError } from 'axios'

interface ApiError {
  message: string
  status: number
  data?: unknown
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: error.message || 'An error occurred',
      status: error.response?.status || 500,
      data: error.response?.data
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('isAuthenticated')
      window.location.href = '/login'
    }

    return Promise.reject(apiError)
  }
)

export default apiClient
export type { ApiError }
