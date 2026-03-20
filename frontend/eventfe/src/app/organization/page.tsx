"use client"

import { useQuery } from "@tanstack/react-query"
import { Activity, Users, GraduationCap } from "lucide-react"
import Link from "next/link"
import { getMyOrganization, getOrgStats } from "@/services/organization.service"
import { getActivities } from "@/services/activity.service"
import type { Activity as ActivityType } from "@/services/activity.service"

function StatsCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  loading?: boolean
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function OrganizationDashboard() {
  const { data: orgData } = useQuery({
    queryKey: ["my-organization"],
    queryFn: () => getMyOrganization(),
  })

  const org = orgData?.data

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["org-stats", org?.organizationId],
    queryFn: () => getOrgStats(org!.organizationId),
    enabled: !!org?.organizationId,
  })

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ["org-activities", org?.organizationId],
    queryFn: () => getActivities({ organizationId: org!.organizationId, limit: 4, page: 1 }),
    enabled: !!org?.organizationId,
  })

  const stats = statsData?.data
  const activities: ActivityType[] = activitiesData?.data?.data ?? []

  return (
    <div className="px-[180px] py-10 bg-gray-100 min-h-screen">
      <h1 className="text-center text-[#0E5C63] font-bold text-xl mb-10">
        THỐNG KÊ — {org?.organizationName ?? "..."}
      </h1>

      <div className="grid grid-cols-3 gap-10 mb-10">
        <StatsCard
          title="Sự kiện đang hoạt động"
          value={stats?.activeActivities ?? 0}
          icon={<Activity className="w-5 h-5 text-green-500" />}
          loading={statsLoading}
        />
        <StatsCard
          title="Tổng lượt đăng ký"
          value={stats?.totalRegistrations ?? 0}
          icon={<Users className="w-5 h-5 text-purple-500" />}
          loading={statsLoading}
        />
        <StatsCard
          title="Thành viên mới tháng này"
          value={stats?.newMembers ?? 0}
          icon={<GraduationCap className="w-5 h-5 text-yellow-500" />}
          loading={statsLoading}
        />
      </div>

      <div className="bg-white rounded-xl p-6">
        <p className="text-center text-gray-600 mb-6 font-medium">Sự kiện gần đây</p>

        {activitiesLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {activities.map(a => (
              <div key={a.activityId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <p className="font-semibold text-sm line-clamp-2">{a.activityName}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {a.startTime ? new Date(a.startTime).toLocaleDateString("vi-VN") : "Chưa có thời gian"}
                </p>
                <span className="inline-block mt-2 text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                  {a.activityType ?? a.activityStatus}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">Chưa có sự kiện nào</p>
        )}

        <div className="flex justify-end mt-6">
          <Link href="/organization/event" className="bg-[#0E5C63] text-white px-4 py-2 rounded-md text-sm">
            Xem tất cả
          </Link>
        </div>
      </div>
    </div>
  )
}
