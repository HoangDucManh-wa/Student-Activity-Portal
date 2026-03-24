"use client"
import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/useDebounce"
import { envConfig } from "@/configs/env.config"
import { http } from "@/configs/http.comfig"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { PaginationCustom } from "@/components/ui-custom/pagination.custom"
import { toast } from "sonner"
import { Search } from "lucide-react"

interface StudentRecord {
  userId: number
  userName: string
  email: string
  studentId: string | null
  university: string
  phoneNumber: string | null
  status: string
  avatarUrl: string | null
  roles: string[]
  isStudentEmail: boolean
}

const STATUS_LABELS: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Chưa kích hoạt",
  banned: "Bị khóa",
  suspended: "Tạm ngừng",
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  banned: "bg-red-100 text-red-700",
  suspended: "bg-yellow-100 text-yellow-700",
}

function Avatar({ src, name }: { src?: string | null; name: string }) {
  const initial = name.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase() || "?"
  if (src) return <img src={src} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
  return (
    <div className="w-9 h-9 rounded-full bg-[#08667a] text-white flex items-center justify-center text-xs font-bold shrink-0">
      {initial}
    </div>
  )
}

function StudentRow({ student }: { student: StudentRecord }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0">
      <Avatar src={student.avatarUrl} name={student.userName} />
      <div className="min-w-0 flex-1 grid grid-cols-[2fr_2fr_1.2fr_1fr_90px] gap-3 items-center text-sm">
        <span className="font-medium truncate">{student.userName}</span>
        <span className="text-gray-500 truncate">{student.email}</span>
        <span className="text-gray-500">{student.studentId ?? "—"}</span>
        <span className="text-gray-500">{student.phoneNumber ?? "—"}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[student.status] ?? "bg-gray-100 text-gray-500"}`}>
          {STATUS_LABELS[student.status] ?? student.status}
        </span>
      </div>
    </div>
  )
}

export function UniversityTable({ onRefresh }: { onRefresh?: () => void }) {
  const [searchInput, setSearchInput] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [status, setStatus] = React.useState("")
  const [openCreateDialog, setOpenCreateDialog] = React.useState(false)
  const [createForm, setCreateForm] = React.useState({
    userName: "", email: "", password: "", university: "",
    studentId: "", phoneNumber: "", role: "student",
  })
  const [creating, setCreating] = React.useState(false)

  const debouncedSearch = useDebounce(searchInput, 400)

  const params = React.useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: "20", emailType: "student" })
    if (debouncedSearch) p.set("search", debouncedSearch)
    if (status) p.set("status", status)
    return p
  }, [page, debouncedSearch, status])

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users-school", page, debouncedSearch, status],
    queryFn: () =>
      http.get<any>(`${envConfig.NEXT_PUBLIC_API_URL}/admin/users?${params}`) as any,
    placeholderData: (prev) => prev,
  })

  const students: StudentRecord[] = data?.data?.data ?? []
  const meta = data?.data?.meta
  const total = meta?.total ?? 0
  const totalPages = meta?.totalPages ?? 1

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const body: Record<string, string> = {
        userName: createForm.userName,
        email: createForm.email,
        password: createForm.password,
        university: createForm.university || "",
        role: createForm.role,
      }
      if (createForm.studentId) body.studentId = createForm.studentId
      if (createForm.phoneNumber) body.phoneNumber = createForm.phoneNumber

      const res = await http.post<any>(
        `${envConfig.NEXT_PUBLIC_API_URL}/admin/users`,
        body
      )
      if (!res?.success) throw new Error(res?.message || "Tạo tài khoản thất bại")
      toast.success("Tạo tài khoản thành công")
      setOpenCreateDialog(false)
      setCreateForm({ userName: "", email: "", password: "", university: "", studentId: "", phoneNumber: "", role: "student" })
      onRefresh?.()
    } catch (err: any) {
      toast.error(err?.message || "Tạo tài khoản thất bại")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
            placeholder="Tìm tên, email, MSSV..."
            className="pl-9 rounded-full"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="border rounded-full px-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Chưa kích hoạt</option>
          <option value="banned">Bị khóa</option>
          <option value="suspended">Tạm ngừng</option>
        </select>
        <div className="ml-auto text-sm text-muted-foreground font-medium">
          Tổng: {total} sinh viên
        </div>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-10 px-5">
              + Tạo tài khoản
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo tài khoản sinh viên</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label>Họ và tên *</Label>
                <Input value={createForm.userName} onChange={(e) => setCreateForm((f) => ({ ...f, userName: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Email *</Label>
                <Input type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Mật khẩu *</Label>
                <Input type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Mã sinh viên</Label>
                <Input value={createForm.studentId} onChange={(e) => setCreateForm((f) => ({ ...f, studentId: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Số điện thoại</Label>
                <Input value={createForm.phoneNumber} onChange={(e) => setCreateForm((f) => ({ ...f, phoneNumber: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Vai trò</Label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="student">Sinh viên</option>
                  <option value="organization_leader">Trưởng CLB/Tổ chức</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Đang tạo..." : "Tạo"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {/* Column headers */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_1.2fr_1fr_90px] gap-3 px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Họ tên</span>
          <span>Email</span>
          <span>Mã SV</span>
          <span>Điện thoại</span>
          <span>Trạng thái</span>
        </div>

        {isLoading && (
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 animate-pulse" />
            ))}
          </div>
        )}
        {isError && (
          <div className="py-10 text-center text-red-500 text-sm">
            Không tải được dữ liệu. Vui lòng thử lại.
          </div>
        )}
        {!isLoading && !isError && students.length === 0 && (
          <div className="py-10 text-center text-muted-foreground text-sm">
            Không có sinh viên nào
          </div>
        )}
        {!isLoading && !isError && students.map((s) => (
          <StudentRow key={s.userId} student={s} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationCustom page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  )
}
