"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { SlidersHorizontal } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

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
import { EVENT_STATUS } from "@/configs/constants/even.constant"
import { getCategories } from "@/services/activity.service"

const filterSchema = z.object({
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
})

export type FilterValues = z.infer<typeof filterSchema>

interface DialogCustomProps {
  className?: string
  onFilter: (filters: FilterValues) => void
}

export function DialogCustom({ className, onFilter }: DialogCustomProps) {
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: "",
      startDate: "",
      endDate: "",
      categoryId: "",
    },
  })

  const { data: categoriesData } = useQuery({
    queryKey: ["activity-categories"],
    queryFn: () => getCategories(),
  })

  const categoryOptions = (categoriesData?.data ?? []).map((c) => ({
    id: String(c.categoryId),
    name: c.categoryName,
  }))

  function onSubmit(data: FilterValues) {
    const filters: FilterValues = { ...data }
    if (filters.startDate) filters.startDate = new Date(filters.startDate).toISOString()
    if (filters.endDate) filters.endDate = new Date(filters.endDate).toISOString()
    onFilter(filters)
  }

  function handleReset() {
    form.reset()
    onFilter({})
  }

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild className={className}>
        <Button variant="outline"><SlidersHorizontal />Bộ lọc</Button>
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
                    placeholder="Tất cả trạng thái"
                    className="w-[350px]"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field orientation="horizontal">
              <Label className="w-[100px]">Phân loại</Label>
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <SelectCustom
                    data={categoryOptions}
                    placeholder="Tất cả phân loại"
                    className="w-[350px]"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field orientation="horizontal">
              <Label className="w-[100px]">Bắt đầu từ</Label>
              <Input
                type="date"
                className="w-[350px]"
                {...form.register("startDate")}
              />
            </Field>
            <Field orientation="horizontal">
              <Label className="w-[100px]">Kết thúc trước</Label>
              <Input
                type="date"
                className="w-[350px]"
                {...form.register("endDate")}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={handleReset}
            >
              Xóa bộ lọc
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer">
              Áp dụng
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
