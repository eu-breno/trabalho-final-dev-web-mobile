"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ApiError, requestJson } from "@/lib/api"
import { Button } from "@/components/ui/button"

export type PerfilUsuario = "estudante" | "administrador"

export type AuthUser = {
  id: string
  nome: string
  email: string
  perfil: PerfilUsuario
}

type AuthContextValue = {
  user: AuthUser | null
  status: "loading" | "ready" | "error"
  error: string | null
  reload: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading")
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const reload = useCallback(() => {
    setStatus("loading")
    setError(null)
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    requestJson<AuthUser>("/api/auth/profile")
      .then((profile) => {
        if (cancelled) return
        setUser(profile)
        setStatus("ready")
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        if (reason instanceof ApiError && reason.status === 401) {
          router.replace("/login")
          return
        }
        setError(reason instanceof Error ? reason.message : "Não foi possível verificar sua sessão.")
        setStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [attempt, router])

  useEffect(() => {
    const handleExpiredSession = () => router.replace("/login")
    window.addEventListener("memora:session-expired", handleExpiredSession)
    return () => window.removeEventListener("memora:session-expired", handleExpiredSession)
  }, [router])

  const contextValue = useMemo(
    () => ({ user, status, error, reload }),
    [user, status, error, reload],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {status === "loading" && (
        <main className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
          Verificando sua sessão...
        </main>
      )}
      {status === "error" && (
        <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <p className="max-w-md text-sm text-muted-foreground">{error}</p>
          <Button onClick={reload} type="button">Tentar novamente</Button>
          <Link className="text-sm font-medium underline underline-offset-4" href="/login">Ir para o login</Link>
        </main>
      )}
      {status === "ready" && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.")
  return context
}
