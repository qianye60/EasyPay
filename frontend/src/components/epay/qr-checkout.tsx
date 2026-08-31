import {
  AlertTriangle,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import * as React from "react"

import { QrDotMap } from "@/components/epay/qr-dot-map"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type QrCheckoutConfig = {
  page?: string
  title?: string
  sitename?: string
  codeUrl?: string
  amount?: string | number
  tradeNo?: string
  productName?: string
  merchantName?: string
  createdAt?: string
  expireAt?: number
  payType?: string
}

const payMeta: Record<
  string,
  { label: string; recommend: string; icon: string; tone: string }
> = {
  wxpay: {
    label: "微信支付",
    recommend: "请使用微信扫一扫",
    icon: "/assets/icon/wxpay.ico",
    tone: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  },
  alipay: {
    label: "支付宝",
    recommend: "请使用支付宝扫一扫",
    icon: "/assets/icon/alipay.ico",
    tone: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  },
  qqpay: {
    label: "QQ 钱包",
    recommend: "请使用 QQ 扫一扫",
    icon: "/assets/icon/qqpay.ico",
    tone: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
  },
  bank: {
    label: "网银支付",
    recommend: "请使用对应 App 扫一扫",
    icon: "/assets/icon/bank.ico",
    tone: "bg-muted text-foreground",
  },
  jdpay: {
    label: "京东支付",
    recommend: "请使用京东 App 扫一扫",
    icon: "/assets/icon/jdpay.ico",
    tone: "bg-red-500/12 text-red-700 dark:text-red-300",
  },
  douyinpay: {
    label: "抖音支付",
    recommend: "请使用抖音扫一扫",
    icon: "/assets/icon/douyinpay.ico",
    tone: "bg-muted text-foreground",
  },
}

function formatAmount(value: string | number | undefined) {
  const number = Number(value ?? 0)
  if (!Number.isFinite(number)) return String(value ?? "0.00")
  return number.toFixed(2)
}

function formatClock(total: number) {
  const safe = Math.max(0, total)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

function isWeChat() {
  return /MicroMessenger/i.test(navigator.userAgent)
}

function payTypeOf(config: QrCheckoutConfig) {
  if (config.payType) return config.payType
  const page = String(config.page ?? "")
  if (page.includes("alipay")) return "alipay"
  if (page.includes("wxpay")) return "wxpay"
  if (page.includes("qqpay")) return "qqpay"
  if (page.includes("jdpay")) return "jdpay"
  if (page.includes("douyin")) return "douyinpay"
  if (page.includes("bank")) return "bank"
  return "wxpay"
}

function openScheme(codeUrl: string, type: string) {
  if (type === "alipay") {
    return `alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(codeUrl)}`
  }
  return codeUrl
}

export function QrCheckoutView({
  config = {},
}: {
  config?: QrCheckoutConfig
}) {
  const type = payTypeOf(config)
  const meta = payMeta[type] ?? payMeta.wxpay
  const amount = formatAmount(config.amount)
  const codeUrl = String(config.codeUrl ?? "")
  const expireAt = Number(config.expireAt ?? 0)
  const siteName = config.sitename || "Rainbow Pay"
  const [remain, setRemain] = React.useState(() =>
    expireAt ? Math.max(0, expireAt - Math.floor(Date.now() / 1000)) : 0
  )
  const [copied, setCopied] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [paid, setPaid] = React.useState(false)
  const expired = remain <= 0 && expireAt > 0
  const mobile = typeof navigator !== "undefined" && isMobile()

  React.useEffect(() => {
    if (!expireAt) return
    const tick = () =>
      setRemain(Math.max(0, expireAt - Math.floor(Date.now() / 1000)))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [expireAt])

  React.useEffect(() => {
    if (!config.tradeNo || expired || paid) return
    let cancelled = false
    const poll = async () => {
      try {
        const response = await fetch(
          `/getshop.php?type=${encodeURIComponent(type)}&trade_no=${encodeURIComponent(String(config.tradeNo))}`,
          { credentials: "same-origin" }
        )
        const data = (await response.json()) as {
          code?: number
          backurl?: string
        }
        if (cancelled) return
        if (data.code === 1 && data.backurl) {
          setPaid(true)
          window.setTimeout(() => {
            window.location.href = String(data.backurl)
          }, 600)
          return
        }
      } catch {
        // 轮询失败时继续等待，避免打断付款。
      }
      if (!cancelled) window.setTimeout(poll, 2000)
    }
    const start = window.setTimeout(poll, 1500)
    return () => {
      cancelled = true
      window.clearTimeout(start)
    }
  }, [config.tradeNo, expired, paid, type])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(codeUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="min-h-svh bg-muted/30 px-3 py-4 text-foreground sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 flex items-center justify-between gap-3 px-1">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <CircleDollarSign className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-semibold tracking-tight">{siteName}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                商户自收款 · 统一回调
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5 rounded-lg">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            安全支付
          </Badge>
        </div>

        <Card className="overflow-hidden rounded-3xl border bg-card/95 shadow-xl shadow-primary/5">
          <CardHeader className="gap-2 border-b bg-muted/20 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  支付收银台
                </p>
                <CardTitle className="mt-1 text-xl tracking-tight">
                  {config.title || meta.label}
                </CardTitle>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium",
                  meta.tone
                )}
              >
                <img src={meta.icon} alt="" className="size-4 rounded" />
                {meta.label}
              </span>
            </div>
            <CardDescription>{meta.recommend}完成付款。</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-4 px-5 py-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">应付金额</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight">
                <span className="mr-1 text-2xl font-medium text-muted-foreground">
                  ¥
                </span>
                {amount}
              </p>
            </div>

            <Alert className="w-full rounded-2xl border-amber-500/30 bg-amber-500/8">
              <AlertTriangle className="text-amber-600" />
              <AlertTitle>请按提示金额原样支付</AlertTitle>
              <AlertDescription>
                必须支付 <strong>¥{amount}</strong>
                ，多付或少付都无法自动匹配到账。
              </AlertDescription>
            </Alert>

            <div
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm",
                expired
                  ? "bg-destructive/10 text-destructive"
                  : remain <= 60
                    ? "bg-amber-500/12 text-amber-700 dark:text-amber-300"
                    : "bg-muted text-muted-foreground"
              )}
            >
              <Clock3 className="size-4" />
              {expired
                ? "支付已超时，请返回重新下单"
                : `请在 ${formatClock(remain)} 内完成支付`}
            </div>

            <div className="relative rounded-3xl border bg-background p-4 shadow-sm">
              {codeUrl && !expired ? (
                <QrDotMap value={codeUrl} size={220} />
              ) : (
                <div className="flex size-[220px] items-center justify-center text-sm text-muted-foreground">
                  {expired ? "二维码已失效" : "二维码加载失败"}
                </div>
              )}
              {(expired || paid) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-background/80 backdrop-blur-sm">
                  {paid ? (
                    <>
                      <Loader2 className="size-8 animate-spin text-primary" />
                      <p className="mt-2 text-sm font-medium">支付成功，正在跳转</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="size-8 text-destructive" />
                      <p className="mt-2 text-sm font-medium">订单已超时</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {mobile && codeUrl && !expired && (
              <div className="grid w-full gap-2">
                {type === "alipay" && !isWeChat() ? (
                  <Button asChild className="h-11 rounded-xl">
                    <a href={openScheme(codeUrl, type)}>
                      <ExternalLink data-icon="inline-start" />
                      打开支付宝付款
                    </a>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl"
                    onClick={() => void copyLink()}
                  >
                    {copied ? (
                      <Check data-icon="inline-start" />
                    ) : (
                      <Copy data-icon="inline-start" />
                    )}
                    {copied ? "已复制支付链接" : "复制支付链接"}
                  </Button>
                )}
              </div>
            )}

            <button
              type="button"
              className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground"
              onClick={() => setDetailOpen((open) => !open)}
            >
              订单详情
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  detailOpen && "rotate-180"
                )}
              />
            </button>
            {detailOpen && (
              <div className="w-full rounded-2xl border bg-muted/30 p-4 text-sm">
                <div className="flex justify-between gap-4 py-1.5">
                  <span className="text-muted-foreground">商品</span>
                  <span className="max-w-[220px] truncate text-right">
                    {config.productName || "在线支付"}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between gap-4 py-1.5">
                  <span className="text-muted-foreground">订单号</span>
                  <span className="max-w-[220px] truncate text-right font-mono text-xs">
                    {config.tradeNo || "—"}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between gap-4 py-1.5">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>{config.createdAt || "—"}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-muted/10 px-5 py-4">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              请勿关闭页面，支付结果会实时回传商户。
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
