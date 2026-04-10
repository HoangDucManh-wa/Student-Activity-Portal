"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Search, Users, Building2, GraduationCap, School,
  KeyRound, Lock, Unlock, Loader2, Mail, RotateCcw, ShieldCheck, X
} from "lucide-react"
import { envConfig } from "@/configs/env.config"
import { http } from "@/configs/http.comfig"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SafeImage } from "@/components/ui-custom/SafeImage"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const API = envConfig.NEXT_PUBLIC_API_URL

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabType = "students" | "in_school" | "clubs" | "organizations" | "recover"

interface UserItem {
  userId: number
  userName: string
  email: string
  studentId: string | null
  university: string | null
  phoneNumber: string | null
  status: string
  avatarUrl: string | null
  roles: string[]
}

interface OrgItem {
  organizationId: number
  organizationName: string
  organizationType: string
  email: string | null
  status: string
  logoUrl: string | null
}

interface ApiMeta { total: number; page: number; limit: number; totalPages: number }

// ─── Status config ─────────────────────────────────────────────────────────────

const USER_STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active:    { label: "Hoạt động",   variant: "default" },
  banned:    { label: "Bị khóa",     variant: "destructive" },
  suspended: { label: "Tạm ngừng",  variant: "secondary" },
  inactive:  { label: "Chưa kích hoạt", variant: "outline" },
}

const ORG_STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active:    { label: "Hoạt động", variant: "default" },
  banned:    { label: "Bị khóa",   variant: "destructive" },
  suspended: { label: "Tạm ngừng", variant: "secondary" },
  inactive:  { label: "Chưa duyệt", variant: "outline" },
}

// ─── Reset password dialog ─────────────────────────────────────────────────────

interface ResetDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  kind: "user" | "org"
  target: { id: number; name: string; email: string }
}

