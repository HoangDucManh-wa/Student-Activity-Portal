"use client"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

const REFRESH_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

export function useAutoRefresh() {
  const router = useRouter()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const doRefresh = async () => {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) return

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (!res.ok) {
        localStorage.removeItem("refreshToken")
        router.push("/auth")
      }
    } catch {
      localStorage.removeItem("refreshToken")
      router.push("/auth")
    }
  }

  useEffect(() => {
    intervalRef.current = setInterval(doRefresh, REFRESH_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])
}
