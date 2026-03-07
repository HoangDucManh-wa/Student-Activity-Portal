"use client"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SelectCustomProps {
  value?: string
  onChange?: (value: string | null) => void
  data: any[],
  placeholder?: string,
  className?: string
}

export function SelectCustom({ value, onChange, data, placeholder, className }: SelectCustomProps) {
  const [search, setSearch] = useState("")

  const selectedName = data?.find((item) => item.id === value)?.name ?? ""

  const filtered = data?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Combobox value={value} onValueChange={(val) => onChange?.(val ?? "")}>
      <ComboboxInput
        placeholder={placeholder}
        value={search || selectedName}
        onChange={(e) => setSearch(e.target.value)}
        className={cn("h-[46px]", className)}
      />
      <ComboboxContent>
        {filtered && filtered.length === 0 &&
          <ComboboxEmpty>Không tìm thấy kết quả</ComboboxEmpty>
        }
        <ComboboxList>
          {filtered?.map((item) => (
            <ComboboxItem key={item.id} value={item.id}>
              {item.name}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}