<?php
require '/var/www/html/includes/common.php';
if($islogin2==1){}else exit('{"code":-3,"msg":"No Login"}');
if(!checkRefererHost()) exit('{"code":403}');
@header('Content-Type: application/json; charset=UTF-8');
if(!isset($_POST['csrf_token']) || $_POST['csrf_token']!==$_SESSION['csrf_token']) exit('{"code":-1,"msg":"CSRF TOKEN ERROR"}');
require_once PLUGIN_ROOT.'guajibao/inc/helper.php';
$act = trim($_POST['act'] ?? 'upload');

if($act === 'toggle'){
	$type = trim($_POST['type'] ?? '');
	$on = intval($_POST['on'] ?? 0);
	if(!GuajiHelper::onField($type)) exit('{"code":-1,"msg":"通道不存在"}');
	if(!GuajiHelper::setOn($uid, $type, $on)) exit('{"code":-1,"msg":"保存失败"}');
	exit('{"code":0,"msg":"ok"}');
}
if($act === 'resetkey'){
	$key = GuajiHelper::resetKey($uid);
	exit(json_encode(['code'=>0,'msg'=>'ok','key'=>$key], JSON_UNESCAPED_UNICODE));
}
if($act === 'testorder'){
	global $clientip, $siteurl, $conf;
	$type = trim($_POST['type'] ?? '');
	$money = trim($_POST['money'] ?? '0.01');
	if(!GuajiHelper::onField($type)) exit('{"code":-1,"msg":"通道不存在"}');
	if(!GuajiHelper::channelOn($uid, $type)) exit('{"code":-1,"msg":"该通道已关闭"}');
	if(!GuajiHelper::qrPath($uid, $type)) exit('{"code":-1,"msg":"请先上传该通道的收款码"}');
	if($money === '' || !is_numeric($money) || $money <= 0 || !preg_match('/^[0-9]+(\.[0-9]{1,2})?$/', $money)) exit('{"code":-1,"msg":"金额不合法，最多两位小数"}');
	$money = sprintf('%.2f', round((float)$money, 2));
	if(!empty($conf['pay_maxmoney']) && $money > $conf['pay_maxmoney']) exit('{"code":-1,"msg":"超过最大支付金额"}');
	if(!empty($conf['pay_minmoney']) && $money < $conf['pay_minmoney']) exit('{"code":-1,"msg":"低于最小支付金额"}');
	$typeid = intval($DB->getColumn("SELECT id FROM pre_type WHERE name=:n AND status=1 LIMIT 1", [':n'=>$type]));
	if($typeid < 1) exit('{"code":-1,"msg":"支付方式未启用"}');
	$trade_no = date('YmdHis').rand(11111, 99999);
	$return_url = rtrim($siteurl, '/').'/user/test.php?ok=1&trade_no='.$trade_no;
	$domain = getdomain($return_url);
	$ok = $DB->exec("INSERT INTO `pre_order` (`trade_no`,`out_trade_no`,`uid`,`tid`,`addtime`,`name`,`money`,`notify_url`,`return_url`,`domain`,`ip`,`status`) VALUES (:trade_no, :out_trade_no, :uid, 3, NOW(), :name, :money, :notify_url, :return_url, :domain, :clientip, 0)", [
		':trade_no'=>$trade_no,
		':out_trade_no'=>$trade_no,
		':uid'=>$uid,
		':name'=>'通道测试',
		':money'=>$money,
		':notify_url'=>$return_url,
		':return_url'=>$return_url,
		':domain'=>$domain,
		':clientip'=>$clientip,
	]);
	if(!$ok) exit('{"code":-1,"msg":"创建订单失败"}');
	exit(json_encode(['code'=>0,'msg'=>'ok','url'=>'/submit2.php?typeid='.$typeid.'&trade_no='.$trade_no], JSON_UNESCAPED_UNICODE));
}

$field = trim($_POST['field'] ?? '');
if(!in_array($field, ['wx_qr','ali_qr','qq_qr'], true)) exit('{"code":-1,"msg":"类型错误"}');
if(empty($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) exit('{"code":-1,"msg":"请选择图片"}');
if($_FILES['file']['size'] > 2*1024*1024) exit('{"code":-1,"msg":"图片不能超过2MB"}');
$info = @getimagesize($_FILES['file']['tmp_name']);
if(!$info || empty($info['mime'])) exit('{"code":-1,"msg":"不是有效图片"}');
$mimeMap = ['image/jpeg'=>'jpg','image/png'=>'png','image/gif'=>'gif','image/webp'=>'webp'];
if(!isset($mimeMap[$info['mime']])) exit('{"code":-1,"msg":"仅支持 jpg/png/gif/webp"}');
$dirRel = 'assets/uploads/guaji';
$dir = ROOT.$dirRel;
if(!is_dir($dir) && !mkdir($dir, 0755, true)) exit('{"code":-1,"msg":"无法创建上传目录"}');
$name = $uid.'_'.$field.'.'.$mimeMap[$info['mime']];
$dest = $dir.'/'.$name;
if(!move_uploaded_file($_FILES['file']['tmp_name'], $dest)) exit('{"code":-1,"msg":"保存失败"}');
$rel = $dirRel.'/'.$name;
$typename = $field === 'wx_qr' ? 'wxpay' : ($field === 'ali_qr' ? 'alipay' : 'qqpay');
$payload = GuajiHelper::decodeQrFile($dest);
if(!$payload){
	@unlink($dest);
	exit('{"code":-1,"msg":"无法识别二维码，请上传清晰、完整的收款码原图"}');
}
if(!GuajiHelper::saveQr($uid, $field, $rel)) exit('{"code":-1,"msg":"写入失败"}');
GuajiHelper::savePayload($uid, $typename, $payload);
exit(json_encode(['code'=>0,'msg'=>'上传成功，已解析为收款码','url'=>'/'.$rel], JSON_UNESCAPED_UNICODE));
