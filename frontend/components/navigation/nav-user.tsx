"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVerticalIcon, Settings, LogOutIcon, Moon, SunMedium } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { requestJson } from "@/lib/api"
import { toast } from "sonner"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, reload } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [error, setError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [name, setName] = useState(user?.nome ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [password, setPassword] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  if (!user) return null

  const initials = useMemo(
    () => user.nome
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    [user.nome],
  )

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

  async function handleSaveProfile() {
    setError(null)
    setIsSavingProfile(true)
    try {
      await requestJson("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: name.trim(), email: email.trim() }),
      })
      toast.success("Perfil atualizado com sucesso.")
      reload()
      setSettingsOpen(false)
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Não foi possível salvar o perfil."
      toast.error(message)
      setError(message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleSavePassword() {
    if (!password.trim()) {
      toast.error("Informe uma nova senha.")
      return
    }
    setError(null)
    setIsSavingPassword(true)
    try {
      await requestJson("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha: password }),
      })
      toast.success("Senha alterada com sucesso.")
      setPassword("")
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Não foi possível alterar a senha."
      toast.error(message)
      setError(message)
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <>
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
                <span className="truncate text-xs text-foreground/70">{user.email}</span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8">
                      <AvatarFallback className="rounded-lg bg-muted font-semibold text-foreground">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.nome}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings />
                  Configurações
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogOutIcon />
                {isLoggingOut ? "Saindo..." : "Sair"}
              </DropdownMenuItem>
              {error && <p aria-live="polite" className="px-2 py-1 text-xs text-destructive">{error}</p>}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>Atualize seus dados, senha e a aparência do app.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-2 text-sm">
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <p className="font-medium text-foreground">Perfil</p>
              <div className="space-y-2">
                <label className="block text-xs text-muted-foreground">Nome</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-muted-foreground">E-mail</label>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" />
              </div>
              <Button type="button" className="w-full" onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? "Salvando..." : "Salvar perfil"}
              </Button>
            </div>

            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <p className="font-medium text-foreground">Segurança</p>
              <div className="space-y-2">
                <label className="block text-xs text-muted-foreground">Nova senha</label>
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
              </div>
              <Button variant="outline" type="button" className="w-full" onClick={handleSavePassword} disabled={isSavingPassword}>
                {isSavingPassword ? "Alterando..." : "Alterar senha"}
              </Button>
            </div>

            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">Tema</p>
                  <p className="text-xs text-muted-foreground">Escolha a aparência do aplicativo</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border bg-background px-2 py-1 text-xs">
                  {theme === "dark" ? <Moon className="size-3.5" /> : <SunMedium className="size-3.5" />}
                  {theme === "dark" ? "Escuro" : "Claro"}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                <span className="text-sm">Tema do sistema</span>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
