<?php
require '/var/www/html/includes/common.php';
if($islogin2==1){}else exit("<script language='javascript'>window.location.href='./login.php';</script>");
$title='软件下载';
include '/var/www/html/user/head.php';
?>
<div id="content" class="app-content" role="main">
  <div class="app-content-body">
    <div class="bg-light lter b-b wrapper-md hidden-print">
      <h1 class="m-n font-thin h3">软件下载</h1>
    </div>
    <div class="wrapper-md control">
      <div class="panel panel-default">
        <div class="panel-heading"><h4 class="panel-title">监控端（安卓）</h4></div>
        <div class="panel-body">
          <p>收款确认靠手机通知栏。本站不托管第三方商业「挂机宝」安装包。协议兼容开源 <strong>V免签监控端</strong>：</p>
          <p>
            <a class="btn btn-success" href="https://github.com/szvone/vmqApk/releases/download/v1.8.1/app-release.apk">下载 APK</a>
            <a class="btn btn-default" href="https://github.com/szvone/vmqApk/releases" target="_blank" rel="noopener">GitHub 发布页</a>
          </p>
          <p>安装后打开 APP 点「扫码配置」，去 <a href="channel.php">通道管理</a> 扫页面上的配置二维码。也可以点「手动配置」，把「配置数据」整串贴进去。然后开启通知使用权。</p>
          <p class="text-muted">官方这款只稳定监听微信、支付宝。QQ 通道要用能推 QQ 到账通知的挂机宝。</p>
          <p>要能自动回调：手机开通知使用权、关掉电池优化、微信关注「微信收款助手」并打开收款提醒；监控 APP 不要被杀掉。付款必须进<strong>这台手机上登录的微信/支付宝</strong>，否则 APP 收不到通知，订单不会变已支付。</p>
        </div>
      </div>
    </div>
  </div>
</div>
<?php include '/var/www/html/user/foot.php'; ?>
