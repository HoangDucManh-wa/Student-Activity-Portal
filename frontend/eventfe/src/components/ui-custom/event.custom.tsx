import { DialogCustom } from "@/components/ui-custom/dialog.custom";
import { EventCard } from "@/components/ui-custom/EventCard";
import { PaginationCustom } from "@/components/ui-custom/pagination.custom";
import Link from "next/link";

export function EventCustome({
  className,
  isFilter=true
}: {
  className?: string;
  isFilter?: boolean
}) {

  return (
    <>
      {
        isFilter &&
        <DialogCustom className="mb-[20px] ml-[30px]" />
      }
      <div className="grid grid-cols-4 gap-y-8 px-4 mb-[30px]">
        <Link href='/event/abc'>
          <EventCard />
        </Link>
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
      </div>
      <PaginationCustom />
    </>
  )
}