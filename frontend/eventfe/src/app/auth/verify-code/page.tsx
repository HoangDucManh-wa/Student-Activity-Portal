import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import BackButton from "@/components/ui-custom/back.ui.custom"
import { VerifyCodeForm } from "./verifyCodeForm"
// import { InputOTPFourDigits } from "./verifyCodeForm"

export default function ForgotPassword() {

  return (
    <Card className="w-full sm:max-w-md mx-auto mt-[50px]">
      <CardHeader>
        <BackButton className="mb-[30px] w-[50px] h-[50px] rounded-full bg-[#ECECEC] flex items-center justify-center" />
        <CardTitle className="mb-[20px]">
          Check you email
        </CardTitle>
        <CardDescription className="text-[#989898]">
          We sent a reset link to alpha...@gmail.com enter 5 digit code that mentioned in the email
        </CardDescription>
      </CardHeader>
      <VerifyCodeForm/>
    </Card>
  )
}
