import { BannerCustom } from "@/components/ui-custom/banner.custom";
import { DialogCustom } from "@/components/ui-custom/dialog.custom";
import { EventCustome } from "@/components/ui-custom/event.custom";
import { EventCard } from "@/components/ui-custom/EventCard";
import { PaginationCustom } from "@/components/ui-custom/pagination.custom";
import Link from "next/link";

export default function EventPage() {

  return (
    <>
      <div className="pb-[20px]">
        <BannerCustom className="mb-[30px] p-[10px] ">
          <Link href='/' className="">
            Trang chủ
          </Link>
        </BannerCustom>
        <EventCustome/>
      </div>
    </>
  )
}