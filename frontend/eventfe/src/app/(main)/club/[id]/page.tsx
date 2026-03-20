"use client"

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SafeImage } from "@/components/ui-custom/SafeImage";
import { getOrganizationById } from "@/services/organization.service";

export default function DetailClubPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["organization", id],
    queryFn: () => getOrganizationById(id),
    enabled: !!id,
  });

  const org = data?.data;

  return (
    <div>
      <div className="relative h-[300px] mb-[35px]">
        <SafeImage
          src={org?.coverImageUrl ?? "/team-building.jpg"}
          alt={org?.organizationName ?? "cover"}
          fill
          priority
          fallbackSrc="/team-building.jpg"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="flex justify-around">
        <SafeImage
          src={org?.coverImageUrl ?? "/team-building.jpg"}
          alt="cover"
          width={1200}
          height={400}
          fallbackSrc="/team-building.jpg"
          className="w-[510px] h-[288] rounded-[29px]"
        />
        <div className="flex flex-col items-center gap-[15px]">
          <SafeImage
            src={org?.logoUrl ?? "/logo-club.jpg"}
            alt="logo-club"
            width={150}
            height={150}
            fallbackSrc="/logo-club.jpg"
            className="rounded-full"
          />
          <div className="text-[#1A73E8] text-[28px] font-bold">
            {isLoading ? "Đang tải..." : org?.organizationName ?? "—"}
          </div>
        </div>
        <SafeImage
          src={org?.coverImageUrl ?? "/team-building.jpg"}
          alt="cover"
          width={1200}
          height={400}
          fallbackSrc="/team-building.jpg"
          className="w-[510px] h-[288] rounded-[29px]"
        />
      </div>

      <div className="flex items-center w-full my-10">
        <div className="flex-1 h-[3px] bg-[#08667a]"></div>
        <div className="px-0">
          <span className="bg-[#08667a] text-white px-8 py-2 rounded-full font-bold text-[16px] whitespace-nowrap uppercase tracking-wider">
            Giới thiệu
          </span>
        </div>
        <div className="flex-1 h-[3px] bg-[#08667a]"></div>
      </div>

      <div className="mx-[20px] rounded-[20px] border-[3px] border-[#1A73E8] p-[20px] min-h-[200px]">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ) : (
          <p className="whitespace-pre-line">{org?.description ?? "Chưa có mô tả."}</p>
        )}
      </div>

      <div className="flex items-center w-full my-10">
        <div className="flex-1 h-[3px] bg-[#08667a]"></div>
        <div className="px-0">
          <span className="bg-[#08667a] text-white px-8 py-2 rounded-full font-bold text-[16px] whitespace-nowrap uppercase tracking-wider">
            Liên hệ
          </span>
        </div>
        <div className="flex-1 h-[3px] bg-[#08667a]"></div>
      </div>

      <div className="mx-[20px] rounded-[12px] border-[3px] border-[#1A73E8] p-[20px] h-[200px] mb-[30px] space-y-[15px]">
        <div className="text-[16px] font-bold">Tiktok: </div>
        <div className="text-[16px] font-bold">Email: </div>
        <div className="text-[16px] font-bold">Facebook: </div>
        <div className="text-[16px] font-bold">Số điện thoại: </div>
      </div>

      <h1 className="mb-[30px] text-[24px] font-bold text-center text-[#1A73E8]">
        CÂU LẠC BỘ HIỆN KHÔNG MỞ ĐƠN TUYỂN THÀNH VIÊN!
      </h1>

      <div className="flex justify-center mt-4">
        <Link
          href={`/club/${id}/member`}
          className="mt-2 bg-[#08667a] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#06505f] transition"
        >
          Xem thành viên
        </Link>
      </div>
    </div>
  );
}
