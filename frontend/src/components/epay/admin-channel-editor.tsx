import * as React from "react"
import { ArrowLeft, Loader2, RefreshCw, Save } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type JsonObject = Record<string, unknown>
type PaymentType = { id: number | string; name: string; showname: string; status: number; virtual?: boolean }
type PaymentPlugin = { name: string; showname: string; types: string }
type DynamicField = { key: string; label: string; type?: string; value?: unknown; note?: string; options?: unknown; required?: boolean }
type Notice = { kind: "success" | "error"; text: string }

export type AdminChannelEditorConfig = {
  title?: string
  description?: string
  sitename?: string
  csrf_token?: string
  channelId?: number | string
  action?: "add" | "edit" | "copy"
}

const EMPTY = "__empty"

function options(value: unknown) {
  if (!value || typeof value !== "object") return []
  return Object.entries(value as Record<string, unknown>).map(([key, label]) => ({ value: key, label: String(label) }))
}

async function readResponse(response: Response) {
  const data = (await response.json().catch(() => ({}))) as JsonObject
  if (!response.ok || (data.code !== undefined && ![0, 200].includes(Number(data.code)))) throw new Error(String(data.msg ?? "请求失败"))
  return data
}

export function AdminChannelEditorView({ config = {} }: { config?: AdminChannelEditorConfig }) {
  const action = config.action ?? "add"
  const channelId = String(config.channelId ?? "0")
  const [types, setTypes] = React.useState<PaymentType[]>([])
  const [plugins, setPlugins] = React.useState<PaymentPlugin[]>([])
  const [fields, setFields] = React.useState<DynamicField[]>([])
  const [values, setValues] = React.useState<Record<string, string>>({
    name: "", type: "", plugin: "", mode: "0", rate: "100", costrate: "", paymin: "", paymax: "", daytop: "0", daymaxorder: "0", timestart: "", timestop: "",
  })
  const [pluginValues, setPluginValues] = React.useState<Record<string, string | string[]>>({})
  const [enableType, setEnableType] = React.useState(true)
  const [loading, setLoading] = React.useState(true)
  const [schemaLoading, setSchemaLoading] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [notice, setNotice] = React.useState<Notice | null>(null)

  const selectedType = types.find((item) => String(item.id) === values.type)
  const availablePlugins = plugins.filter((plugin) => plugin.types.split(",").map((item) => item.trim()).includes(selectedType?.name ?? ""))

  const applyPayload = React.useCallback((payload: JsonObject, initialize: boolean) => {
    const nextTypes = Array.isArray(payload.types) ? payload.types as PaymentType[] : []
    const nextPlugins = Array.isArray(payload.plugins) ? payload.plugins as PaymentPlugin[] : []
    const nextFields = Array.isArray(payload.fields) ? payload.fields as DynamicField[] : []
    setTypes(nextTypes.map((item) => ({ ...item, id: String(item.id).startsWith("new:") ? String(item.id) : Number(item.id), status: Number(item.status) })))
    setPlugins(nextPlugins)
    setFields(nextFields)
    setPluginValues(Object.fromEntries(nextFields.map((field) => [field.key, Array.isArray(field.value) ? field.value.map(String) : String(field.value ?? "")])))
    if (!initialize) return
    const channel = payload.channel && typeof payload.channel === "object" ? payload.channel as JsonObject : {}
    const typeValue = String(channel.type ?? "")
    const type = nextTypes.find((item) => String(item.id) === typeValue)
    setEnableType(type ? Number(type.status) === 1 : true)
    setValues({
      name: `${String(channel.name ?? "")}${action === "copy" ? " 副本" : ""}`,
      type: typeValue,
      plugin: String(channel.plugin ?? ""),
      mode: String(channel.mode ?? "0"),
      rate: String(channel.rate ?? "100"),
      costrate: String(channel.costrate ?? ""),
      paymin: String(channel.paymin ?? ""),
      paymax: String(channel.paymax ?? ""),
      daytop: String(channel.daytop ?? "0"),
      daymaxorder: String(channel.daymaxorder ?? "0"),
      timestart: String(channel.timestart ?? ""),
      timestop: String(channel.timestop ?? ""),
    })
  }, [action])

  const load = React.useCallback(async (initialize = false, type = values.type, plugin = values.plugin) => {
    if (initialize) setLoading(true)
    else setSchemaLoading(true)
    setNotice(null)
    try {
      const query = new URLSearchParams({ id: channelId })
      if (type) query.set("type", type)
      if (plugin) query.set("plugin", plugin)
      const data = await readResponse(await fetch(`ajax_pay.php?act=channelEditorInfo&${query}`, { credentials: "same-origin" }))
      applyPayload((data.data && typeof data.data === "object" ? data.data : {}) as JsonObject, initialize)
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "加载通道信息失败" })
    } finally {
      if (initialize) setLoading(false)
      else setSchemaLoading(false)
    }
  }, [applyPayload, channelId, values.plugin, values.type])

  React.useEffect(() => { const timer = window.setTimeout(() => void load(true), 0); return () => window.clearTimeout(timer) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const changeType = (typeId: string) => {
    const type = types.find((item) => String(item.id) === typeId)
    setValues((current) => ({ ...current, type: typeId, plugin: "" }))
    setEnableType(type ? Number(type.status) === 1 : true)
    setFields([])
    setPluginValues({})
  }

  const changePlugin = (plugin: string) => {
    setValues((current) => ({ ...current, plugin }))
    setFields([])
    setPluginValues({})
    if (plugin) void load(false, values.type, plugin)
  }

  const updatePluginValue = (key: string, value: string | string[]) => setPluginValues((current) => ({ ...current, [key]: value }))

  const dynamicControl = (field: DynamicField) => {
    const value = pluginValues[field.key] ?? (field.type === "checkbox" ? [] : "")
    if (field.type === "checkbox") return <div className="flex min-h-10 flex-wrap gap-4 rounded-md border px-3 py-2">{options(field.options).map((option) => { const selected = Array.isArray(value) && value.includes(option.value); return <label key={option.value} className="flex items-center gap-2 text-sm"><Checkbox checked={selected} onCheckedChange={(checked) => { const current = Array.isArray(value) ? value : []; updatePluginValue(field.key, checked === true ? [...current, option.value] : current.filter((item) => item !== option.value)) }} />{option.label}</label> })}</div>
    if (field.type === "select") return <Select value={String(value || EMPTY)} onValueChange={(next) => updatePluginValue(field.key, next === EMPTY ? "" : next)}><SelectTrigger className="w-full"><SelectValue placeholder={`选择${field.label}`} /></SelectTrigger><SelectContent><SelectGroup>{options(field.options).map((option) => <SelectItem key={option.value || EMPTY} value={option.value || EMPTY}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select>
    if (field.type === "textarea") return <Textarea value={String(value)} onChange={(event) => updatePluginValue(field.key, event.target.value)} placeholder={field.note} />
    return <Input value={String(value)} onChange={(event) => updatePluginValue(field.key, event.target.value)} placeholder={field.note} type={/secret|key|token|password/i.test(`${field.key} ${field.label}`) ? "password" : "text"} />
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.type || !values.plugin) { setNotice({ kind: "error", text: "请先选择支付方式和支付插件" }); return }
    if (!values.name.trim()) { setNotice({ kind: "error", text: "请填写通道名称" }); return }
    setPending(true); setNotice(null)
    try {
      const body = new URLSearchParams({ csrf_token: String(config.csrf_token ?? ""), action, id: channelId, enable_type: enableType ? "1" : "0", save_config: "1", ...values })
      fields.forEach((field) => {
        const value = pluginValues[field.key]
        if (field.key === "apptype") body.set("isapptype", "1")
        if (Array.isArray(value)) value.forEach((item) => body.append(field.key === "apptype" ? "apptype[]" : `config[${field.key}][]`, item))
        else if (field.key === "appwxmp" || field.key === "appwxa") body.set(field.key, String(value ?? ""))
        else body.set(`config[${field.key}]`, String(value ?? ""))
      })
      const data = await readResponse(await fetch("ajax_pay.php?act=saveChannel", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body }))
      setNotice({ kind: "success", text: String(data.msg ?? "通道已保存") })
      window.setTimeout(() => { window.location.href = "./pay_channel.php" }, 600)
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "保存通道失败" })
    } finally { setPending(false) }
  }

  const basicInput = (key: string, label: string, type = "text", note = "") => <Field><FieldLabel htmlFor={`channel-${key}`}>{label}</FieldLabel><Input id={`channel-${key}`} type={type} step={type === "number" ? "any" : undefined} value={values[key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} />{note ? <FieldDescription>{note}</FieldDescription> : null}</Field>

  return <div className="min-w-0 w-full"><div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-muted-foreground">{config.sitename ?? "EasyPay"}</p><h1 className="mt-1 text-2xl font-semibold">{config.title ?? "新增支付通道"}</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{config.description ?? "选择支付方式和插件，并在一个页面完成通道参数与接口密钥配置。"}</p></div><Button asChild variant="outline"><a href="./pay_channel.php"><ArrowLeft data-icon="inline-start" />返回通道列表</a></Button></header>
    {notice ? <Alert variant={notice.kind === "error" ? "destructive" : "default"}><AlertTitle>{notice.kind === "error" ? "操作失败" : "保存成功"}</AlertTitle><AlertDescription>{notice.text}</AlertDescription></Alert> : null}
    <Card className="overflow-hidden shadow-sm"><CardHeader className="border-b"><CardTitle>{config.title ?? "支付通道"}</CardTitle><CardDescription>{loading ? "正在读取支付插件…" : "支付插件只显示当前支付方式支持的选项。"}</CardDescription></CardHeader><form onSubmit={submit}><CardContent className="flex flex-col gap-9 pt-6">
      <FieldSet><FieldLegend>通道与插件</FieldLegend><FieldDescription>先选择收款方式，再选择负责处理该方式的插件。</FieldDescription><FieldGroup className="mt-5 grid gap-5 md:grid-cols-2">
        <Field><FieldLabel>支付方式 *</FieldLabel><Select value={values.type || EMPTY} onValueChange={(next) => changeType(next === EMPTY ? "" : next)} disabled={loading}><SelectTrigger className="w-full"><SelectValue placeholder="选择支付方式" /></SelectTrigger><SelectContent><SelectGroup>{types.map((type) => <SelectItem key={type.id} value={String(type.id)}>{type.showname} ({type.name}){Number(type.status) === 1 ? "" : " · 未启用"}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
        <Field><FieldLabel>支付插件 *</FieldLabel><Select value={values.plugin || EMPTY} onValueChange={(next) => changePlugin(next === EMPTY ? "" : next)} disabled={!values.type || schemaLoading}><SelectTrigger className="w-full"><SelectValue placeholder={values.type ? "选择支付插件" : "请先选择支付方式"} /></SelectTrigger><SelectContent><SelectGroup>{availablePlugins.map((plugin) => <SelectItem key={plugin.name} value={plugin.name}>{plugin.showname} ({plugin.name})</SelectItem>)}</SelectGroup></SelectContent></Select><FieldDescription>{values.type && !availablePlugins.length ? "没有插件声明支持当前支付方式，请先刷新插件列表。" : "列表已按插件声明的支持类型过滤。"}</FieldDescription></Field>
        {basicInput("name", "通道名称 *")}
        <Field><FieldLabel>通道模式</FieldLabel><Select value={values.mode} onValueChange={(mode) => setValues((current) => ({ ...current, mode }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="0">平台代收</SelectItem><SelectItem value="1">商户直清</SelectItem></SelectGroup></SelectContent></Select><FieldDescription>商户直清模式可由商户提供自己的接口参数。</FieldDescription></Field>
        <Field className="md:col-span-2"><div className="flex min-h-12 items-center justify-between gap-4 rounded-md border px-4 py-3"><div><FieldLabel>启用此支付方式</FieldLabel><FieldDescription>{selectedType?.status === 0 ? "该类型由插件同步导入，配置完成后可在此直接启用。" : "关闭后仍保存通道，但商户暂时无法选择此支付方式。"}</FieldDescription></div><Switch checked={enableType} onCheckedChange={setEnableType} /></div></Field>
      </FieldGroup></FieldSet>
      <FieldSet><FieldLegend>插件配置</FieldLegend><FieldDescription>{values.plugin ? `以下字段由 ${plugins.find((item) => item.name === values.plugin)?.showname ?? values.plugin} 插件提供。` : "选择支付方式和插件后显示对应配置。"}</FieldDescription>{schemaLoading ? <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />正在加载配置字段</div> : fields.length ? <FieldGroup className="mt-5 grid gap-5 md:grid-cols-2">{fields.map((field) => <Field key={field.key} className={field.type === "textarea" || field.type === "checkbox" ? "md:col-span-2" : undefined}><FieldLabel>{field.label}{field.required ? " *" : ""}</FieldLabel>{dynamicControl(field)}{field.note ? <FieldDescription>{field.note}</FieldDescription> : null}</Field>)}</FieldGroup> : <div className="mt-5 rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{values.plugin ? "该插件没有额外配置字段" : "尚未选择支付插件"}</div>}</FieldSet>
      <FieldSet><FieldLegend>费率与风控</FieldLegend><FieldDescription>这些设置用于通道分成、成本核算和单日限制。</FieldDescription><FieldGroup className="mt-5 grid gap-5 md:grid-cols-2">{basicInput("rate", "分成比例", "number", "默认 100")}{basicInput("costrate", "通道成本", "number")}{basicInput("paymin", "最小支付金额", "number")}{basicInput("paymax", "最大支付金额", "number")}{basicInput("daytop", "每日金额上限", "number", "0 表示不限制")}{basicInput("daymaxorder", "每日订单上限", "number", "0 表示不限制")}{basicInput("timestart", "开放时间", "number", "0-23 时")}{basicInput("timestop", "结束时间", "number", "0-23 时")}</FieldGroup></FieldSet>
    </CardContent><CardFooter className="flex flex-wrap gap-2 border-t"><Button type="submit" disabled={loading || schemaLoading || pending}>{pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Save data-icon="inline-start" />}{action === "add" ? "创建通道" : action === "copy" ? "创建通道副本" : "保存通道"}</Button><Button type="button" variant="outline" disabled={pending} onClick={() => void load(true)}><RefreshCw data-icon="inline-start" />重新加载</Button></CardFooter></form></Card>
  </div></div>
}
