import * as React from "react"
import {
  Check,
  Clipboard,
  Download,
  ExternalLink,
  Loader2,
  QrCode,
  Save,
  Upload,
} from "lucide-react"

import { QrDotMap } from "@/components/epay/qr-dot-map"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { encode } from "@/lib/uqr.js"

export type OnecodeConfig = {
  sitename?: string
  codeUrl?: string
  codeName?: string
  alipayQrUrl?: string
  csrfToken?: string
  styleUrl?: string
}

type QrStyle = {
  foreground?: string
  background?: string
}

const fallbackStyles: Record<string, QrStyle> = {
  default: { foreground: "#111827", background: "#ffffff" },
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const input = document.createElement("textarea")
  input.value = value
  input.style.position = "fixed"
  input.style.opacity = "0"
  document.body.appendChild(input)
  input.select()
  document.execCommand("copy")
  input.remove()
}

function downloadQrPng(
  value: string,
  fileName: string,
  foreground: string,
  background: string
) {
  const size = 512
  const qr = encode(value, { ecc: "M", border: 2 })
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("无法导出二维码")
  ctx.fillStyle = background
  ctx.fillRect(0, 0, size, size)
  const cell = size / qr.size
  ctx.fillStyle = foreground
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (!qr.data[y]?.[x]) continue
      ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5)
    }
  }
  const link = document.createElement("a")
  link.href = canvas.toDataURL("image/png")
  link.download = fileName
  link.click()
}

