import { toast } from "sonner"

export function toastError(message: string) {
  const toastId = toast.error(message, {
    duration: 1500,
    action: {
      label: "X",
      onClick: () => toast.dismiss(toastId)
    }
  })
}

export function toastSuccess(message: string) {
  const toastId = toast.success(message, {
    duration: 1500,
    action: {
      label: "X",
      onClick: () => toast.dismiss(toastId)
    }
  })
}