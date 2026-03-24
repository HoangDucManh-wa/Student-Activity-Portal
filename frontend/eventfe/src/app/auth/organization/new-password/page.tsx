import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import OrgNewPasswordForm from "./orgNewPasswordForm"

export default function OrgNewPasswordPage() {
  return (
    <Card className="w-full sm:max-w-md mx-auto mt-[50px]">
      <CardHeader>
        <CardTitle>Đặt mật khẩu mới cho tổ chức</CardTitle>
        <CardDescription>
          Tạo mật khẩu mới cho tài khoản tổ chức / CLB
        </CardDescription>
      </CardHeader>
      <OrgNewPasswordForm />
    </Card>
  )
}
