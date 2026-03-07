"use client"
import { SlideCustome } from "@/components/ui-custom/slide.custom"
import { EventCustome } from "@/components/ui-custom/event.custom"
import { ClubCardItem } from "@/components/ui-custom/ClubCardItem.custome"
import { PaginationCustom } from "@/components/ui-custom/pagination.custom"

export default function Home() {
  return (
    <div className="space-y-[30px]">
      <SlideCustome />
      <div >
        <h1 className="text-[#05566B] text-center mb-[30px] text-[28px] font-bold">SỰ KIỆN SẮP DIỄN RA</h1>
        <EventCustome isFilter={false} />
      </div>
      <div>
        <h1 className="text-[#05566B] text-center mb-[30px] text-[28px] font-bold">TUYỂN THÀNH VIÊN</h1>
        <div className="grid grid-cols-2 justify-items-center gap-y-[20px] mb-[30px]">
          <ClubCardItem />
          <ClubCardItem />
          <ClubCardItem />
          <ClubCardItem />
          <ClubCardItem />
          <ClubCardItem />
          <ClubCardItem />
          <ClubCardItem />
          <ClubCardItem />
          <ClubCardItem />
        </div>
        <PaginationCustom />
      </div>
    </div>
  )
}