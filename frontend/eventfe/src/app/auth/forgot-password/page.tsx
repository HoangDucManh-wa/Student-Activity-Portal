import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ForgotPasswordForm } from "./forgotPasswordForm"
import BackButton from "@/components/ui-custom/back.ui.custom"

export default function ForgotPassword() {

  return (
    <Card className="w-full sm:max-w-md mx-auto mt-[50px]">
      <CardHeader>
        <BackButton className="mb-[30px] w-[50px] h-[50px] rounded-full bg-[#ECECEC] flex items-center justify-center cursor-pointer"/>
        <CardTitle className="mb-[20px]">
          Forgot password
        </CardTitle>
        <CardDescription className="text-[#989898]">
          Please enter your email to reset the password
        </CardDescription>
      </CardHeader>
      <ForgotPasswordForm/>
    </Card>
  )
}
