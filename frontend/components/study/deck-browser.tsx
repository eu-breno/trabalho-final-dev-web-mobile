"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Atom, BookOpen, Code2, Dna, Languages, Landmark, Search, SlidersHorizontal } from "lucide-react"
import { ApiDeck, apiRequest } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function deckIcon(deck: ApiDeck) {
  const name = `${deck.nome} ${deck.descricao ?? ""}`.toLowerCase()
  if (/biolog|célul|dna/.test(name)) return Dna
  if (/inglês|idioma|língua/.test(name)) return Languages
  if (/história|revolução/.test(name)) return Landmark
  if (/programa|código|web|tecnolog/.test(name)) return Code2
  if (/física|átomo/.test(name)) return Atom
  return BookOpen
}

export function DeckBrowser({
  discover = false,
  refreshKey = 0,
  onDecksChange,
}: {
  discover?: boolean
  refreshKey?: number
  onDecksChange?: (decks: ApiDeck[]) => void
}) {
  const [query, setQuery] = useState("")
  const [decks, setDecks] = useState<ApiDeck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiRequest<ApiDeck[]>("baralhos")
      .then((result) => {
        if (cancelled) return
        setDecks(result)
        onDecksChange?.(result)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(reason instanceof Error ? reason.message : "Não foi possível carregar seus baralhos.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey, onDecksChange])

  const filteredDecks = useMemo(
    () =>
      decks.filter((deck) =>
        `${deck.nome} ${deck.descricao ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [decks, query],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar baralhos"
            className="h-11 rounded-xl bg-card pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={discover ? "Busque por assunto ou palavra-chave" : "Buscar nos meus baralhos"}
            value={query}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4" />
          <span>{filteredDecks.length} {filteredDecks.length === 1 ? "baralho" : "baralhos"}</span>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Carregando seus baralhos...</p>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-card py-12 text-center">
          <p className="font-medium">Não foi possível carregar os baralhos</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : filteredDecks.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDecks.map((deck) => {
            const Icon = deckIcon(deck)
            return (
              <Link
                className="group"
                href={`/baralhos/${deck.id}`}
                key={deck.id}
              >
                <Card className="h-full rounded-2xl border-border/80 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="space-y-5 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-foreground">
                        <Icon className="size-6" />
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {deck.totalCartoes} {deck.totalCartoes === 1 ? "cartão" : "cartões"}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-semibold tracking-tight group-hover:underline">{deck.nome}</h2>
                      <p className="mt-1 min-h-10 text-sm leading-5 text-muted-foreground">
                        {deck.descricao || "Sem descrição. Abra para adicionar cartões e começar a estudar."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/70 pt-4 text-sm">
                      <span className="text-muted-foreground">
                        {deck.cartoesPendentes ? `${deck.cartoesPendentes} para revisar` : "Revisão em dia"}
                      </span>
                      <span className="font-medium text-foreground">Abrir baralho</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <p className="font-medium">{query ? "Nenhum baralho encontrado" : "Sua biblioteca está vazia"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? "Tente outro termo ou palavra-chave." : "Crie um baralho para começar a organizar seus estudos."}
          </p>
        </div>
      )}
    </div>
  )
}
