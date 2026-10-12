"use client"

import { useState, type FormEvent } from "react"
import { cn } from "cn"
import Link from "next/link"

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

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    const senha = formData.get("password")
    const confirmarSenha = formData.get("confirm-password")

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem.")
      return
    }

    setIsSubmitting(true)
    try {
      await requestJson("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.get("name"),
          email: formData.get("email"),
          senha,
        }),
      })
      setSuccess("Conta criada com sucesso. Agora você já pode entrar.")
      form.reset()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar sua conta.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-3xl border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl shadow-black/20">
        <CardHeader className="gap-2 px-7 pt-8 text-left">
          <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-100">Comece sua jornada</CardTitle>
          <CardDescription className="text-zinc-400">Crie sua conta e comece a organizar seus estudos.</CardDescription>
        </CardHeader>
        <CardContent className="px-7 pb-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-4">
              {error && (
                <p aria-live="polite" className="rounded-xl border border-red-900/70 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}
              {success && (
                <p aria-live="polite" className="rounded-xl border border-emerald-900/70 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
                  {success}
                </p>
              )}
              <Field>
                <FieldLabel className="text-zinc-300" htmlFor="name">Nome</FieldLabel>
                <Input
                  className="h-11 border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/30"
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Como podemos te chamar?"
                  autoComplete="name"
                  maxLength={80}
                  required
                />
              </Field>
              <Field>
                <FieldLabel className="text-zinc-300" htmlFor="email">Email</FieldLabel>
                <Input
                  className="h-11 border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/30"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="fulano@exemplo.com"
                  autoComplete="email"
                  maxLength={120}
                  required
                />
              </Field>
              <Field>
                <FieldLabel className="text-zinc-300" htmlFor="password">Senha</FieldLabel>
                <Input className="h-11 border-zinc-700 bg-zinc-950 text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/30" id="password" name="password" type="password" minLength={8} maxLength={72} autoComplete="new-password" required />
              </Field>
              <Field>
                <FieldLabel className="text-zinc-300" htmlFor="confirm-password">Confirmar senha</FieldLabel>
                <Input className="h-11 border-zinc-700 bg-zinc-950 text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/30" id="confirm-password" name="confirm-password" minLength={8} maxLength={72} autoComplete="new-password" required />
              </Field>
              <Field>
                <Button className="h-11 w-full rounded-xl bg-zinc-700 text-sm text-white hover:bg-zinc-600" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Criando conta..." : "Criar conta"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-zinc-600">
            <span className="h-px flex-1 bg-zinc-800" />
            ou
            <span className="h-px flex-1 bg-zinc-800" />
          </div>
          <p className="mt-6 text-center text-sm text-zinc-400">
            Já tem uma conta? <Link className="font-medium text-zinc-200 underline-offset-4 hover:underline" href="/login">Fazer login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
