"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

const pageTitles: Record<string, string> = {
  "/dashboard": "Início",
  "/baralhos": "Baralhos",
  "/estatisticas": "Estatísticas",
  "/turmas": "Turmas",
  "/admin/usuarios": "Usuários",
}

export function SiteHeader() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [deckName, setDeckName] = useState<string | null>(null)
  const [isDeckLoading, setIsDeckLoading] = useState(false)

  useEffect(() => {
    const match = pathname.match(/^\/baralhos\/([^/]+)$/)
    if (!match) {
      setDeckName(null)
      setIsDeckLoading(false)
      return
    }

    const deckId = match[1]
    if (!deckId || deckId === "new") {
      setDeckName(null)
      return
    }

    let cancelled = false
    setIsDeckLoading(true)
    apiRequest<{ nome?: string }>(`baralhos/${encodeURIComponent(deckId)}`)
      .then((deck) => {
        if (!cancelled) setDeckName(deck?.nome ?? "Baralho")
      })
      .catch(() => {
        if (!cancelled) setDeckName("Baralho")
      })
      .finally(() => {
        if (!cancelled) setIsDeckLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [pathname])

  const title =
    pageTitles[pathname] ??
    (pathname.startsWith("/baralhos/") ? (isDeckLoading ? "Baralho" : (deckName ?? "Baralho")) :
      pathname
        .split("/")
        .filter(Boolean)
        .at(-1)
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ??
      "Memora")

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>
        {user?.perfil === "administrador" && (
          <Link className="ml-auto text-sm font-medium hover:underline" href="/admin/usuarios">
            Usuários
          </Link>
        )}
      </div>
    </header>
  )
}
