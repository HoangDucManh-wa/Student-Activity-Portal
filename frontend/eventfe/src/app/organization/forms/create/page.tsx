"use client"

import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { FormBuilder } from "@/components/form-builder/form-builder"
import { useCreateForm } from "@/hooks/useForm.hook"
import { getMyOrganization } from "@/services/organization.service"
import { toastSuccess, toastError } from "@/lib/toast"
import type { CreateFormPayload } from "@/types/form/form.types"

export default function OrgCreateFormPage() {
  const router = useRouter()
  const createMutation = useCreateForm()

  const { data: orgData } = useQuery({
    queryKey: ["my-organization"],
    queryFn: () => getMyOrganization(),
  })
  const organizationId = orgData?.data?.organizationId

  const handleSave = async (data: CreateFormPayload) => {
    if (!organizationId) {
      toastError("Không tìm thấy thông tin tổ chức")
      return
    }
    try {
      await createMutation.mutateAsync({ ...data, organizationId })
      toastSuccess("Tạo biểu mẫu thành công")
      router.push("/organization/forms")
    } catch {
      toastError("Tạo biểu mẫu thất bại")
    }
  }

  return (
    <div className="px-[60px] py-8">
      <h1 className="text-xl font-bold text-[#0E5C63] mb-6">TẠO BIỂU MẪU MỚI</h1>
      <FormBuilder
        onSave={handleSave}
        isSaving={createMutation.isPending}
      />
    </div>
  )
}
