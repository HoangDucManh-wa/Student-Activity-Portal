"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CheckCircle, XCircle, ClipboardList } from "lucide-react"
import { getActivities, updateActivityStatus } from "@/services/activity.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Bản nháp", variant: "outline" },
  pending_review: { label: "Chờ duyệt", variant: "secondary" },
  published: { label: "Đã đăng", variant: "default" },
  running: { label: "Đang diễn ra", variant: "default" },
  finished: { label: "Kết thúc", variant: "outline" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
}

const TYPE_LABEL: Record<string, string> = {
  program: "Chương trình",
  competition: "Cuộc thi",
  recruitment: "Tuyển sinh",
}

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "draft", label: "Bản nháp" },
  { value: "pending_review", label: "Chờ duyệt" },
  { value: "published", label: "Đã đăng" },
  { value: "running", label: "Đang diễn ra" },
  { value: "finished", label: "Kết thúc" },
  { value: "cancelled", label: "Đã hủy" },
]

export default function AdminActivitiesPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = React.useState("")
  const [page, setPage] = React.useState(1)

  // Fetch activities for the active tab
  const { data, isLoading } = useQuery({
    queryKey: ["admin-activities", activeTab, page],
    queryFn: () => getActivities({ status: activeTab || undefined, limit: 20, page }),
  })

  // Separate count query for "Chờ duyệt" badge (always fetched)
  const { data: pendingData } = useQuery({
    queryKey: ["admin-pending-count"],
    queryFn: () => getActivities({ status: "pending_review", limit: 1 }),
    staleTime: 30_000,
  })
  const pendingCount = pendingData?.data?.meta?.total ?? 0

  const activities = data?.data?.data ?? []
  const meta = data?.data?.meta

  const approveMut = useMutation({
    mutationFn: (id: number) => updateActivityStatus(id, "published"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] })
      queryClient.invalidateQueries({ queryKey: ["admin-pending-count"] })
      toast.success("Đã duyệt hoạt động")
    },
    onError: () => toast.error("Thao tác thất bại"),
  })

  const rejectMut = useMutation({
    mutationFn: (id: number) => updateActivityStatus(id, "draft"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] })
      queryClient.invalidateQueries({ queryKey: ["admin-pending-count"] })
      toast.success("Đã từ chối hoạt động")
    },
    onError: () => toast.error("Thao tác thất bại"),
  })

  const isMutating = approveMut.isPending || rejectMut.isPending

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPage(1)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5" />
        <h1 className="text-xl font-bold">Quản lý hoạt động</h1>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap border-b">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={[
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {tab.label}
            {tab.value === "pending_review" && pendingCount > 0 && (
              <span className="ml-1.5 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && activities.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          Không có hoạt động nào.
        </div>
      )}

      {!isLoading && activities.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Tên hoạt động</th>
                <th className="px-4 py-3 text-left">Tổ chức</th>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Ngày bắt đầu</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activities.map((a) => {
                const statusInfo = STATUS_CONFIG[a.activityStatus] ?? STATUS_CONFIG.draft
                return (
                  <tr key={a.activityId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-[240px]">
                      <p className="truncate">{a.activityName}</p>
                      {a.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{a.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.organization?.organizationName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {TYPE_LABEL[a.activityType] ?? a.activityType}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {a.startTime ? new Date(a.startTime).toLocaleDateString("vi-VN") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {a.activityStatus === "pending_review" && (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isMutating}
                            onClick={() => approveMut.mutate(a.activityId)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isMutating}
                            onClick={() => rejectMut.mutate(a.activityId)}
                            className="text-red-500 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
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
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="flex items-center text-sm text-gray-500">
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
