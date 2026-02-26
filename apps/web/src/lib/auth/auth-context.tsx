import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authToken, currentUser, clearCache } from '@/lib/api/authToken'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedToken = authToken("access")
      const storedUser = currentUser()
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser as User)
      }
    } catch (error) {
      console.error('Failed to load auth data:', error)
    }
    setIsLoading(false)
  }, [])

  const logout = () => {
    clearCache()
    setToken(null)
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, token, logout, isLoading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
