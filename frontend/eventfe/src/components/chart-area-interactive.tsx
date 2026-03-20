"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { http } from "@/configs/http.comfig"

interface MonthlyReg {
  month: string
  total: number
}

interface ActivityStats {
  byStatus: { status: string; count: number }[]
  byType: { type: string; count: number }[]
}

const trendConfig = {
  total: { label: "Đăng ký", color: "var(--primary)" },
} satisfies ChartConfig

const typeConfig = {
  count: { label: "Số hoạt động", color: "var(--primary)" },
} satisfies ChartConfig

const TYPE_LABELS: Record<string, string> = {
  competition: "Cuộc thi",
  program: "Chương trình",
  recruitment: "Tuyển thành viên",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  published: "Đã đăng",
  running: "Đang diễn ra",
  finished: "Đã kết thúc",
  cancelled: "Đã hủy",
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-")
  return `T${month}/${year}`
}

export function ChartAreaInteractive() {
  const [months, setMonths] = React.useState("6")
  const [trend, setTrend] = React.useState<MonthlyReg[]>([])
  const [actStats, setActStats] = React.useState<ActivityStats | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL
    setLoading(true)
    Promise.all([
      http.get<{ success: boolean; data: MonthlyReg[] }>(
        `${base}/admin/stats/registrations?months=${months}`
      ),
      http.get<{ success: boolean; data: ActivityStats }>(
        `${base}/admin/stats/activities`
      ),
    ])
      .then(([regRes, actRes]) => {
        if (regRes?.data) setTrend(regRes.data)
        if (actRes?.data) setActStats(actRes.data)
      })
      .finally(() => setLoading(false))
  }, [months])

  const typeData = (actStats?.byType ?? []).map((t) => ({
    name: TYPE_LABELS[t.type] ?? t.type,
    count: t.count,
  }))

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
      {/* ── Trend chart ── */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Lượt đăng ký theo tháng</CardTitle>
          <CardDescription>Tổng số đăng ký hoạt động</CardDescription>
          <CardAction>
            <Select value={months} onValueChange={setMonths}>
              <SelectTrigger className="w-36" size="sm" aria-label="Chọn khoảng">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="3" className="rounded-lg">3 tháng gần đây</SelectItem>
                <SelectItem value="6" className="rounded-lg">6 tháng gần đây</SelectItem>
                <SelectItem value="12" className="rounded-lg">12 tháng gần đây</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {loading ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Đang tải...
            </div>
          ) : trend.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu
            </div>
          ) : (
            <ChartContainer config={trendConfig} className="aspect-auto h-[250px] w-full">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="fillReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatMonth}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(v) => formatMonth(v)}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="total"
                  type="monotone"
                  fill="url(#fillReg)"
                  stroke="var(--primary)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Activity type breakdown ── */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Phân loại hoạt động</CardTitle>
          <CardDescription>Số hoạt động theo từng loại</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {loading ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Đang tải...
            </div>
          ) : typeData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu
            </div>
          ) : (
            <ChartContainer config={typeConfig} className="aspect-auto h-[250px] w-full">
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
