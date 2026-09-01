import { CircleDollarSign } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const DEFAULT_LOGO = "/assets/uploads/logo.png"
const FALLBACK_LOGO = "/assets/img/logo.png"

function resolveLogoUrl(logoUrl?: string | null) {
  const value = String(logoUrl ?? "").trim()
  if (value) return value
  return `${DEFAULT_LOGO}?fallback=1`
}

export function SiteLogo({
  logoUrl,
  className,
  imgClassName,
  alt = "站点 Logo",
}: {
  logoUrl?: string | null
  className?: string
  imgClassName?: string
  alt?: string
}) {
  const [src, setSrc] = React.useState(() => resolveLogoUrl(logoUrl))
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    setSrc(resolveLogoUrl(logoUrl))
    setFailed(false)
  }, [logoUrl])

  if (failed) {
    return (
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm",
          className
        )}
      >
        <CircleDollarSign className="size-5" aria-hidden="true" />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background shadow-sm ring-1 ring-border/70",
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className={cn("size-full object-contain p-1", imgClassName)}
        onError={() => {
          if (src.includes(DEFAULT_LOGO) && !src.includes(FALLBACK_LOGO)) {
            setSrc(`${FALLBACK_LOGO}?v=${Date.now()}`)
            return
          }
          setFailed(true)
        }}
      />
    </span>
  )
}
