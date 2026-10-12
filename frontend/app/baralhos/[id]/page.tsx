"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BookOpenCheck, Check, Pencil, Plus, Trash2, X } from "lucide-react"
import { AppPageLayout } from "@/components/navigation/app-page-layout"
import { ApiCard, ApiDeck, apiRequest } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

type CardDraft = { frente: string; verso: string }

export default function BaralhoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [deck, setDeck] = useState<ApiDeck | null>(null)
  const [cards, setCards] = useState<ApiCard[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<CardDraft>({ frente: "", verso: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [queue, setQueue] = useState<ApiCard[] | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  function refreshDeck() {
    setLoading(true)
    setError(null)
    setRefreshKey((value) => value + 1)
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([
      apiRequest<ApiDeck>(`baralhos/${encodeURIComponent(id)}`),
      apiRequest<ApiCard[]>(`baralhos/${encodeURIComponent(id)}/cartoes`),
    ])
      .then(([nextDeck, nextCards]) => {
        if (cancelled) return
        setDeck(nextDeck)
        setCards(nextCards)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Não foi possível carregar o baralho.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, refreshKey])

  function startEditing(card?: ApiCard) {
    setEditingId(card?.id ?? "new")
    setDraft({ frente: card?.frente ?? "", verso: card?.verso ?? "" })
    setError(null)
  }

  async function saveCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      if (editingId === "new") {
        await apiRequest<ApiCard>(`baralhos/${encodeURIComponent(id)}/cartoes`, {
          method: "POST",
          body: JSON.stringify(draft),
        })
      } else if (editingId) {
        await apiRequest<ApiCard>(`cartoes/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          body: JSON.stringify(draft),
        })
      }
      setEditingId(null)
      setDraft({ frente: "", verso: "" })
      refreshDeck()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar o cartão.")
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteCard(card: ApiCard) {
    if (!window.confirm(`Remover o cartão “${card.frente}”?`)) return
    setError(null)
    try {
      await apiRequest<void>(`cartoes/${encodeURIComponent(card.id)}`, { method: "DELETE" })
      refreshDeck()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível remover o cartão.")
    }
  }

  async function deleteDeck() {
    if (!deck || !window.confirm(`Excluir “${deck.nome}” e todos os seus cartões?`)) return
    setError(null)
    try {
      await apiRequest<void>(`baralhos/${encodeURIComponent(deck.id)}`, { method: "DELETE" })
      router.replace("/baralhos")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível excluir o baralho.")
    }
  }

  async function updateDeck() {
    if (!deck) return
    const nome = window.prompt("Nome do baralho", deck.nome)
    if (nome === null) return
    const descricao = window.prompt("Descrição do baralho", deck.descricao ?? "")
    if (descricao === null) return
    setError(null)
    try {
      const updated = await apiRequest<ApiDeck>(`baralhos/${encodeURIComponent(deck.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ nome, descricao }),
      })
      setDeck(updated)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível atualizar o baralho.")
    }
  }

  async function startStudy() {
    setReviewError(null)
    try {
      const result = await apiRequest<ApiCard[] | { dados: ApiCard[] }>(
        `baralhos/${encodeURIComponent(id)}/estudo`,
      )
      setQueue(Array.isArray(result) ? result : result.dados)
      setShowAnswer(false)
    } catch (reason) {
      setReviewError(reason instanceof Error ? reason.message : "Não foi possível iniciar a revisão.")
    }
  }

  async function reviewCard(nota: "errei" | "dificil" | "bom" | "facil") {
    const current = queue?.[0]
    if (!current) return
    setReviewError(null)
    try {
      await apiRequest<ApiCard>(`cartoes/${encodeURIComponent(current.id)}/revisoes`, {
        method: "POST",
        body: JSON.stringify({ nota }),
      })
      setQueue((items) => items?.slice(1) ?? [])
      setShowAnswer(false)
      refreshDeck()
    } catch (reason) {
      setReviewError(reason instanceof Error ? reason.message : "Não foi possível registrar sua resposta.")
    }
  }

  return (
    <AppPageLayout>
      <div className="mx-auto w-full max-w-5xl space-y-7 py-2">
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" href="/baralhos">
          <ArrowLeft className="size-4" /> Voltar aos baralhos
        </Link>

        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Carregando baralho...</p>
        ) : error && !deck ? (
          <div className="rounded-2xl border border-destructive/30 bg-card p-8 text-center">
            <p className="font-medium">Não foi possível abrir este baralho</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : deck ? (
          <>
            <section className="flex flex-col gap-5 rounded-3xl border border-border bg-muted p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">SEU BARALHO</p>
                <h1 className="mt-1 break-words text-3xl font-semibold tracking-tight">{deck.nome}</h1>
                <p className="mt-2 text-muted-foreground">{deck.descricao || "Sem descrição"}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {deck.totalCartoes} {deck.totalCartoes === 1 ? "cartão" : "cartões"} · {deck.cartoesPendentes} para revisar
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-background" onClick={updateDeck} type="button">
                  <Pencil className="size-4" /> Editar
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10" onClick={deleteDeck} type="button">
                  <Trash2 className="size-4" /> Excluir
                </button>
              </div>
            </section>

            {error && <p aria-live="polite" className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">{error}</p>}

            <section className="grid gap-4 sm:grid-cols-2">
              <button className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90" onClick={startStudy} type="button">
                <BookOpenCheck className="size-5" /> Começar revisão ({deck.cartoesPendentes})
              </button>
              <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 font-semibold transition hover:bg-muted" onClick={() => startEditing()} type="button">
                <Plus className="size-5" /> Adicionar cartão
              </button>
            </section>

            {reviewError && <p aria-live="polite" className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">{reviewError}</p>}
            {queue && (
              <Card className="rounded-3xl border-border/80 bg-card shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-5 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Sessão de revisão</span>
                    <button aria-label="Fechar revisão" className="rounded-lg p-2 hover:bg-muted" onClick={() => setQueue(null)} type="button"><X className="size-4" /></button>
                  </div>
                  {queue.length ? (
                    <div className="space-y-6">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {queue.length} {queue.length === 1 ? "cartão restante" : "cartões restantes"}
                      </p>
                      <div className="min-h-36 rounded-2xl bg-muted p-6">
                        <p className="text-xs font-medium text-muted-foreground">PERGUNTA</p>
                        <p className="mt-3 whitespace-pre-wrap text-xl font-medium">{queue[0].frente}</p>
                        {showAnswer && (
                          <div className="mt-6 border-t border-border pt-5">
                            <p className="text-xs font-medium text-muted-foreground">RESPOSTA</p>
                            <p className="mt-2 whitespace-pre-wrap text-lg">{queue[0].verso}</p>
                          </div>
                        )}
                      </div>
                      {!showAnswer ? (
                        <button className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90" onClick={() => setShowAnswer(true)} type="button">
                          Mostrar resposta
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {([
                            ["errei", "Errei"],
                            ["dificil", "Difícil"],
                            ["bom", "Bom"],
                            ["facil", "Fácil"],
                          ] as const).map(([rating, label]) => (
                            <button className="rounded-xl border border-border bg-background px-3 py-3 text-sm font-semibold transition hover:bg-muted" key={rating} onClick={() => reviewCard(rating)} type="button">
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Check className="mx-auto size-9 text-primary" />
                      <p className="mt-3 text-lg font-semibold">Revisão concluída!</p>
                      <p className="mt-1 text-sm text-muted-foreground">Você não tem mais cartões pendentes neste baralho.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {editingId && (
              <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
                <CardContent className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold">{editingId === "new" ? "Novo cartão" : "Editar cartão"}</h2>
                    <button aria-label="Cancelar edição" className="rounded-lg p-2 text-muted-foreground hover:bg-muted" onClick={() => setEditingId(null)} type="button"><X className="size-4" /></button>
                  </div>
                  <form className="space-y-4" onSubmit={saveCard}>
                    <label className="block space-y-2 text-sm font-medium" htmlFor="card-front">
                      Frente
                      <Textarea autoFocus id="card-front" maxLength={500} onChange={(event) => setDraft((value) => ({ ...value, frente: event.target.value }))} required rows={3} value={draft.frente} />
                    </label>
                    <label className="block space-y-2 text-sm font-medium" htmlFor="card-back">
                      Verso
                      <Textarea id="card-back" maxLength={1000} onChange={(event) => setDraft((value) => ({ ...value, verso: event.target.value }))} required rows={3} value={draft.verso} />
                    </label>
                    {error && <p aria-live="polite" className="text-sm text-destructive">{error}</p>}
                    <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50" disabled={isSaving} type="submit">
                      {isSaving ? "Salvando..." : "Salvar cartão"}
                    </button>
                  </form>
                </CardContent>
              </Card>
            )}

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Cartões deste baralho</h2>
                <p className="mt-1 text-sm text-muted-foreground">Edite o conteúdo ou remova cartões que não precisa mais.</p>
              </div>
              {cards.length ? cards.map((card) => (
                <Card className="rounded-2xl border-border/80 bg-card shadow-sm" key={card.id}>
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
                      <div><p className="text-xs font-medium text-muted-foreground">FRENTE</p><p className="mt-1 whitespace-pre-wrap font-medium">{card.frente}</p></div>
                      <div><p className="text-xs font-medium text-muted-foreground">VERSO</p><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{card.verso}</p></div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button aria-label={`Editar cartão ${card.frente}`} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => startEditing(card)} type="button"><Pencil className="size-4" /></button>
                      <button aria-label={`Remover cartão ${card.frente}`} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteCard(card)} type="button"><Trash2 className="size-4" /></button>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="rounded-2xl border border-dashed border-border bg-card py-12 text-center">
                  <p className="font-medium">Este baralho ainda não tem cartões</p>
                  <p className="mt-1 text-sm text-muted-foreground">Adicione o primeiro cartão para começar a estudar.</p>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AppPageLayout>
  )
}
