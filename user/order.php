<?php
include("../includes/common.php");
if($islogin2==1){}else exit("<script language='javascript'>window.location.href='./login.php';</script>");
$title='订单记录';
if(empty($_SESSION['csrf_token'])) $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
$epay_ui_view = 'merchant-order';
$epay_ui_config = [
	'title' => '订单记录',
	'description' => '查询、筛选与核对商户交易订单',
	'sitename' => $conf['sitename'],
	'kind' => 'merchant',
	'csrf_token' => $_SESSION['csrf_token'],
	'is_user_refund' => (int)($conf['user_refund'] ?? 0) === 1,
	'paymentTypes' => $DB->getAll("SELECT id, name, showname FROM pre_type WHERE status=1 ORDER BY id ASC"),
];
include './head.php';
exit;
