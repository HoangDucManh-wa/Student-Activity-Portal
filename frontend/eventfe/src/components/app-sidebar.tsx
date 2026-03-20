"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileDescription,
  IconForms,
  IconInnerShadowTop,
  IconUsers,
  IconBell,
  IconClipboardList,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { http } from "@/configs/http.comfig"

const NAV_MAIN = [
  { title: "Dashboard", url: "/admin", icon: IconDashboard },
  { title: "Quản lý tài khoản", url: "/admin/management-account", icon: IconUsers },
  { title: "Duyệt hoạt động", url: "/admin/activities", icon: IconClipboardList },
  { title: "Đăng ký hoạt động", url: "/admin/event-registration/1", icon: IconFileDescription },
  { title: "Biểu mẫu", url: "/admin/forms", icon: IconForms },
  { title: "Thông báo", url: "/admin/notifications", icon: IconBell },
  { title: "Cấu hình hệ thống", url: "/admin/settings", icon: IconSettings },
]

interface UserInfo {
  name: string
  email: string
  avatar: string
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<UserInfo>({
    name: "Admin",
    email: "",
    avatar: "",
  })

  React.useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/me`
    http.get<{ success: boolean; data: { userName: string; email: string; avatarUrl?: string } }>(url)
      .then((res) => {
        if (res?.data) {
          setUser({
            name: res.data.userName,
            email: res.data.email,
            avatar: res.data.avatarUrl ?? "",
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold text-[20px]">
                  <span className="text-[blue]">E</span>
                  <span className="text-[red]">v</span>
                  <span className="text-yellow-600">e</span>
                  <span className="text-[blue]">n</span>
                  <span className="text-green-600">t</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAV_MAIN} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
