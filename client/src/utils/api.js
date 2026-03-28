import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

function clearAuthAndRedirectToLogin() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login'
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''

    if (status === 401) {
      const isAuthEndpoint =
        url.includes('/auth/login') || url.includes('/auth/register')
      if (!isAuthEndpoint) {
        clearAuthAndRedirectToLogin()
      }
    }
    return Promise.reject(err)
  }
)

export default api
