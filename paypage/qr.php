<?php
$is_defend = true;
include('./inc.php');

$trade_no = is_scalar($_GET['trade_no'] ?? null) ? daddslashes($_GET['trade_no']) : '';
if(!$trade_no || empty($_SESSION['paypage_trade_no']) || $_SESSION['paypage_trade_no'] !== $trade_no){
	showerror('订单校验失败，请返回重新下单');
}

$row = $DB->getRow("SELECT * FROM pre_order WHERE trade_no=:trade_no LIMIT 1", [':trade_no'=>$trade_no]);
if(!$row || (int)$row['uid'] !== (int)($_SESSION['paypage_uid'] ?? 0))showerror('订单不存在');
if((int)$row['status'] !== 0)showerror('订单已完成或已失效');

require_once PLUGIN_ROOT.'guajibao/inc/helper.php';
$amount = $row['realmoney'] ?? $row['money'];
$pay = GuajiHelper::alipayPayUrl((int)$row['uid'], $amount, $trade_no);
if(!$pay)showerror('商户尚未配置支付宝 UID 或收款码');
$code_url = $pay['url'];
$amount_locked = !empty($pay['locked']);
$image_url = '';
if(!$amount_locked){
	$qr_path = GuajiHelper::qrPath((int)$row['uid'], 'alipay');
	$image_url = $qr_path ? '/'.ltrim($qr_path, '/').'?v='.time() : '';
}

$userrow = $DB->getRow("SELECT codename,username FROM pre_user WHERE uid=:uid LIMIT 1", [':uid'=>(int)$row['uid']]);
$codename = !empty($userrow['codename']) ? $userrow['codename'] : ($userrow['username'] ?? '商户');
$created_at = !empty($row['addtime']) ? strtotime($row['addtime']) : time();
$config = [
	'page' => 'alipay_qrcode',
	'title' => $amount_locked ? '支付宝转账' : '支付宝收款',
	'sitename' => $conf['sitename'],
	'codeUrl' => $code_url,
	'imageUrl' => $image_url,
	'amount' => $amount,
	'tradeNo' => $trade_no,
	'productName' => '在线收款',
	'merchantName' => $codename,
	'createdAt' => $row['addtime'],
	'expireAt' => $created_at + 1800,
	'payType' => 'alipay',
	'amountLocked' => $amount_locked ? 1 : 0,
	'logoUrl' => function_exists('site_logo_url') ? site_logo_url() : '',
];
$json = htmlspecialchars(json_encode($config, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES), ENT_QUOTES, 'UTF-8');
$ver = @filemtime(ROOT.'assets/dist/epay-ui.css') ?: time();
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo h($config['title'])?> | <?php echo h($conf['sitename'])?></title>
    <link rel="stylesheet" href="/assets/dist/epay-ui.css?v=<?php echo $ver?>">
</head>
<body>
<div id="epay-react-root" data-epay-view="qr-checkout" data-epay-config="<?php echo $json?>"></div>
<script type="module" src="/assets/dist/epay-ui.js?v=<?php echo $ver?>"></script>
</body>
</html>
