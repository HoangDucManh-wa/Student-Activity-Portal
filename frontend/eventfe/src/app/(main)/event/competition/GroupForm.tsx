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

const MAX_MEMBERS = 5

const memberSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
})

const formSchema = z.object({
  members: z.array(memberSchema).min(1),
})

type FormValues = z.infer<typeof formSchema>

type Member = {
  name: string
  phone: string
  role: string
}

// Mock lookup — thay bằng API call thực tế
const lookupMember = (email: string): Member | null => {
  const db: Record<string, Member> = {
    "26a4041684@hvnh.edu.vn": { name: "Đào Thị Huyền", phone: "02342432534", role: "Thành viên" },
    "26a4041685@hvnh.edu.vn": { name: "Nguyễn Văn An", phone: "09812345678", role: "Thành viên" },
    "26a4041686@hvnh.edu.vn": { name: "Trần Thị Bình", phone: "09876543210", role: "Thành viên" },
  }
  return db[email] ?? null
}

type MemberSlot = {
  email: string
  info: Member | null
  searched: boolean
  isLeader: boolean
}

export function GroupForm() {
  const [slots, setSlots] = React.useState<MemberSlot[]>([
    { email: "", info: null, searched: false, isLeader: true },
  ])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { members: [{ email: "" }] },
  })

  const updateSlotEmail = (index: number, email: string) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, email, info: null, searched: false } : s))
    )
    form.setValue(`members.${index}.email`, email)
  }

  const handleLookup = (index: number) => {
    const email = slots[index].email
    const result = lookupMember(email)
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, info: result, searched: true } : s))
    )
    if (!result) {
      form.setError(`members.${index}.email`, { message: "Không tìm thấy thành viên" })
    } else {
      form.clearErrors(`members.${index}.email`)
    }
  }

  const addSlot = () => {
    if (slots.length >= MAX_MEMBERS) return
    setSlots((prev) => [...prev, { email: "", info: null, searched: false, isLeader: false }])
    form.setValue(`members.${slots.length}`, { email: "" })
  }

  const removeSlot = (index: number) => {
    if (index === 0) return
    setSlots((prev) => prev.filter((_, i) => i !== index))
  }

  const allLeaderFound = slots[0]?.info !== null
  const validCount = slots.filter((s) => s.info !== null).length

  function onSubmit(data: FormValues) {
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[#1a6b74] text-center text-xl">
          Đăng kí nhóm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 rounded-lg bg-muted/50 p-4 space-y-1 text-sm text-muted-foreground border">
          <p className="font-semibold text-foreground">Cuộc thi Lập trình 2025</p>
          <p>🗓 15/04/2025 — 08:00</p>
          <p>📍 Hội trường A, Học viện Ngân hàng</p>
          <p>👥 Hình thức: Nhóm (tối đa {MAX_MEMBERS} người)</p>
        </div>

        <form id="group-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            {slots.map((slot, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${slot.isLeader
                    ? "bg-[#1a6b74] text-white"
                    : "bg-muted text-muted-foreground"
                    }`}>
                    {slot.isLeader ? "Trưởng nhóm" : `Thành viên ${index}`}
                  </span>
                  {!slot.isLeader && (
                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                <Controller
                  name={`members.${index}.email`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`email-${index}`}>
                        Email thành viên
                      </FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          {...field}
                          id={`email-${index}`}
                          value={slot.email}
                          onChange={(e) => updateSlotEmail(index, e.target.value)}
                          placeholder="VD: 26a4041684@hvnh.edu.vn"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleLookup(index)}
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

                {/* Kết quả tìm kiếm */}
                {slot.searched && slot.info && (
                  <div className="flex items-center gap-3 rounded-lg border border-[#1a6b74]/30 bg-[#1a6b74]/5 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a6b74] text-white font-semibold text-sm">
                      {slot.info.name.split(" ").slice(-1)[0][0]}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">{slot.info.name}</p>
                      <p className="text-muted-foreground">{slot.info.phone} · {slot.info.role}</p>
                    </div>
                    <span className="ml-auto text-[#1a6b74] font-bold">✓</span>
                  </div>
                )}

                {slot.searched && !slot.info && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    Không tìm thấy thành viên. Vui lòng kiểm tra lại email.
                  </div>
                )}
              </div>
            ))}
          </FieldGroup>

          {/* Thêm thành viên */}
          {slots.length < MAX_MEMBERS && allLeaderFound && (
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full border-dashed text-muted-foreground hover:text-foreground"
              onClick={addSlot}
            >
              + Thêm thành viên ({slots.length}/{MAX_MEMBERS})
            </Button>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {validCount}/{slots.length} thành viên đã xác nhận
        </p>
        <Button
          type="submit"
          form="group-form"
          disabled={!allLeaderFound || validCount === 0}
          className="bg-[#1a6b74] hover:bg-[#155a62] text-white"
        >
          Xác nhận đăng ký
        </Button>
      </CardFooter>
    </Card>
  )
}