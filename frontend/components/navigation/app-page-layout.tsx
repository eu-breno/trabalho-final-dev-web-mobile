import type { CSSProperties, ReactNode } from "react"
import { AppSidebar } from "@/components/navigation/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AuthProvider } from "@/components/auth/auth-provider"

export function AppPageContent({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl space-y-8 py-2">{children}</div>
}

export function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  )
}
