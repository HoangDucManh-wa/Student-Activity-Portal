"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"

const FALLBACK = "/hinh-nen-may-tinh-anime.jpg"

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
}

/**
 * Wrapper around next/image that:
 * - Falls back to a local placeholder on error
 * - Uses unoptimized for external URLs (avoids hostname whitelist issues)
 */
export function SafeImage({ src, fallbackSrc = FALLBACK, alt, ...rest }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  const isExternal = typeof imgSrc === "string" && imgSrc.startsWith("http")

  return (
    <Image
      {...rest}
      src={imgSrc || fallbackSrc}
      alt={alt}
      unoptimized={isExternal}
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
}
