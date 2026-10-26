"use client"

import { useEffect, useState } from "react"
import { ApiError, apiRequest } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"

type Usuario = {
  id: string
  nome: string
  email: string
  perfil: string
  createdAt: string
}

type PaginaUsuarios = {
  dados: Usuario[]
  total: number
  page: number
  limit: number
}

export default function AdminUsuariosPage() {
  const { user, status } = useAuth()
  const [pagina, setPagina] = useState(1)
  const [resultado, setResultado] = useState<PaginaUsuarios | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erroAcesso, setErroAcesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (status !== "ready" || user?.perfil !== "administrador") return

    let cancelado = false
    apiRequest<PaginaUsuarios>(`usuarios?page=${pagina}&limit=20`)
      .then((dados) => {
        if (!cancelado) setResultado(dados)
      })
      .catch((motivo: unknown) => {
        if (cancelado) return
        if (motivo instanceof ApiError && motivo.status === 403) {
          setErroAcesso(true)
          return
        }
        setErro(motivo instanceof Error ? motivo.message : "Não foi possível carregar os usuários.")
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [pagina, status, user?.perfil])

  if ((status === "ready" && user?.perfil !== "administrador") || erroAcesso) {
    return <p role="alert">Acesso negado.</p>
  }

  const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / resultado.limit)) : 1

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Usuários</h2>
        <p className="text-sm text-muted-foreground">Contas cadastradas no sistema.</p>
      </div>

      {erro && <p className="text-sm text-destructive" role="alert">{erro}</p>}
      {carregando ? (
        <p className="text-sm text-muted-foreground">Carregando usuários...</p>
      ) : erro ? null : resultado?.dados.length ? (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Perfil</th>
                  <th className="px-4 py-3 font-medium">Data de criação</th>
                </tr>
              </thead>
              <tbody>
                {resultado.dados.map((usuario) => (
                  <tr className="border-t" key={usuario.id}>
                    <td className="px-4 py-3">{usuario.nome}</td>
                    <td className="px-4 py-3">{usuario.email}</td>
                    <td className="px-4 py-3">{usuario.perfil}</td>
                    <td className="px-4 py-3">
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(usuario.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-3">
            <span className="text-sm text-muted-foreground">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
              disabled={pagina <= 1}
              onClick={() => {
                setCarregando(true)
                setErro(null)
                setResultado(null)
                setPagina((valor) => valor - 1)
              }}
              type="button"
            >
              Anterior
            </button>
            <button
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
              disabled={!resultado || pagina >= totalPaginas}
              onClick={() => {
                setCarregando(true)
                setErro(null)
                setResultado(null)
                setPagina((valor) => valor + 1)
              }}
              type="button"
            >
              Próxima
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
      )}
    </section>
  )
}
