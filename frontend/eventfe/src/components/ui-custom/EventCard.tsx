import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Image from "next/image"

export function EventCard() {
  return (
    <Card className="relative mx-auto w-[350px] max-w-sm pt-0 h-[400px] rounded-t-[10px] duration-300 hover:scale-105">
      <div className="relative">
        <Image
          src='/hinh-nen-may-tinh-anime.jpg'
          alt="Event"
          width={1080}
          height={1080}
          className="w-full h-[200px] rounded-t-[10px] object-cover"
        />
        <Badge
          variant="secondary"
          className="absolute bottom-[-10px] left-0 bg-[red] rounded-tl-[0px] rounded-bl-[0px]"
        >
          học thuật
        </Badge>
      </div>
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">Còn chỗ</Badge>
        </CardAction>
        <CardTitle>Design systems meetup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-[15px] text-gray-800">thời gian bắt đầu:</div>
        <div className="text-[15px] text-gray-800">thời gian kết thúc:</div>
        <div className="text-[15px] text-gray-800">thời gian hạn đăng kí:</div>
      </CardContent>
      <CardFooter>
        <div>Số người đăng kí</div>
      </CardFooter>
    </Card>
  )
}
