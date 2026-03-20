"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getMyNotifications,
  markAllAsRead,
  markAsRead,
  deleteNotification,
  type Notification,
} from "@/services/notification.service"

const TYPE_LABEL: Record<string, string> = {
  system: "Hệ thống",
  activity: "Hoạt động",
  registration: "Đăng ký",
}

const TYPE_BADGE: Record<string, string> = {
  system: "bg-blue-100 text-blue-700",
  activity: "bg-green-100 text-green-700",
  registration: "bg-purple-100 text-purple-700",
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => getMyNotifications({ page, limit: 20 }),
  })

  const notifications: Notification[] = data?.data?.data ?? []
  const meta = data?.data?.meta
  const unreadCount = notifications.filter((n) => n.status === "unread").length

  const markAllMut = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const markOneMut = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const deleteMut = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#05566B]" />
          <h1 className="text-xl font-bold text-[#05566B]">Thông báo của tôi</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}

        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            Bạn chưa có thông báo nào.
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n.notificationId}
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
              n.status === "unread" ? "bg-blue-50/50 border-blue-100" : "bg-white border-gray-100"
            }`}
            onClick={() => n.status === "unread" && markOneMut.mutate(n.notificationId)}
          >
            <div className="mt-1.5 shrink-0">
              <div className={`w-2 h-2 rounded-full ${n.status === "unread" ? "bg-[#05566B]" : "bg-transparent"}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className={`text-sm truncate ${n.status === "unread" ? "font-semibold" : "font-normal text-gray-700"}`}>
                  {n.title}
                </p>
                {n.notificationType && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${TYPE_BADGE[n.notificationType] ?? "bg-gray-100 text-gray-500"}`}>
                    {TYPE_LABEL[n.notificationType] ?? n.notificationType}
                  </span>
                )}
              </div>
              {n.content && (
                <p className="text-xs text-gray-500 line-clamp-2">{n.content}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.notificationTime).toLocaleString("vi-VN")}
              </p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); deleteMut.mutate(n.notificationId) }}
              className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="text-sm text-gray-500">{page} / {meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Sau
          </Button>
        </div>
      )}
    </div>
  )
}
