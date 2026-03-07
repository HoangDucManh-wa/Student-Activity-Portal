"use client"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import React from "react"

export function SlideCustome({
  className
}: {
  className?: string
}) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  )
  return (
    <>
      <div className={cn("w-full", className)}>
        <Carousel
          className="w-full"
          plugins={[plugin.current]}
        >
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="h-[300px] flex items-center justify-center p-6">
                      <div>
                        <Image
                          src="/slide.png"
                          alt="team-building"
                          width={1000}
                          height={1000}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </>
  )
}