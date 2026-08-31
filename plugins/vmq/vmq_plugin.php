<?php

class vmq_plugin
{
	static public $info = [
		'name'        => 'vmq', //支付插件英文名称，需和目录名称一致，不能有重复
		'showname'    => 'V免签', //支付插件显示名称
		'author'      => 'V免签', //支付插件作者
		'link'        => 'https://github.com/szvone/vmqphp', //支付插件作者链接
		'types'       => ['alipay','qqpay','wxpay'], //支付插件支持的支付方式，可选的有alipay,qqpay,wxpay,bank
		'inputs' => [ //支付插件要求传入的参数以及参数显示名称，可选的有appid,appkey,appsecret,appurl,appmchid
			'appurl' => [
				'name' => '接口地址',
				'type' => 'input',
				'note' => '必须以http://或https://开头，以/结尾',
			],
			'appid' => [
				'name' => '商户ID',
				'type' => 'input',
				'note' => '如果不需要商户ID，随便填写即可',
			],
			'appkey' => [
				'name' => '通讯密钥',
				'type' => 'input',
				'note' => '',
			],
		],
		'select' => null,
		'note' => '', //支付密钥填写说明
		'bindwxmp' => false, //是否支持绑定微信公众号
		'bindwxa' => false, //是否支持绑定微信小程序
	];

	static public function submit(){
		global $siteurl, $channel, $order, $conf;

		if($order['typename']=='alipay'){
			$paytype='2';
		}elseif($order['typename']=='qqpay'){
			$paytype='4';
		}elseif($order['typename']=='wxpay'){
			$paytype='1';
		}elseif($order['typename']=='bank'){
			$paytype='3';
		}else{
			return ['type'=>'error','msg'=>'V免签不支持该支付方式'];
		}

		$param = '';
		$price = (string)$order['realmoney'];
		$data = array(
			'payId' => TRADE_NO,
			'param' => $param,
			'type' => $paytype,
			'price' => $price,
			'isHtml' => '0',
			'notifyUrl' => $conf['localurl'].'pay/notify/'.TRADE_NO.'/',
			'returnUrl' => $siteurl.'pay/return/'.TRADE_NO.'/',
		);
		$data['sign'] = md5($data['payId'].$data['param'].$data['type'].$data['price'].$channel['appkey']);

		$resp = get_curl($channel['appurl'].'createOrder', http_build_query($data));
		$json = json_decode($resp, true);
		if(!is_array($json)){
			return ['type'=>'error','msg'=>'V免签无响应，请检查接口地址'];
		}
		if(intval($json['code'] ?? 0) !== 1){
			return ['type'=>'error','msg'=>'V免签下单失败：'.($json['msg'] ?? $resp)];
		}
		$orderId = $json['data']['orderId'] ?? '';
		if($orderId === ''){
			return ['type'=>'error','msg'=>'V免签未返回订单号'];
		}
		return ['type'=>'jump','url'=>$channel['appurl'].'payPage/pay.html?orderId='.urlencode($orderId)];
	}

	//异步回调
	static public function notify(){
		global $channel, $order;

		$payId = $_GET['payId'];//商户订单号
		$type = $_GET['type'];//支付方式 ：微信支付为1 支付宝支付为2 中国银联（云闪付）传入3 QQ钱包传入4
		$price = $_GET['price'];//订单金额
		$reallyPrice = $_GET['reallyPrice'];//实际支付金额
		$sign = $_GET['sign'];//校验签名，计算方式 = md5(payId +  type + price + reallyPrice + 通讯密钥)

		if(!$payId || !$sign)return ['type'=>'html','data'=>'error_param'];

		$_sign =  md5($payId . $type . $price . $reallyPrice . $channel['appkey']);
		if ($_sign !== $sign)return ['type'=>'html','data'=>'error_sign'];

		$out_trade_no = daddslashes($payId);
		if($out_trade_no == TRADE_NO && round($price,2)==round($order['money'],2)){
			processNotify($order, $out_trade_no);
		}
		return ['type'=>'html','data'=>'success'];
	}

	//同步回调
	static public function return(){
		global $channel, $order;

		$payId = $_GET['payId'];//商户订单号
		$type = $_GET['type'];//支付方式 ：微信支付为1 支付宝支付为2 中国银联（云闪付）传入3 QQ钱包传入4
		$price = $_GET['price'];//订单金额
		$reallyPrice = $_GET['reallyPrice'];//实际支付金额
		$sign = $_GET['sign'];//校验签名，计算方式 = md5(payId +  type + price + reallyPrice + 通讯密钥)

		if(!$payId || !$sign)return ['type'=>'error','data'=>'参数不完整'];

		$_sign =  md5($payId . $type . $price . $reallyPrice . $channel['appkey']);
		if ($_sign !== $sign)return ['type'=>'error','data'=>'签名校验失败'];

		$out_trade_no = daddslashes($payId);
		if($out_trade_no == TRADE_NO && round($price,2)==round($order['money'],2)){
			processReturn($order, $out_trade_no);
		}else{
			return ['type'=>'error','msg'=>'订单信息校验失败'];
		}
	}

}