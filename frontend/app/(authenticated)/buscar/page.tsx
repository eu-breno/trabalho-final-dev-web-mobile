import { Compass, Sparkles } from "lucide-react"
import { DeckBrowser } from "@/components/study/deck-browser"

export default function BuscarPage() {
  return (
      <div className="mx-auto w-full max-w-7xl space-y-8 py-2">
        <section className="overflow-hidden rounded-3xl border border-border bg-muted p-6 sm:p-9">
          <div className="flex max-w-2xl items-start gap-4">
            <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-foreground shadow-sm sm:flex"><Compass className="size-6" /></div>
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Sparkles className="size-4" /> EXPLORE E APRENDA</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Encontre seu próximo assunto</h1>
              <p className="mt-2 leading-6 text-muted-foreground">Encontre rapidamente um baralho da sua biblioteca para continuar aprendendo.</p>
            </div>
          </div>
        </section>
        <DeckBrowser discover />
      </div>
  )
}
