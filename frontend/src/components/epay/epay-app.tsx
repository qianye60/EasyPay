import * as React from "react"
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageCircle,
  Menu,
  Moon,
  PackageCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  QrCode,
  RefreshCw,
  Settings,
  ShieldCheck,
  Store,
  Sun,
  Users,
  WalletCards,
  Zap,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AuthView } from "@/components/epay/auth-view"
import { AdminOrderView, type AdminOrderConfig } from "@/components/epay/admin-order"
import { AdminResourceView, type AdminResourceConfig } from "@/components/epay/admin-resource"
import { AdminFormView, AdminStatsView, type AdminFormConfig } from "@/components/epay/admin-form"
import { AdminChannelEditorView, type AdminChannelEditorConfig } from "@/components/epay/admin-channel-editor"
import { AdminAccountView, AdminBatchView, AdminChannelConfigView, AdminChannelTestView, AdminGroupPurchaseView, AdminMaintenanceView, AdminRollConfigView, AdminSettlementBatchView, AdminTokenView, AdminTotpView, type AdminAccountConfig, type AdminBatchConfig, type AdminChannelConfig, type AdminChannelTestConfig, type AdminGroupPurchaseConfig, type AdminMaintenanceConfig, type AdminRollConfig, type AdminSettlementBatchConfig, type AdminTokenConfig, type AdminTotpConfig } from "@/components/epay/admin-tools"
import { GoldPlanView, type GoldPlanConfig } from "@/components/epay/gold-plan"
import {
  GatewayShell,
  InstallerShell,
  LegacyAuthShell,
  PublicLegacyShell,
  type LegacyShellConfig,
} from "@/components/epay/legacy-shell"
import { PublicHomeView } from "@/components/epay/public-home"
import {
  SoftDownloadView,
  type SoftDownloadConfig,
} from "@/components/epay/soft-download"
import {
  TransferConfirmView,
  type TransferConfirmConfig,
} from "@/components/epay/transfer-confirm"
import {
  PaymentStatusView,
  type PaymentStatusConfig,
} from "@/components/epay/payment-status"
import { PayPageView, type PayPageConfig } from "@/components/epay/pay-page"
import {
  QrCheckoutView,
  type QrCheckoutConfig,
} from "@/components/epay/qr-checkout"
import {
  TestPaymentView,
  type TestPaymentConfig,
} from "@/components/epay/test-payment"
import {
  MerchantOnecodeView,
  type OnecodeConfig,
} from "@/components/epay/merchant-onecode"
import {
  MerchantPlansView,
  type MerchantPlansConfig,
} from "@/components/epay/merchant-plans"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

type EpayView =
  | "admin-dashboard"
  | "admin-order"
  | "admin-resource"
  | "admin-form"
  | "admin-stats"
  | "admin-token"
  | "admin-maintenance"
  | "admin-settle-batch"
  | "admin-account"
  | "admin-group-purchase"
  | "admin-channel-config"
  | "admin-channel-editor"
  | "admin-channel-test"
  | "admin-totp"
  | "admin-batches"
  | "admin-roll-config"
  | "admin-shell"
  | "merchant-dashboard"
  | "merchant-onecode"
  | "merchant-plans"
  | "soft-download"
  | "merchant-shell"
  | "cashier"
  | "payment"
  | "public-home"
  | "test-payment"
  | "payment-status"
  | "transfer-confirm"
  | "gold-plan"
  | "legacy-auth"
  | "gateway-shell"
  | "installer-shell"
  | "public-legacy-shell"
  | "documentation-shell"
  | "pay-page"
  | "qr-checkout"
  | "admin-login"
  | "user-login"
  | "user-register"
  | "user-recovery"
type JsonObject = Record<string, unknown>

type CashierConfig = {
  tradeNo?: string
  sitename?: string
  other?: boolean
  order?: {
    name?: string
    addtime?: string
    money?: string
    realmoney?: string
  }
  paytype?: Array<{ id: string | number; name: string; showname: string }>
}

type EpayAppProps = {
  view: EpayView
  config?: JsonObject | CashierConfig
}

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  section?: string
  feature?: string
  external?: boolean
}

const sectionIcons: Record<string, React.ElementType> = {
  概览: LayoutDashboard,
  订单: FileText,
  结算: WalletCards,
  商户: Users,
  通道: CreditCard,
  设置: Settings,
  日志: ShieldCheck,
  收款: QrCode,
  账户: Store,
  套餐: PackageCheck,
  其他: Activity,
  帮助: BookOpen,
}

// 与 admin 原有入口保持对应，仅把一级菜单收成业务分组。
const adminNav: NavItem[] = [
  { section: "概览", label: "平台首页", href: "./", icon: LayoutDashboard },
  { section: "订单", label: "订单管理", href: "./order.php", icon: FileText },
  { label: "导出订单", href: "./export.php", icon: FileText },
  { label: "支付用户统计", href: "./buyerstat.php", icon: BarChart3 },
  { label: "黑名单管理", href: "./blacklist.php", icon: ShieldCheck },
  { label: "分账规则", href: "./ps_receiver.php", icon: Settings },
  { label: "分账记录", href: "./ps_order.php", icon: FileText },
  { section: "结算", label: "结算管理", href: "./slist.php", icon: PackageCheck },
  { label: "批量结算", href: "./settle.php", icon: PackageCheck },
  { label: "付款记录", href: "./transfer.php", icon: WalletCards },
  { label: "新增付款", href: "./transfer_add.php", icon: ArrowUpRight },
  { label: "创建红包", href: "./transfer_red.php", icon: WalletCards },
  { label: "付款统计", href: "./transfer_stat.php", icon: BarChart3 },
  { label: "导出付款记录", href: "./transfer_export.php", icon: FileText },
  { label: "批量转账", href: "./transfer_batch.php", icon: ArrowUpRight },
  {
    label: "安全发转账记录",
    href: "./satf_transfer.php",
    icon: ShieldCheck,
    feature: "satf",
  },
  { section: "商户", label: "用户列表", href: "./ulist.php", icon: Users },
  { label: "用户组设置", href: "./glist.php", icon: Users },
  { label: "用户组购买", href: "./group.php", icon: Store },
  { label: "资金明细", href: "./record.php", icon: BarChart3 },
  { label: "支付统计", href: "./ustat.php", icon: Activity },
  {
    label: "授权域名",
    href: "./domain.php",
    icon: ShieldCheck,
    feature: "domain",
  },
  {
    label: "邀请码管理",
    href: "./invitecode.php",
    icon: ShieldCheck,
    feature: "invitecode",
  },
  { section: "通道", label: "支付通道", href: "./pay_channel.php", icon: CreditCard },
  { label: "支付方式", href: "./pay_type.php", icon: CreditCard },
  { label: "支付插件", href: "./pay_plugin.php", icon: PackageCheck },
  { label: "支付通道轮询", href: "./pay_roll.php", icon: RefreshCw },
  { label: "公众号小程序", href: "./pay_weixin.php", icon: ShieldCheck },
  {
    label: "进件渠道管理",
    href: "./applyments_channel.php",
    icon: Store,
    feature: "applyments",
  },
  {
    label: "进件商户管理",
    href: "./applyments_merchant.php",
    icon: Store,
    feature: "applyments",
  },
  { label: "企业微信账号", href: "./pay_wework.php", icon: Store },
  { section: "设置", label: "网站信息", href: "./set.php?mod=site", icon: Settings },
  { label: "支付配置", href: "./set.php?mod=pay", icon: CreditCard },
  { label: "风控配置", href: "./set.php?mod=risk", icon: ShieldCheck },
  { label: "结算规则", href: "./set.php?mod=settle", icon: PackageCheck },
  { label: "转账付款", href: "./set.php?mod=transfer", icon: WalletCards },
  { label: "快捷登录", href: "./set.php?mod=oauth", icon: Users },
  { label: "消息提醒", href: "./set.php?mod=notice", icon: Bell },
  { label: "实名认证", href: "./set.php?mod=certificate", icon: ShieldCheck },
  { label: "网站公告", href: "./gonggao.php", icon: FileText },
  { label: "首页模板", href: "./set.php?mod=template", icon: Store },
  { label: "邮箱短信", href: "./set.php?mod=mail", icon: FileText },
  { label: "网站 Logo", href: "./set.php?mod=upimg", icon: ArrowUpRight },
  { label: "计划任务", href: "./set.php?mod=cron", icon: RefreshCw },
  { label: "中转代理", href: "./set.php?mod=proxy", icon: ShieldCheck },
  { label: "微信客服支付", href: "./set_wxkf.php", icon: Store },
  { label: "管理员账户", href: "./set.php?mod=account", icon: Users },
  { label: "TOTP 二次验证", href: "./set_totp.php", icon: ShieldCheck },
  { section: "日志", label: "风控记录", href: "./risk.php", icon: ShieldCheck },
  { label: "登录日志", href: "./log.php", icon: FileText },
  { label: "数据清理", href: "./clean.php", icon: RefreshCw },
  { label: "获取用户标识", href: "./gettoken.php", icon: ShieldCheck },
  {
    label: "支付交易投诉",
    href: "./complain.php",
    icon: MessageCircle,
    feature: "complain",
  },
  {
    label: "渠道商户违规记录",
    href: "./mchrisk.php",
    icon: ShieldCheck,
    feature: "mchrisk",
  },
]

