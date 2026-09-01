<?php
include("../includes/common.php");
if($islogin2!=1)exit("<script>window.location.href='./login.php';</script>");
if(!$conf['onecode'] && $userrow['open_code']!=1)exit('未开启聚合收款');

$title = '聚合收款';
$csrf_token = bin2hex(random_bytes(16));
$_SESSION['csrf_token'] = $csrf_token;
$merchant = authcode($uid, 'ENCODE', SYS_KEY);
$code_url = $siteurl.'paypage/?merchant='.urlencode($merchant);
require_once PLUGIN_ROOT.'guajibao/inc/helper.php';
$guaji = GuajiHelper::get($uid);
$alipay_qr_url = !empty($guaji['ali_qr']) ? '/'.ltrim($guaji['ali_qr'], '/').'?v='.time() : '';
$epay_ui_view = 'merchant-onecode';
$epay_ui_config = [
	'sitename' => $conf['sitename'],
	'title' => '聚合收款',
	'description' => '一个码收多种支付方式',
	'codeUrl' => $code_url,
	'codeName' => $userrow['codename'] ?: '',
	'alipayQrUrl' => $alipay_qr_url,
	'csrfToken' => $csrf_token,
	'styleUrl' => './assets/js/config.json',
];
include './head.php';
exit('</div></body></html>');
