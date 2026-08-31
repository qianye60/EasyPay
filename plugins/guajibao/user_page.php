<?php
require '/var/www/html/includes/common.php';
if($islogin2==1){}else exit("<script language='javascript'>window.location.href='./login.php';</script>");
$title='通道管理';
include '/var/www/html/user/head.php';
require_once PLUGIN_ROOT.'guajibao/inc/helper.php';
$row = GuajiHelper::get($uid);
$csrf_token = bin2hex(random_bytes(16));
$_SESSION['csrf_token'] = $csrf_token;
$monitor = rtrim($siteurl, '/').'/gjb/'.$uid.'/';
$configData = GuajiHelper::configData($uid);
$online = GuajiHelper::online($uid);
$lastHeart = !empty($row['last_heart']) ? $row['last_heart'] : '无';
$lastPush = !empty($row['last_push']) ? $row['last_push'].' '.($row['last_push_note'] ?? '') : '无（付款后监控端要把到账通知推上来）';
$channels = [
	['type'=>'wxpay', 'qr'=>'wx_qr', 'on'=>'wx_on', 'name'=>'微信支付', 'note'=>'上传清晰的微信收款码。系统会解析出码内容并重新生成点位图，不会直接展示原图。'],
	['type'=>'alipay', 'qr'=>'ali_qr', 'on'=>'ali_on', 'name'=>'支付宝', 'note'=>'上传清晰的支付宝收款码。请安装本站「软件下载」里的修复版监控端：新版支付宝把「成功收款」放在标题，官方旧包只扫内容会漏推。'],
	['type'=>'qqpay', 'qr'=>'qq_qr', 'on'=>'qq_on', 'name'=>'QQ钱包', 'note'=>'上传清晰的 QQ 收款码。官方 V免签 APP 不听 QQ 通知，需挂机宝等能推 QQ 到账的监控端。'],
];
$uploadedCount = 0;
$activeCount = 0;
foreach($channels as $channel){
	if(!empty($row[$channel['qr']])) $uploadedCount++;
	if(intval($row[$channel['on']] ?? 1) === 1) $activeCount++;
}
?>
<style>
.gjb-page{max-width:1180px;margin:0 auto;padding:28px 32px 48px;color:#1f2937}
.gjb-page *{box-sizing:border-box}
.gjb-page .gjb-title{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:24px}
.gjb-page .gjb-title h1{margin:0;font-size:26px;font-weight:700;color:#111827}
.gjb-page .gjb-title p{margin:7px 0 0;color:#94a3b8;font-size:13px}
.gjb-summary{display:flex;gap:10px}.gjb-summary-item{min-width:92px;padding:10px 13px;border:1px solid #e8edf3;border-radius:10px;background:#fff;text-align:left}.gjb-summary-item strong{display:block;font-size:17px;line-height:1.1;color:#111827}.gjb-summary-item span{display:block;margin-top:4px;color:#94a3b8;font-size:11px}
.gjb-card{background:#fff;border:1px solid #e8edf3;border-radius:16px;box-shadow:0 8px 24px rgba(15,23,42,.045);margin-bottom:20px;overflow:hidden}
.gjb-card-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #edf1f5}
.gjb-card-head h2{margin:0;font-size:17px;font-weight:700;color:#111827}
.gjb-card-head small{color:#94a3b8;font-size:12px}
.gjb-monitor{display:grid;grid-template-columns:220px 1fr;gap:28px;padding:24px}
.gjb-status{border-radius:14px;padding:20px;background:#ecfdf5;border:1px solid #d1fae5;min-height:170px}
.gjb-status.offline{background:#f8fafc;border-color:#e2e8f0}
.gjb-status-label{font-size:12px;color:#64748b;margin-bottom:14px}
.gjb-status-value{display:flex;align-items:center;gap:9px;font-size:22px;font-weight:700;color:#15803d}
.gjb-status.offline .gjb-status-value{color:#64748b}
.gjb-dot{width:9px;height:9px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 5px rgba(34,197,94,.13)}
.gjb-status.offline .gjb-dot{background:#94a3b8;box-shadow:0 0 0 5px rgba(148,163,184,.15)}
.gjb-status-meta{margin-top:22px;color:#64748b;font-size:12px;line-height:1.8}
.gjb-status-push{margin-top:14px;padding-top:12px;border-top:1px solid rgba(148,163,184,.22);color:#64748b;font-size:12px;line-height:1.6}.gjb-status-push strong{display:block;color:#334155;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gjb-status .btn{margin-top:14px;border-radius:8px;padding:7px 12px}
.gjb-fields{display:grid;grid-template-columns:1fr 1fr;gap:18px 22px}
.gjb-field{min-width:0}.gjb-field-wide{grid-column:1/-1}
.gjb-field label{display:block;margin-bottom:8px;font-size:13px;font-weight:600;color:#475569}
.gjb-field .input-group{display:flex;width:100%}.gjb-field .form-control{height:40px;border-color:#dbe3ec;box-shadow:none;border-radius:9px 0 0 9px;color:#334155;background:#fbfdff}
.gjb-field .input-group-btn .btn{height:40px;border-color:#dbe3ec;background:#fff;color:#334155;border-radius:0 9px 9px 0;padding:0 16px}
.gjb-field .input-group-btn .btn + .btn{margin-left:-1px;border-radius:0 9px 9px 0}
.gjb-field .help-block{margin:7px 0 0;color:#94a3b8;font-size:12px;line-height:1.6}
.gjb-qr-wrap{display:flex;align-items:center;gap:18px;padding:14px;background:#f8fafc;border:1px solid #e8edf3;border-radius:12px}
#gjb-qr{display:inline-flex;padding:8px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;min-height:196px;min-width:196px;align-items:center;justify-content:center}
.gjb-qr-wrap .help-block{margin:0;max-width:240px}
.gjb-testbar{display:flex;align-items:center;gap:12px;padding:18px 24px;background:#f8fafc;border-bottom:1px solid #edf1f5}
.gjb-testbar label{margin:0;font-size:13px;font-weight:600;color:#475569}.gjb-testbar .input-group{width:170px}.gjb-testbar .form-control{height:38px;box-shadow:none;border-color:#dbe3ec}.gjb-testbar .input-group-addon{background:#fff;border-color:#dbe3ec;color:#64748b}.gjb-testbar .help-block{margin:0;color:#94a3b8;font-size:12px}
.gjb-channels{padding:0 24px 24px}.gjb-channel{display:grid;grid-template-columns:minmax(230px,1.5fr) 110px 86px minmax(250px,1fr);gap:18px;align-items:center;padding:20px 0;border-bottom:1px solid #edf1f5}.gjb-channel:last-child{border-bottom:0;padding-bottom:0}
.gjb-channel{transition:background .18s ease}.gjb-channel:hover{background:#fbfdff}.gjb-field .form-control:focus{border-color:#93c5fd;box-shadow:0 0 0 3px rgba(59,130,246,.10)}.gjb-actions .btn:focus,.gjb-status .btn:focus{box-shadow:0 0 0 3px rgba(59,130,246,.16);outline:0}
.gjb-channel-name{font-size:15px;font-weight:700;color:#1e293b;margin-bottom:6px}.gjb-channel-note{font-size:12px;line-height:1.6;color:#94a3b8;max-width:330px}
.gjb-qr-thumb{width:76px;height:76px;object-fit:cover;border:1px solid #e2e8f0;border-radius:9px;background:#f8fafc}.gjb-empty{display:flex;align-items:center;justify-content:center;width:76px;height:76px;border:1px dashed #cbd5e1;border-radius:9px;color:#94a3b8;font-size:12px}
.gjb-badge{display:inline-flex;align-items:center;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:600}.gjb-badge.on{background:#dcfce7;color:#15803d}.gjb-badge.off{background:#f1f5f9;color:#64748b}
.gjb-actions{display:flex;flex-wrap:wrap;gap:7px}.gjb-actions .btn{border-radius:8px;padding:7px 11px;font-size:12px}.gjb-actions .btn-info{background:#eff6ff;border-color:#bfdbfe;color:#2563eb}.gjb-actions .btn-warning{background:#fff7ed;border-color:#fed7aa;color:#c2410c}.gjb-actions .btn-success{background:#ecfdf5;border-color:#bbf7d0;color:#15803d}.gjb-actions .btn-primary{background:#111827;border-color:#111827;color:#fff}
@media(max-width:900px){.gjb-page{padding:22px 18px 36px}.gjb-monitor{grid-template-columns:1fr;gap:18px}.gjb-status{min-height:0}.gjb-channel{grid-template-columns:1fr 90px;gap:14px}.gjb-channel-status{grid-column:2;grid-row:1}.gjb-channel-qr{grid-column:2;grid-row:2}.gjb-channel-info{grid-column:1;grid-row:1/span 2}.gjb-channel-actions{grid-column:1/-1;grid-row:3}.gjb-channel-note{max-width:none}}
@media(max-width:560px){.gjb-page .gjb-title{display:block}.gjb-page .gjb-title h1{font-size:22px}.gjb-summary{margin-top:16px}.gjb-summary-item{flex:1;min-width:0}.gjb-card-head{padding:17px}.gjb-monitor,.gjb-channels{padding:17px}.gjb-fields{grid-template-columns:1fr}.gjb-field-wide{grid-column:auto}.gjb-qr-wrap{display:block}.gjb-qr-wrap .help-block{margin-top:10px;max-width:none}.gjb-testbar{padding:15px 17px;flex-wrap:wrap}.gjb-testbar .help-block{width:100%}.gjb-channel{grid-template-columns:1fr 76px}.gjb-channel-status{grid-column:2}.gjb-channel-qr{grid-column:2}.gjb-channel-info{grid-column:1;grid-row:1/span 2}.gjb-actions .btn{flex:1;text-align:center}}
</style>
<div id="content" class="app-content" role="main">
  <div class="app-content-body">
    <div class="gjb-page">
      <input type="hidden" id="csrf_token" value="<?php echo $csrf_token?>">
      <div class="gjb-title"><div><h1>通道管理</h1><p>配置监控端与个人收款渠道，订单到账会自动同步。</p></div><div class="gjb-summary"><div class="gjb-summary-item"><strong><?php echo $activeCount?> / <?php echo count($channels)?></strong><span>已开启通道</span></div><div class="gjb-summary-item"><strong><?php echo $uploadedCount?> / <?php echo count($channels)?></strong><span>已上传收款码</span></div></div></div>
      <section class="gjb-card">
        <div class="gjb-card-head"><h2>监控端</h2><small>挂机宝连接状态与配置</small></div>
        <div class="gjb-monitor">
          <div class="gjb-status <?php echo $online ? '' : 'offline'?>">
            <div class="gjb-status-label">软件状态</div>
            <div class="gjb-status-value"><i class="gjb-dot"></i><?php echo $online ? '在线' : '离线'?></div>
            <div class="gjb-status-meta">最后心跳<br><strong><?php echo h($lastHeart)?></strong></div>
            <div class="gjb-status-push">最近收款推送<strong title="<?php echo h($lastPush)?>"><?php echo h($lastPush)?></strong></div>
            <a href="softdown.php" class="btn btn-success btn-sm">软件下载</a>
          </div>
          <div class="gjb-fields">
            <div class="gjb-field gjb-field-wide"><label>扫码配置</label><div class="gjb-qr-wrap"><div id="gjb-qr"></div><span class="help-block">打开监控 APP，点击「扫码配置」扫描此二维码。请勿使用微信或支付宝扫码。</span></div></div>
            <div class="gjb-field"><label for="gjb-cfg">配置数据</label><div class="input-group"><input class="form-control" type="text" id="gjb-cfg" value="<?php echo h($configData)?>" readonly><span class="input-group-btn"><button class="btn btn-default" type="button" onclick="copyText('gjb-cfg')">复制</button></span></div><span class="help-block">APP「手动配置」整串粘贴，格式为 地址/密钥。</span></div>
            <div class="gjb-field"><label for="gjb-url">监控地址</label><div class="input-group"><input class="form-control" type="text" id="gjb-url" value="<?php echo h($monitor)?>" readonly><span class="input-group-btn"><button class="btn btn-default" type="button" onclick="copyText('gjb-url')">复制</button></span></div><span class="help-block">用于监控 APP 连接本站。</span></div>
            <div class="gjb-field gjb-field-wide"><label for="gjb-key">软件通讯密钥</label><div class="input-group"><input class="form-control" type="text" id="gjb-key" value="<?php echo h($row['gjb_key'])?>" readonly><span class="input-group-btn"><button class="btn btn-default" type="button" onclick="copyText('gjb-key')">复制</button><button class="btn btn-warning" type="button" onclick="resetKey()">重置</button></span></div><span class="help-block">仅供监控 APP 使用，与网站对接的商户密钥不同。重置后需要重新扫码。</span></div>
          </div>
        </div>
      </section>
      <section class="gjb-card">
        <div class="gjb-card-head"><h2>收款通道</h2><small>上传收款码后即可接收订单</small></div>
        <div class="gjb-testbar"><label for="gjb-test-money">测试金额</label><div class="input-group"><span class="input-group-addon">¥</span><input class="form-control" type="number" id="gjb-test-money" value="0.01" min="0.01" step="0.01"></div><span class="help-block">点击通道的「测试订单」会按此金额下单</span></div>
        <div class="gjb-channels">
<?php foreach($channels as $ch){
	$src = !empty($row[$ch['qr']]) ? '/'.ltrim($row[$ch['qr']], '/').'?v='.time() : '';
	$on = intval($row[$ch['on']] ?? 1) === 1;
?>
              <div class="gjb-channel">
                <div class="gjb-channel-info"><div class="gjb-channel-name"><?php echo h($ch['name'])?></div><div class="gjb-channel-note"><?php echo h($ch['note'])?></div></div>
                <div class="gjb-channel-qr"><?php if($src){ ?><img class="gjb-qr-thumb" src="<?php echo h($src)?>" alt="<?php echo h($ch['name'])?>收款码"><?php }else{ ?><span class="gjb-empty">未上传</span><?php } ?></div>
                <div class="gjb-channel-status"><?php echo $on ? '<span class="gjb-badge on">开启</span>' : '<span class="gjb-badge off">关闭</span>'; ?></div>
                <div class="gjb-channel-actions gjb-actions">
                  <label class="btn btn-xs btn-info gjb-upload-button" data-label="<?php echo $src ? '重新上传' : '上传收款码'?>"><span><?php echo $src ? '重新上传' : '上传收款码'?></span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-field="<?php echo $ch['qr']?>" class="gjb-file" style="display:none"></label>
                  <button type="button" class="btn btn-xs btn-<?php echo $on?'warning':'success'?>" onclick="toggleCh('<?php echo $ch['type']?>',<?php echo $on?0:1?>)"><?php echo $on?'关闭':'开启'?></button>
                  <button type="button" class="btn btn-xs btn-primary" onclick="testOrder('<?php echo $ch['type']?>')">测试订单</button>
                  <button type="button" class="btn btn-xs btn-default" onclick="simulatePush('<?php echo $ch['type']?>')">模拟推送</button>
                </div>
              </div>
<?php } ?>
        </div>
      </section>
    </div>
  </div>
</div>
<script>
function copyText(id){
  var el = document.getElementById(id);
  el.select();
  document.execCommand('copy');
  if(window.layer) layer.msg('已复制'); else alert('已复制');
}
function postAct(data, cb){
  data.csrf_token = document.getElementById('csrf_token').value;
  var fd = new FormData();
  Object.keys(data).forEach(function(k){ fd.append(k, data[k]); });
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/gjb-upload.php');
  xhr.onload = function(){
    try{ cb(JSON.parse(xhr.responseText)); }catch(e){ alert('请求失败'); }
  };
  xhr.send(fd);
}
function toggleCh(type, on){
  postAct({act:'toggle', type:type, on:on}, function(d){
    if(d.code===0) location.reload(); else alert(d.msg||'失败');
  });
}
function resetKey(){
  if(!confirm('重置后监控 APP 里的旧密钥会失效，确定？')) return;
  postAct({act:'resetkey'}, function(d){
    if(d.code===0) location.reload(); else alert(d.msg||'失败');
  });
}
function testOrder(type){
  var money = (document.getElementById('gjb-test-money').value || '').trim();
  if(!money){ alert('请填写测试金额'); return; }
  postAct({act:'testorder', type:type, money:money}, function(d){
    if(d.code===0 && d.url){ window.open(d.url, '_blank'); }
    else { alert(d.msg||'无法创建测试订单'); }
  });
}
function simulatePush(type){
  var money = (document.getElementById('gjb-test-money').value || '').trim();
  if(!money){ alert('请填写测试金额'); return; }
  if(!confirm('将模拟监控 APP 的到账推送（不经过手机）。请先用「测试订单」开一笔同金额待支付单。')) return;
  postAct({act:'simulatePush', type:type, money:money}, function(d){
    alert(d.msg||'完成');
    if(d.code===0) location.reload();
  });
}
(function(){
  var el = document.getElementById('gjb-qr');
  var text = document.getElementById('gjb-cfg').value;
  if(!el || !text) return;
  var draw = function(){
    if(window.jQuery && jQuery.fn.qrcode){
      jQuery(el).empty().qrcode({text:text, width:180, height:180});
    }
  };
  if(window.jQuery && jQuery.fn.qrcode){ draw(); return; }
  var s1 = document.createElement('script');
  s1.src = <?php echo json_encode($cdnpublic.'jquery/3.4.1/jquery.min.js')?>;
  s1.onload = function(){
    var s2 = document.createElement('script');
    s2.src = <?php echo json_encode($cdnpublic.'jquery.qrcode/1.0/jquery.qrcode.min.js')?>;
    s2.onload = draw;
    document.body.appendChild(s2);
  };
  document.body.appendChild(s1);
})();
document.querySelectorAll('.gjb-file').forEach(function(input){
  input.addEventListener('change', function(){
    if(!this.files || !this.files[0]) return;
    var currentInput = this;
    var button = currentInput.parentNode;
    var buttonText = button.querySelector('span');
    var originalText = button.getAttribute('data-label') || '上传收款码';
    currentInput.disabled = true;
    button.classList.add('disabled');
    buttonText.textContent = '上传中...';
    var fd = new FormData();
    fd.append('csrf_token', document.getElementById('csrf_token').value);
    fd.append('act', 'upload');
    fd.append('field', this.getAttribute('data-field'));
    fd.append('file', this.files[0]);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/gjb-upload.php');
    xhr.onload = function(){
      try{
        var d = JSON.parse(xhr.responseText);
        if(d.code === 0){
          if(window.layer) layer.msg(d.msg || '重新上传成功');
          setTimeout(function(){ location.reload(); }, 600);
          return;
        }
        alert(d.msg || '上传失败');
      }catch(e){ alert('上传失败'); }
      currentInput.disabled = false;
      currentInput.value = '';
      button.classList.remove('disabled');
      buttonText.textContent = originalText;
    };
    xhr.onerror = function(){
      alert('上传失败，请检查网络后重试');
      currentInput.disabled = false;
      currentInput.value = '';
      button.classList.remove('disabled');
      buttonText.textContent = originalText;
    };
    xhr.send(fd);
  });
});
</script>
<?php include '/var/www/html/user/foot.php'; ?>