const merchantNav: NavItem[] = [
  { section: "概览", label: "工作台", href: "./", icon: LayoutDashboard },
  { section: "收款", label: "收款通道", href: "./channel.php", icon: QrCode },
  { label: "软件下载", href: "./softdown.php", icon: Download },
  {
    label: "聚合收款",
    href: "./onecode.php",
    icon: CreditCard,
    feature: "onecode",
  },
  { section: "订单", label: "订单记录", href: "./order.php", icon: FileText },
  { label: "结算记录", href: "./settle.php", icon: PackageCheck },
  { label: "资金明细", href: "./record.php", icon: BarChart3 },
  {
    label: "申请提现",
    href: "./apply.php",
    icon: ArrowUpRight,
    feature: "withdraw",
  },
  {
    label: "余额充值",
    href: "./recharge.php",
    icon: CircleDollarSign,
    feature: "recharge",
  },
  {
    section: "套餐",
    label: "套餐购买",
    href: "./groupbuy.php",
    icon: PackageCheck,
    feature: "groupbuy",
  },
  {
    section: "账户",
    label: "API 信息",
    href: "./userinfo.php?mod=api",
    icon: ShieldCheck,
  },
  { label: "修改资料", href: "./editinfo.php", icon: Store },
  { label: "修改密码", href: "./userinfo.php?mod=account", icon: Settings },
  {
    label: "实名认证",
    href: "./certificate.php",
    icon: ShieldCheck,
    feature: "cert",
  },
  {
    label: "保证金",
    href: "./deposit.php",
    icon: WalletCards,
    feature: "deposit",
  },
  {
    label: "授权域名",
    href: "./domain.php",
    icon: ShieldCheck,
    feature: "domain",
  },
  {
    section: "其他",
    label: "代付管理",
    href: "./transfer.php",
    icon: ArrowUpRight,
    feature: "transfer",
  },
  {
    label: "邀请返现",
    href: "./invite.php",
    icon: Users,
    feature: "invite",
  },
  {
    label: "交易投诉",
    href: "./complain.php",
    icon: MessageCircle,
    feature: "complain",
  },
  {
    label: "商户违规记录",
    href: "./mchrisk.php",
    icon: ShieldCheck,
    feature: "mchrisk",
  },
  { section: "帮助", label: "开发文档", href: "/doc.html", icon: BookOpen },
]

function featureEnabled(features: JsonObject, key: string, fallback = true) {
  const value = features[key]
  if (value === undefined) return fallback
  return value === true || value === 1 || value === "1"
}

function safeExternalHref(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return null
  try {
    const url = new URL(value, window.location.href)
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null
  } catch {
    return null
  }
}

function getVisibleNav(items: NavItem[], features: JsonObject) {
  return items.filter(
    (item) => !item.feature || featureEnabled(features, item.feature)
  )
}

function getMerchantNav(features: JsonObject) {
  const items = getVisibleNav(merchantNav, features)
  const externalItems: NavItem[] = []
  const qqGroup = safeExternalHref(features.qqqun)
  const appUrl = safeExternalHref(features.appurl)
  if (qqGroup) {
    externalItems.push({
      label: "产品QQ群",
      href: qqGroup,
      icon: Users,
      external: true,
    })
  }
  if (appUrl) {
    externalItems.push({
      label: "APP下载",
      href: appUrl,
      icon: ArrowUpRight,
      external: true,
    })
  }
  return [...items, ...externalItems]
}

function normalizeRoutePath(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/"
  return path.endsWith("/index.php") ? path.slice(0, -10) || "/" : path
}

function isNavItemActive(href: string) {
  if (typeof window === "undefined") return false
  const target = new URL(href, window.location.href)
  const current = new URL(window.location.href)
  if (
    normalizeRoutePath(target.pathname) !== normalizeRoutePath(current.pathname)
  ) {
    return false
  }
  return !target.search || target.search === current.search
}

function valueOf(
  data: JsonObject | null | undefined,
  key: string,
  fallback = "0"
) {
  const value = data?.[key]
  return value === null || value === undefined || value === ""
    ? fallback
    : String(value)
}

function objectOf(
  data: JsonObject | null | undefined,
  key: string
): JsonObject {
  const value = data?.[key]
  return value && typeof value === "object" ? (value as JsonObject) : {}
}

type NavGroup = {
  id: string
  label: string
  icon: React.ElementType
  items: NavItem[]
}

function groupNav(items: NavItem[]): NavGroup[] {
  const groups: NavGroup[] = []
  for (const item of items) {
    if (item.section || groups.length === 0) {
      const label = item.section || "其他"
      groups.push({
        id: label,
        label,
        icon: sectionIcons[label] || Settings,
        items: [item],
      })
    } else {
      groups[groups.length - 1].items.push(item)
    }
  }
  return groups
}

