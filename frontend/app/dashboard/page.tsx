"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpenCheck,
  Flame,
  Sparkles,
  Timer,
} from "lucide-react"
import { AppPageLayout } from "@/components/navigation/app-page-layout"
import { useAuth } from "@/components/auth/auth-provider"
import { ApiDeck, ApiStats, apiRequest } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [decks, setDecks] = useState<ApiDeck[]>([])
  const [error, setError] = useState<string | null>(null)
  const reviewCount = decks.reduce((total, deck) => total + deck.cartoesPendentes, 0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      apiRequest<ApiStats>("estatisticas?periodo=geral"),
      apiRequest<ApiDeck[]>("baralhos"),
    ])
      .then(([nextStats, nextDecks]) => {
        if (cancelled) return
        setStats(nextStats)
        setDecks(nextDecks)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Não foi possível carregar seu resumo.")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const metrics = useMemo(() => [
    { label: "Baralhos", value: stats?.totalBaralhos, detail: "Na sua biblioteca", icon: BookOpenCheck },
    { label: "Cartões", value: stats?.totalCartoes, detail: "Em todos os baralhos", icon: BookOpenCheck },
    { label: "Revisões", value: stats?.cartoesEstudados, detail: "Desde o início", icon: Timer },
    { label: "Sequência atual", value: stats?.sequenciaDiasAtual, detail: "Dias estudando", icon: Flame },
  ], [stats])
  const weekMaximum = Math.max(1, ...(stats?.atividadeSemanal.map((item) => item.total) ?? [0]))

  return (
    <AppPageLayout>
      <div className="mx-auto w-full max-w-7xl space-y-8 py-2">
        <section className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">SEU ESPAÇO DE ESTUDOS</p>
          <DashboardGreeting />
          <p className="text-muted-foreground">Um pouquinho por dia faz uma grande diferença. Vamos estudar?</p>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg sm:p-9">
          <div className="absolute -right-12 -top-20 size-64 rounded-full border-[36px] border-primary-foreground/5" />
          <div className="absolute bottom-[-5rem] right-1/4 size-48 rounded-full bg-primary-foreground/5 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium">
                <Sparkles className="size-3.5" /> Seu momento de foco
              </div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Hora de manter o ritmo</h2>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/80 sm:text-base">
                Você tem <strong className="text-primary-foreground">{reviewCount} cartões</strong> esperando pela revisão de hoje.
                Revisões curtas ajudam a guardar o conteúdo por mais tempo.
              </p>
              <Link className="mt-6 inline-flex items-center gap-2 rounded-xl bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted" href="/baralhos">
                Começar revisão <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="hidden size-36 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 md:flex">
              <BookOpenCheck className="size-16 text-primary-foreground" strokeWidth={1.4} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((stat) => {
            const Icon = stat.icon
            return (
              <Card className="rounded-2xl border-border/80 bg-card shadow-sm" key={stat.label}>
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{stat.value ?? "—"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground"><Icon className="size-5" /></div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">Seu ritmo de estudos</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Cartões revisados nesta semana</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{stats ? `${stats.cartoesEstudados} revisões` : "Carregando..."}</span>
              </div>
              <div className="mt-8 flex h-40 items-end justify-between gap-3">
                {(stats?.atividadeSemanal ?? []).map((item) => (
                  <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={item.dia}>
                    <div className="flex w-full flex-1 items-end">
                      <div className={`w-full rounded-t-lg ${item.total === weekMaximum && item.total > 0 ? "bg-primary" : "bg-muted"}`} style={{ height: `${Math.max(4, item.total / weekMaximum * 100)}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.dia}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Continue estudando</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Retome de onde você parou</p>
                </div>
                <Link aria-label="Ver todos os baralhos" className="text-foreground hover:text-muted-foreground" href="/baralhos"><ArrowRight className="size-5" /></Link>
              </div>
              <div className="mt-5 space-y-3">
                {decks.slice(0, 3).map((deck) => {
                  return (
                    <Link className="flex items-center gap-3 rounded-xl border border-border/70 p-3 transition hover:bg-muted" href={`/baralhos/${deck.id}`} key={deck.id}>
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted"><BookOpenCheck className="size-5" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{deck.nome}</p>
                        <p className="text-xs text-muted-foreground">{deck.cartoesPendentes} cartões para revisar</p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </Link>
                  )
                })}
                {!decks.length && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Crie seu primeiro baralho para vê-lo aqui.</p>}
              </div>
            </CardContent>
          </Card>
        </section>
        {error && <p aria-live="polite" className="text-sm text-destructive">{error}</p>}
      </div>
    </AppPageLayout>
  )
}

function DashboardGreeting() {
  const { user } = useAuth()
  return (
    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
      Oi, {user?.nome.split(" ")[0] ?? "estudante"} <span aria-hidden="true">👋</span>
    </h1>
  )
}
