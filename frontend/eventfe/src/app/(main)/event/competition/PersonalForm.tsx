"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
})

type FormValues = z.infer<typeof formSchema>

// Mock lookup — thay bằng API call thực tế
const lookupMember = (email: string) => {
  if (email === "26a4041684@hvnh.edu.vn") {
    return { name: "Đào Thị Huyền", phone: "02342432534", role: "Thành viên" }
  }
  return null
}

export function PersonalForm() {
  const [member, setMember] = React.useState<ReturnType<typeof lookupMember>>(null)
  const [searched, setSearched] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  })

  const email = form.watch("email")

  const handleLookup = () => {
    const result = lookupMember(email)
    setMember(result)
    setSearched(true)
    if (!result) {
      form.setError("email", { message: "Không tìm thấy thành viên với email này" })
    } else {
      form.clearErrors("email")
    }
  }

  function onSubmit(data: FormValues) {
    if (!member) return
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[#1a6b74] text-center text-xl">
          Đăng kí cá nhân
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-6 rounded-lg bg-muted/50 p-4 space-y-1 text-sm text-muted-foreground border">
          <p className="font-semibold text-foreground">Cuộc thi Lập trình 2025</p>
          <p>🗓 15/04/2025 — 08:00</p>
          <p>📍 Hội trường A, Học viện Ngân hàng</p>
          <p>👤 Hình thức: Cá nhân</p>
        </div>

        <form id="personal-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="personal-email">
                    Email thành viên
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      id="personal-email"
                      aria-invalid={fieldState.invalid}
                      placeholder="VD: 26a4041684@hvnh.edu.vn"
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLookup}
                    >
                      Tìm
                    </Button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {/* Kết quả tìm kiếm */}
          {searched && member && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#1a6b74]/30 bg-[#1a6b74]/5 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a6b74] text-white font-semibold text-sm">
                {member.name.split(" ").slice(-1)[0][0]}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-muted-foreground">{member.phone} · {member.role}</p>
              </div>
              <div className="ml-auto text-[#1a6b74]">
                ✓
              </div>
            </div>
          )}

          {searched && !member && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              Không tìm thấy thành viên. Vui lòng kiểm tra lại email.
            </div>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          type="submit"
          form="personal-form"
          disabled={!member}
          className="bg-[#1a6b74] hover:bg-[#155a62] text-white"
        >
          Xác nhận đăng ký
        </Button>
      </CardFooter>
    </Card>
  )
}