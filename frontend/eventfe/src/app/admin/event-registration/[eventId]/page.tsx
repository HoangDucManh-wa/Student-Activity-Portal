"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getRegistrationsByActivity,
  getActivityStats,
  updateRegistrationStatus,
  type RegistrationDetail,
} from "@/services/registration.service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toastSuccess, toastError } from "@/lib/toast"

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Chờ duyệt", variant: "secondary" },
  approved: { label: "Đã duyệt", variant: "default" },
  rejected: { label: "Từ chối", variant: "destructive" },
  cancelled: { label: "Đã hủy", variant: "outline" },
}

const TYPE_LABELS: Record<string, string> = {
  individual: "Cá nhân",
  team: "Nhóm",
}

const STATUS_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "cancelled", label: "Đã hủy" },
]

export default function EventRegistrationPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState("")

  const { data: statsResult } = useQuery({
    queryKey: ["activity-stats", eventId],
    queryFn: () => getActivityStats(eventId),
  })

  const { data: result, isLoading } = useQuery({
    queryKey: ["registrations", eventId, page, statusFilter],
    queryFn: () =>
      getRegistrationsByActivity(eventId, {
        page,
        limit: 20,
        status: statusFilter || undefined,
      }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) =>
      updateRegistrationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", eventId] })
      queryClient.invalidateQueries({ queryKey: ["activity-stats", eventId] })
    },
  })

  const stats = statsResult?.data
  const registrations: RegistrationDetail[] = result?.data?.data ?? []
  const meta = result?.data?.meta

  const handleUpdateStatus = async (id: number, status: "approved" | "rejected") => {
    try {
      await updateMutation.mutateAsync({ id, status })
      toastSuccess(status === "approved" ? "Đã duyệt đăng ký" : "Đã từ chối đăng ký")
    } catch {
      toastError("Thao tác thất bại")
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Danh sách đăng ký hoạt động #{eventId}</h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Tổng" value={stats.total} />
          <StatCard label="Chờ duyệt" value={stats.pending} />
          <StatCard label="Đã duyệt" value={stats.approved} />
          <StatCard label="Từ chối" value={stats.rejected} />
          <StatCard label="Đã hủy" value={stats.cancelled} />
          <StatCard
            label="Sức chứa"
            value={stats.maxParticipants ? `${stats.approved}/${stats.maxParticipants}` : "Không giới hạn"}
          />
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter(f.value)
              setPage(1)
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <p className="text-muted-foreground p-6">Đang tải...</p>
          ) : registrations.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center">Chưa có đăng ký nào.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left font-medium">STT</th>
                  <th className="p-3 text-left font-medium">Tên</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">MSSV</th>
                  <th className="p-3 text-left font-medium">Loại</th>
                  <th className="p-3 text-left font-medium">Thời gian</th>
                  <th className="p-3 text-left font-medium">Trạng thái</th>
                  <th className="p-3 text-left font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {registrations.map((r, i) => {
                  const statusInfo = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending
                  return (
                    <tr key={r.registrationId} className="hover:bg-muted/30">
                      <td className="p-3">{(page - 1) * 20 + i + 1}</td>
                      <td className="p-3 font-medium">{r.user?.userName ?? `User #${r.userId}`}</td>
                      <td className="p-3 text-muted-foreground">{r.user?.email ?? "-"}</td>
                      <td className="p-3 text-muted-foreground">{r.user?.studentId ?? "-"}</td>
                      <td className="p-3">{TYPE_LABELS[r.registrationType] ?? r.registrationType}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(r.registrationTime).toLocaleString("vi-VN")}
                      </td>
                      <td className="p-3">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td className="p-3">
                        {r.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-800 border-green-200"
                              disabled={updateMutation.isPending}
                              onClick={() => handleUpdateStatus(r.registrationId, "approved")}
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-700 border-red-200"
                              disabled={updateMutation.isPending}
                              onClick={() => handleUpdateStatus(r.registrationId, "rejected")}
                            >
                              Từ chối
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-xs text-muted-foreground font-normal">{label}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
