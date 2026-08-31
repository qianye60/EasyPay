<?php
require '/var/www/html/includes/common.php';
if($islogin2==1){}else exit("<script language='javascript'>window.location.href='./login.php';</script>");
$title='软件下载';
include '/var/www/html/user/head.php';
?>
<style>
.gjb-page{max-width:720px;margin:0 auto;padding:24px 28px 48px;color:#0f172a}
.gjb-page *{box-sizing:border-box}
.gjb-hero{margin-bottom:22px}
.gjb-hero h1{margin:0;font-size:24px;font-weight:700;letter-spacing:-.02em}
.gjb-hero p{margin:6px 0 0;color:#64748b;font-size:13px;line-height:1.5}
.gjb-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.gjb-dl{padding:28px 24px;text-align:center;background:linear-gradient(180deg,#f8fafc 0%,#fff 70%)}
.gjb-dl-icon{width:56px;height:56px;margin:0 auto 14px;border-radius:14px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;letter-spacing:-.04em}
.gjb-dl h2{margin:0;font-size:17px;font-weight:700}
.gjb-dl p{margin:8px 0 0;font-size:13px;color:#64748b;line-height:1.5}
.gjb-dl-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:18px}
.gjb-dl-actions .btn{border-radius:10px;padding:10px 18px;font-size:13px;font-weight:600}
.gjb-dl-actions .btn-success{background:#0f172a;border-color:#0f172a;color:#fff}
.gjb-dl-actions .btn-success:hover,.gjb-dl-actions .btn-success:focus{background:#1e293b;border-color:#1e293b;color:#fff}
.gjb-dl-actions .btn-default{background:#fff;border-color:#e2e8f0;color:#475569}
.gjb-steps{padding:0 20px 8px;margin:0;list-style:none;counter-reset:step}
.gjb-steps li{display:flex;gap:12px;align-items:flex-start;padding:14px 0;border-top:1px solid #f1f5f9;font-size:13px;line-height:1.55;color:#475569}
.gjb-steps li::before{counter-increment:step;content:counter(step);flex-shrink:0;width:24px;height:24px;border-radius:8px;background:#f1f5f9;color:#334155;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px}
.gjb-steps a{color:#2563eb;text-decoration:none}
.gjb-steps a:hover{text-decoration:underline}
.gjb-note{margin:0;padding:12px 20px 18px;font-size:12px;color:#94a3b8;line-height:1.55}
@media(max-width:520px){
  .gjb-page{padding:16px 14px 36px}
  .gjb-dl{padding:24px 16px}
}
</style>
<div id="content" class="app-content" role="main">
  <div class="app-content-body">
    <div class="gjb-page">
      <div class="gjb-hero">
        <h1>软件下载</h1>
        <p>安卓监控端，监听微信 / 支付宝收款通知并自动回调。</p>
      </div>

      <section class="gjb-card">
        <div class="gjb-dl">
          <div class="gjb-dl-icon">APK</div>
          <h2>监控端（修复版）</h2>
          <p>兼容新版支付宝通知；已装官方旧包请先卸载再装。</p>
          <div class="gjb-dl-actions">
            <a class="btn btn-success" href="/assets/apk/vmq-epay.apk">下载 APK</a>
            <a class="btn btn-default" href="https://github.com/szvone/vmqApk" target="_blank" rel="noopener">上游源码</a>
          </div>
        </div>
        <ol class="gjb-steps">
          <li>安装并打开 APP，开启通知使用权，关闭电池优化。</li>
          <li>点「扫码配置」，到 <a href="channel.php">通道管理</a> 扫配置二维码；或「手动配置」粘贴配置数据。</li>
          <li>保持 APP 在后台运行；付款须进本机已登录的微信 / 支付宝。</li>
        </ol>
        <p class="gjb-note">微信需关注「微信收款助手」并打开收款提醒，否则可能收不到通知。</p>
      </section>
    </div>
  </div>
</div>
<?php include '/var/www/html/user/foot.php'; ?>
