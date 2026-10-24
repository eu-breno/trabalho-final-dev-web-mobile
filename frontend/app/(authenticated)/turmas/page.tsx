import Link from "next/link"
import { ArrowUpRight, BookOpen, GraduationCap, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const classes = [
  { name: "Biologia — 2º semestre", teacher: "Prof.ª Mariana Costa", members: 28, decks: 4, color: "bg-muted text-foreground", initials: "BC" },
  { name: "Inglês intermediário", teacher: "Prof. Daniel Martins", members: 16, decks: 6, color: "bg-muted text-foreground", initials: "IN" },
  { name: "Programação Web", teacher: "Prof. Rafael Lima", members: 32, decks: 3, color: "bg-muted text-foreground", initials: "PW" },
]

export default function TurmasPage() {
  return (
      <div className="mx-auto w-full max-w-7xl space-y-8 py-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">APRENDER EM GRUPO</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Minhas turmas</h1>
            <p className="mt-2 text-muted-foreground">Acompanhe conteúdos e estude junto com sua turma.</p>
          </div>
          <button className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-muted" type="button">＋ Entrar com código</button>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Turmas ativas", value: "3", icon: Users },
            { label: "Baralhos compartilhados", value: "13", icon: BookOpen },
            { label: "Colegas estudando", value: "76", icon: GraduationCap },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card className="rounded-2xl border-border/80 bg-card shadow-sm" key={stat.label}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground"><Icon className="size-5" /></div>
                  <div><p className="text-2xl font-semibold">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div><h2 className="text-lg font-semibold">Turmas que você participa</h2><p className="mt-1 text-sm text-muted-foreground">Conteúdos recentes e atividade da turma.</p></div>
            <span className="text-sm text-muted-foreground">3 turmas</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {classes.map((classroom, index) => (
              <Card className="rounded-2xl border-border/80 bg-card shadow-sm transition hover:shadow-md" key={classroom.name}>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex size-12 items-center justify-center rounded-2xl text-sm font-bold ${classroom.color}`}>{classroom.initials}</div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{index === 1 ? "2 novidades" : "Em dia"}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{classroom.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{classroom.teacher}</p>
                  <div className="mt-5 flex flex-wrap gap-4 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> {classroom.members} participantes</span>
                    <span className="inline-flex items-center gap-1.5"><BookOpen className="size-4" /> {classroom.decks} baralhos</span>
                  </div>
                  <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-muted-foreground" href="/baralhos">Ver materiais <ArrowUpRight className="size-4" /></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
  )
}
