"use client"

import { useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight, BookOpenCheck, Flame, Target } from "lucide-react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ApiAdminDeck, ApiDeck, ApiStats, apiRequest } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

type DeckStats = {
  baralhoId: string
  totalCartoes: number
  cartoesRevisados: number
  retencaoPorcentagem: number
}

export function StatisticsDashboard({
  userId,
  userName,
}: {
  userId?: string
  userName?: string
}) {
  const [refreshKey, setRefreshKey] = useState(0)
  const requestKey = `${userId ?? "self"}:${refreshKey}`
  const [result, setResult] = useState<{
    key: string
    stats: ApiStats | null
    decks: ApiDeck[]
    deckStats: DeckStats[]
    error: string | null
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    const statsEndpoint = userId
      ? `usuarios/${encodeURIComponent(userId)}/estatisticas?periodo=semana`
      : "estatisticas?periodo=semana"
    const decksRequest = userId
      ? apiRequest<ApiAdminDeck[]>(`usuarios/${encodeURIComponent(userId)}/baralhos`)
          .then((nextDecks) => ({
            decks: nextDecks,
            stats: nextDecks.map((deck) => ({
              baralhoId: deck.id,
              totalCartoes: deck.totalCartoes,
              cartoesRevisados: deck.cartoesRevisados,
              retencaoPorcentagem: deck.retencaoPorcentagem,
            })),
          }))
      : apiRequest<ApiDeck[]>("baralhos")
          .then(async (nextDecks) => ({
            decks: nextDecks,
            stats: await Promise.all(
              nextDecks.map((deck) =>
                apiRequest<DeckStats>(`estatisticas/baralhos/${encodeURIComponent(deck.id)}`),
              ),
            ),
          }))

    Promise.all([
      apiRequest<ApiStats>(statsEndpoint),
      decksRequest,
    ])
      .then(([nextStats, nextDeckData]) => {
        if (cancelled) return
        setResult({
          key: requestKey,
          stats: nextStats,
          decks: nextDeckData.decks,
          deckStats: nextDeckData.stats,
          error: null,
        })
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            stats: null,
            decks: [],
            deckStats: [],
            error: reason instanceof Error ? reason.message : "Não foi possível carregar suas estatísticas.",
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey, requestKey, userId])

  const currentResult = result?.key === requestKey ? result : null
  const stats = currentResult?.stats ?? null
  const decks = currentResult?.decks ?? []
  const deckStats = currentResult?.deckStats ?? []
  const loading = currentResult === null
  const error = currentResult?.error ?? null

  return (
      <div className="mx-auto w-full max-w-7xl space-y-8 py-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{userId ? "PROGRESSO DO USUÁRIO" : "SEU PROGRESSO"}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {userName ? `Estatísticas de ${userName}` : "Estatísticas"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {userId
              ? `Acompanhe a evolução de ${userName ?? "este usuário"} com base nas revisões registradas.`
              : "Acompanhe sua evolução com base nas revisões registradas."}
          </p>
        </div>

        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="text-sm text-destructive">{error}</p>
            <Button onClick={() => setRefreshKey((value) => value + 1)} type="button" variant="outline">
              Tentar novamente
            </Button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Baralhos", value: stats?.totalBaralhos, note: userId ? "Na biblioteca do usuário" : "Na sua biblioteca", icon: BookOpenCheck },
            { label: "Cartões", value: stats?.totalCartoes, note: userId ? "Em todos os baralhos do usuário" : "Em todos os baralhos", icon: Target },
            { label: "Revisões", value: stats?.cartoesEstudados, note: "Nesta semana", icon: BookOpenCheck },
            { label: "Sequência atual", value: stats?.sequenciaDiasAtual, note: "Dias consecutivos", icon: Flame },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card className="rounded-2xl border-border/80 bg-card shadow-sm" key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground"><Icon className="size-4" /></div>
                  </div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight">
                    {loading ? <Skeleton className="h-7 w-16" /> : stat.value ?? 0}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <ChartAreaInteractive userId={userId} />
          <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div><h2 className="font-semibold">Taxa de acerto</h2><p className="mt-1 text-sm text-muted-foreground">Avaliações desta semana</p></div>
                {stats && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-sm font-medium">
                    {stats.taxaAcertoPorcentagem >= 70 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                    {Math.round(stats.taxaAcertoPorcentagem)}%
                  </span>
                )}
              </div>
              <div className="mt-6 space-y-5">
                {decks.length ? decks.slice(0, 5).map((deck) => {
                  const metrics = deckStats.find((item) => item.baralhoId === deck.id)
                  const progress = metrics?.totalCartoes
                    ? metrics.cartoesRevisados / metrics.totalCartoes * 100
                    : 0
                  return (
                    <div className="space-y-2" key={deck.id}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate">{deck.nome}</span>
                        <span className="shrink-0 font-medium">{metrics?.cartoesRevisados ?? 0}/{metrics?.totalCartoes ?? 0}</span>
                      </div>
                      <div aria-label={`${Math.round(progress)}% dos cartões revisados`} className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? "Carregando..."
                      : userId
                        ? "Este usuário ainda não possui baralhos."
                        : "Crie um baralho para acompanhar seu progresso."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
  )
}
