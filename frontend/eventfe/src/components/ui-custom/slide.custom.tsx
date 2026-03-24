"use client"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { envConfig } from "@/configs/env.config"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { useQuery } from "@tanstack/react-query"

interface BannerSlide {
  imageUrl: string
  linkUrl: string | null
  alt: string
}

const DEFAULT_SLIDES: BannerSlide[] = [
  { imageUrl: "/slide.png", linkUrl: null, alt: "Banner" },
]

async function fetchBannerSlides(): Promise<BannerSlide[]> {
  const res = await fetch(
    `${envConfig.NEXT_PUBLIC_API_URL}/system-config/public/homepage.banner_slides`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return DEFAULT_SLIDES
  const json = await res.json()
  const slides: BannerSlide[] = json?.data?.value?.slides
  return Array.isArray(slides) && slides.length > 0 ? slides : DEFAULT_SLIDES
}

export function SlideCustome({
  className,
}: {
  className?: string
}) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  )

  const { data: slides = DEFAULT_SLIDES } = useQuery({
    queryKey: ["homepage-banner-slides"],
    queryFn: fetchBannerSlides,
    staleTime: 60_000,
  })

  return (
    <div className={cn("w-full", className)}>
      <Carousel className="w-full" plugins={[plugin.current]}>
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="h-[300px] flex items-center justify-center p-0 overflow-hidden">
                    {slide.linkUrl ? (
                      <Link href={slide.linkUrl} className="w-full h-full">
                        <Image
                          src={slide.imageUrl}
                          alt={slide.alt}
                          width={1200}
                          height={300}
                          className="w-full h-full object-cover object-center"
                        />
                      </Link>
                    ) : (
                      <Image
                        src={slide.imageUrl}
                        alt={slide.alt}
                        width={1200}
                        height={300}
                        className="w-full h-full object-cover object-center"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
