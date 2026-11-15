"use client"

import { useMemo, useState, type FormEvent } from "react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { EllipsisVertical, Eye, EyeOff, Loader2, LogOutIcon, Mail, Pencil, Settings, ShieldLock, SunMoon, User } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { requestJson } from "@/lib/api"
import { toast } from "sonner"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, reload } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [name, setName] = useState(user?.nome ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const initials = useMemo(
    () => (user?.nome ?? "")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    [user?.nome],
  )

  if (!user) return null

  async function handleLogout() {
    setLogoutError(null)
    setIsLoggingOut(true)
    try {
      await requestJson("/api/auth/logout", { method: "POST" })
      setLogoutDialogOpen(false)
      router.replace("/login")
    } catch (reason) {
      setLogoutError(reason instanceof Error ? reason.message : "Não foi possível encerrar a sessão.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  async function handleSaveProfile(field: "nome" | "email", event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = field === "nome" ? name.trim() : email.trim()
    const setSaving = field === "nome" ? setIsSavingName : setIsSavingEmail
    setSaving(true)
    try {
      await requestJson("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      toast.success(field === "nome" ? "Nome atualizado com sucesso." : "E-mail atualizado com sucesso.")
      reload()
      if (field === "nome") setNameDialogOpen(false)
      else setEmailDialogOpen(false)
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Não foi possível salvar o perfil."
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("A nova senha e a confirmação não coincidem.")
      return
    }
    setIsSavingPassword(true)
    try {
      await requestJson("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual: currentPassword, novaSenha: newPassword }),
      })
      toast.success("Senha alterada com sucesso.")
      reload()
      setPasswordDialogOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Não foi possível alterar a senha."
      toast.error(message)
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
              <EllipsisVertical className="ml-auto size-4" />
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
              <DropdownMenuItem
                onClick={() => {
                  setLogoutError(null)
                  setLogoutDialogOpen(true)
                }}
                disabled={isLoggingOut}
              >
                <LogOutIcon />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <AlertDialog
        open={logoutDialogOpen}
        onOpenChange={(open) => {
          if (!isLoggingOut) {
            setLogoutDialogOpen(open)
            if (!open) setLogoutError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Você precisará entrar novamente para acessar seus baralhos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {logoutError && (
            <p aria-live="polite" className="text-sm text-destructive">{logoutError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoggingOut}
              onClick={() => setLogoutError(null)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoggingOut}
              onClick={(event) => {
                event.preventDefault()
                void handleLogout()
              }}
            >
              {isLoggingOut ? <><Loader2 className="animate-spin" /> Saindo...</> : "Sair"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>Atualize seus dados, senha e a aparência do app.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <p className="font-medium text-foreground">Perfil</p>
              <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                <User className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{user.nome}</span>
                <Button aria-label="Editar nome" onClick={() => { setName(user.nome); setNameDialogOpen(true) }} size="icon-sm" type="button" variant="ghost">
                  <Pencil />
                </Button>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{user.email}</span>
                <Button aria-label="Editar e-mail" onClick={() => { setEmail(user.email); setEmailDialogOpen(true) }} size="icon-sm" type="button" variant="ghost">
                  <Pencil />
                </Button>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <p className="font-medium text-foreground">Segurança</p>
              <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                <ShieldLock className="size-4 shrink-0 text-muted-foreground" />
                <span aria-label="Senha armazenada com segurança" className="min-w-0 flex-1 truncate">••••••••••••</span>
                <Button aria-label="Alterar senha" onClick={() => setPasswordDialogOpen(true)} size="icon-sm" type="button" variant="ghost">
                  <Pencil />
                </Button>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">Tema</p>
                  <p className="text-xs text-muted-foreground">Escolha a aparência do aplicativo</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border bg-background px-2 py-1 text-xs">
                  <SunMoon className="size-3.5" />
                  {theme === "dark" ? "Escuro" : "Claro"}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                <span className="text-sm">Tema escuro</span>
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

      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar nome</DialogTitle>
            <DialogDescription>Atualize o nome exibido no seu perfil.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSaveProfile("nome", event)}>
            <label className="block space-y-2 text-sm font-medium" htmlFor="profile-name">
              Nome
              <Input autoFocus id="profile-name" maxLength={120} minLength={2} onChange={(event) => setName(event.target.value)} required value={name} />
            </label>
            <DialogFooter>
              <Button onClick={() => setNameDialogOpen(false)} type="button" variant="outline">Cancelar</Button>
              <Button disabled={isSavingName} type="submit">{isSavingName ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar e-mail</DialogTitle>
            <DialogDescription>Atualize o endereço de e-mail da sua conta.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSaveProfile("email", event)}>
            <label className="block space-y-2 text-sm font-medium" htmlFor="profile-email">
              E-mail
              <Input autoFocus id="profile-email" maxLength={180} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </label>
            <DialogFooter>
              <Button onClick={() => setEmailDialogOpen(false)} type="button" variant="outline">Cancelar</Button>
              <Button disabled={isSavingEmail} type="submit">{isSavingEmail ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>Confirme sua senha atual e escolha uma nova senha.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSavePassword(event)}>
            {[
              {
                id: "current-password",
                label: "Senha atual",
                value: currentPassword,
                setValue: setCurrentPassword,
                visible: showCurrentPassword,
                setVisible: setShowCurrentPassword,
              },
              {
                id: "new-password",
                label: "Nova senha",
                value: newPassword,
                setValue: setNewPassword,
                visible: showNewPassword,
                setVisible: setShowNewPassword,
              },
              {
                id: "confirm-password",
                label: "Confirmação da nova senha",
                value: confirmPassword,
                setValue: setConfirmPassword,
                visible: showConfirmPassword,
                setVisible: setShowConfirmPassword,
              },
            ].map((field) => (
              <label className="block space-y-2 text-sm font-medium" htmlFor={field.id} key={field.id}>
                {field.label}
                <span className="relative block">
                  <Input
                    autoComplete={field.id === "current-password" ? "current-password" : "new-password"}
                    className="pr-10"
                    id={field.id}
                    minLength={8}
                    onChange={(event) => field.setValue(event.target.value)}
                    required
                    type={field.visible ? "text" : "password"}
                    value={field.value}
                  />
                  <Button
                    aria-label={field.visible ? `Ocultar ${field.label.toLowerCase()}` : `Mostrar ${field.label.toLowerCase()}`}
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => field.setVisible((visible) => !visible)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    {field.visible ? <EyeOff /> : <Eye />}
                  </Button>
                </span>
              </label>
            ))}
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p aria-live="polite" className="text-sm text-destructive">A nova senha e a confirmação não coincidem.</p>
            )}
            <DialogFooter>
              <Button onClick={() => setPasswordDialogOpen(false)} type="button" variant="outline">Cancelar</Button>
              <Button disabled={isSavingPassword || newPassword !== confirmPassword} type="submit">
                {isSavingPassword ? "Salvando..." : "Salvar senha"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
