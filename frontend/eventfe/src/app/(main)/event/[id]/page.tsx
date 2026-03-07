import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function DetailEventPage() {
  return (
    <div className="">
      <div className="relative h-[300px] mb-[30px]">
        <Image
          src="/team-building.jpg"
          alt="team-building"
          fill
          priority
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="flex mx-[150px] gap-[20px] mb-[30px]">
        <div
          className="border-[2px] w-[400px] bg-white rounded-xl p-6"
          style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
        >
          <div>Thông tin chính</div>
          <div>Thời gian:</div>
          <div>Địa điểm:</div>
          <div>Số lượng còn lại:</div>
        </div>
        <div
          className="border-[2px] flex-1 h-[212px] p-6 rounded-[20px]"
          style={{ boxShadow: "0px 4px 4px 0px #00000040" }}>
          <div>TÊN SỰ KIỆN</div>
          <div>ĐƠN VỊ TỔ CHỨC</div>
          <div>MÔ TẢ CHI TIẾT</div>
        </div>
      </div>
      <div className="text-center">
        <Link href='/event/competition' className="bg-[#05566B] w-[200px] h-[50px] flex items-center justify-center rounded-[20px] mx-auto text-white" >Đăng kí ngay</Link>
      </div>
    </div>
  );
}