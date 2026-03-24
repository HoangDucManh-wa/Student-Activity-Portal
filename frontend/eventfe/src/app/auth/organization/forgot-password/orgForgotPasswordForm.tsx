"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { http } from "@/configs/http.comfig"
import { toast } from "sonner"

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
})

export function OrgForgotPasswordForm() {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const res = await http.post(`/api/auth/forgot-password/organization`, { email: data.email }) as any
    if (!res?.success) {
      toast.error(res?.message || "Có lỗi xảy ra")
      return
    }
    toast.success("Email khôi phục mật khẩu đã được gửi")
    router.push(`/auth/forgot-password/sent`)
  }

  return (
    <>
      <CardContent>
        <form id="form-org-forgot-password" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-org-forgot-password-email">
                    Email tổ chức / CLB
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-org-forgot-password-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="org@example.com"
                    autoComplete="on"
                    className="h-[46px]"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="form-org-forgot-password" className="bg-[#4E55D7] w-full hover:bg-[#4E55D7]">
            Đặt lại mật khẩu
          </Button>
        </Field>
      </CardFooter>
    </>
  )
}
