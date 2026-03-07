import { cn } from "@/lib/utils";

export function BannerCustom({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-[#EFFBFF] w-full h-[40px] mb-[20px]", className)}>
      <span className="flex items-center">{children}</span>
    </div>
  )
}