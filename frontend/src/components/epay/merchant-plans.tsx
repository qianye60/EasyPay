import * as React from "react"
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Info, Loader2, Minus, PackageCheck, Plus } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type PlanChannel = { name: string; rate: string | number }
type Plan = { gid: string | number; name: string; price: string | number; expire: string | number; channels: PlanChannel[] }
type PaymentMethod = { id: string | number; showname: string }

export type MerchantPlansConfig = {
  sitename?: string
  csrfToken?: string
  plans?: Plan[]
  methods?: PaymentMethod[]
  current?: { name?: string; expire?: string }
  success?: { name?: string } | null
}

function money(value: string | number, quantity = 1) {
  return (Number(value) * quantity).toFixed(2)
}

export function MerchantPlansView({ config }: { config?: MerchantPlansConfig }) {
  const plans = config?.plans ?? []
  const methods = config?.methods ?? [{ id: 0, showname: "余额支付" }]
  const [selected, setSelected] = React.useState<Plan | null>(null)
  const [quantity, setQuantity] = React.useState(1)
  const [method, setMethod] = React.useState(String(methods[0]?.id ?? "0"))
  const [pending, setPending] = React.useState(false)
  const [notice, setNotice] = React.useState("")
  const [noticeKind, setNoticeKind] = React.useState<"info" | "error">("info")

  const choose = (plan: Plan) => {
    setSelected(plan)
    setQuantity(1)
    setNotice("")
    window.setTimeout(() => document.getElementById("plan-checkout")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
  }

  const submit = async () => {
    if (!selected) return
    setPending(true)
    setNotice("")
    try {
      const body = new URLSearchParams({ gid: String(selected.gid), num: String(quantity), typeid: method, csrf_token: config?.csrfToken ?? "" })
      const response = await fetch("ajax2.php?act=groupbuy", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body })
      const data = (await response.json()) as { code?: number; msg?: string; url?: string }
      if (data.code === 0 && data.url) {
        window.location.href = data.url
        return
      }
      if (data.code === 1) {
        setNoticeKind("info")
        setNotice(data.msg || "套餐已开通")
        setSelected(null)
      } else {
        throw new Error(data.msg || "购买失败")
      }
    } catch (error) {
      setNoticeKind("error")
      setNotice(error instanceof Error ? error.message : "购买失败，请稍后重试")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {config?.success?.name && <Alert className="rounded-2xl border-emerald-500/25 bg-emerald-500/5"><CheckCircle2 className="text-emerald-600" /><AlertTitle>套餐购买成功</AlertTitle><AlertDescription>「{config.success.name}」已生效，感谢你的使用。</AlertDescription></Alert>}
      <Card className="rounded-2xl border-border/70 shadow-xs">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><PackageCheck className="size-5" /></div><div><p className="text-sm font-semibold">当前套餐：{config?.current?.name || "默认用户组"}</p><p className="mt-1 text-xs text-muted-foreground">到期时间：<span className="font-medium text-foreground">{config?.current?.expire || "永久"}</span></p></div></div>
          <Badge variant="secondary" className="w-fit rounded-md text-emerald-600">服务正常</Badge>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-end justify-between gap-3"><div><h1 className="text-xl font-semibold tracking-tight">选择套餐</h1><p className="mt-1 text-sm text-muted-foreground">按需购买回调监听服务，随时升级你的收款能力。</p></div><Badge variant="outline" className="rounded-md">{plans.length} 个可用套餐</Badge></div>
        <div className="grid gap-4 xl:grid-cols-3">
          {plans.map((plan, index) => {
            const active = String(selected?.gid) === String(plan.gid)
            return <Card key={String(plan.gid)} className={cn("relative overflow-hidden rounded-2xl border-border/70 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md", index === 0 && "border-primary/40", active && "border-primary ring-2 ring-primary/15")}>
              {index === 0 && <div className="absolute inset-x-0 top-0 h-1 bg-primary" />}
              <CardHeader className="border-b border-border/50 pb-5"><div className="flex items-center justify-between gap-2"><CardTitle className="text-base">{plan.name}</CardTitle>{index === 0 && <Badge className="rounded-md">推荐</Badge>}</div><CardDescription>{plan.expire === 0 || plan.expire === "0" ? "长期有效" : `有效期 ${plan.expire} 个月`}</CardDescription></CardHeader>
              <CardContent className="flex flex-col gap-5 p-5"><div><span className="text-3xl font-bold tracking-tight text-primary">¥ {money(plan.price)}</span><span className="ml-1 text-xs text-muted-foreground">/ {plan.expire === 0 || plan.expire === "0" ? "永久" : `${plan.expire} 个月`}</span></div><div className="grid gap-2 border-t border-border/50 pt-4 text-sm">{plan.channels.length ? plan.channels.slice(0, 4).map((channel) => <div key={`${channel.name}-${channel.rate}`} className="flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-2 text-muted-foreground"><CheckCircle2 className="size-4 shrink-0 text-primary" />{channel.name}</span><span className="shrink-0 font-medium">费率 {channel.rate}%</span></div>) : <span className="text-muted-foreground">按平台默认通道提供服务</span>}</div><Button type="button" className="h-10 w-full rounded-xl" onClick={() => choose(plan)}>{active ? "已选择" : "立即购买"}<ArrowRight data-icon="inline-end" /></Button></CardContent>
            </Card>
          })}
        </div>
      </div>

      {selected && <Card id="plan-checkout" className="scroll-mt-24 rounded-2xl border-primary/30 shadow-sm"><CardHeader className="border-b border-border/50 pb-4"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-base">确认购买 · {selected.name}</CardTitle><CardDescription className="mt-1">核对有效期与支付方式后提交订单。</CardDescription></div><Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => setSelected(null)} aria-label="返回套餐列表"><ArrowLeft className="size-4" /></Button></div></CardHeader><CardContent className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto]"><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><span className="text-xs text-muted-foreground">购买数量</span><div className="flex h-10 w-fit items-center rounded-xl border border-input"><Button type="button" variant="ghost" size="icon" className="size-9 rounded-xl" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={selected.expire === 0 || selected.expire === "0"}><Minus className="size-3.5" /></Button><span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span><Button type="button" variant="ghost" size="icon" className="size-9 rounded-xl" onClick={() => setQuantity((value) => Math.min(300, value + 1))} disabled={selected.expire === 0 || selected.expire === "0"}><Plus className="size-3.5" /></Button></div><span className="text-xs text-muted-foreground">{selected.expire === 0 || selected.expire === "0" ? "永久套餐无需重复购买数量" : `合计 ${Number(selected.expire) * quantity} 个月`}</span></div><div className="grid gap-2"><span className="text-xs text-muted-foreground">支付方式</span><div className="flex flex-wrap gap-2">{methods.map((item) => <label key={String(item.id)} className={cn("inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors", method === String(item.id) ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/60")}><input type="radio" name="plan-payment" value={String(item.id)} checked={method === String(item.id)} onChange={() => setMethod(String(item.id))} className="accent-primary" />{item.showname}</label>)}</div></div></div><div className="flex min-w-[210px] flex-col justify-between gap-4 rounded-xl bg-primary/5 p-4"><div><span className="text-xs text-muted-foreground">应付金额</span><p className="mt-1 text-2xl font-bold tabular-nums text-primary">¥ {money(selected.price, quantity)}</p></div><Button type="button" className="h-10 rounded-xl" onClick={() => void submit()} disabled={pending}>{pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Check data-icon="inline-start" />}确认购买</Button></div></CardContent></Card>}
      {notice && <Alert variant={noticeKind === "error" ? "destructive" : "default"} className="rounded-xl"><Info /><AlertTitle>{noticeKind === "error" ? "操作失败" : "操作成功"}</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert>}
    </div>
  )
}
