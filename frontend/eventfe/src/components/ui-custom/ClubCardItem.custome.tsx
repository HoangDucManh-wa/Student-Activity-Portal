import Image from "next/image";
import Link from "next/link";

export function ClubCardItem() {


  return (
    <>
      <Link href="/club/abc" className="flex items-center gap-[20px]">
        <Image
          src="/logo-club.jpg"
          alt="logo"
          width={130}
          height={130}
          className="w-[100px] h-[100px]"
        />
        <div className="">
          <h2 className="text-[18px] font-bold">FJC - CLB Luật gia tương lai</h2>
        </div>
      </Link>
    </>
  )
}