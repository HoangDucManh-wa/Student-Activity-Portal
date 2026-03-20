"use client"
import { useAutoRefresh } from "@/hooks/useAutoRefresh"

export function AuthRefreshProvider({ children }: { children: React.ReactNode }) {
  useAutoRefresh()
  return <>{children}</>
}