function Brand({
  compact = false,
  name = "Rainbow Pay",
  subtitle = "商户自收款",
  role,
}: {
  compact?: boolean
  name?: string
  subtitle?: string
  role?: string
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center",
        compact ? "justify-center" : "gap-2.5"
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Zap className="size-4" aria-hidden="true" />
      </div>
      {!compact && (
        <div className="min-w-0 leading-none">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold tracking-tight text-foreground">
              {name}
            </span>
            {role ? (
              <span className="inline-flex shrink-0 items-center rounded-md border border-border bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {role}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}

function NavLeaf({
  item,
  collapsed = false,
  onNavigate,
}: {
  item: NavItem
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const active = isNavItemActive(item.href)
  const Icon = item.icon
  const link = (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "h-9 rounded-lg font-normal transition-all duration-150",
        collapsed ? "size-9 justify-center px-0" : "w-full justify-start gap-2.5 px-2.5",
        active
          ? "bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary-foreground hover:bg-primary/15"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
    >
      <a
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
      >
        <Icon
          className={cn(
            "size-4 shrink-0 transition-colors",
            active ? "text-primary dark:text-primary-foreground" : "text-muted-foreground"
          )}
          aria-hidden="true"
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </a>
    </Button>
  )
  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}

function NavGroups({
  items,
  collapsed = false,
  onNavigate,
}: {
  items: NavItem[]
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const groups = React.useMemo(() => groupNav(items), [items])
  const [openIds, setOpenIds] = React.useState<string[]>(() => {
    const active = groups.find((group) => group.items.some((item) => isNavItemActive(item.href)))
    return [active?.id ?? groups[0]?.id].filter(Boolean) as string[]
  })

  const toggle = (id: string) => {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    )
  }

  return (
    <nav className="grid gap-1" aria-label="主导航">
      {groups.map((group) => {
        const GroupIcon = group.icon
        const single = group.items.length === 1
        const open = openIds.includes(group.id)
        const groupActive = group.items.some((item) => isNavItemActive(item.href))

        if (single) {
          return (
            <NavLeaf
              key={group.id}
              item={{ ...group.items[0], icon: GroupIcon }}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          )
        }

        if (collapsed) {
          return (
            <Popover key={group.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant={groupActive ? "secondary" : "ghost"}
                      className={cn(
                        "size-9 justify-center rounded-lg px-0",
                        groupActive && "bg-primary/10 text-primary dark:bg-primary/20"
                      )}
                      aria-label={group.label}
                    >
                      <GroupIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">{group.label}</TooltipContent>
              </Tooltip>
              <PopoverContent side="right" align="start" className="w-52 p-2">
                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <NavLeaf key={item.href} item={item} onNavigate={onNavigate} />
                ))}
              </PopoverContent>
            </Popover>
          )
        }

        return (
          <div key={group.id} className="grid gap-0.5">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-9 w-full justify-start gap-2.5 rounded-lg px-2.5 font-medium transition-all duration-150",
                groupActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
              onClick={() => toggle(group.id)}
              aria-expanded={open}
            >
              <GroupIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs font-semibold uppercase tracking-wider">{group.label}</span>
              <ChevronDown
                className={cn(
                  "ml-auto size-3.5 text-muted-foreground transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </Button>
            {open && (
              <div className="ml-3 grid gap-0.5 border-l border-border/60 pl-2">
                {group.items.map((item) => (
                  <NavLeaf key={item.href} item={item} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

/** Preserve the independent navigation scroll position across PHP page loads. */
function PersistentNavScrollArea({
  storageKey,
  className,
  children,
}: {
  storageKey: string
  className?: string
  children: React.ReactNode
}) {
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const viewport = rootRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    )
    if (!viewport) return

    const save = () => {
      try {
        sessionStorage.setItem(storageKey, String(viewport.scrollTop))
      } catch {
        // Storage can be unavailable in privacy-restricted browser contexts.
      }
    }

    let saved = 0
    try {
      saved = Number(sessionStorage.getItem(storageKey) || 0)
    } catch {
      saved = 0
    }
    if (saved > 0) {
      requestAnimationFrame(() => {
        viewport.scrollTop = saved
      })
    }

    viewport.addEventListener("scroll", save, { passive: true })
    window.addEventListener("pagehide", save)
    return () => {
      save()
      viewport.removeEventListener("scroll", save)
      window.removeEventListener("pagehide", save)
    }
  }, [storageKey])

  return (
    <div ref={rootRef} className={cn("min-h-0", className)}>
      <ScrollArea className="h-full overscroll-contain">{children}</ScrollArea>
    </div>
  )
}

function WorkspaceShell({
  children,
  kind,
  title,
  description,
  sitename = "Rainbow Pay",
  features,
  user,
}: {
  children: React.ReactNode
  kind: "admin" | "merchant"
  title: string
  description?: string
  sitename?: string
  features?: JsonObject
  user?: JsonObject
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === "dark"
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(() => {
    try {
      return localStorage.getItem("epay-sidebar-collapsed") === "1"
    } catch {
      return false
    }
  })
  const nav =
    kind === "admin"
      ? getVisibleNav(adminNav, features ?? {})
      : getMerchantNav(features ?? {})
  const subtitle = kind === "admin" ? "平台运营" : "商户自收款"
  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current
      try {
        localStorage.setItem("epay-sidebar-collapsed", next ? "1" : "0")
      } catch {
        // 隐私模式下忽略持久化。
      }
      return next
    })
  }

  const userObj = user || {}
  const displayName = String(
    userObj.username ||
      userObj.account ||
      (userObj.uid ? `商户 #${userObj.uid}` : kind === "admin" ? "超级管理员" : "商户账户")
  )
  const userSubtext =
    kind === "admin" ? "平台运营模式" : userObj.uid ? `UID: ${userObj.uid}` : "商户自收款"

  const accountMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 rounded-xl px-2 text-xs font-medium hover:bg-muted/80"
        >
          <Avatar className="size-6 ring-1 ring-border/80">
            <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
              {kind === "admin" ? "管" : "商"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-xs sm:inline font-medium max-w-28 truncate">
            {displayName}
          </span>
          <ChevronDown className="size-3 text-muted-foreground/60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-lg">
        <div className="flex items-center gap-2.5 px-2.5 py-2 border-b mb-1">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {kind === "admin" ? "AD" : "商户"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{userSubtext}</p>
          </div>
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="rounded-lg text-xs">
            <a href={kind === "admin" ? "./set.php?mod=account" : "editinfo.php"}>
              <Settings className="size-3.5" data-icon="inline-start" />
              账户设置
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-lg text-xs">
            <a href="/doc.html" target="_blank" rel="noreferrer">
              <FileText className="size-3.5" data-icon="inline-start" />
              开发文档
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="rounded-lg text-xs text-destructive focus:text-destructive"
          >
            <a href={kind === "admin" ? "./login.php?logout" : "login.php?logout"}>
              <LogOut className="size-3.5" data-icon="inline-start" />
              退出登录
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <TooltipProvider>
      <div className="flex min-h-svh bg-muted/30 text-foreground antialiased">
        <aside
          className={cn(
            "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
            collapsed ? "w-[72px]" : "w-[240px]"
          )}
        >
          <div
            className={cn(
              "flex h-14 items-center border-b border-border/60",
              collapsed ? "justify-center px-2" : "px-4"
            )}
          >
            <Brand
              compact={collapsed}
              name={sitename}
              subtitle={subtitle}
              role={kind === "admin" ? "管理端" : "商户版"}
            />
          </div>
          <PersistentNavScrollArea
            storageKey={`epay-nav-${kind}-desktop`}
            className={cn("min-h-0 flex-1", collapsed ? "px-2 py-3" : "px-3 py-3")}
          >
            <NavGroups items={nav} collapsed={collapsed} />
          </PersistentNavScrollArea>
          <div className={cn("border-t border-border/60 p-2", collapsed ? "px-2" : "px-3")}>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-9 rounded-lg",
                collapsed ? "w-full justify-center px-0" : "w-full justify-start gap-2"
              )}
              onClick={toggleCollapsed}
              aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <>
                  <PanelLeftClose className="size-4" />
                  <span>收起菜单</span>
                </>
              )}
            </Button>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-xl md:hidden"
                      aria-label="打开导航"
                    >
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] p-0">
                    <SheetHeader className="border-b px-5 py-4 text-left">
                      <SheetTitle>
                        <Brand name={sitename} subtitle={subtitle} />
                      </SheetTitle>
                      <SheetDescription>
                        {description || (kind === "admin" ? "平台运营" : "商户自收款与套餐管理")}
                      </SheetDescription>
                    </SheetHeader>
                    <PersistentNavScrollArea
                      storageKey={`epay-nav-${kind}-mobile`}
                      className="h-[calc(100vh-118px)] px-3 py-4"
                    >
                      <NavGroups items={nav} onNavigate={() => setMobileOpen(false)} />
                    </PersistentNavScrollArea>
                  </SheetContent>
                </Sheet>
                <nav
                  aria-label="面包屑"
                  className="flex min-w-0 items-center gap-1.5 text-sm leading-none"
                >
                  <span className="hidden text-muted-foreground sm:inline">
                    {kind === "admin" ? "管理控制台" : "商户中心"}
                  </span>
                  <ChevronRight className="hidden size-3.5 text-muted-foreground/40 sm:inline" />
                  <span className="truncate font-medium text-foreground">{title}</span>
                </nav>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-foreground sm:inline-flex"
                >
                  <a
                    href="/doc.html"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="打开开发文档"
                  >
                    <BookOpen className="size-3.5" />
                    <span>接口文档</span>
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-xl text-muted-foreground hover:text-foreground"
                  onClick={() => setTheme(dark ? "light" : "dark")}
                  aria-label={dark ? "切换亮色模式" : "切换暗色模式"}
                >
                  {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </Button>
                {accountMenu}
              </div>
            </div>
          </header>
          <main className="min-w-0 flex-1 px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-10 lg:px-8 lg:pt-9 lg:pb-12 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
  brandName = "Rainbow Pay",
}: {
  eyebrow?: string
  title: string
  description: string
  action?: React.ReactNode
  brandName?: string
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>{brandName}</span>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-snug">
          {description}
        </p>
      </div>
      {action && <div className="flex flex-wrap items-center gap-2 shrink-0">{action}</div>}
    </div>
  )
}

function LegacyContentSlot({ className }: { className?: string } = {}) {
  const flat = Boolean(className?.includes("epay-legacy-workspace-surface"))
  if (flat) {
    return (
      <div
        id="epay-react-legacy-slot"
        className={cn("epay-legacy-slot min-w-0", className)}
        aria-live="polite"
      />
    )
  }
  return (
    <Card className={cn("epay-legacy-card rounded-2xl shadow-sm", className)}>
      <CardHeader className="sr-only">
        <CardTitle>页面内容</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div
          id="epay-react-legacy-slot"
          className="min-w-0"
          aria-live="polite"
        />
      </CardContent>
    </Card>
  )
}

const merchantPageMeta: Record<string, string> = {
  订单记录: "查询、筛选与导出商户订单",
  结算记录: "查看提现申请与结算进度",
  资金明细: "余额变动与关联订单流水",
  申请提现: "将可用余额提现到收款账户",
  余额充值: "为账户充值，用于消费或退款",
  通道管理: "连接监控端并管理收款码",
  软件下载: "下载安卓监控端并完成配置",
  聚合收款: "一个码收多种支付方式",
  套餐购买: "购买适合你的服务套餐",
  个人资料: "查看与修改商户资料",
  实名认证: "完成商户实名认证",
  保证金管理: "查看与缴纳保证金",
  授权支付域名: "管理支付授权域名",
  代付管理: "发起与查询代付",
  邀请返现: "邀请商户获得返现",
}

const documentationNav: Array<{
  label: string
  href: string
  icon: React.ElementType
}> = [
  { label: "接口说明", href: "/doc/index.html", icon: BookOpen },
  { label: "签名规则", href: "/doc/sign_note.html", icon: ShieldCheck },
  { label: "支付方式", href: "/doc/paytype.html", icon: CreditCard },
  { label: "页面跳转支付", href: "/doc/pay_submit.html", icon: ArrowUpRight },
  { label: "统一下单接口", href: "/doc/pay_create.html", icon: FileText },
  { label: "订单查询", href: "/doc/pay_query.html", icon: FileText },
  { label: "支付结果通知", href: "/doc/pay_notify.html", icon: Activity },
  { label: "订单退款", href: "/doc/pay_refund.html", icon: WalletCards },
  {
    label: "订单退款查询",
    href: "/doc/pay_refundquery.html",
    icon: WalletCards,
  },
  { label: "关闭订单", href: "/doc/pay_close.html", icon: ShieldCheck },
  { label: "商户信息", href: "/doc/merchant_info.html", icon: Users },
  { label: "商户订单", href: "/doc/merchant_orders.html", icon: FileText },
  { label: "转账发起", href: "/doc/transfer_submit.html", icon: ArrowUpRight },
  { label: "转账查询", href: "/doc/transfer_query.html", icon: FileText },
  {
    label: "余额查询",
    href: "/doc/transfer_balance.html",
    icon: CircleDollarSign,
  },
  { label: "SDK 下载", href: "/doc/sdk.html", icon: PackageCheck },
  { label: "服务条款", href: "/agreement.html", icon: ShieldCheck },
  { label: "旧版接口文档", href: "/doc_old.html", icon: FileText },
  { label: "微信支付教程", href: "/wx.html", icon: CreditCard },
]

function DocumentationNav({
  active,
  onNavigate,
}: {
  active: string
  onNavigate?: () => void
}) {
  return (
    <nav className="grid gap-1" aria-label="开发文档目录">
      {documentationNav.map(({ label, href, icon: Icon }) => {
        const activeItem =
          href.endsWith(`${active}.html`) ||
          (active === "index" && href.endsWith("/index.html"))
        return (
          <Button
            key={href}
            asChild
            variant={activeItem ? "secondary" : "ghost"}
            className={cn(
              "h-10 justify-start gap-3 rounded-xl px-3 font-normal",
              activeItem && "font-medium"
            )}
          >
            <a href={href} onClick={onNavigate}>
              <Icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span>{label}</span>
            </a>
          </Button>
        )
      })}
    </nav>
  )
}

function safeDocumentationUrl(value: string | null, kind: "href" | "src") {
  if (!value) return undefined
  const url = value.trim()
  if (url.startsWith("#") || url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) return url
  if (kind === "href" && /^(https?:|mailto:)/i.test(url)) return url
  if (kind === "src" && /^https?:/i.test(url)) return url
  return undefined
}

function renderDocumentationChildren(node: Node, key: string): React.ReactNode[] {
  return Array.from(node.childNodes).map((child, index) =>
    renderDocumentationNode(child, `${key}-${index}`)
  )
}

function renderDocumentationNode(node: Node, key: string): React.ReactNode {
  if (node.nodeType === 3) return node.textContent
  if (node.nodeType !== 1) return null
  const element = node as HTMLElement
  const tag = element.tagName.toLowerCase()
  if (["script", "style", "link", "meta", "iframe", "object", "embed", "form", "input", "button", "textarea", "select"].includes(tag)) return null
  const children = renderDocumentationChildren(node, key)
  switch (tag) {
    case "h1":
      return <h2 key={key} className="scroll-mt-24 border-b pb-3 text-2xl font-semibold tracking-tight">{children}</h2>
    case "h2":
      return <h3 key={key} className="scroll-mt-24 pt-4 text-xl font-semibold tracking-tight">{children}</h3>
    case "h3":
      return <h4 key={key} className="scroll-mt-24 pt-3 text-lg font-semibold">{children}</h4>
    case "h4":
    case "h5":
    case "h6":
      return <h5 key={key} className="pt-2 text-base font-semibold">{children}</h5>
    case "p":
      return <p key={key} className="text-sm leading-7 text-foreground/90">{children}</p>
    case "ul":
      return <ul key={key} className="list-disc space-y-2 pl-6 text-sm leading-7">{children}</ul>
    case "ol":
      return <ol key={key} className="list-decimal space-y-2 pl-6 text-sm leading-7">{children}</ol>
    case "li":
      return <li key={key} className="pl-1">{children}</li>
    case "blockquote":
      return <blockquote key={key} className="border-l-2 pl-4 text-sm italic leading-7 text-muted-foreground">{children}</blockquote>
    case "pre":
      return <pre key={key} className="overflow-x-auto rounded-xl border bg-muted/50 p-4 font-mono text-xs leading-6 whitespace-pre-wrap break-words">{children}</pre>
    case "code":
      return <code key={key} className={element.parentElement?.tagName.toLowerCase() === "pre" ? "font-mono" : "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"}>{children}</code>
    case "table":
      return <div key={key} className="overflow-x-auto rounded-xl border"><Table>{children}</Table></div>
    case "thead":
      return <TableHeader key={key}>{children}</TableHeader>
    case "tbody":
      return <TableBody key={key}>{children}</TableBody>
    case "tfoot":
      return <tfoot key={key} className="border-t bg-muted/30">{children}</tfoot>
    case "tr":
      return <TableRow key={key}>{children}</TableRow>
    case "th":
      return <TableHead key={key}>{children}</TableHead>
    case "td":
      return <TableCell key={key} className="whitespace-normal break-words">{children}</TableCell>
    case "a": {
      const href = safeDocumentationUrl(element.getAttribute("href"), "href")
      return href ? <a key={key} href={href} className="font-medium underline underline-offset-4 hover:text-muted-foreground" target={/^https?:/i.test(href) ? "_blank" : undefined} rel={/^https?:/i.test(href) ? "noreferrer" : undefined}>{children}</a> : <span key={key}>{children}</span>
    }
    case "img": {
      const src = safeDocumentationUrl(element.getAttribute("src"), "src")
      return src ? <img key={key} src={src} alt={element.getAttribute("alt") ?? ""} loading="lazy" className="max-w-full rounded-xl border" /> : null
    }
    case "hr":
      return <Separator key={key} className="my-2" />
    case "br":
      return <br key={key} />
    case "strong":
    case "b":
      return <strong key={key}>{children}</strong>
    case "em":
    case "i":
      return <em key={key}>{children}</em>
    case "dl":
      return <div key={key} className="space-y-3">{children}</div>
    case "dt":
      return <dt key={key} className="font-medium">{children}</dt>
    case "dd":
      return <dd key={key} className="pl-4 text-sm leading-7 text-muted-foreground">{children}</dd>
    case "div":
    case "section":
    case "article":
    case "main":
    case "header":
    case "footer":
    case "figure":
    case "figcaption":
      return <div key={key} className="space-y-4">{children}</div>
    default:
      return <span key={key}>{children}</span>
  }
}

function DocumentationContent({ html }: { html: string }) {
  const nodes = React.useMemo(() => {
    if (!html || typeof DOMParser === "undefined") return []
    const container = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html").body.firstElementChild
    return container ? renderDocumentationChildren(container, "doc") : []
  }, [html])
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-base">文档正文</CardTitle>
        <CardDescription>内容已按统一的 shadcn 文档样式渲染。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-5 sm:p-8">
        {nodes.length ? nodes : <Alert><AlertTitle>暂无文档内容</AlertTitle><AlertDescription>该文档暂时没有可展示的正文。</AlertDescription></Alert>}
      </CardContent>
    </Card>
  )
}

function DocumentationShell({ config }: { config?: JsonObject }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const active = String(config?.doc ?? "index")
  const title = String(config?.title ?? "开发文档")
  const sitename = String(config?.sitename ?? "Rainbow Pay")
  const dark = resolvedTheme === "dark"

  return (
    <div className="min-h-svh bg-muted/30 text-foreground antialiased">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="打开文档目录"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[290px] p-0">
              <SheetHeader className="border-b px-5 py-4 text-left">
                <SheetTitle>
                  <Brand name={sitename} />
                </SheetTitle>
                <SheetDescription>快速浏览接口文档</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-118px)] px-4 py-5">
                <DocumentationNav
                  active={active}
                  onNavigate={() => setMobileOpen(false)}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="hidden md:block">
            <Brand name={sitename} />
          </div>
          <Separator
            orientation="vertical"
            className="mx-2 hidden h-6 md:block"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">开发文档</p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {sitename} API 与接入指南
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setTheme(dark ? "light" : "dark")}
              aria-label={dark ? "切换亮色模式" : "切换暗色模式"}
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button
              asChild
              variant="outline"
              className="hidden rounded-xl sm:inline-flex"
            >
              <a href="/">返回官网</a>
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r bg-background/60 p-4 md:block">
          <div className="mb-6 rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">
              文档中心
            </p>
            <p className="mt-1 font-semibold">{title}</p>
            <Badge
              variant="secondary"
              className="mt-3 gap-1.5 rounded-lg font-normal"
            >
              <BookOpen className="size-3.5" />
              持续更新
            </Badge>
          </div>
          <ScrollArea className="h-[calc(100vh-220px)] pr-2">
            <DocumentationNav active={active} />
          </ScrollArea>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <PageHeading
            eyebrow="开发文档"
            title={title}
            description="使用统一的接口规范接入收款、退款、商户与代付能力。"
            brandName={sitename}
          />
          <DocumentationContent html={String(config?.docHtml ?? "")} />
        </main>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue",
  loading = false,
}: {
  label: string
  value: string
  hint: string
  icon: React.ElementType
  tone?: "blue" | "green" | "amber" | "violet"
  loading?: boolean
}) {
  const toneStyles = {
    blue: {
      icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      badge: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
    green: {
      icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      badge: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    amber: {
      icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      badge: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    violet: {
      icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
      badge: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
    },
  }[tone]

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">{label}</p>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-28" />
          ) : (
            <p className="mt-2 truncate text-2xl lg:text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {value}
            </p>
          )}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium", toneStyles.badge)}>
              <ArrowUpRight className="size-3" />
              {hint}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105",
            toneStyles.icon
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  )
}

function FetchError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive" className="rounded-2xl">
      <AlertTitle>数据暂时无法加载</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center gap-3">
        请检查登录状态或稍后重试。
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw data-icon="inline-start" />
          重新加载
        </Button>
      </AlertDescription>
    </Alert>
  )
}

function AdminDashboard({ config }: { config?: JsonObject }) {
  const [data, setData] = React.useState<JsonObject | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [failed, setFailed] = React.useState(false)
  const load = React.useCallback(() => {
    setLoading(true)
    setFailed(false)
    fetch("ajax.php?act=getcount", { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error("request failed")
        return response.json() as Promise<JsonObject>
      })
      .then(setData)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [])
  React.useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  const order = objectOf(data, "order")
  const orderToday = objectOf(data, "order_today")
  const rows = Object.entries(order).slice(0, 7)
  const sitename = String(config?.sitename ?? "Rainbow Pay")
  const features = objectOf(config, "features")
  const user = objectOf(config, "user")
  return (
    <WorkspaceShell
      kind="admin"
      title="运营总览"
      description="管理商户自收款、套餐服务与支付通道"
      sitename={sitename}
      features={features}
      user={user}
    >
      <PageHeading
        title="运营总览"
        description="平台提供回调与监听服务，商户使用自己的收款码收款。"
        brandName={sitename}
        action={
          <Button onClick={load} variant="outline" className="rounded-xl shadow-xs">
            <RefreshCw data-icon="inline-start" />
            刷新数据
          </Button>
        }
      />
      {failed ? (
        <FetchError onRetry={load} />
      ) : loading && !data ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="订单总数"
              value={valueOf(data, "count1")}
              hint="较昨日持续更新"
              icon={FileText}
              tone="blue"
              loading={loading}
            />
            <StatCard
              label="商户数量"
              value={valueOf(data, "count2")}
              hint="活跃商户总数"
              icon={Users}
              tone="violet"
              loading={loading}
            />
            <StatCard
              label="平台总余额"
              value={`¥ ${valueOf(data, "usermoney")}`}
              hint="每小时同步一次"
              icon={CircleDollarSign}
              tone="green"
              loading={loading}
            />
            <StatCard
              label="今日成功率"
              value={`${valueOf(data, "success_rate")}%`}
              hint="今日订单统计"
              icon={Activity}
              tone="amber"
              loading={loading}
            />
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,.6fr)]">
            <Card className="rounded-2xl border-border/70 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-4">
                <div>
                  <CardTitle className="text-base font-semibold">近期开单趋势</CardTitle>
                  <CardDescription className="text-xs mt-0.5">按日期汇总的订单金额与笔数</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-lg font-normal text-xs">
                  自动更新
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs defaultValue="amount">
                  <TabsList className="mb-4 rounded-xl">
                    <TabsTrigger value="amount" className="rounded-lg text-xs">订单金额</TabsTrigger>
                    <TabsTrigger value="count" className="rounded-lg text-xs">订单数量</TabsTrigger>
                  </TabsList>
                  <TabsContent value="amount" className="mt-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="font-semibold text-xs py-3">日期</TableHead>
                          <TableHead className="text-right font-semibold text-xs py-3">订单金额</TableHead>
                          <TableHead className="text-right font-semibold text-xs py-3 pr-6">订单数</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.length ? (
                          rows.map(([date, row]) => (
                            <TableRow key={date} className="hover:bg-muted/40">
                              <TableCell className="font-medium text-sm py-3.5">
                                {date}
                              </TableCell>
                              <TableCell className="text-right font-medium text-sm tabular-nums py-3.5">
                                ¥ {valueOf(row as JsonObject, "all")}
                              </TableCell>
                              <TableCell className="text-right font-medium text-sm tabular-nums py-3.5 pr-6">
                                {valueOf(row as JsonObject, "count", "—")}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="h-28 text-center text-muted-foreground text-sm"
                            >
                              暂无趋势数据
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent value="count" className="mt-0">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(orderToday)
                        .slice(0, 6)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="rounded-xl border border-border/60 bg-muted/30 p-4"
                          >
                            <p className="text-xs text-muted-foreground font-medium">
                              {key}
                            </p>
                            <p className="mt-2 text-xl font-bold tabular-nums text-foreground">
                              {String(value)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-6">
              <Card className="rounded-2xl border-border/70 shadow-xs">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base font-semibold">快捷运营操作</CardTitle>
                  <CardDescription className="text-xs mt-0.5">常用管理入口与配置</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 pt-4">
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 justify-between rounded-xl hover:bg-muted/60 text-xs font-normal"
                  >
                    <a href="order.php">
                      <span className="flex items-center gap-2.5">
                        <FileText className="size-4 text-muted-foreground" />
                        所有订单记录
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 justify-between rounded-xl hover:bg-muted/60 text-xs font-normal"
                  >
                    <a href="ulist.php">
                      <span className="flex items-center gap-2.5">
                        <Users className="size-4 text-muted-foreground" />
                        商户列表管理
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 justify-between rounded-xl hover:bg-muted/60 text-xs font-normal"
                  >
                    <a href="pay_channel.php">
                      <span className="flex items-center gap-2.5">
                        <CreditCard className="size-4 text-muted-foreground" />
                        支付通道与插件
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 justify-between rounded-xl hover:bg-muted/60 text-xs font-normal"
                  >
                    <a href="settle.php">
                      <span className="flex items-center gap-2.5">
                        <WalletCards className="size-4 text-muted-foreground" />
                        结算与代付
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </WorkspaceShell>
  )
}

function ChannelIcon({
  name,
  showname,
  className,
}: {
  name?: string
  showname?: string
  className?: string
}) {
  const key = `${name || ""} ${showname || ""}`.toLowerCase()

  if (key.includes("ali") || key.includes("支付宝")) {
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#1677ff]/10 border border-[#1677ff]/20 shadow-xs",
          className
        )}
      >
        <img
          src="/assets/icon/alipay.ico"
          alt="支付宝"
          className="size-4.5 object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLElement).style.display = "none"
          }}
        />
      </div>
    )
  }
  if (key.includes("wx") || key.includes("wechat") || key.includes("微信")) {
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#07c160]/10 border border-[#07c160]/20 shadow-xs",
          className
        )}
      >
        <img
          src="/assets/icon/wxpay.ico"
          alt="微信支付"
          className="size-4.5 object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLElement).style.display = "none"
          }}
        />
      </div>
    )
  }
  if (
    key.includes("usdt") ||
    key.includes("trc") ||
    key.includes("bep") ||
    key.includes("erc") ||
    key.includes("polygon")
  ) {
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#26A17B]/10 border border-[#26A17B]/20 shadow-xs",
          className
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5 shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#26A17B" />
          <path
            fill="#FFFFFF"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.435 12.355v-.002c-.068.005-.38.024-1.398.024-.803 0-1.258-.017-1.396-.024v.002C7.79 12.227 5.7 11.66 5.7 10.978c0-.684 2.09-1.25 4.94-1.378v2.188c.138.01.602.035 1.417.035.975 0 1.312-.027 1.377-.035V9.6c2.846.128 4.933.694 4.933 1.377 0 .683-2.087 1.25-4.932 1.378zm0-3.036V7.78h3.94V5.4H6.697v2.38h3.94v1.54c-3.23.148-5.637.848-5.637 1.68 0 .83 2.408 1.53 5.637 1.68v5.92h2.798v-5.92c3.224-.15 5.628-.85 5.628-1.68 0-.832-2.404-1.532-5.628-1.68z"
          />
        </svg>
      </div>
    )
  }
  if (key.includes("bank") || key.includes("银联") || key.includes("银行") || key.includes("网银")) {
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 shadow-xs",
          className
        )}
      >
        <img
          src="/assets/icon/bank.ico"
          alt="银联"
          className="size-4.5 object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLElement).style.display = "none"
          }}
        />
      </div>
    )
  }
  if (key.includes("jd") || key.includes("京东")) {
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 shadow-xs",
          className
        )}
      >
        <img
          src="/assets/icon/jdpay.ico"
          alt="京东支付"
          className="size-4.5 object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLElement).style.display = "none"
          }}
        />
      </div>
    )
  }
  if (key.includes("douyin") || key.includes("抖音")) {
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20 shadow-xs",
          className
        )}
      >
        <img
          src="/assets/icon/douyinpay.ico"
          alt="抖音支付"
          className="size-4.5 object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLElement).style.display = "none"
          }}
        />
      </div>
    )
  }
  if (key.includes("paypal")) {
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-600/20 shadow-xs",
          className
        )}
      >
        <img
          src="/assets/icon/paypal.ico"
          alt="PayPal"
          className="size-4.5 object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLElement).style.display = "none"
          }}
        />
      </div>
    )
  }
  if (key.includes("ecny") || key.includes("数字人民币")) {
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-600/10 border border-red-600/20 shadow-xs",
          className
        )}
      >
        <img
          src="/assets/icon/ecny.ico"
          alt="数字人民币"
          className="size-4.5 object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLElement).style.display = "none"
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs",
        className
      )}
    >
      <CreditCard className="size-4" />
    </div>
  )
}

