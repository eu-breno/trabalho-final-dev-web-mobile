"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BookOpenCheck, Layers3, Target } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { StatisticsDashboard } from "@/components/statistics/statistics-dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError, apiRequest, type ApiAdminUserDetail } from "@/lib/api"

export default function AdminUsuarioDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, status } = useAuth()
  const [tentativa, setTentativa] = useState(0)
  const requestKey = `${id}:${tentativa}`
  const [resultado, setResultado] = useState<{
    key: string
    status: "success" | "denied" | "not-found" | "error"
    detalhe?: ApiAdminUserDetail
    erro?: string
  } | null>(null)

  useEffect(() => {
    if (status !== "ready" || user?.perfil !== "administrador") return

    let cancelado = false
    apiRequest<ApiAdminUserDetail>(`usuarios/${encodeURIComponent(id)}`)
      .then((resultado) => {
        if (!cancelado) {
          setResultado({ key: requestKey, status: "success", detalhe: resultado })
        }
      })
      .catch((motivo: unknown) => {
        if (cancelado) return
        if (motivo instanceof ApiError && motivo.status === 403) {
          setResultado({ key: requestKey, status: "denied" })
          return
        }
        if (motivo instanceof ApiError && motivo.status === 404) {
          setResultado({ key: requestKey, status: "not-found" })
          return
        }
        setResultado({
          key: requestKey,
          status: "error",
          erro: motivo instanceof Error ? motivo.message : "Não foi possível carregar o usuário.",
        })
      })

    return () => {
      cancelado = true
    }
  }, [id, requestKey, status, user?.perfil])

  const estadoAtual = resultado?.key === requestKey ? resultado : null
  const detalhe = estadoAtual?.status === "success" ? estadoAtual.detalhe : null

  function voltarParaLista() {
    router.push("/admin/usuarios")
  }

  if (status === "ready" && user?.perfil !== "administrador") {
    return (
      <section className="space-y-4">
        <p role="alert">Acesso negado.</p>
        <Button onClick={voltarParaLista} type="button" variant="outline">
          <ArrowLeft /> Voltar para usuários
        </Button>
      </section>
    )
  }

  if (
    estadoAtual?.status === "denied" ||
    estadoAtual?.status === "not-found" ||
    estadoAtual?.status === "error"
  ) {
    const acessoNegado = estadoAtual.status === "denied"
    const naoEncontrado = estadoAtual.status === "not-found"
    const erro = estadoAtual.status === "error" ? estadoAtual.erro : null
    const mensagem = acessoNegado
      ? "Acesso negado."
      : naoEncontrado
        ? "Usuário não encontrado."
        : erro

    return (
      <section className="space-y-4">
        <p aria-live="polite" className={acessoNegado || naoEncontrado ? "text-muted-foreground" : "text-destructive"}>
          {mensagem}
        </p>
        <div className="flex gap-2">
          <Button onClick={voltarParaLista} type="button" variant="outline">
            <ArrowLeft /> Voltar para usuários
          </Button>
          {erro && (
            <Button onClick={() => setTentativa((valor) => valor + 1)} type="button">
              Tentar novamente
            </Button>
          )}
        </div>
      </section>
    )
  }

  if (!detalhe) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <Skeleton className="h-28 rounded-2xl" key={item} />)}
        </div>
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </section>
    )
  }

  const resumo = [
    { label: "Baralhos", valor: detalhe.totalBaralhos, icon: Layers3 },
    { label: "Cartas", valor: detalhe.totalCartoes, icon: BookOpenCheck },
    { label: "Cartas pendentes", valor: detalhe.cartoesPendentes, icon: Target },
  ]

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8">
      <div className="space-y-5">
        <Button onClick={voltarParaLista} type="button" variant="outline">
          <ArrowLeft /> Voltar para usuários
        </Button>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{detalhe.nome}</h1>
            <Badge variant={detalhe.perfil === "administrador" ? "default" : "secondary"}>
              {detalhe.perfil === "administrador" ? "Administrador" : "Usuário"}
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">{detalhe.email}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Criado em {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(new Date(detalhe.createdAt))}
          </p>
        </div>
      </div>

      <section aria-label="Resumo do usuário" className="grid gap-4 sm:grid-cols-3">
        {resumo.map(({ label, valor, icon: Icon }) => (
          <Card className="rounded-2xl border-border/80 bg-card shadow-sm" key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Icon className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight">{valor}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <StatisticsDashboard
        key={`${detalhe.id}:${tentativa}`}
        userId={detalhe.id}
        userName={detalhe.nome}
      />
    </section>
  )
}
