"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useFormList, useDeleteForm } from "@/hooks/useForm.hook"
import { changeFormStatus } from "@/services/form.service"
import { getMyOrganization } from "@/services/organization.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconPlus, IconEdit, IconTrash, IconFileSpreadsheet, IconPlayerPlay, IconPlayerStop } from "@tabler/icons-react"
import { toastSuccess, toastError } from "@/lib/toast"
import type { Form, FormStatus } from "@/types/form/form.types"

const STATUS_MAP: Record<FormStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Bản nháp", variant: "secondary" },
  open: { label: "Đang mở", variant: "default" },
  closed: { label: "Đã đóng", variant: "destructive" },
}

export default function OrgFormsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(1)

  const { data: orgData } = useQuery({
    queryKey: ["my-organization"],
    queryFn: () => getMyOrganization(),
  })
  const organizationId = orgData?.data?.organizationId

  const { data: result, isLoading } = useFormList({ page, limit: 20, organizationId })
  const deleteMutation = useDeleteForm()

  const forms: Form[] = result?.data?.data ?? []
  const meta = result?.data?.meta

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa biểu mẫu này?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toastSuccess("Đã xóa biểu mẫu")
    } catch {
      toastError("Xóa thất bại")
    }
  }

  const handleChangeStatus = async (id: number, status: FormStatus) => {
    try {
      await changeFormStatus(id, status)
      queryClient.invalidateQueries({ queryKey: ["forms"] })
      toastSuccess("Cập nhật trạng thái thành công")
    } catch {
      toastError("Cập nhật thất bại")
    }
  }

  return (
    <div className="px-[60px] py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#0E5C63]">QUẢN LÝ BIỂU MẪU</h1>
        <Link href="/organization/forms/create">
          <Button className="bg-[#0E5C63] hover:bg-[#0a4a50]">
            <IconPlus className="size-4 mr-2" /> Tạo biểu mẫu mới
          </Button>
        </Link>
      </div>

      {isLoading && <p className="text-muted-foreground">Đang tải...</p>}

      {!isLoading && forms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Chưa có biểu mẫu nào. Nhấn &quot;Tạo biểu mẫu mới&quot; để bắt đầu.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {forms.map((form) => {
          const statusInfo = STATUS_MAP[form.status] ?? STATUS_MAP.draft
          return (
            <Card key={form.formId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{form.title}</CardTitle>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {form.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeStatus(form.formId, "open")}
                      >
                        <IconPlayerPlay className="size-4 mr-1" /> Mở biểu mẫu
                      </Button>
                    )}
                    {form.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeStatus(form.formId, "closed")}
                      >
                        <IconPlayerStop className="size-4 mr-1" /> Đóng biểu mẫu
                      </Button>
                    )}
                    <Link href={`/organization/forms/${form.formId}/responses`}>
                      <Button variant="outline" size="sm">
                        <IconFileSpreadsheet className="size-4 mr-1" />
                        Phản hồi ({form._count?.responses ?? 0})
                      </Button>
                    </Link>
                    <Link href={`/organization/forms/${form.formId}/edit`}>
                      <Button variant="outline" size="sm">
                        <IconEdit className="size-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(form.formId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {form.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{form.description}</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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
