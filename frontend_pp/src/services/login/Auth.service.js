import axios from 'axios'

const authService = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

authService.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

authService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

export default authService
