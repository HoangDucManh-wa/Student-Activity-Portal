import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

function PasswordInput({ className, ...props }: React.ComponentProps<"input">) {
  const [isShow, setIsShow] = useState(true)
  const hasValue = Boolean(props.value)
  return (
    <div className="relative">
      <input
        type={isShow ? 'text' : 'password'}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-[46px]",
          className
        )}
        {...props}
      />
      {
        hasValue && (
          isShow
            ? <Eye className="absolute top-3 right-3 size-5 cursor-pointer" onClick={() => setIsShow(false)} />
            : <EyeOff className="absolute top-3 right-3 size-5 cursor-pointer" onClick={() => setIsShow(true)} />
        )
      }
    </div>
  )
}

export { PasswordInput }
