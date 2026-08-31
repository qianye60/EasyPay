<?php
/** 支付通道管理（原生 shadcn 列表与表单） */
include("../includes/common.php");
require_once __DIR__.'/epay_ui_entry.php';
$id = intval($_GET['id'] ?? 0);
$my = (string)($_GET['my'] ?? ($id ? 'edit' : ''));
if($my === 'config' && $id > 0){
	epay_admin_view('admin-channel-config', ['title'=>'支付通道密钥配置','description'=>'使用当前支付插件提供的配置字段维护支付通道。','channelId'=>$id]);
}
if($my === 'test' && $id > 0){
	$row = $DB->getRow("SELECT id,name FROM pre_channel WHERE id=:id LIMIT 1", [':id'=>$id]);
	if(!$row) epay_admin_view('admin-form', ['title'=>'测试支付失败','description'=>'当前支付通道不存在。','notice'=>'请返回通道列表后重新选择。','links'=>[['label'=>'返回通道列表','href'=>'./pay_channel.php']]]);
	epay_admin_view('admin-channel-test', ['title'=>'测试支付','description'=>'创建一笔测试订单，验证当前通道的收银台跳转与回调链路。','channelId'=>$id,'channelName'=>$row['name']]);
}
if($my === 'add' || $my === 'edit' || $my === 'copy'){
	$row = in_array($my, ['edit','copy'], true) ? $DB->getRow("SELECT * FROM pre_channel WHERE id=:id LIMIT 1", [':id'=>$id]) : [];
	if(in_array($my, ['edit','copy'], true) && !$row) epay_admin_view('admin-form', ['title'=>'支付通道不存在','description'=>'没有找到要编辑或复制的支付通道。','notice'=>'请返回通道列表后重新选择。','links'=>[['label'=>'返回通道列表','href'=>'./pay_channel.php']]]);
	$isCopy = $my === 'copy';
	$title = $my === 'edit' ? '编辑支付通道 ID:'.$id : ($isCopy ? '复制支付通道 ID:'.$id : '新增支付通道');
	epay_admin_view('admin-channel-editor', ['title'=>$title,'description'=>'选择支付方式和插件，并在一个页面完成通道参数与接口密钥配置。','channelId'=>$id,'action'=>$my === 'edit' ? 'edit' : ($isCopy ? 'copy' : 'add')]);
}
epay_admin_view('admin-resource', ['resource'=>'channels','title'=>'支付通道','description'=>'管理支付方式、支付插件、费率与通道状态。','headerActions'=>[['label'=>'新增支付通道','href'=>'./pay_channel.php?my=add']]]);
