"use client"

import { useParams, useRouter } from "next/navigation"
import { FormBuilder } from "@/components/form-builder/form-builder"
import { useFormDetail, useUpdateForm } from "@/hooks/useForm.hook"
import { toastSuccess, toastError } from "@/lib/toast"
import type { CreateFormPayload } from "@/types/form/form.types"

export default function OrgEditFormPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: result, isLoading } = useFormDetail(params.id)
  const updateMutation = useUpdateForm(params.id)

  const form = result?.data

  const handleSave = async (data: CreateFormPayload) => {
    try {
      await updateMutation.mutateAsync(data)
      toastSuccess("Cập nhật biểu mẫu thành công")
      router.push("/organization/forms")
    } catch {
      toastError("Cập nhật thất bại")
    }
  }

  if (isLoading) {
    return (
      <div className="px-[60px] py-8">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="px-[60px] py-8">
        <p className="text-muted-foreground">Không tìm thấy biểu mẫu</p>
      </div>
    )
  }

  const initialData: CreateFormPayload = {
    title: form.title,
    description: form.description,
    activityId: form.activityId,
    organizationId: form.organizationId,
    sections: form.sections.map((section) => ({
      title: section.title,
      description: section.description,
      order: section.order,
      navigationType: section.navigationType,
      questions: section.questions.map((q) => ({
        title: q.title,
        description: q.description,
        type: q.type,
        order: q.order,
        required: q.required,
        options: q.options.map((o) => ({ label: o.label, order: o.order, isOther: o.isOther })),
        gridRows: q.gridRows.map((r) => ({ label: r.label, order: r.order })),
        validationRules: q.validationRules ?? undefined,
        displayCondition: q.displayCondition ?? undefined,
      })),
    })),
  }

  return (
    <div className="px-[60px] py-8">
      <h1 className="text-xl font-bold text-[#0E5C63] mb-6">CHỈNH SỬA BIỂU MẪU</h1>
      <FormBuilder
        initialData={initialData}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
      />
    </div>
  )
}
