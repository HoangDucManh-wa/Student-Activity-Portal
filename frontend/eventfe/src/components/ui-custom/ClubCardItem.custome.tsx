import Link from "next/link";
import { SafeImage } from "@/components/ui-custom/SafeImage";
import type { Organization } from "@/services/organization.service";

interface ClubCardItemProps {
  organization: Organization
}

export function ClubCardItem({ organization }: ClubCardItemProps) {
  return (
    <Link
      href={`/club/${organization.organizationId}`}
      className="flex items-center gap-[20px] w-[480px]"
    >
      <SafeImage
        src={organization.logoUrl ?? "/logo-club.jpg"}
        alt={organization.organizationName}
        width={130}
        height={130}
        fallbackSrc="/logo-club.jpg"
        className="w-[100px] h-[100px] flex-shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0">
        <h2 className="text-[18px] font-bold line-clamp-2">{organization.organizationName}</h2>
        {organization.description && (
          <p className="text-[13px] text-gray-500 line-clamp-2 mt-1">{organization.description}</p>
        )}
      </div>
    </Link>
  )
}
