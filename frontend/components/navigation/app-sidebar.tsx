"use client"

import * as React from "react"
import Link from "next/link"

import { BookCopy } from "lucide-react"
import { NavMain } from "@/components/navigation/nav-main"
import { NavUser } from "@/components/navigation/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { House, ChartBarIcon, UsersIcon, Brain } from "lucide-react"

const data = {
  navMain: [
    {
      title: "Início",
      url: "/dashboard",
      icon: <House />,
    },
    {
      title: "Baralhos",
      url: "/baralhos",
      icon: <BookCopy />,
    },
    {
      title: "Estatísticas",
      url: "/estatisticas",
      icon: <ChartBarIcon />,
    },
    {
      title: "Turmas",
      url: "/turmas",
      icon: <UsersIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <Brain className="size-7!" />
              <span className="text-base font-semibold">Memora</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
