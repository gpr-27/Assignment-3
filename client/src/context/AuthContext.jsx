import { createContext, useContext, useState, useEffect } from 'react'
import { isJwtExpired } from '../utils/jwt'

function loadAuthFromStorage() {
  const token = localStorage.getItem('token')
  if (!token || isJwtExpired(token)) {
    if (token) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return { token: null, user: null }
  }
  try {
    const savedUser = localStorage.getItem('user')
    return { token, user: savedUser ? JSON.parse(savedUser) : null }
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return { token: null, user: null }
  }
}

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const initial = loadAuthFromStorage()
  const [user, setUser] = useState(initial.user)
  const [token, setToken] = useState(initial.token)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    } else if (!token) {
      setUser(null)
    }
  }, [token])

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('token', jwtToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
