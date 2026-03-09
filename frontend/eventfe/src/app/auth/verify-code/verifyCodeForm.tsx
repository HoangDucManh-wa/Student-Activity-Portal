

"use client"

import * as React from "react"
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"

const formSchema = z.object({
  otp: z.string().min(6, "Không đủ 6 kí tự"),
})

export function VerifyCodeForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
  }

  return (
    <>
      <CardContent>
        <form id="form-verify" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-[11px]">
            <Controller
              name="otp"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="text-center">
                  <InputOTP
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="form-verify-otp"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                  >
                    <InputOTPGroup className="mx-auto">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent >
      <CardFooter>
        <Field orientation="horizontal" className="flex flex-col">
          <Button type="submit" form="form-verify" className="w-[130px] h-[40px] bg-[#4E55D7] hover:bg-[#4E55D7] cursor-pointer">
            Verify Code
          </Button>
          <span className="text-[14px] text-[#2A2A2A]">Haven’t got the email yet? Resend email</span>
        </Field>
      </CardFooter>
    </>
  )
}
