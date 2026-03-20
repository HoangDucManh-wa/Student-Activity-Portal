import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SafeImage } from "@/components/ui-custom/SafeImage"
import type { Activity } from "@/services/activity.service"

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  published: { label: "Còn chỗ",     color: "bg-green-500" },
  running:   { label: "Đang diễn ra", color: "bg-blue-500" },
  finished:  { label: "Đã kết thúc",  color: "bg-gray-400" },
  cancelled: { label: "Đã huỷ",       color: "bg-red-400" },
  draft:     { label: "Nháp",          color: "bg-yellow-400" },
}

const TYPE_MAP: Record<string, string> = {
  program:     "Chương trình",
  competition: "Cuộc thi",
  recruitment: "Tuyển thành viên",
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

interface EventCardProps {
  activity: Activity
}

export function EventCard({ activity }: EventCardProps) {
  const status = STATUS_MAP[activity.activityStatus] ?? { label: activity.activityStatus, color: "bg-gray-400" }
  const categoryName = activity.category?.categoryName ?? ""
  const registrationCount = activity._count?.registrations ?? 0

  return (
    <Card className="relative mx-auto w-[350px] max-w-sm pt-0 h-[400px] rounded-t-[10px] duration-300 hover:scale-105 overflow-hidden">
      <div className="relative">
        <SafeImage
          src={activity.coverImage ?? "/hinh-nen-may-tinh-anime.jpg"}
          alt={activity.activityName}
          width={1080}
          height={1080}
          className="w-full h-[200px] rounded-t-[10px] object-cover"
        />
        {categoryName && (
          <Badge
            variant="secondary"
            className="absolute bottom-[-10px] left-0 bg-[red] rounded-tl-[0px] rounded-bl-[0px] text-white"
          >
            {categoryName}
          </Badge>
        )}
      </div>
      <CardHeader>
        <CardAction>
          <Badge variant="secondary" className={`${status.color} text-white`}>
            {status.label}
          </Badge>
        </CardAction>
        <CardTitle className="line-clamp-2 text-[15px]">{activity.activityName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-[13px] text-gray-600">
          Bắt đầu: <span className="text-gray-800 font-medium">{formatDate(activity.startTime)}</span>
        </div>
        <div className="text-[13px] text-gray-600">
          Kết thúc: <span className="text-gray-800 font-medium">{formatDate(activity.endTime)}</span>
        </div>
        <div className="text-[13px] text-gray-600">
          Hạn ĐK: <span className="text-gray-800 font-medium">{formatDate(activity.registrationDeadline)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-[13px] text-gray-600">
          Đã đăng ký: <span className="font-semibold text-[#056382]">{registrationCount}</span>
          {activity.maxParticipants && (
            <span className="text-gray-400"> / {activity.maxParticipants}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
