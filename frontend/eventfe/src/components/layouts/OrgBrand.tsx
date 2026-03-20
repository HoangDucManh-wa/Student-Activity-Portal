"use client"

import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import { getMyOrganization } from "@/services/organization.service"

export function OrgBrand() {
  const { data } = useQuery({
    queryKey: ["my-organization"],
    queryFn: () => getMyOrganization(),
    staleTime: 5 * 60 * 1000,
  })

  const org = data?.data

  return (
    <Link href="/organization" className="ml-[180px] mr-[50px] flex items-center gap-3">
      {org?.logoUrl ? (
        <img
          src={org.logoUrl}
          alt={org.organizationName}
          className="w-[48px] h-[48px] rounded-full object-cover border-2 border-white/30"
        />
      ) : (
        <Image width={48} height={48} alt="Logo" src="/logoheader.png" />
      )}
      {org?.organizationName && (
        <span className="text-white font-bold text-sm leading-tight max-w-[140px] line-clamp-2">
          {org.organizationName}
        </span>
      )}
    </Link>
  )
}
