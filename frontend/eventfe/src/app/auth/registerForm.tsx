"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
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
import { PasswordInput } from "@/components/ui-custom/password-input"
import { SelectCustom } from "@/components/ui-custom/select.ui.custom"
import { http } from "@/configs/http.comfig"
import { envConfig } from "@/configs/env.config"
import { toastError, toastSuccess } from "@/lib/toast"
import { useUniversity } from "@/hooks/useUniversity.hook"

const formSchema = z.object({
  name: z.string(),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại phải có 10 chữ số"),
  password: z.string().min(8, "Không đủ 8 kí tự"),
  university: z.string(),
})

export function RegisterForm() {

  const { data } = useUniversity({ size: -1 })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      university: "",
    },
  })


  async function onSubmit(datavalue: z.infer<typeof formSchema>) {
    try {
      const res: any = await http.post(`${envConfig.NEXT_PUBLIC_API_URL}/auth/register`, datavalue)

      if (res.code !== 200) {
        toastError(res.message)
        return
      }
      toastSuccess(res.message)
    } catch (error) {
      const toastId = toast.error(`Lỗi`, {
        duration: 1500,
        action: {
          label: "X",
          onClick: () => {
            toast.dismiss(toastId)
          }
        }
      })
    }
  }

  return (
    <>
      <CardContent>
        <form id="form-register" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-[11px]">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-register-name">
                    Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-register-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ava Wright"
                    autoComplete="on"
                    className="h-[46px]"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-register-email">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-register-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="ava.wright@gmail.com"
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
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-register-phone">
                    Phone
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-register-phone"
                    aria-invalid={fieldState.invalid}
                    placeholder="0xxxxxxxxx"
                    autoComplete="on"
                    type="tel"
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
                  <FieldLabel htmlFor="form-register-password">
                    Password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="form-register-password"
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
            <Controller
              name="university"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-register-university">
                    University
                  </FieldLabel>
                  <SelectCustom
                    value={field.value}
                    onChange={field.onChange}
                    data={data?.data || []}
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
        <Field orientation="horizontal" className="flex flex-col mt-[20px]">
          <Button type="submit" form="form-register" className="w-[130px] h-[40px] bg-[#056382] hover:bg-[#056382] cursor-pointer">
            Sign up
          </Button>
          <Button
            type="submit"
            form="form-register"
            className="w-[327px] h-[48px] bg-white border border-[#EFF0F6] text-black shadow-[inset_0px_-3px_6px_0px_#F4F5FA99] hover:bg-white cursor-pointer"
          >
            Sign up with Google
          </Button>
        </Field>
      </CardFooter>
    </>
  )
}
