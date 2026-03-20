"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ClubCardItem } from "@/components/ui-custom/ClubCardItem.custome"
import { PaginationCustom } from "@/components/ui-custom/pagination.custom"
import { getOrganizations } from "@/services/organization.service"

export default function ClubPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["organizations-clubs-page", page],
    queryFn: () => getOrganizations({ page, limit: 10, type: "club" }),
  })

  const clubs = data?.data?.data ?? []
  const meta = data?.data?.meta

  return (
    <div className="py-[40px]">
      <h1 className="text-center text-[24px] text-[#1A73E8] font-bold mb-[20px]">TẤT CẢ CÂU LẠC BỘ</h1>
      <div className="grid grid-cols-2 justify-items-center gap-y-[20px] mb-[30px]">
        {isLoading && (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-5">
              <div className="w-[100px] h-[100px] rounded-full bg-gray-100 animate-pulse" />
              <div className="space-y-2">
                <div className="w-40 h-4 bg-gray-100 animate-pulse rounded" />
                <div className="w-32 h-3 bg-gray-100 animate-pulse rounded" />
              </div>
            </div>
          ))
        )}
        {!isLoading && clubs.map((org) => (
          <ClubCardItem key={org.organizationId} organization={org} />
        ))}
        {!isLoading && clubs.length === 0 && (
          <div className="col-span-2 text-center py-10 text-gray-500">Chưa có câu lạc bộ nào.</div>
        )}
      </div>
      <PaginationCustom
        page={page}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  )
}
