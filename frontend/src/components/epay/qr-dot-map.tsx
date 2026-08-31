import * as React from "react"

import { cn } from "@/lib/utils"
import { QrCodeDataType, encode } from "@/lib/uqr.js"

type QrDotMapProps = {
  value: string
  size?: number
  className?: string
  darkColor?: string
  lightColor?: string
}

export function QrDotMap({
  value,
  size = 236,
  className,
  darkColor = "#111111",
  lightColor = "#ffffff",
}: QrDotMapProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !value) return

    const qr = encode(value, { ecc: "M", border: 2 })
    const modules = qr.size
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = lightColor
    ctx.fillRect(0, 0, size, size)

    const cell = size / modules
    const dotRadius = cell * 0.38
    const finderRadius = Math.max(1.5, cell * 0.28)

    const roundRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      const radius = Math.min(r, w / 2, h / 2)
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.arcTo(x + w, y, x + w, y + h, radius)
      ctx.arcTo(x + w, y + h, x, y + h, radius)
      ctx.arcTo(x, y + h, x, y, radius)
      ctx.arcTo(x, y, x + w, y, radius)
      ctx.closePath()
    }

    ctx.fillStyle = darkColor
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if (!qr.data[y]?.[x]) continue
        const kind = qr.types?.[y]?.[x]
        const px = x * cell
        const py = y * cell
        if (kind === QrCodeDataType.Position) {
          roundRect(px + cell * 0.08, py + cell * 0.08, cell * 0.84, cell * 0.84, finderRadius)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(px + cell / 2, py + cell / 2, dotRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }, [darkColor, lightColor, size, value])

  return (
    <canvas
      ref={canvasRef}
      className={cn("block rounded-xl", className)}
      role="img"
      aria-label="收款二维码"
    />
  )
}
