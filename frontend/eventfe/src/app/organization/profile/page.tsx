"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui-custom/ImageUpload"
import { getMyOrganization, updateMyOrganization } from "@/services/organization.service"
import { getMe } from "@/services/auth.service"
import { http } from "@/configs/http.comfig"

interface OrgFormValues {
  organizationName: string
  organizationType: string
  description: string
}

export default function OrgProfilePage() {
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ["my-organization"],
    queryFn: () => getMyOrganization(),
  })

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
  })

  const org = orgData?.data
  const user = meData?.data?.user

  const { register, handleSubmit, formState: { errors } } = useForm<OrgFormValues>({
    values: {
      organizationName: org?.organizationName ?? "",
      organizationType: org?.organizationType ?? "",
      description: org?.description ?? "",
    },
  })

  const handleLogoUpload = async (key: string) => {
    if (!org?.organizationId) return
    try {
      const res = await updateMyOrganization(org.organizationId, { logoUrl: key })
      if (res?.success) {
        queryClient.invalidateQueries({ queryKey: ["my-organization"] })
        toast.success("Cập nhật logo thành công")
      } else {
        toast.error("Cập nhật logo thất bại")
      }
    } catch {
      toast.error("Cập nhật logo thất bại")
    }
  }

  const handleCoverUpload = async (key: string) => {
    if (!org?.organizationId) return
    try {
      const res = await updateMyOrganization(org.organizationId, { coverImageUrl: key })
      if (res?.success) {
        queryClient.invalidateQueries({ queryKey: ["my-organization"] })
        toast.success("Cập nhật ảnh bìa thành công")
      } else {
        toast.error("Cập nhật ảnh bìa thất bại")
      }
    } catch {
      toast.error("Cập nhật ảnh bìa thất bại")
    }
  }

  const onSubmitOrg = async (data: OrgFormValues) => {
    if (!org?.organizationId) return
    setSubmitting(true)
    try {
      const res = await updateMyOrganization(org.organizationId, data)
      if (res?.success) {
        queryClient.invalidateQueries({ queryKey: ["my-organization"] })
        toast.success("Cập nhật thông tin thành công")
      } else {
        toast.error("Cập nhật thất bại")
      }
    } catch {
      toast.error("Cập nhật thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAvatarUpload = async (key: string) => {
    const API = process.env.NEXT_PUBLIC_API_URL
    try {
      const res = await http.put<{ success: boolean; message?: string }>(`${API}/users/me`, { avatarUrl: key })
      if (res?.success) {
        queryClient.invalidateQueries({ queryKey: ["me"] })
        toast.success("Cập nhật ảnh đại diện thành công")
      } else {
        toast.error(res?.message ?? "Cập nhật ảnh đại diện thất bại")
      }
    } catch {
      toast.error("Cập nhật ảnh đại diện thất bại")
    }
  }

  if (orgLoading) {
    return (
      <div className="px-[180px] py-10 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-[180px] py-10 bg-gray-100 min-h-screen space-y-6">
      {/* Thông tin tổ chức */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tổ chức</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ảnh bìa */}
          <div>
            <Label className="mb-2 block">Ảnh bìa</Label>
            <ImageUpload
              folder="covers"
              variant="cover"
              currentImageUrl={org?.coverImageUrl ?? null}
              onUpload={handleCoverUpload}
              className="w-full h-[200px]"
            />
          </div>

          {/* Logo + thông tin cơ bản */}
          <div className="flex items-start gap-6">
            <div>
              <Label className="mb-2 block">Logo</Label>
              <ImageUpload
                folder="logos"
                variant="avatar"
                currentImageUrl={org?.logoUrl ?? null}
                onUpload={handleLogoUpload}
              />
            </div>
            <form onSubmit={handleSubmit(onSubmitOrg)} className="flex-1 space-y-4">
              <div>
                <Label>Tên tổ chức</Label>
                <Input {...register("organizationName", { required: true })} />
                {errors.organizationName && <p className="text-red-500 text-xs mt-1">Vui lòng nhập tên tổ chức</p>}
              </div>
              <div>
                <Label>Loại hình</Label>
                <Input {...register("organizationType")} placeholder="VD: Câu lạc bộ, Đội nhóm..." />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea {...register("description")} rows={4} placeholder="Mô tả về tổ chức..." />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Thông tin cá nhân */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân (người quản lý)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <Label className="mb-2 block">Ảnh đại diện</Label>
              <ImageUpload
                folder="avatars"
                variant="avatar"
                currentImageUrl={user?.avatarUrl ?? null}
                onUpload={handleAvatarUpload}
              />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-lg">{user?.userName}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <p className="text-gray-500 text-sm">{user?.university}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
