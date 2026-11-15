"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EllipsisVertical, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth/auth-provider"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { ApiError, apiRequest, type ApiAdminUser, type ApiAdminUserPage } from "@/lib/api"

export default function AdminUsuariosPage() {
  const { user, status } = useAuth()
  const router = useRouter()
  const [pagina, setPagina] = useState(1)
  const [limite, setLimite] = useState(20)
  const [resultado, setResultado] = useState<ApiAdminUserPage | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erroAcesso, setErroAcesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [atualizacao, setAtualizacao] = useState(0)
  const [usuarioExclusao, setUsuarioExclusao] = useState<ApiAdminUser | null>(null)
  const [senha, setSenha] = useState("")
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    if (status !== "ready" || user?.perfil !== "administrador") return

    let cancelado = false
    apiRequest<ApiAdminUserPage>(`usuarios?page=${pagina}&limit=${limite}`)
      .then((dados) => {
        if (!cancelado) {
          setResultado(dados)
          setErro(null)
        }
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
  }, [atualizacao, limite, pagina, status, user?.perfil])

  function fecharExclusao() {
    setUsuarioExclusao(null)
    setSenha("")
    setErroExclusao(null)
  }

  function abrirExclusao(usuario: ApiAdminUser) {
    setSenha("")
    setErroExclusao(null)
    setUsuarioExclusao(usuario)
  }

  async function excluirUsuario() {
    if (!usuarioExclusao || senha.length === 0 || excluindo) return

    setExcluindo(true)
    setErroExclusao(null)
    try {
      await apiRequest<void>(`usuarios/${encodeURIComponent(usuarioExclusao.id)}`, {
        method: "DELETE",
        body: JSON.stringify({ senha }),
      })

      toast.success("Usuário excluído com sucesso.")
      fecharExclusao()
      setCarregando(true)
      setResultado(null)
      if (resultado?.dados.length === 1 && pagina > 1) {
        setPagina((valor) => valor - 1)
      } else {
        setAtualizacao((valor) => valor + 1)
      }
    } catch (motivo) {
      if (
        motivo instanceof ApiError &&
        motivo.status === 403 &&
        motivo.message === "Senha de confirmação incorreta"
      ) {
        setErroExclusao(motivo.message)
        setSenha("")
        return
      }
      toast.error(motivo instanceof Error ? motivo.message : "Não foi possível excluir o usuário.")
    } finally {
      setExcluindo(false)
    }
  }

  if ((status === "ready" && user?.perfil !== "administrador") || erroAcesso) {
    return <p role="alert">Acesso negado.</p>
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Usuários</h1>
        <p className="mt-2 text-muted-foreground">Contas cadastradas no sistema.</p>
      </div>

      {erro && <p className="text-sm text-destructive" role="alert">{erro}</p>}
      {carregando ? (
        <p className="text-sm text-muted-foreground">Carregando usuários...</p>
      ) : erro ? null : resultado?.dados.length ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Nome</TableHead>
                <TableHead className="w-[34%]">E-mail</TableHead>
                <TableHead className="w-[20%]">Tipo</TableHead>
                <TableHead className="w-[16%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultado.dados.map((usuario) => {
                const ehProprioUsuario = usuario.id === user?.id

                return (
                  <TableRow
                    aria-label={`Detalhes de ${usuario.nome}`}
                    className="cursor-pointer"
                    key={usuario.id}
                    onClick={(event) => {
                      if (event.target instanceof Element && event.target.closest("a, button")) return
                      router.push(`/admin/usuarios/${encodeURIComponent(usuario.id)}`)
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        router.push(`/admin/usuarios/${encodeURIComponent(usuario.id)}`)
                      }
                    }}
                    tabIndex={0}
                  >
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.perfil === "administrador" ? "default" : "secondary"}>
                        {usuario.perfil === "administrador" ? "Administrador" : "Usuário"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              aria-label={`Ações de ${usuario.nome}`}
                              onClick={(event) => event.stopPropagation()}
                              size="icon-sm"
                              title={ehProprioUsuario ? "Sua própria conta não pode ser excluída." : undefined}
                              type="button"
                              variant="ghost"
                            />
                          }
                        >
                          <EllipsisVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                          <DropdownMenuItem
                            disabled={ehProprioUsuario}
                            onClick={(event) => {
                              event.stopPropagation()
                              abrirExclusao(usuario)
                            }}
                            variant="destructive"
                          >
                            <Trash2 /> Excluir usuário
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <TablePagination
            page={pagina}
            pageSize={limite}
            totalItems={resultado.total}
            onPageChange={(proximaPagina) => {
              setCarregando(true)
              setErro(null)
              setPagina(proximaPagina)
            }}
            onPageSizeChange={(proximoLimite) => {
              setCarregando(true)
              setErro(null)
              setResultado(null)
              setPagina(1)
              setLimite(proximoLimite)
            }}
          />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
          Nenhum usuário encontrado.
        </p>
      )}

      <AlertDialog
        open={usuarioExclusao !== null}
        onOpenChange={(aberto) => {
          if (!aberto && !excluindo) fecharExclusao()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              {usuarioExclusao
                ? `Tem certeza de que deseja excluir ${usuarioExclusao.nome} (${usuarioExclusao.email})? Os baralhos, cartões e histórico de revisões serão apagados permanentemente. Esta ação não pode ser desfeita.`
                : "Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="block space-y-2 text-sm font-medium" htmlFor="senha-exclusao-usuario">
            Sua senha de administrador
            <Input
              autoComplete="current-password"
              autoFocus
              disabled={excluindo}
              id="senha-exclusao-usuario"
              onChange={(event) => {
                setSenha(event.target.value)
                setErroExclusao(null)
              }}
              type="password"
              value={senha}
            />
          </label>
          {erroExclusao && <p aria-live="polite" className="text-sm text-destructive">{erroExclusao}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo} onClick={fecharExclusao}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!senha || excluindo}
              onClick={(event) => {
                event.preventDefault()
                void excluirUsuario()
              }}
            >
              {excluindo ? <><Loader2 className="animate-spin" /> Excluindo...</> : "Confirmar exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
