"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { getActivityById } from "@/services/activity.service"
import { createRegistration } from "@/services/registration.service"
import { Button } from "@/components/ui/button"
import { SafeImage } from "@/components/ui-custom/SafeImage"
import { toast } from "sonner"
import { useState } from "react"

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const TYPE_MAP: Record<string, string> = {
  program:     "Chương trình",
  competition: "Cuộc thi",
  recruitment: "Tuyển thành viên",
}

export default function DetailEventPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [registering, setRegistering] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["activity", id],
    queryFn: () => getActivityById(id),
    enabled: !!id,
  })

  const activity = data?.data

  const handleRegister = async () => {
    if (!activity) return
    setRegistering(true)
    try {
      const res = await createRegistration({ activityId: activity.activityId }) as any
      if (res?.success) {
        toast.success("Đăng ký thành công!")
      } else {
        toast.error(res?.message ?? "Đăng ký thất bại")
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setRegistering(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-[300px] bg-gray-200 mb-[30px]" />
        <div className="flex mx-[150px] gap-[20px]">
          <div className="w-[400px] h-[200px] bg-gray-100 rounded-xl" />
          <div className="flex-1 h-[200px] bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !activity) {
    return (
      <div className="text-center py-20 text-gray-500">
        Không tìm thấy sự kiện.{" "}
        <button onClick={() => router.back()} className="text-[#056382] underline">Quay lại</button>
      </div>
    )
  }

  const registrationCount = activity._count?.registrations ?? 0
  const spotsLeft = activity.maxParticipants
    ? activity.maxParticipants - registrationCount
    : null

  return (
    <div>
      <div className="relative h-[300px] mb-[30px]">
        <SafeImage
          src={activity.coverImage ?? "/hinh-nen-may-tinh-anime.jpg"}
          alt={activity.activityName}
          fill
          priority
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="flex mx-[150px] gap-[20px] mb-[30px]">
        <div
          className="border-[2px] w-[400px] bg-white rounded-xl p-6 space-y-2"
          style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
        >
          <div className="font-bold text-[16px] text-[#05566B] mb-3">Thông tin chính</div>
          <div className="text-[14px]">
            <span className="font-medium">Loại:</span>{" "}
            {TYPE_MAP[activity.activityType] ?? activity.activityType}
          </div>
          <div className="text-[14px]">
            <span className="font-medium">Bắt đầu:</span> {formatDate(activity.startTime)}
          </div>
          <div className="text-[14px]">
            <span className="font-medium">Kết thúc:</span> {formatDate(activity.endTime)}
          </div>
          <div className="text-[14px]">
            <span className="font-medium">Hạn đăng ký:</span> {formatDate(activity.registrationDeadline)}
          </div>
          <div className="text-[14px]">
            <span className="font-medium">Địa điểm:</span> {activity.location ?? "—"}
          </div>
          {spotsLeft !== null && (
            <div className="text-[14px]">
              <span className="font-medium">Còn lại:</span>{" "}
              <span className={spotsLeft <= 5 ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                {spotsLeft} chỗ
              </span>
            </div>
          )}
          {activity.prize && (
            <div className="text-[14px]">
              <span className="font-medium">Giải thưởng:</span> {activity.prize}
            </div>
          )}
        </div>

        <div
          className="border-[2px] flex-1 p-6 rounded-[20px] space-y-3"
          style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
        >
          <h1 className="text-[22px] font-bold text-[#05566B]">{activity.activityName}</h1>
          {activity.organization && (
            <div className="text-[14px] text-gray-600">
              <span className="font-medium">Đơn vị tổ chức:</span>{" "}
              {activity.organization.organizationName}
            </div>
          )}
          {activity.description && (
            <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
              {activity.description}
            </p>
          )}
        </div>
      </div>

      <div className="text-center pb-[40px]">
        <Button
          onClick={handleRegister}
          disabled={registering || spotsLeft === 0}
          className="bg-[#05566B] w-[200px] h-[50px] rounded-[20px] text-white hover:bg-[#056382] cursor-pointer disabled:opacity-50"
        >
          {registering ? "Đang đăng ký..." : spotsLeft === 0 ? "Hết chỗ" : "Đăng ký ngay"}
        </Button>
      </div>
    </div>
  )
}
