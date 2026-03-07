import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconUpload, IconDownload } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import React from "react"

export function ImportExcelDialog() {
  const [isDragging, setIsDragging] = React.useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <IconUpload />
          Nhập Excel
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm mới yêu cầu bằng file excel</DialogTitle>
        </DialogHeader>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files[0]
            // xử lý file ở đây
            console.log(file)
          }}
          onClick={() => document.getElementById("file-input")?.click()}
          className={`
            flex flex-col items-center justify-center gap-2 
            rounded-lg border-2 border-dashed p-10 cursor-pointer transition-colors
            ${isDragging ? "border-blue-500 bg-blue-50" : "border-muted-foreground/30 hover:bg-muted/50"}
          `}
        >
          <IconUpload className="size-10 text-blue-500" />
          <p className="text-sm font-medium">Nhấp hoặc kéo tệp vào đây để tải lên</p>
          <p className="text-xs text-muted-foreground">xlsx</p>
          <input
            id="file-input"
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {

            }}
          />
        </div>

        <Button variant="outline" className="gap-2">
          <IconDownload />
          Tải file template
        </Button>
      </DialogContent>
    </Dialog>
  )
}