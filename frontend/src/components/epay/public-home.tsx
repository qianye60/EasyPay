import {
  ArrowRight,
  BarChart3,
  Check,
  Menu,
  ShieldCheck,
  WalletCards,
  Zap,
} from "lucide-react"
import type { ElementType } from "react"

import { SiteLogo } from "@/components/epay/site-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type JsonObject = Record<string, unknown>

function textOf(config: JsonObject, key: string, fallback: string) {
  const value = config[key]
  return value === null || value === undefined || value === ""
    ? fallback
    : String(value)
}

function Brand({ name, logoUrl }: { name: string; logoUrl?: string }) {
  return (
    <a
      href="/"
      className="flex min-w-0 items-center gap-3"
      aria-label={`${name} 首页`}
    >
      <SiteLogo logoUrl={logoUrl} className="size-10" />
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-semibold tracking-tight">
          {name}
        </span>
        <span className="block text-[11px] text-muted-foreground">
          商户自收款 · 回调监听
        </span>
      </span>
    </a>
  )
}

const navItems = [
  ["产品能力", "#capabilities"],
  ["收款渠道", "#partners"],
  ["开发文档", "/doc_old.html"],
] as const

export function PublicHomeView({ config = {} }: { config?: JsonObject }) {
  const siteName = textOf(config, "sitename", "EasyPay")
  const logoUrl = textOf(config, "logoUrl", "")
  const title = textOf(config, "title", `欢迎使用${siteName}`)
  const description = textOf(
    config,
    "description",
    "商户用自己的微信、支付宝收款码收款。平台提供到账监听、订单回调，后续还将支持支付宝云端渠道，扫码登录即可收款，无需再下载挂机软件。"
  )
  const testOpen =
    config.test_open === true ||
    config.test_open === 1 ||
    config.test_open === "1"
  const footer = textOf(config, "footer", "All Rights Reserved.")
  const orgName = textOf(config, "orgname", "平台运营方")
  const email = textOf(config, "email", "")
  const kfqq = textOf(config, "kfqq", "")

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="打开导航">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader className="text-left">
                  <SheetTitle>
                    <Brand name={siteName} logoUrl={logoUrl} />
                  </SheetTitle>
                  <SheetDescription>快速访问平台入口</SheetDescription>
                </SheetHeader>
                <nav className="mt-8 grid gap-2">
                  {navItems.map(([label, href]) => (
                    <Button
                      key={href}
                      asChild
                      variant="ghost"
                      className="justify-start rounded-xl"
                    >
                      <a href={href}>{label}</a>
                    </Button>
                  ))}
                  {testOpen && (
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start rounded-xl"
                    >
                      <a href="/user/test.php">支付测试</a>
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Brand name={siteName} logoUrl={logoUrl} />
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {navItems.map(([label, href]) => (
              <Button
                key={href}
                asChild
                variant="ghost"
                className="rounded-xl px-3 text-sm font-normal"
              >
                <a href={href}>{label}</a>
              </Button>
            ))}
            {testOpen && (
              <Button
                asChild
                variant="ghost"
                className="rounded-xl px-3 text-sm font-normal"
              >
                <a href="/user/test.php">支付测试</a>
              </Button>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-3">
            <Button
              asChild
              variant="outline"
              className="hidden rounded-xl sm:inline-flex"
            >
              <a href="/user/login.php">商户登录</a>
            </Button>
            <Button asChild className="rounded-xl">
              <a href="/user/reg.php">
                注册商户
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b bg-muted/30">
          <div className="pointer-events-none absolute -top-40 -right-40 -z-10 size-[32rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-48 -left-40 -z-10 size-[30rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-28">
            <div className="max-w-2xl">
              <Badge
                variant="secondary"
                className="mb-6 h-auto max-w-full rounded-lg px-3 py-1.5 text-center leading-5 whitespace-normal tracking-wide"
              >
                PAYMENT · MERCHANT COLLECT · CALLBACK MONITOR
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                {description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-xl px-6">
                  <a href="/user/reg.php">
                    注册商户收款
                    <ArrowRight data-icon="inline-end" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl px-6"
                >
                  <a href="/doc.html">查看开发文档</a>
                </Button>
              </div>
              <div className="mt-10 grid max-w-xl gap-4 border-t pt-6 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium">商户自收款</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    钱进你的微信 / 支付宝
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">回调监听</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    到账自动通知订单
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">即将上线</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    云端渠道扫码登录
                  </p>
                </div>
              </div>
            </div>
            <Card className="relative overflow-hidden rounded-3xl border bg-card/90 shadow-2xl shadow-primary/10">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardDescription>商户工作台</CardDescription>
                    <CardTitle className="mt-1 text-xl">自收款状态总览</CardTitle>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BarChart3 className="size-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-5 sm:p-7">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground">今日收款</p>
                    <p className="mt-2 text-2xl font-semibold">¥ 28,640</p>
                    <p className="mt-1 text-xs text-primary">↑ 18.6%</p>
                  </div>
                  <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
                    <p className="text-xs text-primary-foreground/70">
                      支付成功率
                    </p>
                    <p className="mt-2 text-2xl font-semibold">99.2%</p>
                    <p className="mt-1 text-xs text-primary-foreground/70">
                      持续稳定
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-medium">监听服务</span>
                    <Badge
                      variant="secondary"
                      className="rounded-lg font-normal"
                    >
                      全部正常
                    </Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="size-2 rounded-full bg-primary" />
                      支付宝
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="size-2 rounded-full bg-primary" />
                      微信支付
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                  <ShieldCheck className="size-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    安全风控、到账回调与套餐服务统一管理
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          id="capabilities"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 lg:py-24"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary">
              CORE CAPABILITIES
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              一套平台，服务商户自己收款
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              从自有收款码、到账监听到订单回调，把复杂的支付对接交给平台。
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <FeatureCard
              icon={WalletCards}
              index="01"
              title="商户自收款"
              description="上传微信、支付宝收款码即可收款，资金直接进入商户本人账户。"
            />
            <FeatureCard
              icon={Zap}
              index="02"
              title="回调与套餐服务"
              description="平台负责到账监听和订单回调。按套餐开通服务，不经平台钱包。"
            />
            <FeatureCard
              icon={Check}
              index="03"
              title="云端渠道即将上线"
              description="支付宝云端扫码登录收款，无需再下载挂机宝等监控软件。"
            />
          </div>
        </section>

        <section id="partners" className="scroll-mt-24 border-y bg-muted/25">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-primary">
                  PAYMENT NETWORK
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  兼容主流支付生态
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                让用户用熟悉的方式完成付款，让商户用统一的方式经营每一笔订单。
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-2">
              <Partner name="支付宝" src="/assets/icon/alipay.ico" />
              <Partner name="微信支付" src="/assets/icon/wxpay.ico" />
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Brand name={siteName} logoUrl={logoUrl} />
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              让支付接入更简单，让每一笔收款都清晰可控。商户自己收款，平台只做回调与监听。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <p className="font-medium">产品</p>
              <a
                className="block text-muted-foreground hover:text-foreground"
                href="/agreement.html"
              >
                服务条款
              </a>
              <a
                className="block text-muted-foreground hover:text-foreground"
                href="/doc.html"
              >
                开发文档
              </a>
              {testOpen && (
                <a
                  className="block text-muted-foreground hover:text-foreground"
                  href="/user/test.php"
                >
                  支付测试
                </a>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium">关于我们</p>
              <p className="max-w-[16rem] leading-6 text-muted-foreground">
                {siteName}由{orgName}运营，为商户提供自收款与到账监听服务。
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium">联系我们</p>
              {kfqq && (
                <a
                  className="block text-muted-foreground hover:text-foreground"
                  href={`https://wpa.qq.com/msgrd?v=3&uin=${encodeURIComponent(kfqq)}&Site=pay&Menu=yes`}
                  target="_blank"
                  rel="noreferrer"
                >
                  QQ：{kfqq}
                </a>
              )}
              {email && (
                <a
                  className="block text-muted-foreground hover:text-foreground"
                  href={`mailto:${email}`}
                >
                  Email：{email}
                </a>
              )}
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-xs text-muted-foreground">
          {siteName} · © {new Date().getFullYear()} ·{" "}
          {/* 管理后台允许 footer 配置保留 HTML，兼容旧版主题的页脚声明。 */}
          <span dangerouslySetInnerHTML={{ __html: footer }} />
        </p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  index,
  title,
  description,
}: {
  icon: ElementType
  index: string
  title: string
  description: string
}) {
  return (
    <Card className="group rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {index}
          </span>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            <Icon className="size-5" />
          </span>
        </div>
        <CardTitle className="pt-3 text-lg">{title}</CardTitle>
        <CardDescription className="leading-6">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function Partner({ name, src }: { name: string; src: string }) {
  return (
    <Card className="rounded-2xl shadow-sm transition-colors hover:border-primary/40">
      <CardContent className="flex items-center gap-3 p-4">
        <img src={src} alt="" className="size-10 shrink-0 rounded-xl" />
        <span className="text-sm font-medium">{name}</span>
      </CardContent>
    </Card>
  )
}
