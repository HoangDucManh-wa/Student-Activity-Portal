"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"

const FALLBACK = "/hinh-nen-may-tinh-anime.jpg"

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
}

function isValidSrc(src: unknown): src is string {
  if (typeof src !== "string" || !src.trim()) return false
  try {
    new URL(src)
    return true
  } catch {
    // Relative path or other valid src — let Next.js handle it
    return src.startsWith("/") || src.startsWith("./") || src.startsWith("../")
  }
}

export function SafeImage({ src, fallbackSrc = FALLBACK, alt, ...rest }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  const resolvedSrc = imgSrc ?? fallbackSrc

  // Prevent Next.js Image from crashing on invalid/undefined src
  if (!isValidSrc(resolvedSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fallbackSrc} alt={alt ?? ""} {...rest} />
    )
  }

  const isExternal = resolvedSrc.startsWith("http")

  return (
    <Image
      {...rest}
      src={resolvedSrc}
      alt={alt ?? ""}
      unoptimized={isExternal}
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
}
