"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVerticalIcon, CircleUserRoundIcon, Settings, LogOutIcon } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { requestJson } from "@/lib/api"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  if (!user) return null

  const initials = user.nome
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  async function handleLogout() {
    setError(null)
    setIsLoggingOut(true)
    try {
      await requestJson("/api/auth/logout", { method: "POST" })
      router.replace("/login")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível encerrar a sessão.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-muted font-semibold text-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.nome}</span>
              <span className="truncate text-xs text-foreground/70">
                {user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarFallback className="rounded-lg bg-muted font-semibold text-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.nome}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <CircleUserRoundIcon
                />
                Conta
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings
                />
                Configurações
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <LogOutIcon
              />
              {isLoggingOut ? "Saindo..." : "Sair"}
            </DropdownMenuItem>
            {error && <p aria-live="polite" className="px-2 py-1 text-xs text-destructive">{error}</p>}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
