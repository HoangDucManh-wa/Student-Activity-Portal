import { envConfig } from "@/configs/env.config"
import { http } from "@/configs/http.comfig"

const BASE = `${envConfig.NEXT_PUBLIC_API_URL}/notifications`

export interface Notification {
  notificationId: number
  title: string
  content?: string
  notificationTime: string
  status: "unread" | "read"
  notificationType?: string
  userId: number
}

export interface NotificationsResponse {
  success: boolean
  data: {
    data: Notification[]
    meta: { total: number; page: number; limit: number; totalPages: number }
  }
}

export interface StatsResponse {
  success: boolean
  data: { unreadCount: number }
}

export async function getMyNotifications(params?: { limit?: number; status?: string; page?: number }) {
  const query = new URLSearchParams()
  if (params?.limit) query.set("limit", String(params.limit))
  if (params?.status) query.set("status", params.status)
  if (params?.page) query.set("page", String(params.page))
  const qs = query.toString()
  return http.get<NotificationsResponse>(`${BASE}${qs ? `?${qs}` : ""}`)
}

export async function getUnreadCount() {
  return http.get<StatsResponse>(`${BASE}/stats`)
}

export async function markAsRead(id: number) {
  return http.put(`${BASE}/${id}/read`, {})
}

export async function markAllAsRead() {
  return http.put(`${BASE}/read-all`, {})
}

export async function deleteNotification(id: number) {
  return http.delete(`${BASE}/${id}`, {})
}
