interface BadgeProps {
  title: string
}

export function Badge({ title }: BadgeProps) {
  return (
    <span className="rounded-full border-2 border-pink-400 text-pink-400 px-3 py-1 text-sm font-medium">
      {title}
    </span>
  )
}