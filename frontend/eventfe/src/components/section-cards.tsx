"use client"

import { useEffect, useState } from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { http } from "@/configs/http.comfig"

interface OverviewStats {
  totalUsers: number
  activeUsers: number
  totalActivities: number
  totalOrganizations: number
  totalRegistrations: number
}

function StatCard({
  label,
  value,
  footer,
  trend,
}: {
  label: string
  value: number | string
  footer: string
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {trend && (
          <CardAction>
            <Badge variant="outline">
              {trend === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
          {footer}
        </div>
      </CardFooter>
    </Card>
  )
}

export function SectionCards() {
  const [stats, setStats] = useState<OverviewStats | null>(null)

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/stats/overview`
    http.get<{ success: boolean; data: OverviewStats }>(url)
      .then((res) => {
        if (res?.data) setStats(res.data)
      })
      .catch(() => {})
  }, [])

  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <CardDescription className="h-4 w-32 bg-muted rounded" />
              <CardTitle className="h-8 w-16 bg-muted rounded mt-2" />
            </CardHeader>
            <CardFooter>
              <div className="h-4 w-40 bg-muted rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  const inactiveUsers = stats.totalUsers - stats.activeUsers

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <StatCard
        label="Tổng số người dùng"
        value={stats.totalUsers.toLocaleString("vi-VN")}
        footer={`${stats.activeUsers.toLocaleString("vi-VN")} đang hoạt động • ${inactiveUsers} không hoạt động`}
        trend="up"
      />
      <StatCard
        label="Tổng số hoạt động"
        value={stats.totalActivities.toLocaleString("vi-VN")}
        footer="Cuộc thi, chương trình, tuyển thành viên"
        trend="up"
      />
      <StatCard
        label="Tổng số đăng ký"
        value={stats.totalRegistrations.toLocaleString("vi-VN")}
        footer="Tổng lượt đăng ký tất cả hoạt động"
        trend="up"
      />
      <StatCard
        label="Số tổ chức / CLB"
        value={stats.totalOrganizations.toLocaleString("vi-VN")}
        footer="Câu lạc bộ và tổ chức đang hoạt động"
        trend="up"
      />
    </div>
  )
}
