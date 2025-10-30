import axios from 'axios'
import { useAuthStore } from '../context/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://hiresense-api.vercel.app/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from Zustand store on each request
api.interceptors.request.use((config) => {
  try {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // noop
  }
  return config
})

export default api
