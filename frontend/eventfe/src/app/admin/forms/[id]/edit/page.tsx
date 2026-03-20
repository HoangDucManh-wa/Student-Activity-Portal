"use client"

import { useParams, useRouter } from "next/navigation"
import { FormBuilder } from "@/components/form-builder/form-builder"
import { useFormDetail, useUpdateForm } from "@/hooks/useForm.hook"
import { toastSuccess, toastError } from "@/lib/toast"
import type { CreateFormPayload } from "@/types/form/form.types"

export default function EditFormPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: result, isLoading } = useFormDetail(params.id)
  const updateMutation = useUpdateForm(params.id)

  const form = result?.data

  const handleSave = async (data: CreateFormPayload) => {
    try {
      await updateMutation.mutateAsync(data)
      toastSuccess("Cap nhat form thanh cong")
      router.push("/admin/forms")
    } catch {
      toastError("Cap nhat form that bai")
    }
  }

  if (isLoading) {
    return (
      <div className="@container/main p-4 lg:p-6">
        <p className="text-muted-foreground">Dang tai...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="@container/main p-4 lg:p-6">
        <p className="text-muted-foreground">Khong tim thay form</p>
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
        options: q.options.map((o) => ({
          label: o.label,
          order: o.order,
          isOther: o.isOther,
        })),
        gridRows: q.gridRows.map((r) => ({ label: r.label, order: r.order })),
        validationRules: q.validationRules ?? undefined,
        displayCondition: q.displayCondition ?? undefined,
      })),
    })),
  }

  return (
    <div className="@container/main p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-6">Chinh sua form</h1>
      <FormBuilder
        initialData={initialData}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
      />
    </div>
  )
}
