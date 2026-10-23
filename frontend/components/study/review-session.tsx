"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { ApiCard, apiRequest } from "@/lib/api"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AppSidebar } from "@/components/navigation/app-sidebar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

type Rating = "errei" | "dificil" | "bom" | "facil"
type RatingCounts = Record<Rating, number>

const ratingOptions: { value: Rating; label: string; selectedClass: string }[] = [
  { value: "errei", label: "Errei", selectedClass: "border-destructive bg-destructive/10 text-destructive" },
  { value: "dificil", label: "Difícil", selectedClass: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { value: "bom", label: "Bom", selectedClass: "border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  { value: "facil", label: "Fácil", selectedClass: "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
]

const emptyCounts: RatingCounts = { errei: 0, dificil: 0, bom: 0, facil: 0 }

export function ReviewSession() {
  const params = useSearchParams()
  const router = useRouter()
  const deckId = params.get("baralhoId")
  const cardId = params.get("cartaoId")
  const scopeParam = params.get("escopo")
  const scope = scopeParam === "todos" ? "todos" : "pendentes"

  const [loadedSession, setLoadedSession] = useState<{
    key: string
    cards: ApiCard[]
    error: string | null
  } | null>(null)
  const [index, setIndex] = useState(0)
  const [reviewed, setReviewed] = useState(0)
  const [ratings, setRatings] = useState<RatingCounts>(emptyCounts)
  const [isSending, setIsSending] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [confirmExit, setConfirmExit] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [completedNormally, setCompletedNormally] = useState(false)
  const emptyReviewMessage = "Você não tem cartões pendentes para revisar agora"
  const sessionKey = `${deckId ?? ""}:${cardId ?? ""}:${scope}:${retryKey}`

  useEffect(() => {
    let cancelled = false
    const query = new URLSearchParams()
    if (cardId) query.set("cartaoId", cardId)
    else query.set("escopo", scope)

    const endpoint = deckId
      ? `baralhos/${encodeURIComponent(deckId)}/estudo?${query.toString()}`
      : `baralhos/estudo?${query.toString()}`

    apiRequest<ApiCard[]>(endpoint)
      .then((result) => {
        if (cancelled) return
        const nextError = result.length === 0 ? emptyReviewMessage : null
        setLoadedSession({ key: sessionKey, cards: result, error: nextError })
        setIndex(0)
        setReviewed(0)
        setRatings(emptyCounts)
        setShowAnswer(false)
        setSelectedRating(null)
        setReviewError(null)
        setCompletedNormally(result.length === 0)
        setShowResults(result.length === 0)
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setLoadedSession({
            key: sessionKey,
            cards: [],
            error: reason instanceof Error ? reason.message : "Não foi possível carregar os cartões.",
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [cardId, deckId, retryKey, scope, sessionKey])

  const cards = loadedSession?.key === sessionKey ? loadedSession.cards : []
  const loadError = loadedSession?.key === sessionKey ? loadedSession.error : null
  const isLoading = loadedSession?.key !== sessionKey
  const currentCard = cards[index]
  const progress = cards.length === 0 ? 0 : Math.round((reviewed / cards.length) * 100)

  async function submitRating() {
    if (!currentCard || !selectedRating || isSending) return
    setIsSending(true)
    setReviewError(null)
    try {
      await apiRequest<ApiCard>(`cartoes/${encodeURIComponent(currentCard.id)}/revisoes`, {
        method: "POST",
        body: JSON.stringify({ nota: selectedRating }),
      })
      const nextRatings = { ...ratings, [selectedRating]: ratings[selectedRating] + 1 }
      const nextReviewed = reviewed + 1
      setRatings(nextRatings)
      setReviewed(nextReviewed)
      setShowAnswer(false)
      setSelectedRating(null)

      if (index + 1 === cards.length) {
        setCompletedNormally(true)
        setShowResults(true)
      } else {
        setIndex((value) => value + 1)
      }
    } catch (reason) {
      setReviewError(reason instanceof Error ? reason.message : "Não foi possível registrar sua avaliação.")
    } finally {
      setIsSending(false)
    }
  }

  function finishAndReturn() {
    setShowResults(false)
    router.replace(deckId ? `/baralhos/${encodeURIComponent(deckId)}` : "/dashboard")
  }

  return (
    <AuthProvider>
      <SidebarProvider
        defaultOpen={false}
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <main className="relative flex min-h-svh flex-1 flex-col items-center px-4 py-6 sm:px-8 sm:py-10">
            <Button
              aria-label="Sair da revisão"
              className="absolute left-4 top-4 sm:left-8 sm:top-8"
              onClick={() => setConfirmExit(true)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X />
            </Button>

            <div className="my-auto flex w-full max-w-2xl flex-col gap-6 py-16">
              <Progress aria-label="Progresso da revisão" className="gap-2" value={progress}>
                <div className="flex w-full items-center gap-2">
                  <ProgressLabel className="text-xs text-muted-foreground">Progresso</ProgressLabel>
                  <span className="ml-auto text-xs tabular-nums text-muted-foreground">{progress}%</span>
                </div>
              </Progress>

              {isLoading ? (
                <p className="py-20 text-center text-sm text-muted-foreground">Carregando cartões...</p>
              ) : loadError ? (
                <div className="space-y-4 rounded-3xl border border-destructive/30 bg-card p-8 text-center">
                  {loadError === emptyReviewMessage ? (
                    <Alert variant="default" className="border-amber-500/30 bg-amber-500/5 text-left">
                      <AlertTitle className="text-base font-semibold text-foreground">Sem cartões pendentes</AlertTitle>
                      <AlertDescription>{loadError}</AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <p className="font-medium">Não foi possível iniciar a revisão</p>
                      <p className="text-sm text-muted-foreground">{loadError}</p>
                    </>
                  )}
                  <div className="flex justify-center gap-2">
                    {loadError !== emptyReviewMessage && (
                      <Button onClick={() => setRetryKey((value) => value + 1)} type="button" variant="outline">Tentar novamente</Button>
                    )}
                    <Button onClick={finishAndReturn} type="button">Voltar</Button>
                  </div>
                </div>
              ) : currentCard ? (
                <>
                  <section aria-label="Cartão atual" className="flex min-h-64 items-center justify-center rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:min-h-80 sm:p-12">
                    <div className="w-full">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {showAnswer ? "Resposta" : "Pergunta"}
                      </p>
                      <p className="mt-5 whitespace-pre-wrap text-2xl font-medium leading-relaxed tracking-tight sm:text-3xl">
                        {showAnswer ? currentCard.verso : currentCard.frente}
                      </p>
                    </div>
                  </section>

                  <Button
                    className="w-full"
                    onClick={() => {
                      if (showAnswer) setSelectedRating(null)
                      setShowAnswer((value) => !value)
                    }}
                    size="lg"
                    type="button"
                    variant="outline"
                  >
                    {showAnswer ? "Desvirar cartão" : "Virar cartão"}
                  </Button>

                  <div aria-label="Como você se saiu?" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ratingOptions.map((option) => (
                      <Button
                        aria-pressed={selectedRating === option.value}
                        className={selectedRating === option.value ? option.selectedClass : ""}
                        disabled={!showAnswer || isSending}
                        key={option.value}
                        onClick={() => setSelectedRating(option.value)}
                        type="button"
                        variant="outline"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>

                  {reviewError && <p aria-live="polite" className="text-center text-sm text-destructive">{reviewError}</p>}

                  <Button disabled={!selectedRating || isSending} onClick={submitRating} size="lg" type="button">
                    {isSending ? "Enviando..." : "Enviar"}
                  </Button>
                </>
              ) : null}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      <AlertDialog open={confirmExit} onOpenChange={setConfirmExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da revisão?</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja sair da revisão? As avaliações já enviadas foram salvas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar revisando</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                setConfirmExit(false)
                setCompletedNormally(false)
                setShowResults(true)
              }}
            >
              Sair e ver resultado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={showResults}
        onOpenChange={(open) => {
          if (!open) finishAndReturn()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{completedNormally ? "Revisão concluída" : "Resultado parcial da revisão"}</DialogTitle>
            <DialogDescription>
              {completedNormally
                ? "Você chegou ao fim dos cartões desta sessão."
                : "Este é o resultado das avaliações que você enviou até sair."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-xl bg-muted p-4">
            <p className="font-medium">{reviewed} {reviewed === 1 ? "cartão revisado" : "cartões revisados"}</p>
            <p className="text-sm text-muted-foreground">
              {ratings.errei} errados · {ratings.dificil} difíceis · {ratings.bom} bons · {ratings.facil} fáceis
            </p>
          </div>
          <Button onClick={finishAndReturn} type="button">Voltar ao baralho</Button>
        </DialogContent>
      </Dialog>
    </AuthProvider>
  )
}
