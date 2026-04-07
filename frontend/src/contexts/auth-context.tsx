"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { apiFetch } from "@/lib/api/client"
import type { AuthPayload, MeResponse, User } from "@/lib/api/types"
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/lib/auth/storage"

type AuthContextValue = {
  user: User | null
  token: string | null
  ready: boolean
  login: (payload: AuthPayload) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => {
      const t = getStoredToken()
      setToken(t)
      setReady(false)
      if (!t) {
        setUser(null)
        setReady(true)
        return
      }
      apiFetch<MeResponse>("/auth/me", { token: t })
        .then((data) => {
          setUser(data.user)
        })
        .catch(() => {
          clearStoredToken()
          setToken(null)
          setUser(null)
        })
        .finally(() => setReady(true))
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  const login = useCallback((payload: AuthPayload) => {
    setStoredToken(payload.token)
    setToken(payload.token)
    setUser(payload.user)
    setReady(true)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const t = getStoredToken()
    if (!t) return
    const data = await apiFetch<MeResponse>("/auth/me", { token: t })
    setUser(data.user)
  }, [])

  const value = useMemo(
    () => ({ user, token, ready, login, logout, refreshUser }),
    [user, token, ready, login, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
