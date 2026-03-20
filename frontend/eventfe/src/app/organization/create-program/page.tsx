"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ImageUpload } from "@/components/ui-custom/ImageUpload"
import { getMyOrganization } from "@/services/organization.service"
import { getCategories, createActivity } from "@/services/activity.service"
import { getFormList } from "@/services/form.service"

const ACTIVITY_TYPE_OPTIONS = [
  { value: "program", label: "Chương trình" },
  { value: "competition", label: "Cuộc thi" },
  { value: "recruitment", label: "Tuyển sinh" },
]

const STEPS = [
  "Thông tin cơ bản",
  "Thời gian & địa điểm",
  "Form đăng ký",
]

export default function CreateProgramPage() {
  const [step, setStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const [coverKey, setCoverKey] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    deadline: "",
    location: "",
    quantity: "",
    activityType: "program",
    categoryId: "",
  })

  const { data: orgData } = useQuery({
    queryKey: ["my-organization"],
    queryFn: () => getMyOrganization(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ["activity-categories"],
    queryFn: () => getCategories(),
  })

  const organizationId = orgData?.data?.organizationId

  const { data: formsData } = useQuery({
    queryKey: ["org-forms-for-activity", organizationId],
    queryFn: () => getFormList({ organizationId, limit: 50 }),
    enabled: !!organizationId && step === 3,
  })

  const categories = categoriesData?.data ?? []
  const orgForms = (formsData as any)?.data?.data ?? []

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError("")
  }

  const goToStep2 = () => {
    if (!form.name) { setError("Vui lòng nhập tên!"); return }
    if (!form.categoryId) { setError("Vui lòng chọn danh mục!"); return }
    setError("")
    setStep(2)
  }

  const goToStep3 = () => {
    const { startDate, endDate, deadline, location, quantity } = form
    if (!startDate || !endDate || !deadline || !location) {
      setError("Vui lòng điền đầy đủ thông tin!"); return
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Ngày bắt đầu phải trước ngày kết thúc!"); return
    }
    if (!quantity || isNaN(Number(quantity))) {
      setError("Số lượng phải là số hợp lệ!"); return
    }
    if (new Date(deadline) > new Date(startDate)) {
      setError("Hạn đăng ký phải trước ngày bắt đầu!"); return
    }
    setError("")
    setStep(3)
  }

  const handleSubmit = async () => {
    if (!organizationId) { setError("Không tìm thấy thông tin tổ chức!"); return }
    setSubmitting(true)
    setError("")
    try {
      const res = await createActivity({
        activityName: form.name,
        description: form.description || null,
        coverImage: coverKey || null,
        location: form.location,
        activityType: form.activityType as "program" | "competition" | "recruitment",
        teamMode: "individual",
        startTime: new Date(form.startDate).toISOString(),
        endTime: new Date(form.endDate).toISOString(),
        registrationDeadline: new Date(form.deadline).toISOString(),
        maxParticipants: Number(form.quantity),
        organizationId,
        categoryId: Number(form.categoryId),
        registrationFormId: selectedFormId,
      })
      if (res?.success) {
        setShowSuccess(true)
      } else {
        setError((res as any)?.error ?? "Tạo thất bại, vui lòng thử lại!")
      }
    } catch (e: any) {
      setError(e?.message ?? "Không thể kết nối máy chủ!")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow mt-6">
      <h1 className="text-center text-xl font-semibold mb-4">TẠO MỚI CHƯƠNG TRÌNH</h1>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {/* Step indicator */}
      <div className="flex justify-center gap-6 mb-6">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className={[
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                step === i + 1
                  ? "bg-teal-700 text-white"
                  : step > i + 1
                  ? "bg-teal-300 text-white"
                  : "bg-gray-200 text-gray-500",
              ].join(" ")}
            >
              {i + 1}
            </span>
            <span className={step === i + 1 ? "text-teal-700 font-medium text-sm" : "text-gray-400 text-sm"}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Step 1: Thông tin cơ bản ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên chương trình:</label>
            <input value={form.name} onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border p-2 rounded mt-1" placeholder="Nhập tên chương trình..." />
          </div>
          <div>
            <label className="text-sm font-medium">Loại hoạt động:</label>
            <select value={form.activityType} onChange={(e) => handleChange("activityType", e.target.value)}
              className="w-full border p-2 rounded mt-1">
              {ACTIVITY_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Danh mục:</label>
            <select value={form.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)}
              className="w-full border p-2 rounded mt-1">
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Ảnh đại diện:</label>
            <ImageUpload folder="covers" variant="cover" onUpload={(key) => setCoverKey(key)} className="mt-2 max-w-[300px]" />
          </div>
          <div>
            <label className="text-sm font-medium">Mô tả:</label>
            <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)}
              className="w-full border p-2 rounded mt-1" rows={3} placeholder="Mô tả chương trình..." />
          </div>
          <div className="flex justify-end">
            <button onClick={goToStep2} className="bg-teal-700 text-white px-4 py-2 rounded">
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Thời gian & địa điểm ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Thời gian bắt đầu:</label>
              <input type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full border p-2 rounded mt-1" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Thời gian kết thúc:</label>
              <input type="date" value={form.endDate} onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full border p-2 rounded mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Hạn đăng ký:</label>
            <input type="date" value={form.deadline} onChange={(e) => handleChange("deadline", e.target.value)}
              className="w-full border p-2 rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Địa điểm:</label>
            <input value={form.location} onChange={(e) => handleChange("location", e.target.value)}
              className="w-full border p-2 rounded mt-1" placeholder="Nhập địa điểm..." />
          </div>
          <div>
            <label className="text-sm font-medium">Số lượng đăng ký tối đa:</label>
            <input type="number" value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)}
              className="border p-2 rounded mt-1 w-[140px]" />
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={() => setStep(1)} className="bg-gray-400 text-white px-4 py-2 rounded">
              ← Quay lại
            </button>
            <button onClick={goToStep3} className="bg-teal-700 text-white px-4 py-2 rounded">
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Form đăng ký ── */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Chọn một biểu mẫu để người dùng điền khi đăng ký. Có thể bỏ qua nếu không cần.
          </p>

          {/* No form option */}
          <label
            className={[
              "flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors",
              selectedFormId === null ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-gray-300",
            ].join(" ")}
          >
            <input
              type="radio"
              name="reg-form"
              checked={selectedFormId === null}
              onChange={() => setSelectedFormId(null)}
              className="mt-0.5"
            />
            <div>
              <p className="font-medium text-sm">Không sử dụng biểu mẫu</p>
              <p className="text-xs text-gray-500">Người dùng đăng ký trực tiếp, không cần điền thêm thông tin.</p>
            </div>
          </label>

          {/* Org's existing forms */}
          {orgForms.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Tổ chức chưa có biểu mẫu nào.{" "}
              <a href="/organization/forms/create" target="_blank" className="text-teal-600 underline">
                Tạo biểu mẫu mới
              </a>
            </p>
          )}
          {orgForms.map((f: any) => (
            <label
              key={f.formId}
              className={[
                "flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors",
                selectedFormId === f.formId ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-gray-300",
              ].join(" ")}
            >
              <input
                type="radio"
                name="reg-form"
                checked={selectedFormId === f.formId}
                onChange={() => setSelectedFormId(f.formId)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{f.title}</p>
                  <span className={[
                    "text-xs px-1.5 py-0.5 rounded-full",
                    f.status === "open" ? "bg-green-100 text-green-700" :
                    f.status === "closed" ? "bg-red-100 text-red-600" :
                    "bg-gray-100 text-gray-500"
                  ].join(" ")}>
                    {f.status === "open" ? "Đang mở" : f.status === "closed" ? "Đã đóng" : "Bản nháp"}
                  </span>
                </div>
                {f.description && <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>}
              </div>
            </label>
          ))}

          <div className="pt-2 text-xs text-gray-400">
            Bạn có thể thay đổi biểu mẫu đăng ký sau khi tạo hoạt động.
          </div>

          <div className="flex justify-between mt-4">
            <button onClick={() => setStep(2)} className="bg-gray-400 text-white px-4 py-2 rounded">
              ← Quay lại
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-teal-700 text-white px-4 py-2 rounded disabled:opacity-50">
              {submitting ? "Đang tạo..." : "Tạo chương trình"}
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[320px] text-center shadow-lg">
            <div className="text-green-600 text-3xl mb-2">✓</div>
            <h2 className="font-semibold mb-2">Tạo mới thành công</h2>
            <p className="text-sm text-gray-600 mb-4">
              Chương trình đã được ghi nhận vào hệ thống.
              {selectedFormId ? " Biểu mẫu đăng ký đã được gắn." : ""}
            </p>
            <button onClick={() => router.push("/organization/event")}
              className="bg-teal-700 text-white px-4 py-2 rounded">
              Xem danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
