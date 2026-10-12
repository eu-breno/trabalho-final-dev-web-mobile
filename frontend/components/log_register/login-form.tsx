import { useState, type FormEvent } from "react"
import { cn } from "cn"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { requestJson } from "@/lib/api"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)

    try {
      await requestJson<{ ok: boolean }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          senha: formData.get("password"),
        }),
      })
      router.replace("/dashboard")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível entrar.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-3xl border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl shadow-black/20">
        <CardHeader className="gap-2 px-7 pt-8 text-left">
          <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-100">Que bom ter você de volta!</CardTitle>
          <CardDescription className="text-zinc-400">Entre na sua conta ou explore a demonstração.</CardDescription>
        </CardHeader>
        <CardContent className="px-7 pb-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              {error && (
                <p aria-live="polite" className="rounded-xl border border-red-900/70 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}
              <Field>
                <FieldLabel className="text-zinc-300" htmlFor="email">Email</FieldLabel>
                <Input
                  className="h-11 border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/30"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="fulano@exemplo.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel className="text-zinc-300" htmlFor="password">Senha</FieldLabel>
                </div>
                <Input className="h-11 border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/30" id="password" name="password" type="password" autoComplete="current-password" required />
              </Field>
              <Field>
                <Button className="h-11 w-full rounded-xl bg-zinc-700 text-sm text-white hover:bg-zinc-600" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-zinc-600">
            <span className="h-px flex-1 bg-zinc-800" />
            ou
            <span className="h-px flex-1 bg-zinc-800" />
          </div>
          <Link className="flex h-11 w-full items-center justify-center rounded-xl border border-zinc-700 bg-transparent text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800" href="/dashboard">
            Explorar demonstração
          </Link>
          <p className="mt-2 text-center text-xs text-zinc-500">
            A demonstração usa dados fictícios e não cria uma sessão de usuário.
          </p>
          <p className="mt-6 text-center text-sm text-zinc-400">
            Ainda não tem uma conta? <Link className="font-medium text-zinc-200 underline-offset-4 hover:underline" href="/register">Criar conta</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
