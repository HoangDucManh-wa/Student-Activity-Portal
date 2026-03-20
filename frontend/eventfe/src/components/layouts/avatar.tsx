"use client"
import { BadgeCheckIcon, Building2, ClipboardClock, Home, LogOutIcon, Rows2, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { http } from "@/configs/http.comfig"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { getMe } from "@/services/auth.service"

export function UserMenu({
  className,
  isOrganization = false
}: {
  className?: string
  isOrganization?: boolean
}) {
  const router = useRouter()

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
  })

  const user = data?.data?.user
  const isOrgLeader = user?.roles?.includes("organization_leader")
  const initials = user?.userName
    ? user.userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken") ?? undefined

    const res: any = await http.post(`/api/auth/logout`, { refreshToken })

    if (!res?.success) {
      toast.error(res?.message ?? "Đăng xuất thất bại")
      return
    }

    localStorage.removeItem("refreshToken")
    router.push("/auth")
    toast.success("Đăng xuất thành công")
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="">
        <Avatar className="w-[40px] h-[40px]">
          <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.userName ?? "Người dùng"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[99999]">
<<<<<<< HEAD
       <DropdownMenuGroup>
        {!isOrganization && (
          <>
            <DropdownMenuItem>
              <User />
              <Link href="/profile">Account</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Rows2 />
              <Link href="/my-events">Sự kiện của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <ClipboardClock />
              <Link href="/history-club">Lịch sử CLB</Link>
            </DropdownMenuItem>
          </>
        )}

        {isOrganization && (
          <DropdownMenuItem>
            <User />
            <Link href="/organization/profile">Hồ sơ</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>
=======
        <DropdownMenuGroup>
          {!isOrganization && (
            <>
              <DropdownMenuItem>
                <User />
                <Link href="/profile">Tài khoản</Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Rows2 />
                <Link href="/my-events">Sự kiện của tôi</Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <ClipboardClock />
                <Link href="/history-club">Lịch sử CLB</Link>
              </DropdownMenuItem>

              {isOrgLeader && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Building2 />
                    <Link href="/organization">Quản lý Tổ chức</Link>
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}

          {isOrganization && (
            <>
              <DropdownMenuItem>
                <User />
                <Link href="/organization/profile">Hồ sơ tổ chức</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Rows2 />
                <Link href="/organization/event">Quản lý sự kiện</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Home />
                <Link href="/">Trang chính</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
>>>>>>> origin/main
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOutIcon />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
