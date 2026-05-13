import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { token } from '../services/token'
import type { AdminUser } from '../types'

interface AuthContextType {
  admin: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const restore = async () => {
      if (!token.get()) {
        setIsLoading(false)
        return
      }
      try {
        const res = await api.auth.me()
        setAdmin(res.data)
      } catch {
        token.clear()
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    token.save(res.data.access_token)
    const me = await api.auth.me()
    setAdmin(me.data)
    navigate('/')
  }

  const logout = () => {
    token.clear()
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
