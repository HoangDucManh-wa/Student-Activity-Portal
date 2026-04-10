"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui-custom/password-input"
import { http } from "@/configs/http.comfig"
import { envConfig } from "@/configs/env.config"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
})

export function OrgLoginForm() {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const res = await http.post(`/api/auth/login/organization`, data) as any

    if (!res?.success) {
      toast.error(typeof res?.error === "string" ? res.error : "Đăng nhập thất bại")
      return
    }

    toast.success("Đăng nhập thành công")
    router.push("/organization")
  }

  return (
    <>
      <CardContent>
        <form id="form-login-org" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-[11px]">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-login-org-email">
                    Email tổ chức / CLB
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-login-org-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="org@example.com"
                    autoComplete="on"
                    type="email"
                    className="h-[46px]"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-login-org-password">
                    Mật khẩu
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="form-login-org-password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
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
        <Field orientation="horizontal" className="flex-col gap-2 w-full">
          <Button
            type="submit"
            form="form-login-org"
            className="w-full h-[40px] bg-[#056382] hover:bg-[#056382] cursor-pointer"
          >
            Đăng nhập
          </Button>
        </Field>
      </CardFooter>
    </>
  )
}