export function MerchantOnecodeView({ config }: { config?: OnecodeConfig }) {
  const codeUrl = config?.codeUrl ?? ""
  const [codeName, setCodeName] = React.useState(config?.codeName ?? "")
  const [styleName, setStyleName] = React.useState("default")
  const [styles, setStyles] = React.useState(fallbackStyles)
  const [notice, setNotice] = React.useState<{
    kind: "success" | "error"
    text: string
  } | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [alipayQrUrl, setAlipayQrUrl] = React.useState(
    config?.alipayQrUrl ?? ""
  )
  const [uploadingQr, setUploadingQr] = React.useState(false)
  const alipayFileInput = React.useRef<HTMLInputElement>(null)
  const [copied, setCopied] = React.useState(false)
  const styleUrl = config?.styleUrl ?? "./assets/js/config.json"
  const style = styles[styleName] ?? styles.default ?? fallbackStyles.default
  const foreground = style.foreground ?? "#111827"
  const background = style.background ?? "#ffffff"

  React.useEffect(() => {
    let cancelled = false
    fetch(styleUrl, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error("样式配置加载失败")
        return response.json() as Promise<Record<string, QrStyle>>
      })
      .then((data) => {
        if (cancelled || !data || typeof data !== "object") return
        setStyles({ ...fallbackStyles, ...data })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [styleUrl])

  const saveName = async () => {
    setSaving(true)
    setNotice(null)
    try {
      const body = new URLSearchParams({
        codename: codeName,
        csrf_token: config?.csrfToken ?? "",
      })
      const response = await fetch("ajax2.php?act=edit_codename", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      })
      const data = (await response.json()) as { code?: number; msg?: string }
      if (data.code !== 1) throw new Error(data.msg || "保存失败")
      setNotice({ kind: "success", text: data.msg || "收款名称已保存" })
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "保存失败，请稍后重试",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    if (!codeUrl) return
    try {
      await copyText(codeUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setNotice({ kind: "error", text: "复制失败，请手动选择链接" })
    }
  }

  const handleDownload = () => {
    if (!codeUrl) return
    try {
      downloadQrPng(
        codeUrl,
        `聚合收款-${codeName || "收款码"}.png`,
        foreground,
        background
      )
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "下载失败",
      })
    }
  }

  const uploadAlipayQr = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setUploadingQr(true)
    setNotice(null)
    try {
      const body = new FormData()
      body.append("field", "ali_qr")
      body.append("csrf_token", config?.csrfToken ?? "")
      body.append("file", file)
      const response = await fetch("ajax2.php?act=guajiUpload", {
        method: "POST",
        credentials: "same-origin",
        body,
      })
      const data = (await response.json()) as {
        code?: number
        msg?: string
        url?: string
      }
      if (data.code !== 0 || !data.url) {
        throw new Error(data.msg || "上传失败")
      }
      setAlipayQrUrl(data.url)
      setNotice({ kind: "success", text: data.msg || "支付宝收款码已上传" })
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "上传失败，请稍后重试",
      })
    } finally {
      setUploadingQr(false)
    }
  }

  const styleKeys = Object.keys(styles)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs text-muted-foreground">
          {config?.sitename ?? "EasyPay"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">聚合收款</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          一个二维码同时支持支付宝、微信、QQ 等常用支付方式。
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-base">收款设置</CardTitle>
            <CardDescription>
              设置展示名称，并把收款链接发给客户。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <label htmlFor="onecode-name" className="text-sm font-medium">
                收款名称
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="onecode-name"
                  value={codeName}
                  onChange={(event) => setCodeName(event.target.value)}
                  placeholder="留空则显示商户名称"
                  maxLength={40}
                  className="h-10 flex-1 rounded-xl"
                />
                <Button
                  type="button"
                  onClick={() => void saveName()}
                  disabled={saving}
                  className="h-10 rounded-xl sm:w-28"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                  ) : (
                    <Save data-icon="inline-start" />
                  )}
                  保存
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="onecode-url" className="text-sm font-medium">
                  收款链接
                </label>
                <Badge variant="secondary" className="rounded-md">
                  可分享
                </Badge>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="onecode-url"
                  value={codeUrl}
                  readOnly
                  className="h-10 min-w-0 flex-1 rounded-xl bg-muted/40 font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl sm:w-28"
                  onClick={() => void handleCopy()}
                  disabled={!codeUrl}
                >
                  {copied ? (
                    <Check data-icon="inline-start" />
                  ) : (
                    <Clipboard data-icon="inline-start" />
                  )}
                  {copied ? "已复制" : "复制"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                客户打开链接后输入金额即可付款。
              </p>
            </div>

            {notice ? (
              <Alert
                variant={notice.kind === "error" ? "destructive" : "default"}
                className="rounded-xl"
              >
                <AlertTitle>
                  {notice.kind === "error" ? "操作失败" : "操作成功"}
                </AlertTitle>
                <AlertDescription>{notice.text}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-3 rounded-2xl border border-sky-200/70 bg-sky-50/60 p-4">
              <div>
                <p className="text-sm font-medium text-sky-950">支付宝转账收款码</p>
                <p className="mt-1 text-xs leading-5 text-sky-900/70">
                  上传支付宝个人收款码，客户输入金额后可直接扫码转账。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-200 bg-white">
                  {alipayQrUrl ? (
                    <img
                      src={alipayQrUrl}
                      alt="支付宝收款码"
                      className="size-full object-cover"
                    />
                  ) : (
                    <QrCode className="size-7 text-sky-300" />
                  )}
                </div>
                <div className="min-w-0 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl border-sky-300 bg-white"
                    onClick={() => alipayFileInput.current?.click()}
                    disabled={uploadingQr}
                  >
                    {uploadingQr ? (
                      <Loader2 className="animate-spin" data-icon="inline-start" />
                    ) : (
                      <Upload data-icon="inline-start" />
                    )}
                    {alipayQrUrl ? "重新上传" : "上传收款码"}
                  </Button>
                  <input
                    ref={alipayFileInput}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(event) => void uploadAlipayQr(event)}
                  />
                  <p className="text-xs leading-5 text-sky-900/60">
                    仅支持清晰完整的支付宝收款码图片，最大 2MB。需要自动核验到账时，请同时开启到账监听。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-base">收款二维码</CardTitle>
            <CardDescription>本地即时生成，可下载分享</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="flex w-full items-center gap-2">
              <label
                htmlFor="qr-style"
                className="shrink-0 text-xs text-muted-foreground"
              >
                样式
              </label>
              <select
                id="qr-style"
                value={styleName}
                onChange={(event) => setStyleName(event.target.value)}
                className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:border-ring"
              >
                {styleKeys.map((key, index) => (
                  <option key={key} value={key}>
                    {index === 0 ? "标准样式" : `样式 ${index}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex aspect-square w-full max-w-[260px] items-center justify-center rounded-2xl border bg-white p-4">
              {codeUrl ? (
                <QrDotMap
                  value={codeUrl}
                  size={220}
                  darkColor={foreground}
                  lightColor={background}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <QrCode className="size-8" />
                  <span>暂无收款链接</span>
                </div>
              )}
            </div>

            <div className="flex w-full gap-2">
              <Button
                type="button"
                className="h-10 flex-1 rounded-xl"
                onClick={handleDownload}
                disabled={!codeUrl}
              >
                <Download data-icon="inline-start" />
                下载二维码
              </Button>
              <Button
                asChild
                type="button"
                variant="outline"
                className="h-10 rounded-xl px-3"
                disabled={!codeUrl}
              >
                <a href={codeUrl || "#"} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
