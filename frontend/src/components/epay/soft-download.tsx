import {
  Bell,
  Download,
  ExternalLink,
  QrCode,
  Smartphone,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type SoftDownloadConfig = {
  sitename?: string
  apkUrl?: string
  sourceUrl?: string
  channelUrl?: string
}

const steps = [
  {
    icon: Bell,
    title: "开启通知权限",
    desc: "安装后打开 APP，开启通知使用权，并关闭电池优化。",
  },
  {
    icon: QrCode,
    title: "扫码或粘贴配置",
    desc: "点「扫码配置」到通道管理扫二维码，或「手动配置」粘贴配置数据。",
  },
  {
    icon: Smartphone,
    title: "保持后台运行",
    desc: "付款须进本机已登录的微信 / 支付宝；微信关注收款助手并打开提醒。",
  },
] as const

export function SoftDownloadView({
  config = {},
}: {
  config?: SoftDownloadConfig
}) {
  const apkUrl = config.apkUrl || "/assets/apk/vmq-epay.apk"
  const sourceUrl = config.sourceUrl || "https://github.com/szvone/vmqApk"
  const channelUrl = config.channelUrl || "./channel.php"

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="text-xs text-muted-foreground">
          {config.sitename ?? "Rainbow Pay"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">软件下载</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          安卓监控端，监听微信 / 支付宝收款通知并自动回调。
        </p>
      </header>

      <Card className="overflow-hidden rounded-2xl shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Smartphone className="size-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg">监控端</CardTitle>
                  <Badge variant="secondary" className="rounded-lg">
                    Android
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  安装后到通道管理完成配置即可开始收款回调。
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="rounded-xl">
                <a href={apkUrl}>
                  <Download data-icon="inline-start" />
                  下载 APK
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink data-icon="inline-start" />
                  上游源码
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ol className="divide-y">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <li
                  key={step.title}
                  className="flex items-start gap-3 px-5 py-4 sm:px-6"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm font-semibold">{step.title}</p>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {index === 1 ? (
                        <>
                          点「扫码配置」到{" "}
                          <a
                            href={channelUrl}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                          >
                            通道管理
                          </a>{" "}
                          扫二维码，或「手动配置」粘贴配置数据。
                        </>
                      ) : (
                        step.desc
                      )}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
