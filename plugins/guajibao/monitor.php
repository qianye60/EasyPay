<?php
$nosession = true;
require '/var/www/html/includes/common.php';
require_once PLUGIN_ROOT.'guajibao/inc/helper.php';

@header('Content-Type: application/json; charset=UTF-8');

$uid = intval($_GET['uid'] ?? ($_POST['uid'] ?? 0));
$act = $_GET['act'] ?? ($_POST['act'] ?? '');
if(!in_array($act, ['appHeart','appPush'], true)){
	exit(json_encode(['code'=>-1,'msg'=>'参数错误'], JSON_UNESCAPED_UNICODE));
}

$t = strval($_GET['t'] ?? ($_POST['t'] ?? ''));
$sign = strval($_GET['sign'] ?? ($_POST['sign'] ?? ''));
$type = strval($_GET['type'] ?? ($_POST['type'] ?? ''));
$price = strval($_GET['price'] ?? ($_POST['price'] ?? ''));
// 兼容部分监控端把金额写成「￥0.01」「0.01元」
$price = preg_replace('/[^\d.]/', '', $price);

if($t === '' || $sign === ''){
	exit(json_encode(['code'=>-1,'msg'=>'缺少签名'], JSON_UNESCAPED_UNICODE));
}
if(strlen($t) > 20 || !preg_match('/^\d+$/', $t)){
	exit(json_encode(['code'=>-1,'msg'=>'时间戳无效'], JSON_UNESCAPED_UNICODE));
}

if($uid < 1){
	$payload = $act === 'appHeart' ? $t : $type.$price.$t;
	$uid = GuajiHelper::uidBySign($sign, $payload);
}
if($uid < 1){
	error_log('gjb '.$act.' uid fail t='.$t.' type='.$type.' price='.$price);
	exit(json_encode(['code'=>-1,'msg'=>'签名错误'], JSON_UNESCAPED_UNICODE));
}

$user = $DB->getRow("SELECT uid,`key`,status,pay FROM pre_user WHERE uid=:uid LIMIT 1", [':uid'=>$uid]);
if(!$user || intval($user['status'])!==1){
	exit(json_encode(['code'=>-1,'msg'=>'商户不存在'], JSON_UNESCAPED_UNICODE));
}

$key = GuajiHelper::softKey($uid);
if($key === ''){
	exit(json_encode(['code'=>-1,'msg'=>'未配置通讯密钥'], JSON_UNESCAPED_UNICODE));
}

if($act === 'appHeart'){
	if(strtolower(md5($t.$key)) !== strtolower($sign)){
		exit(json_encode(['code'=>-1,'msg'=>'签名错误'], JSON_UNESCAPED_UNICODE));
	}
	GuajiHelper::touchHeart($uid);
	exit(json_encode(['code'=>1,'msg'=>'success'], JSON_UNESCAPED_UNICODE));
}

if(strtolower(md5($type.$price.$t.$key)) !== strtolower($sign)){
	GuajiHelper::touchPush($uid, '签名错误 type='.$type.' price='.$price);
	error_log('gjb appPush bad sign uid='.$uid.' type='.$type.' price='.$price.' t='.$t);
	exit(json_encode(['code'=>-1,'msg'=>'签名错误'], JSON_UNESCAPED_UNICODE));
}

$typename = GuajiHelper::typeNameFromVmq($type);
if(!$typename){
	GuajiHelper::touchPush($uid, '不支持的类型 type='.$type.' price='.$price);
	error_log('gjb appPush bad type uid='.$uid.' type='.$type.' price='.$price);
	exit(json_encode(['code'=>-1,'msg'=>'不支持的支付类型'], JSON_UNESCAPED_UNICODE));
}

$order = GuajiHelper::matchOrder($uid, $typename, $price);
if(!$order){
	GuajiHelper::touchPush($uid, '未匹配订单 '.$typename.' '.$price);
	error_log('gjb appPush no order uid='.$uid.' type='.$typename.' price='.$price);
	exit(json_encode(['code'=>-1,'msg'=>'未匹配到订单'], JSON_UNESCAPED_UNICODE));
}

GuajiHelper::touchPush($uid, '已确认 '.$order['trade_no'].' '.$typename.' '.$price);
error_log('gjb appPush ok uid='.$uid.' trade_no='.$order['trade_no'].' type='.$typename.' price='.$price);
processNotify($order, 'guaji'.$t);
exit(json_encode(['code'=>1,'msg'=>'success'], JSON_UNESCAPED_UNICODE));
