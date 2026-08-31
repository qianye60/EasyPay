# EasyPay 运维手册（给后续 Agent）

本仓库由千夜持有，后续改代码、发镜像、管服务器都在这里做。  
**不要再拉 `aliveranme/Epay` 或 `maajiko/Epay`。** 生产镜像必须是 `ghcr.io/qianye60/easypay`。

公开文档不写明文密码。现网口令在服务器文件里，SSH 上去读。

---

## 1. 仓库与本机

| 项 | 值 |
|---|---|
| GitHub | https://github.com/qianye60/EasyPay |
| 本机目录 | `C:\Users\15385\Documents\CodeProject\Epay` |
| 默认分支 | `main` |
| 代码结构说明 | 同目录 `AGENTS.md` |

改完后：

```powershell
cd C:\Users\15385\Documents\CodeProject\Epay
git add -A
git commit -m "简要说明"
git push origin main
```

推到 `main` 会触发 GitHub Actions，构建并推送 `ghcr.io/qianye60/easypay:latest`。  
工作流：`.github/workflows/docker-publish.yml`  
Actions：https://github.com/qianye60/EasyPay/actions

镜像变绿之后，**服务器不会自动更新**，必须再拉一次（见第 4 节）。

---

## 2. Azure 虚拟机

学生订阅，区域白名单只有：`japanwest` / `koreacentral` / `malaysiawest` / `indonesiacentral` / `indiasouthcentral`。  
**不要用** `japaneast`、`southeastasia`、`eastasia`，会被 `RequestDisallowedByAzure` 拒绝。

| 项 | 值 |
|---|---|
| 订阅 | Azure for Students |
| 资源组 | `qianye` |
| 虚拟机 | `Qianye` |
| 区域 | `japanwest`（大阪） |
| 规格 | `Standard_B2ats_v2`（2 核 1GB） |
| 系统 | Debian 12 Gen2 x64 |
| 公网 IP | `20.78.176.93`（静态，资源名 `Qianye-ip`） |
| 磁盘 | 30GB Standard HDD |
| NSG | `QianyeNSG`，规则 `allow-all-inbound` 已放行全部入站 |
| Swap | `/swapfile` 2GB |

本机 Azure CLI：

```
C:\Program Files (x86)\Microsoft SDKs\Azure\CLI2\wbin\az.cmd
```

PowerShell 当前会话若找不到 `az`：

```powershell
$env:Path = "C:\Program Files (x86)\Microsoft SDKs\Azure\CLI2\wbin;" + $env:Path
```

这台 1GB 机器和 CLIProxyAPI 共用。MySQL 必须限内存（见 override）。不要在这台机上 `docker build` 整镜像，会 OOM；用 GHCR。

---

## 3. SSH

可登录用户：`root`、`azureuser`（sudo）。优先 `root`。

本机密钥：`C:\Users\15385\.ssh\id_rsa`  
另有 [sshid.io/qianye](https://sshid.io/qianye) 的 `ssh-ed25519` 公钥，已写入 `/root/.ssh/authorized_keys` 和 `/home/azureuser/.ssh/authorized_keys`。

```powershell
ssh -i $env:USERPROFILE\.ssh\id_rsa -o IdentitiesOnly=yes root@20.78.176.93
```

重建虚拟机后 IP 不变（静态），但 host key 会变，需 `ssh-keygen -R 20.78.176.93`。

---

## 4. EasyPay 生产栈

服务器目录：`/root/EasyPay`

| 容器 | 镜像 | 说明 |
|---|---|---|
| `epay-php` | `ghcr.io/qianye60/easypay:latest` | 应用 |
| `epay-nginx` | `nginx:alpine` | 80 端口 |
| `epay-mysql` | `mysql:8.0` | 限 384MB，`innodb_buffer_pool_size=128M` |
| `epay-cron` | `alpine:latest` | 每 5 分钟打 cron.php |

启动文件：

- `docker-compose.prod.yml`（镜像名 `${EPAY_IMAGE:-ghcr.io/qianye60/easypay:latest}`）
- `docker-compose.override.yml`（内存上限，只在服务器上，勿当生产密钥提交）
- `.env`（只在服务器，已 gitignore）

站点：http://20.78.176.93/  
后台：http://20.78.176.93/admin/  
商户端：http://20.78.176.93/user/  
后台账号：`admin`  
后台密码：`cat /root/EasyPay.adminpass`

### 发版（改代码后必做）

1. 本机 push `main`，等 Actions 成功  
2. 服务器：

```bash
cd /root/EasyPay
git pull
docker compose -f docker-compose.prod.yml -f docker-compose.override.yml pull
docker compose -f docker-compose.prod.yml -f docker-compose.override.yml up -d
```

entrypoint 会把镜像里的代码 rsync 进 `app_data` 卷，并保留已有 `config.php` / `install.lock`。

### 查看日志

```bash
docker logs -f epay-php
docker logs -f epay-nginx
docker compose -f /root/EasyPay/docker-compose.prod.yml -f /root/EasyPay/docker-compose.override.yml ps
```

### 禁止

- 不要 `down -v` 除非用户明确要清空数据库  
- 不要删 `cli-proxy-api` 容器  
- 不要把 `.env`、`config.php`、管理员密码推进 GitHub  

---

## 5. 同机 CLIProxyAPI（别误伤）

| 项 | 值 |
|---|---|
| 目录 | `/root/CLIProxyAPI` |
| 容器 | `cli-proxy-api` |
| API | `http://20.78.176.93:8317` |
| 配置 | `/root/CLIProxyAPI/config.yaml` |
| API Key | `/root/CLIProxyAPI.apikey` |
| 管理密钥 | `/root/CLIProxyAPI.mgmtkey` |
| 管理接口 | 已开 `remote-management.allow-remote: true` |

面板地址填 `http://20.78.176.93:8317`，不要填 8085。  
未登录 Codex/Claude 时 `/v1/models` 为空是正常的。

---

## 6. 支付渠道（二改方向）

用户收款方式是个人免签约，不要配官方 `alipay` / `wxpay` / `wxpayn` 企业商户插件。

| 用途 | 插件目录 | 后台显示名 |
|---|---|---|
| 微信 / QQ 手机监听回调 | `plugins/vmq` | V免签 |
| 支付宝若代理是易支付协议 | `plugins/epayn` | 彩虹易支付V2 |
| 支付宝若也是手机监听 | 同样用 `vmq` | V免签 |
| USDT | `plugins/bepusdt` | BEpusdt（需另部署 BEpusdt） |

后台路径：支付管理 → 支付插件 → 支付通道 → 支付方式。

本仓库没有「支付宝扫码登录 Cookie 监控」专用插件。

---

## 7. 常用排障

- 首页能开、后台 404：后台是 `/admin/`，不是 `/user/`  
- 页面空壳：查 `epay-php` 日志和 `/assets/dist/` 是否 200  
- 内存打满：`free -h`、`docker stats`；MySQL 不要去掉 `mem_limit`  
- GHCR 拉不下来：确认 Actions 已成功，包名全小写 `ghcr.io/qianye60/easypay`  
- Azure 创建资源失败：先核对区域是否在白名单  

---

## 8. 会话约定

- 用户说「更新 / 发版 / 部署」：走第 4 节发版流程  
- 用户说「改 EasyPay / 易支付」：改本机 `Epay` 目录，不要改服务器上手工补丁（下次 pull 会被覆盖）  
- 用户说「服务器」默认这台大阪机 `20.78.176.93`  
- 回复用中文  
