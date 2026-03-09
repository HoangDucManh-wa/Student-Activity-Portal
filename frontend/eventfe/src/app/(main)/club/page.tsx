import { ClubCardItem } from "@/components/ui-custom/ClubCardItem.custome";
import { PaginationCustom } from "@/components/ui-custom/pagination.custom";


export default function ClubPage() {

  return (
    <div className="py-[40px]">
      <h1 className="text-center text-[24px] text-[#1A73E8] font-bold mb-[20px]">TẤT CẢ CÂU LẠC BỘ</h1>
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
  )
}