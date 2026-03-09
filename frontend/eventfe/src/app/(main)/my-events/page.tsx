import { BannerCustom } from "@/components/ui-custom/banner.custom"
import { DialogCustom } from "@/components/ui-custom/dialog.custom"
import { EventCard } from "@/components/ui-custom/EventCard"
import { PaginationCustom } from "@/components/ui-custom/pagination.custom"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export default function MyEventsPage() {

  return (
    <>
      <div className="pb-[20px]">
        <BannerCustom className="mb-[30px] p-[10px]">
          <Link href='/' className="">
            Trang chủ
          </Link>
          <ChevronRight className="inline-block size-[18px]" />
          <Link href='/my-events' className="">
            Sự kiện của tôi
          </Link>
        </BannerCustom>
        <DialogCustom className="mb-[20px] ml-[30px]" />
        <div className="grid grid-cols-4 gap-y-8 px-4 mb-[30px]">
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
        </div>
        <PaginationCustom />
      </div>
    </>
  )
}