"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Bell, Send, Trash2, CheckCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getMyNotifications,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from "@/services/notification.service"
import { envConfig } from "@/configs/env.config"
import { http } from "@/configs/http.comfig"

const API = envConfig.NEXT_PUBLIC_API_URL

const TYPE_BADGE: Record<string, string> = {
  system: "bg-blue-100 text-blue-700",
  activity: "bg-green-100 text-green-700",
  registration: "bg-purple-100 text-purple-700",
}

const TYPE_LABEL: Record<string, string> = {
  system: "Hệ thống",
  activity: "Hoạt động",
  registration: "Đăng ký",
}

// ─── User info lookup ─────────────────────────────────────────────────────────

function useUserLookup(userId: string) {
  return useQuery({
    queryKey: ["user-lookup", userId],
    queryFn: () =>
      http.get<{ success: boolean; data: { userId: number; userName: string; email: string } }>(
        `${API}/users/${userId}`
      ),
    enabled: !!userId && !isNaN(Number(userId)) && Number(userId) > 0,
    staleTime: 30_000,
    retry: false,
  })
}

// ─── Single send form ─────────────────────────────────────────────────────────

function SingleSendForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ userId: "", title: "", content: "", notificationType: "system" })
  const [sending, setSending] = useState(false)

  const { data: userResult, isFetching: lookingUp } = useUserLookup(form.userId)
  const lookedUpUser = userResult?.data

  const handleSend = async () => {
    if (!form.userId || !form.title) {
      toast.error("Vui lòng nhập ID người dùng và tiêu đề")
      return
    }
    setSending(true)
    try {
      const res = await http.post<{ success: boolean; message?: string }>(
        `${API}/notifications/send`,
        {
          userId: Number(form.userId),
          title: form.title,
          content: form.content,
          notificationType: form.notificationType,
          channels: ["IN_APP"],
        }
      )
      if (res?.success) {
        toast.success("Đã gửi thông báo thành công")
        setForm({ userId: "", title: "", content: "", notificationType: "system" })
        onSuccess()
      } else {
        toast.error("Gửi thất bại")
      }
    } catch {
      toast.error("Gửi thất bại")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>ID người dùng</Label>
        <Input
          type="number"
          placeholder="Nhập ID người dùng (VD: 5)"
          value={form.userId}
          onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
        />
        {/* User info preview */}
        {form.userId && Number(form.userId) > 0 && (
          <div className="text-xs mt-1 min-h-[20px]">
            {lookingUp && <span className="text-gray-400">Đang tìm người dùng...</span>}
            {!lookingUp && lookedUpUser && (
              <span className="text-green-700 font-medium">
                {lookedUpUser.userName} — {lookedUpUser.email}
              </span>
            )}
            {!lookingUp && !lookedUpUser && form.userId && (
              <span className="text-red-500">Không tìm thấy người dùng</span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label>Loại thông báo</Label>
        <Select
          value={form.notificationType}
          onValueChange={(v) => setForm((p) => ({ ...p, notificationType: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">Hệ thống</SelectItem>
            <SelectItem value="activity">Hoạt động</SelectItem>
            <SelectItem value="registration">Đăng ký</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Tiêu đề</Label>
        <Input
          placeholder="Nhập tiêu đề thông báo"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <Label>Nội dung</Label>
        <Textarea
          placeholder="Nhập nội dung thông báo (tùy chọn)"
          rows={3}
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
        />
      </div>

      <Button className="w-full" onClick={handleSend} disabled={sending || !lookedUpUser}>
        {sending ? "Đang gửi..." : "Gửi thông báo"}
      </Button>
    </div>
  )
}

// ─── Bulk send form ────────────────────────────────────────────────────────────

function BulkSendForm({ onSuccess }: { onSuccess: () => void }) {
  const [target, setTarget] = useState<"all" | "userIds" | "organization">("all")
  const [userIdsText, setUserIdsText] = useState("")
  const [orgId, setOrgId] = useState("")
  const [form, setForm] = useState({ title: "", content: "", notificationType: "system", scheduledAt: "" })
  const [sending, setSending] = useState(false)

  // Lookup each entered userId
  const parsedIds = userIdsText
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s && !isNaN(Number(s)) && Number(s) > 0)
    .map(Number)

  const handleSendBulk = async () => {
    if (!form.title) {
      toast.error("Vui lòng nhập tiêu đề")
      return
    }
    if (target === "userIds" && parsedIds.length === 0) {
      toast.error("Vui lòng nhập ít nhất 1 ID người dùng hợp lệ")
      return
    }
    if (target === "organization" && (!orgId || isNaN(Number(orgId)))) {
      toast.error("Vui lòng nhập ID tổ chức hợp lệ")
      return
    }

    setSending(true)
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        content: form.content,
        notificationType: form.notificationType,
        channels: ["IN_APP"],
      }
      if (target === "all") payload.sendToAll = true
      if (target === "userIds") payload.userIds = parsedIds
      if (target === "organization") payload.organizationId = Number(orgId)
      if (form.scheduledAt) payload.scheduledAt = new Date(form.scheduledAt).toISOString()

      const res = await http.post<{ success: boolean; data?: { totalSent: number }; message?: string }>(
        `${API}/notifications/send-bulk`,
        payload
      )
      if (res?.success) {
        toast.success(`Đã gửi thành công cho ${res.data?.totalSent ?? "?"} người dùng`)
        setForm({ title: "", content: "", notificationType: "system", scheduledAt: "" })
        setUserIdsText("")
        setOrgId("")
        onSuccess()
      } else {
        toast.error(res?.message ?? "Gửi thất bại")
      }
    } catch {
      toast.error("Gửi thất bại")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Gửi đến</Label>
        <Select value={target} onValueChange={(v) => setTarget(v as typeof target)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả người dùng</SelectItem>
            <SelectItem value="userIds">Danh sách ID người dùng</SelectItem>
            <SelectItem value="organization">Thành viên tổ chức</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {target === "userIds" && (
        <div className="space-y-1">
          <Label>ID người dùng (mỗi dòng hoặc phân cách bằng dấu phẩy)</Label>
          <Textarea
            placeholder={"5\n6\n7 hoặc 5,6,7"}
            rows={3}
            value={userIdsText}
            onChange={(e) => setUserIdsText(e.target.value)}
          />
          {parsedIds.length > 0 && (
            <p className="text-xs text-green-700">Sẽ gửi đến {parsedIds.length} người dùng: {parsedIds.join(", ")}</p>
          )}
        </div>
      )}

      {target === "organization" && (
        <div className="space-y-1">
          <Label>ID tổ chức</Label>
          <Input
            type="number"
            placeholder="Nhập ID tổ chức (VD: 2)"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-1">
        <Label>Loại thông báo</Label>
        <Select
          value={form.notificationType}
          onValueChange={(v) => setForm((p) => ({ ...p, notificationType: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">Hệ thống</SelectItem>
            <SelectItem value="activity">Hoạt động</SelectItem>
            <SelectItem value="registration">Đăng ký</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Tiêu đề</Label>
        <Input
          placeholder="Nhập tiêu đề thông báo"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <Label>Nội dung</Label>
        <Textarea
          placeholder="Nhập nội dung thông báo (tùy chọn)"
          rows={3}
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <Label>Lên lịch gửi (tùy chọn)</Label>
        <Input
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
        />
        <p className="text-xs text-gray-400">Để trống = gửi ngay lập tức qua worker</p>
      </div>

      <Button className="w-full" onClick={handleSendBulk} disabled={sending}>
        {sending ? "Đang gửi qua worker..." : "Gửi đồng loạt"}
      </Button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => getMyNotifications({ limit: 50 }),
  })

  const notifications: Notification[] = data?.data?.data ?? []
  const unreadCount = notifications.filter((n) => n.status === "unread").length

  const markAllMut = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] })
      toast.success("Đã đánh dấu tất cả là đã đọc")
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] })
      toast.success("Đã xóa thông báo")
    },
  })

  const handleSendSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6" />
          <h1 className="text-xl font-bold">Quản lý thông báo</h1>
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

      <div className="grid grid-cols-3 gap-6">
        {/* Panel gửi thông báo */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4" />
              Gửi thông báo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="single">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="single" className="flex-1">
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Đơn lẻ
                </TabsTrigger>
                <TabsTrigger value="bulk" className="flex-1">
                  <Users className="w-3.5 h-3.5 mr-1" />
                  Đồng loạt
                </TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <SingleSendForm onSuccess={handleSendSuccess} />
              </TabsContent>
              <TabsContent value="bulk">
                <BulkSendForm onSuccess={handleSendSuccess} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Danh sách thông báo */}
        <div className="col-span-2 space-y-3">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}

          {!isLoading && notifications.length === 0 && (
            <div className="text-center py-12 text-gray-400">Chưa có thông báo nào</div>
          )}

          {notifications.map((n) => (
            <div
              key={n.notificationId}
              className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
                n.status === "unread" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {n.status === "unread" && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                  <p className="font-medium text-sm truncate">{n.title}</p>
                  {n.notificationType && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        TYPE_BADGE[n.notificationType] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {TYPE_LABEL[n.notificationType] ?? n.notificationType}
                    </span>
                  )}
                </div>
                {n.content && (
                  <p className="text-xs text-gray-500 line-clamp-1">{n.content}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.notificationTime).toLocaleString("vi-VN")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-gray-400 hover:text-red-500 shrink-0"
                onClick={() => deleteMut.mutate(n.notificationId)}
                disabled={deleteMut.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
