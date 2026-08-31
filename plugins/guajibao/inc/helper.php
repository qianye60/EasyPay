<?php
class GuajiHelper {
	const TYPE_WX = 1;
	const TYPE_ALI = 2;
	const TYPE_QQ = 4;

	const PAY_EXPIRE = 600;

	static public function ensureTable(){
		global $DB;
		$DB->exec("CREATE TABLE IF NOT EXISTS `pre_guaji` (
			`uid` int(11) unsigned NOT NULL,
			`wx_qr` varchar(255) DEFAULT NULL,
			`ali_qr` varchar(255) DEFAULT NULL,
			`qq_qr` varchar(255) DEFAULT NULL,
			`wx_payload` text DEFAULT NULL,
			`ali_payload` text DEFAULT NULL,
			`qq_payload` text DEFAULT NULL,
			`gjb_key` varchar(32) DEFAULT NULL,
			`wx_on` tinyint(1) NOT NULL DEFAULT 1,
			`ali_on` tinyint(1) NOT NULL DEFAULT 1,
			`qq_on` tinyint(1) NOT NULL DEFAULT 1,
			`last_heart` datetime DEFAULT NULL,
			`last_push` datetime DEFAULT NULL,
			`last_push_note` varchar(255) DEFAULT NULL,
			PRIMARY KEY (`uid`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
		foreach (['gjb_key varchar(32) DEFAULT NULL','wx_on tinyint(1) NOT NULL DEFAULT 1','ali_on tinyint(1) NOT NULL DEFAULT 1','qq_on tinyint(1) NOT NULL DEFAULT 1','last_push datetime DEFAULT NULL','last_push_note varchar(255) DEFAULT NULL','wx_payload text DEFAULT NULL','ali_payload text DEFAULT NULL','qq_payload text DEFAULT NULL'] as $col){
			try { $DB->exec("ALTER TABLE `pre_guaji` ADD COLUMN ".$col); } catch (Exception $e) {}
		}
	}

	static public function get($uid){
		global $DB;
		self::ensureTable();
		$uid = intval($uid);
		$row = $DB->getRow("SELECT * FROM pre_guaji WHERE uid=:uid LIMIT 1", [':uid'=>$uid]);
		if(!$row){
			$DB->insert('guaji', ['uid'=>$uid, 'gjb_key'=>self::newKey(), 'wx_on'=>1, 'ali_on'=>1, 'qq_on'=>1]);
			$row = $DB->getRow("SELECT * FROM pre_guaji WHERE uid=:uid LIMIT 1", [':uid'=>$uid]);
		}
		if(empty($row['gjb_key'])){
			$DB->update('guaji', ['gjb_key'=>self::newKey()], ['uid'=>$uid]);
			$row = $DB->getRow("SELECT * FROM pre_guaji WHERE uid=:uid LIMIT 1", [':uid'=>$uid]);
		}
		return $row;
	}

	static public function newKey(){
		return substr(bin2hex(random_bytes(16)), 0, 32);
	}

	static public function resetKey($uid){
		global $DB;
		self::get($uid);
		$key = self::newKey();
		$DB->update('guaji', ['gjb_key'=>$key], ['uid'=>intval($uid)]);
		return $key;
	}

	static public function softKey($uid){
		$row = self::get($uid);
		return $row['gjb_key'] ?? '';
	}

	static public function monitorHost(){
		global $siteurl;
		$p = parse_url((string)$siteurl);
		$host = $p['host'] ?? (strval($_SERVER['HTTP_HOST'] ?? '127.0.0.1'));
		$host = preg_replace('/:\d+$/', '', $host);
		if(!empty($p['port'])) $host .= ':'.$p['port'];
		return $host;
	}

	static public function configData($uid){
		return self::monitorHost().'/'.self::softKey($uid);
	}

	static public function uidBySign($sign, $payload){
		global $DB;
		self::ensureTable();
		$sign = strtolower((string)$sign);
		if($sign === '' || $payload === '') return 0;
		$rows = $DB->getAll("SELECT uid,gjb_key FROM pre_guaji WHERE gjb_key IS NOT NULL AND gjb_key<>''");
		if(!$rows) return 0;
		foreach($rows as $row){
			if(strtolower(md5($payload.$row['gjb_key'])) === $sign){
				return intval($row['uid']);
			}
		}
		return 0;
	}

	static public function onField($typename){
		if($typename === 'wxpay') return 'wx_on';
		if($typename === 'alipay') return 'ali_on';
		if($typename === 'qqpay') return 'qq_on';
		return null;
	}

	static public function channelOn($uid, $typename){
		$field = self::onField($typename);
		if(!$field) return false;
		$row = self::get($uid);
		return intval($row[$field] ?? 1) === 1;
	}

	static public function setOn($uid, $typename, $on){
		global $DB;
		$field = self::onField($typename);
		if(!$field) return false;
		self::get($uid);
		return $DB->update('guaji', [$field=>$on?1:0], ['uid'=>intval($uid)]) !== false;
	}

	static public function saveQr($uid, $field, $path){
		global $DB;
		self::get($uid);
		if(!in_array($field, ['wx_qr','ali_qr','qq_qr'], true)) return false;
		return $DB->update('guaji', [$field=>$path], ['uid'=>intval($uid)]) !== false;
	}

	static public function touchHeart($uid){
		global $DB;
		self::get($uid);
		$DB->update('guaji', ['last_heart'=>'NOW()'], ['uid'=>intval($uid)]);
	}

	static public function online($uid){
		$row = self::get($uid);
		if(empty($row['last_heart'])) return false;
		return strtotime($row['last_heart']) >= time() - 180;
	}

	static public function touchPush($uid, $note){
		global $DB;
		self::get($uid);
		$DB->update('guaji', ['last_push'=>'NOW()', 'last_push_note'=>mb_substr((string)$note, 0, 250)], ['uid'=>intval($uid)]);
	}

	static public function payloadField($typename){
		if($typename === 'wxpay') return 'wx_payload';
		if($typename === 'alipay') return 'ali_payload';
		if($typename === 'qqpay') return 'qq_payload';
		return null;
	}

	static public function decodeQrFile($fullPath){
		if(!is_file($fullPath)) return null;
		require_once SYSTEM_ROOT.'qrcodedecoder/bootstrap.php';
		try {
			$reader = new \Zxing\QrReader($fullPath, \Zxing\QrReader::SOURCE_TYPE_FILE, false);
			$text = $reader->text();
			if(is_string($text)){
				$text = trim($text);
				if($text !== '') return $text;
			}
		} catch (\Throwable $e) {}
		return null;
	}

	static public function savePayload($uid, $typename, $payload){
		global $DB;
		$field = self::payloadField($typename);
		if(!$field) return false;
		self::get($uid);
		return $DB->update('guaji', [$field=>$payload], ['uid'=>intval($uid)]) !== false;
	}

	static public function payload($uid, $typename){
		global $DB;
		$field = self::payloadField($typename);
		if(!$field) return null;
		$row = self::get($uid);
		if(!empty($row[$field])) return $row[$field];
		$rel = self::qrPath($uid, $typename);
		if(!$rel) return null;
		$full = ROOT.ltrim(str_replace('\\','/',$rel), '/');
		$text = self::decodeQrFile($full);
		if($text){
			$DB->update('guaji', [$field=>$text], ['uid'=>intval($uid)]);
		}
		return $text;
	}

	static public function qrFieldByPayType($typename){
		if($typename === 'wxpay') return 'wx_qr';
		if($typename === 'alipay') return 'ali_qr';
		if($typename === 'qqpay') return 'qq_qr';
		return null;
	}

	static public function qrPath($uid, $typename){
		$field = self::qrFieldByPayType($typename);
		if(!$field) return null;
		$row = self::get($uid);
		return !empty($row[$field]) ? $row[$field] : null;
	}

	static public function typeNameFromVmq($type){
		$type = intval($type);
		if($type === self::TYPE_WX) return 'wxpay';
		if($type === self::TYPE_ALI) return 'alipay';
		if($type === self::TYPE_QQ) return 'qqpay';
		return null;
	}

	static public function dataUri($relPath){
		$full = ROOT.ltrim(str_replace('\\','/',$relPath), '/');
		if(!is_file($full)) return null;
		$mime = 'image/png';
		$ext = strtolower(pathinfo($full, PATHINFO_EXTENSION));
		if($ext === 'jpg' || $ext === 'jpeg') $mime = 'image/jpeg';
		elseif($ext === 'gif') $mime = 'image/gif';
		elseif($ext === 'webp') $mime = 'image/webp';
		return 'data:'.$mime.';base64,'.base64_encode(file_get_contents($full));
	}

	static public function matchOrder($uid, $typename, $price){
		global $DB;
		$typeid = $DB->getColumn("SELECT id FROM pre_type WHERE name=:n LIMIT 1", [':n'=>$typename]);
		if(!$typeid) return null;
		$price = round(floatval($price), 2);
		$row = $DB->getRow("SELECT * FROM pre_order WHERE uid=:uid AND type=:type AND status=0 AND ROUND(realmoney,2)=:price AND addtime>=DATE_SUB(NOW(), INTERVAL ".intval(self::PAY_EXPIRE)." SECOND) ORDER BY addtime ASC LIMIT 1", [
			':uid'=>intval($uid),
			':type'=>$typeid,
			':price'=>$price,
		]);
		if($row) return $row;
		return $DB->getRow("SELECT * FROM pre_order WHERE uid=:uid AND type=:type AND status=0 AND ROUND(money,2)=:price AND addtime>=DATE_SUB(NOW(), INTERVAL ".intval(self::PAY_EXPIRE)." SECOND) ORDER BY addtime ASC LIMIT 1", [
			':uid'=>intval($uid),
			':type'=>$typeid,
			':price'=>$price,
		]);
	}
}
