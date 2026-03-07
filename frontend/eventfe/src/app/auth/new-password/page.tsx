import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import NewPasswordForm from "./newPasswordForm"


export default function NewPasswordPage() {

  return (
    <Card className="w-full sm:max-w-md mx-auto mt-[50px]">
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>
          Create a new password. Ensure it differs from
          previous ones for security
        </CardDescription>
      </CardHeader>
      <NewPasswordForm />
    </Card>
  )
}
