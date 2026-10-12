"use client"

import { useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight, BookOpenCheck, Flame, Target } from "lucide-react"
import { AppPageLayout } from "@/components/navigation/app-page-layout"
import { ApiDeck, ApiStats, apiRequest } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"

type DeckStats = {
  baralhoId: string
  totalCartoes: number
  cartoesRevisados: number
  retencaoPorcentagem: number
}

export default function EstatisticasPage() {
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [decks, setDecks] = useState<ApiDeck[]>([])
  const [deckStats, setDeckStats] = useState<DeckStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      apiRequest<ApiStats>("estatisticas?periodo=semana"),
      apiRequest<ApiDeck[]>("baralhos"),
    ])
      .then(async ([nextStats, nextDecks]) => {
        const nextDeckStats = await Promise.all(
          nextDecks.map((deck) =>
            apiRequest<DeckStats>(`estatisticas/baralhos/${encodeURIComponent(deck.id)}`),
          ),
        )
        if (cancelled) return
        setStats(nextStats)
        setDecks(nextDecks)
        setDeckStats(nextDeckStats)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Não foi possível carregar suas estatísticas.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const maximumDaily = Math.max(1, ...(stats?.atividadeSemanal.map((item) => item.total) ?? [0]))

  return (
    <AppPageLayout>
      <div className="mx-auto w-full max-w-7xl space-y-8 py-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">SEU PROGRESSO</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Estatísticas</h1>
          <p className="mt-2 text-muted-foreground">Acompanhe sua evolução com base nas revisões registradas.</p>
        </div>

        {error && <p aria-live="polite" className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">{error}</p>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Baralhos", value: stats?.totalBaralhos, note: "Na sua biblioteca", icon: BookOpenCheck },
            { label: "Cartões", value: stats?.totalCartoes, note: "Em todos os baralhos", icon: Target },
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
                  <p className="mt-3 text-2xl font-semibold tracking-tight">{loading ? "—" : stat.value ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="font-semibold">Atividade de estudo</h2><p className="mt-1 text-sm text-muted-foreground">Cartões revisados por dia nesta semana</p></div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">Esta semana</span>
              </div>
              <div className="mt-8 flex h-52 items-end justify-between gap-3 border-b border-border/70 pb-2">
                {(stats?.atividadeSemanal ?? []).map((item) => (
                  <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={item.dia}>
                    <span className="text-xs text-muted-foreground">{item.total}</span>
                    <div className="flex w-full flex-1 items-end">
                      <div aria-label={`${item.total} cartões revisados ${item.dia}`} className={`w-full rounded-t-lg ${item.total === maximumDaily && item.total > 0 ? "bg-primary" : "bg-muted"}`} role="img" style={{ height: `${Math.max(4, item.total / maximumDaily * 100)}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.dia}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>0 revisões</span><span>{stats?.cartoesEstudados ?? 0} nesta semana</span></div>
            </CardContent>
          </Card>

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
                  <p className="text-sm text-muted-foreground">{loading ? "Carregando..." : "Crie um baralho para acompanhar seu progresso."}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-2xl border-border bg-muted shadow-none">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-semibold">Uma dica para continuar evoluindo</h2><p className="mt-1 text-sm text-muted-foreground">Revisar um pouco todos os dias ajuda mais do que tentar estudar tudo de uma vez.</p></div>
            <span className="shrink-0 rounded-full bg-card px-3 py-1.5 text-sm font-medium text-foreground">Você está no caminho certo ✨</span>
          </CardContent>
        </Card>
      </div>
    </AppPageLayout>
  )
}