function MerchantDashboard({ config }: { config?: JsonObject }) {
  const [data, setData] = React.useState<JsonObject | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [failed, setFailed] = React.useState(false)
  const load = React.useCallback(() => {
    setLoading(true)
    setFailed(false)
    fetch("ajax2.php?act=getcount", { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error("request failed")
        return response.json() as Promise<JsonObject>
      })
      .then((count) => setData({ ...count, money: config?.money ?? "0.00" }))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [config?.money])
  React.useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  const channels = (
    Array.isArray(data?.channels) ? (data?.channels as JsonObject[]) : []
  ).filter((channel) => {
    const name = String(channel.name ?? "").toLowerCase()
    const showname = String(channel.showname ?? "")
    return (
      !name.includes("qq") &&
      !showname.includes("QQ") &&
      !showname.includes("qq")
    )
  })
  const sitename = String(config?.sitename ?? "Rainbow Pay")
  const features = objectOf(config, "features")
  const user = objectOf(config, "user")
  return (
    <WorkspaceShell
      kind="merchant"
      title="工作台"
      description="用自己的收款码收款，平台负责订单回调"
      sitename={sitename}
      features={features}
      user={user}
    >
      <PageHeading
        title="欢迎回来"
        description="钱直接进入你的微信 / 支付宝，购买套餐后即可获得订单回调服务。"
        brandName={sitename}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" className="rounded-xl shadow-xs">
              <a href="channel.php">
                <QrCode data-icon="inline-start" />
                通道管理
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-xl shadow-xs">
              <a href="userinfo.php?mod=api">
                <ShieldCheck data-icon="inline-start" />
                API 信息
              </a>
            </Button>
            {featureEnabled(features, "groupbuy") && (
              <Button asChild variant="outline" className="rounded-xl shadow-xs">
                <a href="groupbuy.php">
                  <PackageCheck data-icon="inline-start" />
                  套餐购买
                </a>
              </Button>
            )}
            <Button asChild className="rounded-xl shadow-sm">
              <a href="order.php">查看订单</a>
            </Button>
          </div>
        }
      />
      {failed ? (
        <FetchError onRetry={load} />
      ) : loading && !data ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="账户余额"
              value={`¥ ${valueOf(data, "money", "0.00")}`}
              hint="商户账户余额"
              icon={CircleDollarSign}
              tone="blue"
              loading={loading}
            />
            <StatCard
              label="已结算余额"
              value={`¥ ${valueOf(data, "settle_money", "0.00")}`}
              hint="累计结算金额"
              icon={WalletCards}
              tone="green"
              loading={loading}
            />
            <StatCard
              label="订单总数"
              value={valueOf(data, "orders")}
              hint="历史累计"
              icon={FileText}
              tone="violet"
              loading={loading}
            />
            <StatCard
              label="今日订单"
              value={valueOf(data, "orders_today")}
              hint="今日实时统计"
              icon={Activity}
              tone="amber"
              loading={loading}
            />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
            <Card className="rounded-2xl border-border/70 shadow-xs">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">支付渠道表现</CardTitle>
                    <CardDescription className="text-xs mt-0.5">各渠道今日收入、成功率与费率</CardDescription>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg text-xs text-muted-foreground">
                    <a href="channel.php">管理渠道</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold text-xs py-3">渠道</TableHead>
                      <TableHead className="font-semibold text-xs py-3">今日收入</TableHead>
                      <TableHead className="font-semibold text-xs py-3">成功率</TableHead>
                      <TableHead className="text-right font-semibold text-xs py-3 pr-6">费率</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channels.length ? (
                      channels.map((channel) => (
                        <TableRow key={String(channel.name)} className="hover:bg-muted/40">
                          <TableCell className="py-3.5">
                            <div className="flex items-center gap-3">
                              <ChannelIcon
                                name={String(channel.name ?? "")}
                                showname={String(channel.showname ?? "")}
                              />
                              <span className="font-semibold text-sm text-foreground">
                                {String(
                                  channel.showname ?? channel.name ?? "渠道"
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-sm tabular-nums py-3.5">
                            ¥ {String(channel.order_today ?? "0")}
                          </TableCell>
                          <TableCell className="py-3.5">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "rounded-md font-medium text-xs tabular-nums",
                                Number(channel.success_rate || 0) >= 80
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : Number(channel.success_rate || 0) > 0
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {String(channel.success_rate ?? "0")} %
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm tabular-nums py-3.5 pr-6">
                            {String(channel.rate ?? "0")} %
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-28 text-center text-muted-foreground text-sm"
                        >
                          暂无渠道数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/70 shadow-xs">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-semibold">账户状态与快捷操作</CardTitle>
                <CardDescription className="text-xs mt-0.5">保持资料完整，收款更顺畅</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-4">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-900 dark:text-emerald-200">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">商户服务运行正常</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      收款、监听与回调功能均已开启
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 w-full justify-between rounded-xl hover:bg-muted/60 text-xs font-normal"
                  >
                    <a href="editinfo.php">
                      <span className="flex items-center gap-2.5">
                        <Settings className="size-4 text-muted-foreground" />
                        完善商户资料
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 w-full justify-between rounded-xl hover:bg-muted/60 text-xs font-normal"
                  >
                    <a href="settle.php">
                      <span className="flex items-center gap-2.5">
                        <PackageCheck className="size-4 text-muted-foreground" />
                        查看结算记录
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 w-full justify-between rounded-xl hover:bg-muted/60 text-xs font-normal"
                  >
                    <a href="./record.php">
                      <span className="flex items-center gap-2.5">
                        <BarChart3 className="size-4 text-muted-foreground" />
                        查看资金明细
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                    </a>
                  </Button>
                  {featureEnabled(features, "withdraw") && (
                    <Button
                      asChild
                      variant="outline"
                      className="h-10 w-full justify-between rounded-xl hover:bg-muted/60 text-xs font-normal"
                    >
                      <a href="./apply.php">
                        <span className="flex items-center gap-2.5">
                          <ArrowUpRight className="size-4 text-muted-foreground" />
                          申请提现
                        </span>
                        <ChevronRight className="size-3.5 text-muted-foreground/60" />
                      </a>
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 w-full justify-between rounded-xl hover:bg-muted/60 text-xs font-normal"
                  >
                    <a href="./userinfo.php?mod=account">
                      <span className="flex items-center gap-2.5">
                        <ShieldCheck className="size-4 text-muted-foreground" />
                        修改安全密码
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </WorkspaceShell>
  )
}

function CashierView({ config }: { config?: CashierConfig }) {
  const order = config?.order ?? {}
  const types = config?.paytype ?? []
  const [selected, setSelected] = React.useState(String(types[0]?.id ?? ""))
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")
  const goBack = () => {
    try {
      if (
        document.referrer &&
        new URL(document.referrer).origin === window.location.origin
      ) {
        window.history.back()
        return
      }
    } catch {
      // 直接打开收银台时回到官网。
    }
    window.location.assign("/")
  }
  const submit = () => {
    if (!selected) {
      setError("请选择一种支付方式")
      return
    }
    setSubmitting(true)
    setError("")
    window.location.href = `/submit2.php?typeid=${encodeURIComponent(selected)}&trade_no=${encodeURIComponent(config?.tradeNo ?? "")}`
  }
  return (
    <div className="min-h-svh bg-muted/30 px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Brand name={config?.sitename ?? "Rainbow Pay"} />
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="secondary" className="rounded-lg font-normal">
              安全收银台
            </Badge>
          </div>
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <ShieldCheck className="size-4 text-primary" />
            支付过程已加密
          </div>
        </header>
        {config?.other ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:p-7">
              <Alert className="rounded-2xl">
                <AlertTitle>当前支付方式暂时维护</AlertTitle>
                <AlertDescription>
                  请返回并选择其他可用支付方式。
                </AlertDescription>
              </Alert>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl"
                onClick={goBack}
              >
                返回上一页
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">确认订单</CardTitle>
              <CardDescription>请核对订单信息后选择支付方式</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-7">
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">商品名称</span>
                  <span className="max-w-[230px] truncate font-medium">
                    {order.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">订单号</span>
                  <span className="max-w-[230px] truncate font-mono text-xs">
                    {config?.tradeNo || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>{order.addtime || "—"}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-primary/5 px-5 py-4 text-right">
                <p className="text-xs text-muted-foreground">需支付金额</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-primary">
                  ¥ {order.realmoney || order.money || "0.00"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {!config?.other && (
          <>
            <Card className="mt-5 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">选择支付方式</CardTitle>
                <CardDescription>
                  选择一种方式完成付款，支付过程由对应平台安全处理。
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
                {types.map((type) => (
                  <Button
                    variant={
                      selected === String(type.id) ? "secondary" : "outline"
                    }
                    type="button"
                    key={String(type.id)}
                    aria-pressed={selected === String(type.id)}
                    onClick={() => setSelected(String(type.id))}
                    className={cn(
                      "group flex h-auto min-h-16 w-full items-center gap-3 rounded-xl p-4 text-left whitespace-normal transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm",
                      selected === String(type.id) &&
                        "border-primary ring-2 ring-primary/15"
                    )}
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <CreditCard className="size-5" />
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {type.showname}
                    </span>
                    {selected === String(type.id) && (
                      <Check className="size-4 text-primary" />
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>
            <div className="mt-5 flex flex-col items-stretch gap-3 rounded-2xl border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                请按提示金额原样支付，避免无法到账
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  支付{" "}
                  <strong className="text-lg text-primary">
                    ¥ {order.realmoney || order.money || "0.00"}
                  </strong>
                </span>
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="h-11 rounded-xl px-6"
                >
                  {submitting ? (
                    <Loader2
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                  ) : null}
                  {submitting ? "正在跳转" : "立即支付"}
                </Button>
              </div>
            </div>
            {error && (
              <p className="mt-3 text-center text-sm text-destructive">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PaymentView() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>支付确认</CardTitle>
          <CardDescription>请使用收银台完成支付。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full rounded-xl">
            <a href="/">返回首页</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function EpayApp({ view, config }: EpayAppProps) {
  const shellConfig =
    config && typeof config === "object" ? (config as JsonObject) : {}
  const shellTitle = String(shellConfig.title ?? "")
  if (
    view === "admin-login" ||
    view === "user-login" ||
    view === "user-register" ||
    view === "user-recovery"
  )
    return <AuthView mode={view} config={config as JsonObject | undefined} />
  if (view === "public-home")
    return <PublicHomeView config={config as JsonObject | undefined} />
  if (view === "test-payment")
    return <TestPaymentView config={config as TestPaymentConfig | undefined} />
  if (view === "payment-status")
    return (
      <PaymentStatusView config={config as PaymentStatusConfig | undefined} />
    )
  if (view === "gold-plan")
    return <GoldPlanView config={config as GoldPlanConfig | undefined} />
  if (view === "legacy-auth")
    return <LegacyAuthShell config={config as LegacyShellConfig | undefined} />
  if (view === "gateway-shell")
    return <GatewayShell config={config as LegacyShellConfig | undefined} />
  if (view === "installer-shell")
    return <InstallerShell config={config as LegacyShellConfig | undefined} />
  if (view === "public-legacy-shell")
    return (
      <PublicLegacyShell config={config as LegacyShellConfig | undefined} />
    )
  if (view === "transfer-confirm")
    return (
      <TransferConfirmView
        config={config as TransferConfirmConfig | undefined}
      />
    )
  if (view === "documentation-shell")
    return <DocumentationShell config={config as JsonObject | undefined} />
  if (view === "pay-page")
    return <PayPageView config={config as PayPageConfig | undefined} />
  if (view === "qr-checkout")
    return <QrCheckoutView config={config as QrCheckoutConfig | undefined} />
  if (view === "merchant-dashboard")
    return <MerchantDashboard config={config as JsonObject | undefined} />
  if (view === "merchant-onecode")
    return (
      <WorkspaceShell
        kind="merchant"
        title="聚合收款"
        description="统一管理收款二维码与分享链接"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
        user={objectOf(shellConfig, "user")}
      >
        <MerchantOnecodeView config={config as OnecodeConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "merchant-plans")
    return (
      <WorkspaceShell
        kind="merchant"
        title="套餐购买"
        description="选择适合你的回调监听服务套餐"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
        user={objectOf(shellConfig, "user")}
      >
        <MerchantPlansView config={config as MerchantPlansConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "soft-download") {
    const softConfig = (config ?? {}) as SoftDownloadConfig & JsonObject
    return (
      <WorkspaceShell
        kind="merchant"
        title="软件下载"
        description="下载安卓监控端，配置后自动回调到账"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
        user={objectOf(shellConfig, "user")}
      >
        <SoftDownloadView config={softConfig} />
      </WorkspaceShell>
    )
  }
  if (view === "admin-order")
    return (
      <WorkspaceShell
        kind="admin"
        title="订单管理"
        description="查询、核对并处理平台订单"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminOrderView config={config as AdminOrderConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-resource")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "平台管理"}
        description="统一管理平台数据与运营配置"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminResourceView config={config as AdminResourceConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-form")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "平台配置"}
        description="统一维护平台运营配置"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminFormView config={config as AdminFormConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-stats")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "数据统计"}
        description="按条件查询平台统计数据"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminStatsView config={config as AdminFormConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-token")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "获取用户标识"}
        description="生成 OAuth 与 OpenID 授权链接"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminTokenView config={config as AdminTokenConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-maintenance")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "系统维护"}
        description="执行缓存和历史数据维护"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminMaintenanceView config={config as AdminMaintenanceConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-settle-batch")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "批量结算"}
        description="逐笔处理待结算记录"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminSettlementBatchView config={config as AdminSettlementBatchConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-account")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "管理员账户设置"}
        description="分别维护后台登录凭据和支付密码"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminAccountView config={config as AdminAccountConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-group-purchase")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "用户组购买设置"}
        description="控制用户组购买开关与商品规则"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminGroupPurchaseView config={config as AdminGroupPurchaseConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-channel-config")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "支付通道密钥配置"}
        description="使用支付插件字段维护通道配置"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminChannelConfigView config={config as AdminChannelConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-channel-editor")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "支付通道"}
        description="选择支付方式、插件并完成通道配置"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminChannelEditorView config={config as AdminChannelEditorConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-channel-test")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "测试支付"}
        description="创建测试订单并验证支付通道"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminChannelTestView config={config as AdminChannelTestConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-totp")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "TOTP 二次验证"}
        description="保护管理员登录凭据"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminTotpView config={config as AdminTotpConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-batches")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "批量结算"}
        description="生成、导出并处理结算批次"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminBatchView config={config as AdminBatchConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "admin-roll-config")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "配置轮询通道"}
        description="维护轮询组的通道顺序和权重"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
      >
        <AdminRollConfigView config={config as AdminRollConfig | undefined} />
      </WorkspaceShell>
    )
  if (view === "merchant-shell") {
    const pageTitle = shellTitle || "商户工作台"
    const pageDescription =
      String(shellConfig.description ?? "") ||
      merchantPageMeta[pageTitle] ||
      "商户自收款、回调监听与套餐管理"
    return (
      <WorkspaceShell
        kind="merchant"
        title={pageTitle}
        description={pageDescription}
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
        user={objectOf(shellConfig, "user")}
      >
        <PageHeading
          title={pageTitle}
          description={pageDescription}
          brandName={String(shellConfig.sitename ?? "Rainbow Pay")}
        />
        <LegacyContentSlot className="epay-legacy-workspace-surface" />
      </WorkspaceShell>
    )
  }
  if (view === "cashier")
    return <CashierView config={config as CashierConfig | undefined} />
  if (view === "payment") return <PaymentView />
  if (view === "admin-shell")
    return (
      <WorkspaceShell
        kind="admin"
        title={shellTitle || "平台运营"}
        description="管理商户自收款、回调监听与通道配置"
        sitename={String(shellConfig.sitename ?? "Rainbow Pay")}
        features={objectOf(shellConfig, "features")}
        user={objectOf(shellConfig, "user")}
      >
        <LegacyContentSlot className="epay-legacy-workspace-surface" />
      </WorkspaceShell>
    )
  return <AdminDashboard config={config as JsonObject | undefined} />
}