function ResetPasswordDialog({ open, onClose, onSuccess, kind, target }: ResetDialogProps) {
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) { setError("Mật khẩu phải ít nhất 8 ký tự"); return }
    if (password !== confirm) { setError("Mật khẩu xác nhận không khớp"); return }

    setLoading(true)
    try {
      const endpoint = kind === "user"
        ? `${API}/admin/users/${target.id}/reset-password`
        : `${API}/admin/organizations/${target.id}/reset-password`
      const res = await http.post<any>(endpoint, { password })
      if (res?.success) {
        toast.success("Đặt lại mật khẩu thành công")
        onSuccess()
        onClose()
        setPassword("")
        setConfirm("")
      } else {
        toast.error(typeof res?.error === "string" ? res.error : "Thao tác thất bại")
      }
    } catch {
      toast.error("Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Đặt lại mật khẩu
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="text-sm bg-gray-50 rounded-lg px-3 py-2">
            <p className="font-medium text-gray-800">{target.name}</p>
            <p className="text-gray-500 text-xs">{target.email}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 8 ký tự"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#05566B]"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#05566B]"
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
              <Button
                type="submit"
                disabled={loading || !password || !confirm}
                className="bg-[#05566B] hover:bg-[#056382] text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <KeyRound className="w-4 h-4 mr-1" />}
                Đặt lại
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── User table row ───────────────────────────────────────────────────────────

function UserRow({ user, onReset, onToggle }: {
  user: UserItem
  onReset: (u: UserItem) => void
  onToggle: (u: UserItem) => void
}) {
  const stCfg = USER_STATUS_CONFIG[user.status] ?? { label: user.status, variant: "secondary" as const }
  const isActive = user.status === "active"
  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="py-2.5 pl-4 pr-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
          {user.avatarUrl
            ? <SafeImage src={user.avatarUrl} alt={user.userName} width={32} height={32} className="object-cover w-full h-full" />
            : <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-500">
                {user.userName.charAt(0).toUpperCase()}
              </div>
          }
        </div>
      </td>
      <td className="py-2.5 px-2">
        <p className="text-sm font-medium text-gray-800">{user.userName}</p>
        <p className="text-xs text-gray-400">{user.studentId ?? "—"}</p>
      </td>
      <td className="py-2.5 px-2 text-sm text-gray-600">{user.email}</td>
      <td className="py-2.5 px-2 text-sm text-gray-500 hidden md:table-cell">{user.university ?? "—"}</td>
      <td className="py-2.5 px-2 text-sm text-gray-500">{user.phoneNumber ?? "—"}</td>
      <td className="py-2.5 px-2">
        <Badge variant={stCfg.variant}>{stCfg.label}</Badge>
      </td>
      <td className="py-2.5 px-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onReset(user)}
            title="Đặt lại mật khẩu"
            className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggle(user)}
            title={isActive ? "Khóa tài khoản" : "Mở khóa"}
            className={`p-1.5 rounded-lg transition-colors ${isActive ? "hover:bg-red-50 text-red-500" : "hover:bg-green-50 text-green-600"}`}
          >
            {isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Org table row ─────────────────────────────────────────────────────────────

function OrgRow({ org, onReset, onToggle }: {
  org: OrgItem
  onReset: (o: OrgItem) => void
  onToggle: (o: OrgItem) => void
}) {
  const stCfg = ORG_STATUS_CONFIG[org.status] ?? { label: org.status, variant: "secondary" as const }
  const isActive = org.status === "active"
  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="py-2.5 pl-4 pr-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
          {org.logoUrl
            ? <SafeImage src={org.logoUrl} alt={org.organizationName} width={32} height={32} className="object-cover w-full h-full" />
            : <Building2 className="w-4 h-4 text-gray-400 mx-auto my-1.5" />
          }
        </div>
      </td>
      <td className="py-2.5 px-2">
        <p className="text-sm font-medium text-gray-800">{org.organizationName}</p>
        <p className="text-xs text-gray-400 capitalize">{org.organizationType}</p>
      </td>
      <td className="py-2.5 px-2 text-sm text-gray-600">{org.email ?? "—"}</td>
      <td className="py-2.5 px-2">
        <Badge variant={stCfg.variant}>{stCfg.label}</Badge>
      </td>
      <td className="py-2.5 px-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onReset(org)}
            title="Đặt lại mật khẩu"
            className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggle(org)}
            title={isActive ? "Khóa tổ chức" : "Mở khóa"}
            className={`p-1.5 rounded-lg transition-colors ${isActive ? "hover:bg-red-50 text-red-500" : "hover:bg-green-50 text-green-600"}`}
          >
            {isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const TABS: { value: TabType; label: string; icon: React.ReactNode }[] = [
  { value: "students",      label: "Sinh viên",            icon: <Users className="w-4 h-4" /> },
  { value: "in_school",    label: "SV trong trường",       icon: <School className="w-4 h-4" /> },
  { value: "clubs",        label: "Câu lạc bộ",            icon: <GraduationCap className="w-4 h-4" /> },
  { value: "organizations", label: "Tổ chức / Bên thứ 3", icon: <Building2 className="w-4 h-4" /> },
  { value: "recover",      label: "Khôi phục tài khoản",  icon: <RotateCcw className="w-4 h-4" /> },
]

export default function ManagementAccountPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>("students")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const queryClient = useQueryClient()

  React.useEffect(() => { setPage(1) }, [activeTab, debouncedSearch])

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // ── Fetch: students (all users) ──────────────────────────────────────────────
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["admin-users", page, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (debouncedSearch) params.set("search", debouncedSearch)
      return http.get<{ success: boolean; data: { data: UserItem[]; meta: ApiMeta } }>(
        `${API}/admin/users?${params}`
      )
    },
    enabled: activeTab === "students",
  })

  // ── Fetch: in_school (student emails only) ─────────────────────────────────
  const { data: inSchoolData, isLoading: inSchoolLoading } = useQuery({
    queryKey: ["admin-users-in-school", page, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "20", emailType: "student" })
      if (debouncedSearch) params.set("search", debouncedSearch)
      return http.get<{ success: boolean; data: { data: UserItem[]; meta: ApiMeta } }>(
        `${API}/admin/users?${params}`
      )
    },
    enabled: activeTab === "in_school",
  })

  // ── Fetch: clubs (organizationType = club) ─────────────────────────────────
  const { data: clubsData, isLoading: clubsLoading } = useQuery({
    queryKey: ["admin-clubs", page, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "20", organizationType: "club" })
      if (debouncedSearch) params.set("search", debouncedSearch)
      return http.get<{ success: boolean; data: { data: OrgItem[]; meta: ApiMeta } }>(
        `${API}/admin/organizations?${params}`
      )
    },
    enabled: activeTab === "clubs",
  })

  // ── Fetch: organizations (organizationType = organization) ─────────────────
  const { data: orgsData, isLoading: orgsLoading } = useQuery({
    queryKey: ["admin-organizations", page, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "20", organizationType: "organization" })
      if (debouncedSearch) params.set("search", debouncedSearch)
      return http.get<{ success: boolean; data: { data: OrgItem[]; meta: ApiMeta } }>(
        `${API}/admin/organizations?${params}`
      )
    },
    enabled: activeTab === "organizations",
  })

  const students: UserItem[] = studentsData?.data?.data ?? []
  const inSchool: UserItem[] = inSchoolData?.data?.data ?? []
  const clubs: OrgItem[] = clubsData?.data?.data ?? []
  const orgs: OrgItem[] = orgsData?.data?.data ?? []

  const getMeta = (): ApiMeta | undefined => {
    if (activeTab === "students") return studentsData?.data?.meta
    if (activeTab === "in_school") return inSchoolData?.data?.meta
    if (activeTab === "clubs") return clubsData?.data?.meta
    if (activeTab === "organizations") return orgsData?.data?.meta
    return undefined
  }
  const meta = getMeta()

  const isUserTab = activeTab === "students" || activeTab === "in_school"
  const loading = activeTab === "students" ? studentsLoading
    : activeTab === "in_school" ? inSchoolLoading
    : activeTab === "clubs" ? clubsLoading
    : activeTab === "organizations" ? orgsLoading
    : false

  // ── Mutations ───────────────────────────────────────────────────────────────

  const toggleUserMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      http.patch<{ success: boolean }>(`${API}/admin/users/${id}/status`, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-users-in-school"] })
      toast.success(vars.status === "banned" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản")
    },
    onError: () => toast.error("Thao tác thất bại"),
  })

  const toggleOrgMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      http.patch<{ success: boolean }>(`${API}/admin/organizations/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clubs"] })
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] })
      toast.success("Đã cập nhật trạng thái")
    },
    onError: () => toast.error("Thao tác thất bại"),
  })

  // ── Reset dialog state ──────────────────────────────────────────────────────

  const [resetTarget, setResetTarget] = React.useState<{
    kind: "user" | "org"; id: number; name: string; email: string
  } | null>(null)

  const handleResetUser = (u: UserItem) =>
    setResetTarget({ kind: "user", id: u.userId, name: u.userName, email: u.email })
  const handleResetOrg = (o: OrgItem) =>
    setResetTarget({ kind: "org", id: o.organizationId, name: o.organizationName, email: o.email ?? "" })

  const handleToggleUser = (u: UserItem) => {
    const next = u.status === "active" ? "banned" : "active"
    toggleUserMut.mutate({ id: u.userId, status: next })
  }
  const handleToggleOrg = (o: OrgItem) => {
    const next = o.status === "active" ? "banned" : "active"
    toggleOrgMut.mutate({ id: o.organizationId, status: next })
  }

  // ── Account recovery ─────────────────────────────────────────────────────────

  const [recoverName, setRecoverName] = React.useState("")
  const [recoverPhone, setRecoverPhone] = React.useState("")
  const [recoverStudentId, setRecoverStudentId] = React.useState("")
  const [recoveredAccounts, setRecoveredAccounts] = React.useState<UserItem[]>([])
  const [recoverSearched, setRecoverSearched] = React.useState(false)

  const recoverMut = useMutation({
    mutationFn: () => {
      const params = new URLSearchParams()
      if (recoverName) params.set("userName", recoverName)
      if (recoverPhone) params.set("phoneNumber", recoverPhone)
      if (recoverStudentId) params.set("studentId", recoverStudentId)
      return http.get<{ success: boolean; data: UserItem[] }>(
        `${API}/admin/accounts/recover?${params.toString()}`
      )
    },
    onSuccess: (res) => {
      const r = res as any
      setRecoveredAccounts(r?.data ?? [])
      setRecoverSearched(true)
    },
    onError: () => {
      toast.error("Tìm kiếm thất bại")
      setRecoveredAccounts([])
      setRecoverSearched(true)
    },
  })

  const resendEmailMut = useMutation({
    mutationFn: (userId: number) =>
      http.post<{ success: boolean }>(`${API}/admin/users/${userId}/resend-reset-email`, {}),
    onSuccess: (res) => {
      const r = res as any
      toast.success(r?.data?.message ?? "Đã gửi email đặt lại mật khẩu")
    },
    onError: () => toast.error("Gửi email thất bại"),
  })

  const handleRecoverSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoverName && !recoverPhone && !recoverStudentId) {
      toast.error("Vui lòng nhập ít nhất 1 thông tin")
      return
    }
    recoverMut.mutate()
  }

  const clearRecoverTab = () => {
    setRecoverName("")
    setRecoverPhone("")
    setRecoverStudentId("")
    setRecoveredAccounts([])
    setRecoverSearched(false)
  }

  const getUsers = (): UserItem[] => {
    if (activeTab === "students") return students
    if (activeTab === "in_school") return inSchool
    return []
  }

  const getOrgs = (): OrgItem[] => {
    if (activeTab === "clubs") return clubs
    if (activeTab === "organizations") return orgs
    return []
  }

  return (
    <div className="@container/main mb-[20px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#05566B]">Quản lý tài khoản</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý, đặt lại mật khẩu và khôi phục tài khoản sinh viên, câu lạc bộ, tổ chức
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value)
              setSearch("")
              if (tab.value !== "recover") clearRecoverTab()
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.value
                ? "border-[#05566B] text-[#05566B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search — hidden on recover tab */}
      {activeTab !== "recover" && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={
                isUserTab
                  ? "Tìm theo tên, email, mã sinh viên..."
                  : "Tìm theo tên hoặc email..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#05566B]"
            />
          </div>
        </div>
      )}

      {/* Recover tab */}
      {activeTab === "recover" && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-[#05566B]" />
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Tìm tài khoản</h3>
              <p className="text-xs text-gray-500">Nhập ít nhất 1 thông tin để tìm tài khoản người dùng</p>
            </div>
          </div>
          <form onSubmit={handleRecoverSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Họ tên</label>
              <input
                type="text"
                value={recoverName}
                onChange={(e) => setRecoverName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#05566B]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Số điện thoại</label>
              <input
                type="text"
                value={recoverPhone}
                onChange={(e) => setRecoverPhone(e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#05566B]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Mã sinh viên</label>
              <input
                type="text"
                value={recoverStudentId}
                onChange={(e) => setRecoverStudentId(e.target.value)}
                placeholder="VD: SV001"
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#05566B]"
              />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={recoverMut.isPending}
                className="flex items-center gap-2 bg-[#05566B] hover:bg-[#056382] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {recoverMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Tìm kiếm
              </button>
            </div>
          </form>

          {recoverSearched && (
            <div>
              {recoveredAccounts.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Không tìm thấy tài khoản nào phù hợp
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Tìm thấy {recoveredAccounts.length} tài khoản
                  </p>
                  {recoveredAccounts.map((acc) => {
                    const stCfg = USER_STATUS_CONFIG[acc.status] ?? { label: acc.status, variant: "secondary" as const }
                    return (
                      <div key={acc.userId} className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#05566B]/10 flex items-center justify-center text-sm font-bold text-[#05566B]">
                            {acc.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{acc.userName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-[#056382] font-medium">{acc.email}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {acc.studentId && <span className="text-xs text-gray-400">MSV: {acc.studentId}</span>}
                              {acc.phoneNumber && <span className="text-xs text-gray-400">SĐT: {acc.phoneNumber}</span>}
                              {acc.university && <span className="text-xs text-gray-400">{acc.university}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={stCfg.variant}>{stCfg.label}</Badge>
                          <button
                            onClick={() => resendEmailMut.mutate(acc.userId)}
                            disabled={resendEmailMut.isPending}
                            title="Gửi email đặt lại mật khẩu"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {resendEmailMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                            Gửi email đặt lại MK
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {activeTab !== "recover" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {isUserTab ? (
                  <tr className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wide">
                    <th className="py-3 pl-4 pr-2 font-medium text-left">Avatar</th>
                    <th className="py-3 px-2 font-medium text-left">Họ tên</th>
                    <th className="py-3 px-2 font-medium text-left">Email</th>
                    <th className="py-3 px-2 font-medium text-left hidden md:table-cell">Trường</th>
                    <th className="py-3 px-2 font-medium text-left">SĐT</th>
                    <th className="py-3 px-2 font-medium text-left">Trạng thái</th>
                    <th className="py-3 px-2 font-medium text-left">Hành động</th>
                  </tr>
                ) : (
                  <tr className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wide">
                    <th className="py-3 pl-4 pr-2 font-medium text-left">Logo</th>
                    <th className="py-3 px-2 font-medium text-left">Tên</th>
                    <th className="py-3 px-2 font-medium text-left">Email</th>
                    <th className="py-3 px-2 font-medium text-left">Trạng thái</th>
                    <th className="py-3 px-2 font-medium text-left">Hành động</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Đang tải...
                    </td>
                  </tr>
                ) : isUserTab ? (
                  getUsers().length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-400">Không có tài khoản nào</td></tr>
                  ) : (
                    getUsers().map((u) => (
                      <UserRow key={u.userId} user={u} onReset={handleResetUser} onToggle={handleToggleUser} />
                    ))
                  )
                ) : getOrgs().length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-400">
                    {activeTab === "clubs" ? "Không có câu lạc bộ nào" : "Không có tổ chức nào"}
                  </td></tr>
                ) : (
                  getOrgs().map((o) => (
                    <OrgRow key={o.organizationId} org={o} onReset={handleResetOrg} onToggle={handleToggleOrg} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <p className="text-xs text-gray-500">
                Trang {meta.page} / {meta.totalPages} — {meta.total} kết quả
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100"
                >
                  Trước
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">{page}</span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {resetTarget && (
        <ResetPasswordDialog
          open={!!resetTarget}
          onClose={() => setResetTarget(null)}
          onSuccess={() => {
            if (resetTarget.kind === "user") {
              queryClient.invalidateQueries({ queryKey: ["admin-users"] })
              queryClient.invalidateQueries({ queryKey: ["admin-users-in-school"] })
            } else {
              queryClient.invalidateQueries({ queryKey: ["admin-clubs"] })
              queryClient.invalidateQueries({ queryKey: ["admin-organizations"] })
            }
          }}
          kind={resetTarget.kind}
          target={resetTarget}
        />
      )}
    </div>
  )
}
