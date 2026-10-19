"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowDownWideNarrow, ArrowLeft, ArrowUpWideNarrow, Ellipsis, GalleryVerticalEnd, Layers, Pencil, Play, Plus, Trash2 } from "lucide-react"
import { AppPageLayout } from "@/components/navigation/app-page-layout"
import { ApiCard, ApiDeck, apiRequest } from "@/lib/api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type CardDraft = { frente: string; verso: string }
type CardSort = "date-asc" | "date-desc" | "name-asc" | "name-desc"
type StudyScope = "todos" | "pendentes"

const emptyDraft: CardDraft = { frente: "", verso: "" }

function formatShortDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Data indisponível"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date)
}

export default function BaralhoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [deck, setDeck] = useState<ApiDeck | null>(null)
  const [cards, setCards] = useState<ApiCard[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [draft, setDraft] = useState<CardDraft>(emptyDraft)
  const [editingCard, setEditingCard] = useState<ApiCard | "new" | null>(null)
  const [editingDeck, setEditingDeck] = useState(false)
  const [deletingCard, setDeletingCard] = useState<ApiCard | null>(null)
  const [deletingDeck, setDeletingDeck] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [cardSort, setCardSort] = useState<CardSort>("date-desc")
  const [isStartingStudy, setIsStartingStudy] = useState(false)
  const [studyScope, setStudyScope] = useState<StudyScope>("pendentes")

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

  const sortedCards = useMemo(() => [...cards].sort((left, right) => {
    if (cardSort.startsWith("name")) {
      const compared = left.frente.localeCompare(right.frente, "pt-BR", { sensitivity: "base" })
      return cardSort === "name-asc" ? compared : -compared
    }
    const compared = new Date(left.proximaRevisao).getTime() - new Date(right.proximaRevisao).getTime()
    return cardSort === "date-asc" ? compared : -compared
  }), [cards, cardSort])

  function refreshDeck() {
    setActionError(null)
    setError(null)
    setLoading(true)
    setRefreshKey((value) => value + 1)
  }

  function startEditingCard(card?: ApiCard) {
    setActionError(null)
    setDraft({ frente: card?.frente ?? "", verso: card?.verso ?? "" })
    setEditingCard(card ?? "new")
  }

  async function saveCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setActionError(null)
    try {
      if (editingCard === "new") {
        await apiRequest<ApiCard>(`baralhos/${encodeURIComponent(id)}/cartoes`, {
          method: "POST",
          body: JSON.stringify(draft),
        })
      } else if (editingCard) {
        await apiRequest<ApiCard>(`cartoes/${encodeURIComponent(editingCard.id)}`, {
          method: "PATCH",
          body: JSON.stringify(draft),
        })
      }
      setEditingCard(null)
      setDraft(emptyDraft)
      refreshDeck()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Não foi possível salvar o cartão.")
    } finally {
      setIsSaving(false)
    }
  }

  async function removeCard() {
    if (!deletingCard) return
    setIsSaving(true)
    setActionError(null)
    try {
      await apiRequest<void>(`cartoes/${encodeURIComponent(deletingCard.id)}`, { method: "DELETE" })
      setDeletingCard(null)
      refreshDeck()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Não foi possível remover o cartão.")
    } finally {
      setIsSaving(false)
    }
  }

  async function saveDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!deck) return
    const formData = new FormData(event.currentTarget)
    setIsSaving(true)
    setActionError(null)
    try {
      const updated = await apiRequest<ApiDeck>(`baralhos/${encodeURIComponent(deck.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          nome: formData.get("nome"),
          descricao: formData.get("descricao") || undefined,
        }),
      })
      setDeck(updated)
      setEditingDeck(false)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Não foi possível atualizar o baralho.")
    } finally {
      setIsSaving(false)
    }
  }

  async function removeDeck() {
    if (!deck) return
    setIsSaving(true)
    setActionError(null)
    try {
      await apiRequest<void>(`baralhos/${encodeURIComponent(deck.id)}`, { method: "DELETE" })
      router.replace("/baralhos")
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Não foi possível excluir o baralho.")
    } finally {
      setIsSaving(false)
    }
  }

  function beginStudy(cardId?: string) {
    const params = new URLSearchParams({ baralhoId: id })
    if (cardId) params.set("cartaoId", cardId)
    else params.set("escopo", studyScope)
    router.push(`/revisao?${params.toString()}`)
  }

  return (
    <AppPageLayout>
      <div className="mx-auto w-full max-w-5xl space-y-7 py-2">
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" href="/baralhos">
          <ArrowLeft className="size-4" /> Voltar aos baralhos
        </Link>

        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Carregando baralho...</p>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-card p-8 text-center">
            <p className="font-medium">Não foi possível abrir este baralho</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : deck ? (
          <>
            <section className="flex flex-col gap-5 rounded-3xl border border-border bg-muted p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-foreground">
                    <Layers className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">SEU BARALHO</p>
                    <h1 className="break-words text-3xl font-semibold tracking-tight">{deck.nome}</h1>
                  </div>
                </div>
                <p className="mt-3 text-muted-foreground">{deck.descricao || "Sem descrição"}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {deck.totalCartoes} {deck.totalCartoes === 1 ? "cartão" : "cartões"} · {deck.cartoesPendentes} pendentes
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button onClick={() => { setActionError(null); setEditingDeck(true) }} size="sm" type="button" variant="outline">
                  <Pencil /> Editar
                </Button>
                <Button onClick={() => { setActionError(null); setDeletingDeck(true) }} size="sm" type="button" variant="outline">
                  <Trash2 /> Excluir
                </Button>
              </div>
            </section>

            {actionError && (
              <p aria-live="polite" className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">
                {actionError}
              </p>
            )}

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <GalleryVerticalEnd className="size-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Cartões deste baralho</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button aria-label="Ordenar cartões" size="icon-sm" variant="outline" />}>
                      <ArrowDownWideNarrow />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setCardSort("date-desc")}><ArrowDownWideNarrow /> Data (mais recentes)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCardSort("date-asc")}><ArrowUpWideNarrow /> Data (mais antigas)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCardSort("name-asc")}>Nome (A–Z)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCardSort("name-desc")}>Nome (Z–A)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button onClick={() => { setStudyScope("pendentes"); setIsStartingStudy(true) }} size="sm" type="button" variant="outline">
                    <Play /> Começar revisão
                  </Button>
                  <Button onClick={() => startEditingCard()} size="sm" type="button">
                    <Plus /> Adicionar cartão
                  </Button>
                </div>
              </div>

              {sortedCards.length ? (
                <div className="space-y-3">
                  {sortedCards.map((card) => (
                    <Card className="rounded-2xl border-border/80 bg-card shadow-sm" key={card.id}>
                      <CardContent className="flex min-w-0 items-center gap-3 p-3 sm:gap-4 sm:p-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          <GalleryVerticalEnd className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium" title={card.frente}>{card.frente}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Próxima revisão: {formatShortDate(card.proximaRevisao)}
                          </p>
                        </div>
                        <Button
                          aria-label={`Revisar cartão: ${card.frente}`}
                          onClick={() => beginStudy(card.id)}
                          size="icon-sm"
                          type="button"
                          variant="outline"
                        >
                          <Play />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button aria-label={`Ações do cartão: ${card.frente}`} size="icon-sm" type="button" variant="ghost" />}>
                            <Ellipsis />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditingCard(card)}><Pencil /> Editar</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => { setActionError(null); setDeletingCard(card) }}
                              variant="destructive"
                            >
                              <Trash2 /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card py-12 text-center">
                  <p className="font-medium">Este baralho ainda não tem cartões</p>
                  <p className="mt-1 text-sm text-muted-foreground">Adicione o primeiro cartão para começar a estudar.</p>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>

      <Dialog open={editingCard !== null} onOpenChange={(open) => { if (!open) { setEditingCard(null); setActionError(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCard === "new" ? "Adicionar cartão" : "Editar cartão"}</DialogTitle>
            <DialogDescription>Preencha a frente e o verso do flashcard.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={saveCard}>
            <label className="block space-y-2 text-sm font-medium" htmlFor="card-front">
              Frente
              <Textarea autoFocus id="card-front" maxLength={500} onChange={(event) => setDraft((value) => ({ ...value, frente: event.target.value }))} required rows={3} value={draft.frente} />
            </label>
            <label className="block space-y-2 text-sm font-medium" htmlFor="card-back">
              Verso
              <Textarea id="card-back" maxLength={1000} onChange={(event) => setDraft((value) => ({ ...value, verso: event.target.value }))} required rows={3} value={draft.verso} />
            </label>
            {actionError && <p aria-live="polite" className="text-sm text-destructive">{actionError}</p>}
            <DialogFooter>
              <Button onClick={() => setEditingCard(null)} type="button" variant="outline">Cancelar</Button>
              <Button disabled={isSaving} type="submit">{isSaving ? "Salvando..." : "Salvar cartão"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editingDeck} onOpenChange={(open) => { setEditingDeck(open); if (!open) setActionError(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar baralho</DialogTitle>
            <DialogDescription>Atualize o nome ou a descrição do baralho.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={saveDeck}>
            <label className="block space-y-2 text-sm font-medium" htmlFor="deck-edit-name">
              Nome
              <Input autoFocus defaultValue={deck?.nome ?? ""} id="deck-edit-name" maxLength={80} name="nome" required />
            </label>
            <label className="block space-y-2 text-sm font-medium" htmlFor="deck-edit-description">
              Descrição
              <Textarea defaultValue={deck?.descricao ?? ""} id="deck-edit-description" maxLength={300} name="descricao" rows={3} />
            </label>
            {actionError && <p aria-live="polite" className="text-sm text-destructive">{actionError}</p>}
            <DialogFooter>
              <Button onClick={() => setEditingDeck(false)} type="button" variant="outline">Cancelar</Button>
              <Button disabled={isSaving} type="submit">{isSaving ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isStartingStudy} onOpenChange={setIsStartingStudy}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Começar revisão</DialogTitle>
            <DialogDescription>Escolha quais cartões deseja revisar nesta sessão.</DialogDescription>
          </DialogHeader>
          <label className="space-y-2 text-sm font-medium" htmlFor="study-scope">
            Cartões da sessão
            <Select
              onValueChange={(value) => {
                if (value === "todos" || value === "pendentes") setStudyScope(value)
              }}
              value={studyScope}
            >
              <SelectTrigger aria-label="Escolher cartões da sessão" className="w-full" id="study-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo o baralho</SelectItem>
                <SelectItem value="pendentes">Apenas os pendentes</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <DialogFooter>
            <Button onClick={() => setIsStartingStudy(false)} type="button" variant="outline">Cancelar</Button>
            <Button onClick={() => beginStudy()} type="button">Iniciar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingCard !== null} onOpenChange={(open) => { if (!open) setDeletingCard(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCard ? `O cartão “${deletingCard.frente}” será removido permanentemente.` : "Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && <p aria-live="polite" className="text-sm text-destructive">{actionError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSaving}
              onClick={(event) => { event.preventDefault(); void removeCard() }}
            >
              {isSaving ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deletingDeck} onOpenChange={setDeletingDeck}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir baralho?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deck?.nome}” e todos os cartões dele serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && <p aria-live="polite" className="text-sm text-destructive">{actionError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSaving}
              onClick={(event) => { event.preventDefault(); void removeDeck() }}
            >
              {isSaving ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppPageLayout>
  )
}
