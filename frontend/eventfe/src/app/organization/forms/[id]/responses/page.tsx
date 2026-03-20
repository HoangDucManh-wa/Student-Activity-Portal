"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useFormDetail, useFormResponses, useApproveResponse } from "@/hooks/useForm.hook"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react"
import { toastSuccess, toastError } from "@/lib/toast"
import type { FormResponse, ResponseStatus } from "@/types/form/form.types"

const STATUS_MAP: Record<ResponseStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  submitted: { label: "Đã nộp", variant: "secondary" },
  approved: { label: "Đã duyệt", variant: "default" },
  rejected: { label: "Từ chối", variant: "destructive" },
}

export default function OrgFormResponsesPage() {
  const params = useParams<{ id: string }>()
  const [page, setPage] = React.useState(1)
  const [selectedResponse, setSelectedResponse] = React.useState<FormResponse | null>(null)

  const { data: formResult } = useFormDetail(params.id)
  const { data: responsesResult, isLoading } = useFormResponses({ id: params.id, page, limit: 20 })
  const approveMutation = useApproveResponse(params.id)

  const form = formResult?.data
  const responses: FormResponse[] = responsesResult?.data?.data ?? []
  const meta = responsesResult?.data?.meta

  const handleApprove = async (responseId: number, status: "approved" | "rejected") => {
    try {
      await approveMutation.mutateAsync({ responseId, status })
      toastSuccess(status === "approved" ? "Đã duyệt phản hồi" : "Đã từ chối phản hồi")
    } catch {
      toastError("Thao tác thất bại")
    }
  }

  return (
    <div className="px-[60px] py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/organization/forms">
            <Button variant="ghost" size="sm">
              <IconArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#0E5C63]">PHẢN HỒI BIỂU MẪU</h1>
            {form && <p className="text-sm text-muted-foreground">{form.title}</p>}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-muted-foreground p-6">Đang tải...</p>
          ) : responses.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center">Chưa có phản hồi nào.</p>
          ) : (
            <div className="divide-y">
              {responses.map((r) => {
                const statusInfo = STATUS_MAP[r.status] ?? STATUS_MAP.submitted
                return (
                  <div key={r.responseId} className="flex items-center justify-between px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {r.user?.userName ?? r.respondentEmail ?? `#${r.responseId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.submittedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      {r.status === "submitted" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(r.responseId, "approved")}
                            className="text-green-600 hover:text-green-800"
                          >
                            <IconCheck className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(r.responseId, "rejected")}
                            className="text-red-500 hover:text-red-700"
                          >
                            <IconX className="size-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setSelectedResponse(r)}>
                        Xem
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
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

      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết phản hồi</DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-medium">Người nộp:</span>{" "}
                {selectedResponse.user?.userName ?? selectedResponse.respondentEmail ?? `#${selectedResponse.responseId}`}
              </div>
              <div className="text-sm">
                <span className="font-medium">Thời gian:</span>{" "}
                {new Date(selectedResponse.submittedAt).toLocaleString("vi-VN")}
              </div>
              <div className="border-t pt-4 space-y-3">
                {selectedResponse.answers.map((answer) => {
                  const displayValue =
                    answer.answerOptions.length > 0
                      ? answer.answerOptions
                          .map((ao) => ao.option?.label ?? ao.otherText ?? "")
                          .filter(Boolean)
                          .join(", ")
                      : answer.textValue ?? "-"
                  return (
                    <div key={answer.answerId} className="space-y-1">
                      <p className="text-sm font-medium">{answer.question.title}</p>
                      <p className="text-sm text-muted-foreground">{displayValue}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
