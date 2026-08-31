<?php
include("../includes/common.php");
if($islogin2!=1)exit("<script>window.location.href='./login.php';</script>");
if($conf['group_buy']==0)exit('未开启套餐购买');

$title = '套餐购买';
$paytype = [];
$rs = $DB->getAll("SELECT * FROM pre_type ORDER BY id ASC");
foreach($rs as $row){
	$paytype[$row['id']] = $row['showname'];
}
unset($rs);

$urow = $DB->getRow("SELECT uid,gid FROM pre_user WHERE uid=:uid LIMIT 1", [':uid'=>$conf['reg_pay_uid']]);
if(!$urow)exit('套餐购买收款商户不存在');
$paytypem = \lib\Channel::getTypes($urow['uid'], $urow['gid']);
$methods = [['id'=>0, 'showname'=>'余额支付']];
foreach($paytypem as $row){
	$methods[] = ['id'=>(int)$row['id'], 'showname'=>$row['showname']];
}

$list = $DB->getAll("SELECT * FROM pre_group WHERE isbuy=1 ORDER BY sort ASC");
$plans = [];
foreach($list as $row){
	if(!isNullOrEmpty($row['visible'])){
		$visible = explode(',', $row['visible']);
		if(!in_array($userrow['gid'], $visible))continue;
	}
	$channels = [];
	$info = json_decode($row['info'], true);
	if(is_array($info)){
		foreach($info as $k=>$v){
			if(empty($v['channel']))continue;
			$rate = empty($v['rate']) ? 100 : (float)$v['rate'];
			if($v['type']=='channel'){
				$channel_rate = $DB->getColumn("SELECT rate FROM pre_channel WHERE id=:id", [':id'=>$v['channel']]);
				if($channel_rate!==false && $channel_rate!==null)$rate = (float)$channel_rate;
			}
			$channels[] = [
				'name' => $paytype[$k] ?? '支付通道',
				'rate' => round(100-$rate, 2),
			];
		}
	}
	$plans[] = [
		'gid' => (int)$row['gid'],
		'name' => $row['name'],
		'price' => $row['price'],
		'expire' => (int)$row['expire'],
		'channels' => $channels,
	];
}

$mygroup = $DB->getRow("SELECT * FROM pre_group WHERE gid=:gid", [':gid'=>$userrow['gid']]);
$current = [
	'name' => $mygroup['name'] ?: '默认用户组',
	'expire' => $userrow['endtime'] ? date('Y-m-d', strtotime($userrow['endtime'])) : '永久',
];
$success = null;
if(isset($_GET['ok']) && $_GET['ok']==1 && !empty($_GET['trade_no'])){
	$order_param = $DB->getColumn("SELECT `param` FROM pre_order WHERE trade_no=:trade_no LIMIT 1", [':trade_no'=>$_GET['trade_no']]);
	if($order_param){
		$order_param = json_decode($order_param, true);
		$success = ['name'=>$DB->getColumn("SELECT name FROM pre_group WHERE gid=:gid", [':gid'=>$order_param['gid']])];
	}
}

$csrf_token = bin2hex(random_bytes(16));
$_SESSION['csrf_token'] = $csrf_token;
$epay_ui_view = 'merchant-plans';
$epay_ui_config = [
	'sitename' => $conf['sitename'],
	'csrfToken' => $csrf_token,
	'plans' => $plans,
	'methods' => $methods,
	'current' => $current,
	'success' => $success,
];
include './head.php';
exit('</div></body></html>');
