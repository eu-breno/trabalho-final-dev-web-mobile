"use client"
{/* esse é o titulo em cima da pagina */}
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()
  const pageTitles: Record<string, string> = {
    "/dashboard": "Início",
    "/baralhos": "Baralhos",
    "/estatisticas": "Estatísticas",
    "/turmas": "Turmas",
    "/buscar": "Buscar",
  }
  const title =
    pageTitles[pathname] ??
    pathname
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) ??
    "Memora"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  )
}
