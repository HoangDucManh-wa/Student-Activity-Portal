"use client"

import { useState } from "react"
import Image from "next/image"

type Club = {
  id: number
  name: string
  logo: string
}

export default function HistoryClubPage() {
  const [tab, setTab] = useState<"joined" | "applied">("joined")
  const [page, setPage] = useState(1)

  // sau này thay bằng API
  const joinedClubs: Club[] = [
    { id: 1, name: "CLB Công nghệ", logo: "/team-building.jpg" },
    { id: 2, name: "CLB Marketing", logo: "/team-building.jpg" },
  ]

  const appliedClubs: Club[] = [
    { id: 3, name: "CLB AI", logo: "/team-building.jpg" },
    { id: 4, name: "CLB Thiết kế", logo: "/team-building.jpg" },
  ]

  const data = tab === "joined" ? joinedClubs : appliedClubs

  return (
    <div className="p-6">

      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 p-1 rounded-xl gap-2">
          <button
            onClick={() => setTab("joined")}
            className={`px-4 py-2 rounded-lg text-sm ${
              tab === "joined" ? "bg-white shadow" : "text-gray-500"
            }`}
          >
            CLB đã tham gia
          </button>

          <button
            onClick={() => setTab("applied")}
            className={`px-4 py-2 rounded-lg text-sm ${
              tab === "applied" ? "bg-white shadow" : "text-gray-500"
            }`}
          >
            CLB đã nộp đơn
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {data.length === 0 && (
          <div className="text-center text-gray-500">
            Không có dữ liệu
          </div>
        )}

        {data.map((club) => (
          <div
            key={club.id}
            className="flex items-center gap-4 p-4 border rounded-lg hover:shadow"
          >
            <div className="w-[80px] h-[80px] relative">
              <Image
                src={club.logo}
                alt={club.name}
                fill
                className="object-cover rounded-md"
              />
            </div>

            <div className="text-lg font-medium">
              {club.name}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded"
        >
          Trước
        </button>

        <span className="font-medium">{page}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded"
        >
          Sau
        </button>
      </div>
    </div>
  )
}