<?php
require '/var/www/html/includes/common.php';
if($islogin2==1){}else exit("<script language='javascript'>window.location.href='./login.php';</script>");
$title='软件下载';
$epay_ui_view='soft-download';
$epay_ui_config=[
	'sitename'=>$conf['sitename'],
	'title'=>'软件下载',
	'description'=>'下载安卓监控端，配置后自动回调到账',
	'apkUrl'=>'/assets/apk/vmq-epay.apk',
	'sourceUrl'=>'https://github.com/szvone/vmqApk',
	'channelUrl'=>'./channel.php',
];
include '/var/www/html/user/head.php';
if($epay_ui_view){exit('</div></body></html>');}
?>
