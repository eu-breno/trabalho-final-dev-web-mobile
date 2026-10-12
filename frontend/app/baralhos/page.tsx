"use client"

import { useCallback, useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowRight, BookCopy, Plus, X } from "lucide-react"
import { AppPageLayout } from "@/components/navigation/app-page-layout"
import { DeckBrowser } from "@/components/study/deck-browser"
import { ApiDeck, apiRequest } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function BaralhosPage() {
  const [decks, setDecks] = useState<ApiDeck[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updateDecks = useCallback((nextDecks: ApiDeck[]) => setDecks(nextDecks), [])

  async function createDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)
    const data = new FormData(event.currentTarget)
    try {
      await apiRequest<ApiDeck>("baralhos", {
        method: "POST",
        body: JSON.stringify({
          nome: data.get("name"),
          descricao: data.get("description") || undefined,
        }),
      })
      setIsCreating(false)
      setRefreshKey((value) => value + 1)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar o baralho.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppPageLayout>
      <div className="mx-auto w-full max-w-7xl space-y-8 py-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">SUA BIBLIOTECA</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Meus baralhos</h1>
            <p className="mt-2 text-muted-foreground">Organize seus estudos e revise no seu próprio ritmo.</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            onClick={() => { setError(null); setIsCreating(true) }}
            type="button"
          >
            <Plus className="size-4" /> Criar baralho
          </button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted p-5">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-foreground shadow-sm"><BookCopy className="size-5" /></div>
            <div><p className="text-2xl font-semibold">{decks.length}</p><p className="text-sm text-muted-foreground">baralhos na sua biblioteca</p></div>
          </div>
          <Link className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition hover:bg-muted" href="/buscar">
            <div><p className="font-semibold">Procurando um baralho?</p><p className="mt-1 text-sm text-muted-foreground">Busque por nome ou descrição na sua biblioteca.</p></div>
            <ArrowRight className="size-5 shrink-0 text-foreground transition group-hover:translate-x-1" />
          </Link>
        </section>

        <DeckBrowser onDecksChange={updateDecks} refreshKey={refreshKey} />
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsCreating(false)
        }}>
          <section aria-labelledby="create-deck-title" aria-modal="true" className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl" role="dialog">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold" id="create-deck-title">Criar baralho</h2>
                <p className="mt-1 text-sm text-muted-foreground">Dê um nome e, se quiser, uma descrição.</p>
              </div>
              <button aria-label="Fechar" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setIsCreating(false)} type="button">
                <X className="size-4" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={createDeck}>
              <label className="block space-y-2 text-sm font-medium" htmlFor="deck-name">
                Nome
                <Input autoFocus id="deck-name" maxLength={80} name="name" required />
              </label>
              <label className="block space-y-2 text-sm font-medium" htmlFor="deck-description">
                Descrição
                <Textarea id="deck-description" maxLength={300} name="description" rows={3} />
              </label>
              {error && <p aria-live="polite" className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted" onClick={() => setIsCreating(false)} type="button">Cancelar</button>
                <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50" disabled={isSaving} type="submit">
                  {isSaving ? "Criando..." : "Criar baralho"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AppPageLayout>
  )
}
