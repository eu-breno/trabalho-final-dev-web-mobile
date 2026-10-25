"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BookOpen, GraduationCap, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"

interface Turma {
    id: string
    nome: string
    descricao: string | null
    codigo: string
    totalMembros: number
    totalBaralhos: number
}

export default function TurmasPage() {
    const [turmas, setTurmas] = useState<Turma[]>([])
    const [loading, setLoading] = useState(true)

    // Estados para controlar o modal de entrar com código
    const [modalAberto, setModalAberto] = useState(false)
    const [codigoInput, setCodigoInput] = useState("")
    const [erroModal, setErroModal] = useState("")

    const carregarTurmas = useCallback(() => apiRequest<Turma[]>("turmas"), [])

    useEffect(() => {
        let cancelado = false
        carregarTurmas()
            .then((data) => {
                if (!cancelado) setTurmas(data)
            })
            .catch((err: unknown) => {
                if (cancelado) return
                console.error("Erro ao carregar turmas:", err)
                setTurmas([])
            })
            .finally(() => {
                if (!cancelado) setLoading(false)
            })
        return () => {
            cancelado = true
        }
    }, [carregarTurmas])

    // Função disparada ao enviar o código da turma
    const handleEntrarTurma = async (e: React.FormEvent) => {
        e.preventDefault()
        setErroModal("")

        try {
            await apiRequest("turmas/entrar", {
                method: "POST",
                body: JSON.stringify({ codigo: codigoInput }),
            })

            // Sucesso: fecha o modal, limpa o input e recarrega a lista
            setModalAberto(false)
            setCodigoInput("")
            setLoading(true)
            carregarTurmas()
                .then(setTurmas)
                .catch((err: unknown) => {
                    console.error("Erro ao atualizar turmas:", err)
                    setTurmas([])
                })
                .finally(() => setLoading(false))
            alert("Você entrou na turma com sucesso!")
        } catch (err) {
            setErroModal(err instanceof Error ? err.message : "Erro ao entrar na turma")
        }
    }

    const totalTurmas = turmas.length
    const totalBaralhosCompartilhados = turmas.reduce((acc, t) => acc + t.totalBaralhos, 0)
    const totalColegas = turmas.reduce((acc, t) => acc + t.totalMembros, 0)

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 py-2 relative">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">APRENDER EM GRUPO</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">Minhas turmas</h1>
                    <p className="mt-2 text-muted-foreground">Acompanhe conteúdos e estude junto com sua turma.</p>
                </div>
                <button
                    onClick={() => setModalAberto(true)}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
                    type="button"
                >
                    ＋ Entrar com código
                </button>
            </div>

            {/* MODAL SIMPLES DE ENTRAR COM CÓDIGO */}
            {modalAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
                        <h2 className="text-xl font-semibold">Entrar em uma turma</h2>
                        <p className="text-sm text-muted-foreground">Peça o código da turma ao seu professor e digite-o abaixo.</p>

                        <form onSubmit={handleEntrarTurma} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Ex: BIO-101"
                                value={codigoInput}
                                onChange={(e) => setCodigoInput(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                                required
                            />

                            {erroModal && <p className="text-sm text-red-500">{erroModal}</p>}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalAberto(false)}
                                    className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                                >
                                    Entrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SEÇÃO DE ESTATÍSTICAS E LISTAGEM (MANTIDAS IGUAIS) */}
            <section className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: "Turmas ativas", value: totalTurmas.toString(), icon: Users },
                    { label: "Baralhos compartilhados", value: totalBaralhosCompartilhados.toString(), icon: BookOpen },
                    { label: "Colegas estudando", value: totalColegas.toString(), icon: GraduationCap },
                ].map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card className="rounded-2xl border-border/80 bg-card shadow-sm" key={stat.label}>
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <Icon className="size-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </section>

            <section>
                <div className="mb-4 flex items-end justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Turmas que você participa</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Conteúdos recentes e atividade da turma.</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{totalTurmas} turmas</span>
                </div>

                {loading ? (
                    <p className="text-sm text-muted-foreground">Carregando turmas...</p>
                ) : turmas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma turma encontrada.</p>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {turmas.map((turma) => {
                            const inicial = turma.nome.slice(0, 2).toUpperCase()
                            return (
                                <Card className="rounded-2xl border-border/80 bg-card shadow-sm transition hover:shadow-md" key={turma.id}>
                                    <CardContent className="p-5 sm:p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-sm font-bold text-foreground">
                                                {inicial}
                                            </div>
                                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        Código: {turma.codigo}
                      </span>
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold">{turma.nome}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">{turma.descricao || "Sem descrição"}</p>
                                        <div className="mt-5 flex flex-wrap gap-4 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-4" /> {turma.totalMembros} participantes
                      </span>
                                            <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="size-4" /> {turma.totalBaralhos} baralhos
                      </span>
                                        </div>
                                        <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-muted-foreground" href={`/turmas/${turma.id}`}>
                                            Ver materiais <ArrowUpRight className="size-4" />
                                        </Link>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}