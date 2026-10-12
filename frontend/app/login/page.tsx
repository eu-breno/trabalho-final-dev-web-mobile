"use client"

import Link from "next/link"
import { LoginForm } from "@/components/log_register/login-form"
import { Brain, BookOpenCheck } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="grid min-h-svh bg-zinc-950 text-zinc-100 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-zinc-800 bg-zinc-900 p-12 text-zinc-100 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 top-20 size-96 rounded-full border-[56px] border-white/[0.03]" />
        <div className="relative flex items-center gap-2 text-xl font-semibold">
          <span className="flex size-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800"><Brain className="size-6" /></span>
          Memora
        </div>
        <div className="relative max-w-lg pb-10">
          <BookOpenCheck className="mb-6 size-8 text-zinc-300" strokeWidth={1.5} />
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">Aprender fica mais fácil quando você volta ao que importa.</h1>
          <p className="mt-5 text-lg leading-8 text-zinc-400">Organize seus conteúdos, crie bons hábitos e acompanhe cada conquista no seu ritmo.</p>
          <div className="mt-10 flex items-center gap-3 text-sm text-zinc-400">
            <div className="flex -space-x-2"><span className="flex size-8 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-700 text-xs font-semibold text-zinc-100">A</span><span className="flex size-8 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-600 text-xs font-semibold text-zinc-100">M</span><span className="flex size-8 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-500 text-xs font-semibold text-zinc-100">J</span></div>
            <span>Um passo de cada vez. Todos os dias.</span>
          </div>
        </div>
        <p className="relative text-sm text-zinc-500">Seu espaço para aprender melhor.</p>
      </section>
      <section className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link className="mb-10 flex items-center justify-center gap-2 text-xl font-semibold text-zinc-100 lg:hidden" href="/"><span className="flex size-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800"><Brain className="size-5" /></span>Memora</Link>
          <LoginForm />
          <p className="mt-8 text-center text-xs leading-5 text-zinc-500">Ao continuar, você concorda com nossos termos de uso e política de privacidade.</p>
        </div>
      </section>
    </main>
  )
}
