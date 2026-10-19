import { Suspense } from "react"
import { ReviewSession } from "@/components/study/review-session"

export default function RevisaoPage() {
  return (
    <Suspense fallback={<main className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Carregando revisão...</main>}>
      <ReviewSession />
    </Suspense>
  )
}
