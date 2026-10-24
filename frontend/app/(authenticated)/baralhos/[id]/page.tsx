"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowLeft, ArrowUpAZ, CircleAlert, CircleCheck, EllipsisVertical, File, Pencil, Play, PlayingCardsFan, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AppPageContent } from "@/components/navigation/app-page-layout"
import { ApiCard, ApiDeck, apiRequest } from "@/lib/api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Textarea } from "@/components/ui/textarea"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { notifyNoReviewCards } from "@/lib/review-notifications"

type CardDraft = { frente: string; verso: string }
type CardSort = "name-asc" | "name-desc"
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
  const [deckDraft, setDeckDraft] = useState({ nome: "", descricao: "" })
  const [deletingCard, setDeletingCard] = useState<ApiCard | null>(null)
  const [deletingDeck, setDeletingDeck] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [cardSort, setCardSort] = useState<CardSort>("name-asc")
  const [pageState, setPageState] = useState({ page: 1, key: "" })
  const [pageSize, setPageSize] = useState(10)
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
    const compared = left.frente.localeCompare(right.frente, "pt-BR", { sensitivity: "base" })
    return cardSort === "name-asc" ? compared : -compared
  }), [cards, cardSort])

  const pageKey = `${cardSort}:${refreshKey}`
  const page = pageState.key === pageKey ? pageState.page : 1

  const paginatedCards = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedCards.slice(start, start + pageSize)
  }, [page, pageSize, sortedCards])

  function changePage(nextPage: number) {
    setPageState({ page: nextPage, key: pageKey })
  }

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
      toast.success(editingCard === "new" ? "Cartão criado com sucesso." : "Cartão atualizado com sucesso.")
      setEditingCard(null)
      setDraft(emptyDraft)
      refreshDeck()
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Não foi possível salvar o cartão."
      setActionError(message)
      toast.error(message)
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
      toast.success("Cartão excluído com sucesso.")
      setDeletingCard(null)
      refreshDeck()
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Não foi possível remover o cartão."
      setActionError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function saveDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!deck) return
    setIsSaving(true)
    setActionError(null)
    try {
      const updated = await apiRequest<ApiDeck>(`baralhos/${encodeURIComponent(deck.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ nome: deckDraft.nome, descricao: deckDraft.descricao || undefined }),
      })
      setDeck(updated)
      setEditingDeck(false)
      toast.success("Baralho atualizado com sucesso.")
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Não foi possível atualizar o baralho."
      setActionError(message)
      toast.error(message)
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
      toast.success("Baralho excluído com sucesso.")
      router.replace("/baralhos")
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Não foi possível excluir o baralho."
      setActionError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  function beginStudy(cardId?: string) {
    if (cardId) {
      const params = new URLSearchParams({ baralhoId: id, cartaoId: cardId })
      router.push(`/revisao?${params.toString()}`)
      return
    }
    if ((deck?.totalCartoes ?? 0) === 0) {
      notifyNoReviewCards("Este baralho ainda não tem cartões.")
      return
    }
    if (studyScope === "pendentes" && (deck?.cartoesPendentes ?? 0) === 0) {
      notifyNoReviewCards("Você não tem cartões pendentes para revisar agora.")
      return
    }
    const params = new URLSearchParams({ baralhoId: id })
    params.set("escopo", studyScope)
    setIsStartingStudy(false)
    router.push(`/revisao?${params.toString()}`)
  }

  return (
    <>
      <AppPageContent>
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
                    <PlayingCardsFan className="size-5" />
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
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button aria-label="Ações do baralho" size="icon" type="button" variant="ghost" />}>
                  <EllipsisVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => { setActionError(null); setDeckDraft({ nome: deck.nome, descricao: deck.descricao ?? "" }); setEditingDeck(true) }}>
                      <Pencil /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setActionError(null); setDeletingDeck(true) }} variant="destructive">
                      <Trash2 /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </section>

            {actionError && (
              <p aria-live="polite" className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">
                {actionError}
              </p>
            )}

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <PlayingCardsFan className="size-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Cartões deste baralho</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button aria-label="Ordenar cartões" size="icon-sm" variant="outline" />}>
                      <ArrowDownWideNarrow />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setCardSort("name-asc")}><ArrowDownAZ /> Nome (A–Z)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCardSort("name-desc")}><ArrowUpAZ /> Nome (Z–A)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button aria-label="Começar revisão" onClick={() => { setStudyScope("pendentes"); setIsStartingStudy(true) }} size="icon-sm" type="button" variant="ghost">
                    <Play />
                  </Button>
                  <Button onClick={() => startEditingCard()} size="sm" type="button">
                    <Plus /> Adicionar cartão
                  </Button>
                </div>
              </div>

              {sortedCards.length ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60%]">Frente</TableHead>
                        <TableHead className="w-[20%]">Status</TableHead>
                        <TableHead className="w-[20%] text-right" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCards.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <File className="size-4" />
                              </span>
                              <div className="min-w-0">
                                <HoverCard>
                                  <HoverCardTrigger render={<button className="w-full min-w-0 text-left" type="button" />}>
                                    <p className="truncate font-medium" title={card.frente}>{card.frente}</p>
                                    <p className="mt-1 truncate text-xs text-muted-foreground">{card.verso.slice(0, 80)}{card.verso.length > 80 ? "..." : ""}</p>
                                  </HoverCardTrigger>
                                  <HoverCardContent>
                                    <p className="font-medium">Próxima revisão</p>
                                    <p className="mt-1 text-muted-foreground">{formatShortDate(card.proximaRevisao)}</p>
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${new Date(card.proximaRevisao) <= new Date() ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                              {new Date(card.proximaRevisao) <= new Date()
                                ? <><CircleAlert className="size-4" /> Pendente</>
                                : <><CircleCheck className="size-4" /> Em dia</>}
                            </span>
                          </TableCell>
                          <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <Button aria-label={`Revisar cartão: ${card.frente}`} className="hover:bg-muted" onClick={() => beginStudy(card.id)} size="icon-sm" type="button" variant="ghost">
                                <Play />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger render={<Button aria-label={`Ações do cartão: ${card.frente}`} onClick={(event) => event.stopPropagation()} size="icon-sm" type="button" variant="ghost" />}>
                                  <EllipsisVertical />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={(event) => { event.stopPropagation(); startEditingCard(card) }}><Pencil /> Editar</DropdownMenuItem>
                                    <DropdownMenuItem onClick={(event) => { event.stopPropagation(); setActionError(null); setDeletingCard(card) }} variant="destructive">
                                      <Trash2 /> Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={sortedCards.length}
                    onPageChange={changePage}
                    onPageSizeChange={(nextPageSize) => {
                      setPageSize(nextPageSize)
                      setPageState({ page: 1, key: pageKey })
                    }}
                  />
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
      </AppPageContent>

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

      <Dialog open={editingDeck} onOpenChange={(open) => {
        if (open && deck) setDeckDraft({ nome: deck.nome, descricao: deck.descricao ?? "" })
        setEditingDeck(open)
        if (!open) setActionError(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar baralho</DialogTitle>
            <DialogDescription>Atualize o nome ou a descrição do baralho.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={saveDeck}>
            <label className="block space-y-2 text-sm font-medium" htmlFor="deck-edit-name">
              Nome
              <Input autoFocus id="deck-edit-name" maxLength={80} name="nome" onChange={(event) => setDeckDraft((value) => ({ ...value, nome: event.target.value }))} required value={deckDraft.nome} />
            </label>
            <label className="block space-y-2 text-sm font-medium" htmlFor="deck-edit-description">
              Descrição
              <Textarea id="deck-edit-description" maxLength={300} name="descricao" onChange={(event) => setDeckDraft((value) => ({ ...value, descricao: event.target.value }))} rows={3} value={deckDraft.descricao} />
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
    </>
  )
}
