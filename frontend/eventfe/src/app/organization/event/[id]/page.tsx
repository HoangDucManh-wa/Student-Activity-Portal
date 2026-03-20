"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getActivityById, updateActivity, updateActivityStatus } from "@/services/activity.service"
import { getFormList } from "@/services/form.service"
import { getMyOrganization } from "@/services/organization.service"
import { toast } from "sonner"

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_review: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
  running: "bg-blue-100 text-blue-700",
  finished: "bg-purple-100 text-purple-600",
  cancelled: "bg-red-100 text-red-600",
}
const STATUS_LABEL: Record<string, string> = {
  draft: "Bản nháp",
  pending_review: "Chờ duyệt",
  published: "Đã công bố",
  running: "Đang diễn ra",
  finished: "Đã kết thúc",
  cancelled: "Đã hủy",
}
const TYPE_LABEL: Record<string, string> = {
  program: "Chương trình",
  competition: "Cuộc thi",
  recruitment: "Tuyển sinh",
}
const FORM_STATUS_LABEL: Record<string, string> = {
  draft: "Bản nháp",
  open: "Đang mở",
  closed: "Đã đóng",
}

export default function OrgEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const [showFormPanel, setShowFormPanel] = useState(false)
  const [selectedFormId, setSelectedFormId] = useState<number | null | "">("")

  const { data: result, isLoading } = useQuery({
    queryKey: ["activity", id],
    queryFn: () => getActivityById(id),
  })

  const { data: orgData } = useQuery({
    queryKey: ["my-organization"],
    queryFn: () => getMyOrganization(),
  })
  const organizationId = orgData?.data?.organizationId

  const { data: formsData } = useQuery({
    queryKey: ["org-forms-panel", organizationId],
    queryFn: () => getFormList({ organizationId, limit: 50 }),
    enabled: !!organizationId && showFormPanel,
  })

  const activity = result?.data
  const orgForms = (formsData as any)?.data?.data ?? []

  const submitMut = useMutation({
    mutationFn: () => updateActivityStatus(id, "pending_review"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity", id] })
      queryClient.invalidateQueries({ queryKey: ["my-org-activities"] })
      toast.success("Đã gửi yêu cầu duyệt!")
    },
    onError: () => toast.error("Gửi thất bại, vui lòng thử lại"),
  })

  const updateFormMut = useMutation({
    mutationFn: (formId: number | null) => updateActivity(id, { registrationFormId: formId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity", id] })
      toast.success("Đã cập nhật biểu mẫu đăng ký")
      setShowFormPanel(false)
    },
    onError: () => toast.error("Cập nhật thất bại"),
  })

  const handleOpenFormPanel = () => {
    setSelectedFormId(activity?.registrationFormId ?? null)
    setShowFormPanel(true)
  }

  const handleSaveForm = () => {
    updateFormMut.mutate(selectedFormId === "" ? null : selectedFormId as number | null)
  }

  if (isLoading) {
    return <div className="px-[60px] py-8 text-muted-foreground">Đang tải...</div>
  }

  if (!activity) {
    return <div className="px-[60px] py-8 text-muted-foreground">Không tìm thấy hoạt động</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-[#0E5C63]">{activity.activityName}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[activity.activityStatus] ?? ""}`}>
              {STATUS_LABEL[activity.activityStatus] ?? activity.activityStatus}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {TYPE_LABEL[activity.activityType] ?? activity.activityType}
            {activity.category && ` · ${activity.category.categoryName}`}
          </p>
        </div>
        <div className="flex gap-2">
          {activity.activityStatus === "draft" && (
            <button
              onClick={() => submitMut.mutate()}
              disabled={submitMut.isPending}
              className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
            >
              Gửi duyệt
            </button>
          )}
          <Link href={`/organization/event/${id}/participants`}
            className="bg-[#0E5C63] text-white px-3 py-1.5 rounded text-sm hover:bg-[#0a4a50]">
            Quản lý tham gia
          </Link>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase">Thời gian</p>
          <p className="text-sm">
            {activity.startTime ? new Date(activity.startTime).toLocaleDateString("vi-VN") : "—"}
            {" → "}
            {activity.endTime ? new Date(activity.endTime).toLocaleDateString("vi-VN") : "—"}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase">Hạn đăng ký</p>
          <p className="text-sm">
            {activity.registrationDeadline
              ? new Date(activity.registrationDeadline).toLocaleDateString("vi-VN")
              : "Không giới hạn"}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase">Địa điểm</p>
          <p className="text-sm">{activity.location ?? "—"}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase">Số lượng</p>
          <p className="text-sm">
            {activity._count?.registrations ?? 0} / {activity.maxParticipants ?? "∞"} người đăng ký
          </p>
        </div>
      </div>

      {/* Description */}
      {activity.description && (
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Mô tả</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.description}</p>
        </div>
      )}

      {/* ── Registration Form Config ── */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase">Biểu mẫu đăng ký</p>
          <button
            onClick={handleOpenFormPanel}
            className="text-xs text-teal-600 hover:underline"
          >
            {activity.registrationForm ? "Đổi biểu mẫu" : "Gắn biểu mẫu"}
          </button>
        </div>

        {activity.registrationForm ? (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.registrationForm.title}</p>
              {activity.registrationForm.description && (
                <p className="text-xs text-gray-500">{activity.registrationForm.description}</p>
              )}
            </div>
            <span className={[
              "text-xs px-1.5 py-0.5 rounded-full",
              activity.registrationForm.status === "open" ? "bg-green-100 text-green-700" :
              activity.registrationForm.status === "closed" ? "bg-red-100 text-red-600" :
              "bg-gray-100 text-gray-500"
            ].join(" ")}>
              {FORM_STATUS_LABEL[activity.registrationForm.status] ?? activity.registrationForm.status}
            </span>
            <button
              onClick={() => updateFormMut.mutate(null)}
              disabled={updateFormMut.isPending}
              className="text-xs text-red-500 hover:underline"
            >
              Gỡ
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Chưa có biểu mẫu. Người dùng đăng ký trực tiếp.</p>
        )}
      </div>

      {/* ── Form selection panel ── */}
      {showFormPanel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold">Chọn biểu mẫu đăng ký</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Chọn biểu mẫu từ thư viện của tổ chức. Người dùng sẽ điền khi đăng ký tham gia.
              </p>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 flex-1">
              {/* No form */}
              <label className={[
                "flex items-start gap-3 border rounded-lg p-3 cursor-pointer",
                selectedFormId === null ? "border-teal-600 bg-teal-50" : "border-gray-200"
              ].join(" ")}>
                <input type="radio" name="sel-form" checked={selectedFormId === null}
                  onChange={() => setSelectedFormId(null)} className="mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Không sử dụng biểu mẫu</p>
                  <p className="text-xs text-gray-500">Đăng ký trực tiếp, không cần điền thêm.</p>
                </div>
              </label>

              {orgForms.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Chưa có biểu mẫu.{" "}
                  <a href="/organization/forms/create" target="_blank" className="text-teal-600 underline">
                    Tạo mới
                  </a>
                </p>
              )}

              {orgForms.map((f: any) => (
                <label key={f.formId} className={[
                  "flex items-start gap-3 border rounded-lg p-3 cursor-pointer",
                  selectedFormId === f.formId ? "border-teal-600 bg-teal-50" : "border-gray-200"
                ].join(" ")}>
                  <input type="radio" name="sel-form" checked={selectedFormId === f.formId}
                    onChange={() => setSelectedFormId(f.formId)} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{f.title}</p>
                      <span className={[
                        "text-xs px-1.5 py-0.5 rounded-full",
                        f.status === "open" ? "bg-green-100 text-green-700" :
                        f.status === "closed" ? "bg-red-100 text-red-600" :
                        "bg-gray-100 text-gray-500"
                      ].join(" ")}>
                        {FORM_STATUS_LABEL[f.status] ?? f.status}
                      </span>
                    </div>
                    {f.description && <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{f._count?.responses ?? 0} phản hồi</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2">
              <button onClick={() => setShowFormPanel(false)}
                className="px-4 py-1.5 border rounded text-sm">
                Hủy
              </button>
              <button onClick={handleSaveForm} disabled={updateFormMut.isPending}
                className="px-4 py-1.5 bg-teal-700 text-white rounded text-sm disabled:opacity-50">
                {updateFormMut.isPending ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
