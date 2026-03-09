import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
} from "@/components/ui/card"
import Image from "next/image"
import { ProfileForm } from "./ProfileForm"
import { BannerCustom } from "@/components/ui-custom/banner.custom"
import { ChevronRight, Link } from "lucide-react"


export default function ProfilePage() {

  return (
    <Card className="w-full px-[30px] mt-[20px]">
      <CardHeader>
        <div className="">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-[10px]">
              <Image
                src="/hinh-nen-may-tinh-anime.jpg"
                alt="Profile"
                width={1080}
                height={1080}
                className="w-[100px] h-[100px] rounded-full object-cover"
              />
              <div>
                <h2>Đinh Thành Long</h2>
                <div>longabcd123@gmail.com</div>
              </div>
            </div>
            <Button className="cursor-pointer">Edit</Button>
          </div>
        </div>
      </CardHeader>
      <ProfileForm />
    </Card>
  )
}



