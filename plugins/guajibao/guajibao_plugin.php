<?php

class guajibao_plugin
{
	static public $info = [
		'name'        => 'guajibao',
		'showname'    => '挂机宝个人收款',
		'author'      => 'EasyPay',
		'link'        => '',
		'types'       => ['alipay','wxpay'],
		'inputs'      => [
			'appurl' => [
				'name' => '说明',
				'type' => 'input',
				'note' => '无需填写。商户在「挂机宝收款」上传自己的收款码，用挂机宝 APP 登录本站即可。',
			],
		],
		'select'      => null,
		'note'        => '多商户免签：每个商户自己上传微信/支付宝收款码，下载监控端填监控地址。钱直接进该商户的微信/支付宝，不经过平台钱包。QQ 通道暂未开放。',
		'bindwxmp'    => false,
		'bindwxa'     => false,
	];

	static private function helper(){
		require_once PAY_ROOT.'inc/helper.php';
	}

	static private function showQr(){
		global $siteurl, $order;

		self::helper();
		if(!GuajiHelper::channelOn($order['uid'], $order['typename'])){
			return ['type'=>'error','msg'=>'商户未开启该支付通道'];
		}

		if($order['typename']=='alipay'){
			$pay = GuajiHelper::alipayPayUrl($order['uid'], $order['realmoney'] ?? $order['money'], defined('TRADE_NO') ? TRADE_NO : ($order['trade_no'] ?? ''));
			if(!$pay){
				return ['type'=>'error','msg'=>'请配置支付宝 UID（推荐，固定金额）或上传支付宝收款码'];
			}
			return ['type'=>'qrcode','page'=>'alipay_qrcode','url'=>$pay['url'],'amount_locked'=>intval($pay['locked'])];
		}

		$rel = GuajiHelper::qrPath($order['uid'], $order['typename']);
		if(!$rel){
			return ['type'=>'error','msg'=>'收款商户尚未上传该支付方式的收款码'];
		}
		$code_url = GuajiHelper::payload($order['uid'], $order['typename']);
		if(!$code_url){
			return ['type'=>'error','msg'=>'收款码无法识别，请商户重新上传清晰的收款二维码'];
		}

		if($order['typename']=='qqpay'){
			$page = 'qqpay_qrcode';
		}else{
			$page = 'wxpay_qrcode';
		}
		return ['type'=>'qrcode','page'=>$page,'url'=>$code_url];
	}

	static public function submit(){
		return ['type'=>'jump','url'=>'/pay/qrcode/'.TRADE_NO.'/'];
	}

	static public function mapi(){
		return self::qrcode();
	}

	static public function qrcode(){
		return self::showQr();
	}
}
