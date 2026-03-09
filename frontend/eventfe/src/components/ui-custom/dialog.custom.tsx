"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectCustom } from "./select.ui.custom"
import { EVENT_CATEGORIES, EVENT_STATUS } from "@/configs/constants/even.constant"

const filterSchema = z.object({
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
})

type FilterValues = z.infer<typeof filterSchema>

export function DialogCustom({ className }: { className?: string }) {

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: "",
      startDate: "",
      endDate: "",
      category: "",
    },
  })

  function onSubmit(data: FilterValues) {
  }

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild className={className}>
        <Button variant="outline"> <SlidersHorizontal />Bộ lọc</Button>
      </DialogTrigger>

      <DialogContent className="w-[600px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader className="mb-[20px]">
            <DialogTitle>Bộ lọc</DialogTitle>
          </DialogHeader>
          <FieldGroup className="space-y-[15px] mb-[30px]">
            <Field orientation="horizontal">
              <Label className="w-[100px]">Trạng thái</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <SelectCustom
                    data={EVENT_STATUS}
                    placeholder="Trạng thái của sự kiện"
                    className="w-[350px]"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field orientation="horizontal">
              <Label className="w-[100px]">Thời gian bắt đầu</Label>
              <Input
                type="date"
                className="w-[350px]"
                {...form.register("startDate")}
              />
            </Field>
            <Field orientation="horizontal">
              <Label className="w-[100px]">Thời gian kết thúc</Label>
              <Input
                type="date"
                className="w-[350px]"
                {...form.register("endDate")}
              />
            </Field>
            <Field orientation="horizontal">
              <Label className="w-[100px]">Phân loại</Label>
              <Controller
                name="category"
                control={form.control}
                render={({ field }) => (
                  <SelectCustom
                    data={EVENT_CATEGORIES}
                    placeholder="Phân loại sự kiện"
                    className="w-[350px]"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => form.reset()}
            >
              Làm mới
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer">
              Lọc
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}