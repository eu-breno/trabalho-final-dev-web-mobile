"use client"

import { useState, type FormEvent } from "react"
import { AppPageLayout } from "@/components/navigation/app-page-layout"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DeckBrowser } from "@/components/study/deck-browser"
import { ApiDeck, apiRequest } from "@/lib/api"

export default function BaralhosPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Meus baralhos</h1>
          <p className="mt-2 text-muted-foreground">Organize seus estudos e revise no seu próprio ritmo.</p>
        </div>

        <DeckBrowser
          onCreate={() => { setError(null); setIsCreating(true) }}
          refreshKey={refreshKey}
        />
      </div>

      <Dialog open={isCreating} onOpenChange={(open) => { setIsCreating(open); if (!open) setError(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar baralho</DialogTitle>
            <DialogDescription>Dê um nome e, se quiser, uma descrição.</DialogDescription>
          </DialogHeader>
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
            <DialogFooter>
              <Button onClick={() => setIsCreating(false)} type="button" variant="outline">Cancelar</Button>
              <Button disabled={isSaving} type="submit">{isSaving ? "Criando..." : "Criar baralho"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppPageLayout>
  )
}
