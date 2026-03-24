import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { OrgForgotPasswordForm } from "./orgForgotPasswordForm"
import BackButton from "@/components/ui-custom/back.ui.custom"

export default function OrgForgotPassword() {
  return (
    <Card className="w-full sm:max-w-md mx-auto mt-[50px]">
      <CardHeader>
        <BackButton className="mb-[30px] w-[50px] h-[50px] rounded-full bg-[#ECECEC] flex items-center justify-center cursor-pointer"/>
        <CardTitle className="mb-[20px]">
          Quên mật khẩu tổ chức / CLB
        </CardTitle>
        <CardDescription className="text-[#989898]">
          Vui lòng nhập email tổ chức để đặt lại mật khẩu
        </CardDescription>
      </CardHeader>
      <OrgForgotPasswordForm/>
    </Card>
  )
}
