"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpAZ, ArrowUpWideNarrow, Ellipsis, Layers, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { ApiDeck, apiRequest } from "@/lib/api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"

type SortMode = "name-asc" | "name-desc" | "date-asc" | "date-desc"

export function DeckBrowser({
  discover = false,
  refreshKey = 0,
  onCreate,
}: {
  discover?: boolean
  refreshKey?: number
  onCreate?: () => void
}) {
  const [query, setQuery] = useState("")
  const [decks, setDecks] = useState<ApiDeck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>("name-asc")
  const [reloadKey, setReloadKey] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editingDeck, setEditingDeck] = useState<ApiDeck | null>(null)
  const [deletingDeck, setDeletingDeck] = useState<ApiDeck | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiRequest<ApiDeck[]>("baralhos")
      .then((result) => {
        if (cancelled) return
        setDecks(result)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Não foi possível carregar seus baralhos.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey, reloadKey])

  const visibleDecks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR")
    const matches = decks.filter((deck) =>
      `${deck.nome} ${deck.descricao ?? ""}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
    )
    return matches.sort((left, right) => {
      if (sortMode.startsWith("name")) {
        const compared = left.nome.localeCompare(right.nome, "pt-BR", { sensitivity: "base" })
        return sortMode === "name-asc" ? compared : -compared
      }
      const compared = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      return sortMode === "date-asc" ? compared : -compared
    })
  }, [decks, query, sortMode])

  useEffect(() => {
    setPage(1)
  }, [query, sortMode, refreshKey, reloadKey])

  const paginatedDecks = useMemo(() => {
    const start = (page - 1) * pageSize
    return visibleDecks.slice(start, start + pageSize)
  }, [page, pageSize, visibleDecks])

  async function saveDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingDeck) return
    const formData = new FormData(event.currentTarget)
    setIsSaving(true)
    setError(null)
    setActionError(null)
    try {
      await apiRequest<ApiDeck>(`baralhos/${encodeURIComponent(editingDeck.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ nome: formData.get("nome") }),
      })
      setEditingDeck(null)
      setLoading(true)
      setReloadKey((value) => value + 1)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Não foi possível atualizar o baralho.")
    } finally {
      setIsSaving(false)
    }
  }

  async function removeDeck() {
    if (!deletingDeck) return
    setIsSaving(true)
    setError(null)
    setActionError(null)
    try {
      await apiRequest<void>(`baralhos/${encodeURIComponent(deletingDeck.id)}`, { method: "DELETE" })
      setDeletingDeck(null)
      setLoading(true)
      setReloadKey((value) => value + 1)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Não foi possível excluir o baralho.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar baralhos"
            className="h-9 rounded-lg bg-card pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={discover ? "Busque por assunto ou palavra-chave" : "Buscar nos meus baralhos"}
            value={query}
          />
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <span className="text-sm text-muted-foreground">
            {decks.length} {decks.length === 1 ? "baralho" : "baralhos"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button aria-label="Ordenar baralhos" size="icon" variant="outline" />}>
              <ArrowDownWideNarrow />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortMode("name-asc")}><ArrowDownAZ /> Nome (A–Z)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortMode("name-desc")}><ArrowUpAZ /> Nome (Z–A)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortMode("date-desc")}><ArrowDownWideNarrow /> Data (mais recentes)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortMode("date-asc")}><ArrowUpWideNarrow /> Data (mais antigos)</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {!discover && onCreate && (
            <Button onClick={onCreate} size="sm" type="button">
              <Plus /> Criar baralho
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <p aria-live="polite" className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Carregando seus baralhos...</p>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-card py-12 text-center">
          <p className="font-medium">Não foi possível carregar os baralhos</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : visibleDecks.length ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[38%]">Baralho</TableHead>
                <TableHead className="w-[14%]">Cartões</TableHead>
                <TableHead className="w-[18%]">Pendentes</TableHead>
                <TableHead className="w-[18%]">Criado em</TableHead>
                <TableHead className="w-[12%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDecks.map((deck) => (
                <TableRow key={deck.id}>
                  <TableCell>
                    <Link className="group flex items-center gap-3" href={`/baralhos/${deck.id}`}>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                        <Layers className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground group-hover:text-primary">{deck.nome}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {deck.descricao ? deck.descricao : "Sem descrição"}
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>{deck.totalCartoes}</TableCell>
                  <TableCell>{deck.cartoesPendentes}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(deck.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium text-foreground transition-colors hover:bg-muted"
                        href={`/baralhos/${deck.id}`}
                      >
                        Abrir
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button aria-label={`Ações de ${deck.nome}`} size="icon-sm" type="button" variant="ghost" />}>
                          <Ellipsis />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => { setActionError(null); setEditingDeck(deck) }}>
                              <Pencil /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => { setActionError(null); setDeletingDeck(deck) }}
                              variant="destructive"
                            >
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
            totalItems={visibleDecks.length}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize)
              setPage(1)
            }}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <p className="font-medium">{query ? "Nenhum baralho encontrado" : "Sua biblioteca está vazia"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? "Tente outro termo ou palavra-chave." : "Crie um baralho para começar a organizar seus estudos."}
          </p>
        </div>
      )}

      <Dialog open={editingDeck !== null} onOpenChange={(open) => { if (!open) setEditingDeck(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar baralho</DialogTitle>
            <DialogDescription>Altere o nome do seu baralho.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={saveDeck}>
            <label className="block space-y-2 text-sm font-medium" htmlFor="edit-deck-name">
              Nome
              <Input autoFocus defaultValue={editingDeck?.nome ?? ""} id="edit-deck-name" maxLength={80} name="nome" required />
            </label>
            {actionError && <p aria-live="polite" className="text-sm text-destructive">{actionError}</p>}
            <DialogFooter>
              <Button onClick={() => setEditingDeck(null)} type="button" variant="outline">Cancelar</Button>
              <Button disabled={isSaving} type="submit">{isSaving ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingDeck !== null} onOpenChange={(open) => { if (!open) setDeletingDeck(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir baralho?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingDeck
                ? `“${deletingDeck.nome}” e todos os cartões dele serão excluídos permanentemente.`
                : "Esta ação não pode ser desfeita."}
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
    </div>
  )
}
