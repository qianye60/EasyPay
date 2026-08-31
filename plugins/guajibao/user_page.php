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
$lastPush = !empty($row['last_push']) ? $row['last_push'].' '.($row['last_push_note'] ?? '') : '尚未收到';
$channels = [
	[
		'type'=>'wxpay',
		'qr'=>'wx_qr',
		'on'=>'wx_on',
		'name'=>'微信支付',
		'icon'=>'/assets/icon/wxpay.ico',
		'tip'=>'上传清晰的微信收款码，系统会解析后重新生成点位图。',
	],
	[
		'type'=>'alipay',
		'qr'=>'ali_qr',
		'on'=>'ali_on',
		'name'=>'支付宝',
		'icon'=>'/assets/icon/alipay.ico',
		'tip'=>'请使用本站「软件下载」里的修复版监控端；新版支付宝把收款金额放在通知标题。',
	],
];
$uploadedCount = 0;
$activeCount = 0;
foreach($channels as $channel){
	if(!empty($row[$channel['qr']])) $uploadedCount++;
	if(intval($row[$channel['on']] ?? 1) === 1) $activeCount++;
}
?>
<style>
.gjb-page{max-width:1080px;margin:0 auto;padding:24px 28px 48px;color:#0f172a}
.gjb-page *{box-sizing:border-box}
.gjb-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:22px}
.gjb-hero h1{margin:0;font-size:24px;font-weight:700;letter-spacing:-.02em}
.gjb-hero p{margin:6px 0 0;color:#64748b;font-size:13px;line-height:1.5}
.gjb-stats{display:flex;gap:8px;flex-shrink:0}
.gjb-stat{min-width:88px;padding:10px 12px;border-radius:12px;background:#fff;border:1px solid #e2e8f0}
.gjb-stat b{display:block;font-size:18px;line-height:1.1}
.gjb-stat span{display:block;margin-top:4px;font-size:11px;color:#94a3b8}
.gjb-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;margin-bottom:18px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.gjb-card-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid #f1f5f9}
.gjb-card-hd h2{margin:0;font-size:15px;font-weight:700}
.gjb-card-hd small{color:#94a3b8;font-size:12px}
.gjb-monitor{display:grid;grid-template-columns:200px 1fr;gap:0}
.gjb-aside{padding:20px;border-right:1px solid #f1f5f9;background:linear-gradient(180deg,#f8fafc 0%,#fff 100%)}
.gjb-aside.online{background:linear-gradient(180deg,#ecfdf5 0%,#fff 55%)}
.gjb-live{display:flex;align-items:center;gap:8px;font-size:20px;font-weight:700;color:#64748b}
.gjb-aside.online .gjb-live{color:#15803d}
.gjb-dot{width:8px;height:8px;border-radius:50%;background:#94a3b8}
.gjb-aside.online .gjb-dot{background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.15)}
.gjb-meta{margin-top:16px;font-size:12px;color:#64748b;line-height:1.7}
.gjb-meta strong{display:block;color:#334155;font-weight:600;word-break:break-all}
.gjb-meta + .gjb-meta{margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0}
.gjb-aside .btn{margin-top:16px;border-radius:8px;width:100%}
.gjb-main{padding:20px;display:grid;grid-template-columns:180px 1fr;gap:20px;align-items:start}
.gjb-scan{text-align:center}
#gjb-qr{display:inline-flex;padding:10px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;min-height:160px;min-width:160px;align-items:center;justify-content:center}
.gjb-scan p{margin:10px 0 0;font-size:12px;color:#94a3b8;line-height:1.5}
.gjb-fields{display:flex;flex-direction:column;gap:12px}
.gjb-field label{display:block;margin:0 0 6px;font-size:12px;font-weight:600;color:#475569}
.gjb-field .input-group{display:flex;width:100%}
.gjb-field .form-control{height:38px;border-color:#e2e8f0;box-shadow:none;border-radius:8px 0 0 8px;background:#f8fafc;color:#334155;font-size:13px}
.gjb-field .form-control:focus{border-color:#94a3b8;background:#fff;box-shadow:none}
.gjb-field .input-group-btn .btn{height:38px;border-color:#e2e8f0;background:#fff;color:#334155;border-radius:0 8px 8px 0;padding:0 14px}
.gjb-field .input-group-btn .btn + .btn{margin-left:-1px}
.gjb-field .help{display:block;margin-top:5px;font-size:11px;color:#94a3b8;line-height:1.5}
.gjb-toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 20px;background:#f8fafc;border-bottom:1px solid #f1f5f9}
.gjb-toolbar label{margin:0;font-size:12px;font-weight:600;color:#475569}
.gjb-toolbar .input-group{width:140px}
.gjb-toolbar .form-control{height:34px;box-shadow:none;border-color:#e2e8f0;font-size:13px}
.gjb-toolbar .input-group-addon{background:#fff;border-color:#e2e8f0;color:#64748b;font-size:12px}
.gjb-toolbar .hint{font-size:12px;color:#94a3b8}
.gjb-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:16px 20px 20px}
.gjb-ch{border:1px solid #e2e8f0;border-radius:14px;padding:16px;background:#fff;display:flex;flex-direction:column;gap:14px;transition:border-color .15s,box-shadow .15s}
.gjb-ch:hover{border-color:#cbd5e1;box-shadow:0 8px 20px rgba(15,23,42,.05)}
.gjb-ch-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.gjb-ch-brand{display:flex;align-items:center;gap:10px;min-width:0}
.gjb-ch-brand img{width:28px;height:28px;border-radius:7px}
.gjb-ch-brand strong{display:block;font-size:15px;font-weight:700}
.gjb-ch-brand span{display:block;font-size:11px;color:#94a3b8;margin-top:1px}
.gjb-badge{display:inline-flex;align-items:center;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:600}
.gjb-badge.on{background:#dcfce7;color:#15803d}
.gjb-badge.off{background:#f1f5f9;color:#64748b}
.gjb-ch-body{display:flex;gap:14px;align-items:flex-start}
.gjb-qr-box{flex-shrink:0;width:88px;height:88px;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;overflow:hidden;display:flex;align-items:center;justify-content:center}
.gjb-qr-box img{width:100%;height:100%;object-fit:cover}
.gjb-qr-box .empty{font-size:12px;color:#94a3b8}
.gjb-ch-tip{flex:1;min-width:0;font-size:12px;line-height:1.65;color:#64748b}
.gjb-ch-actions{display:flex;flex-wrap:wrap;gap:6px;padding-top:2px;border-top:1px solid #f1f5f9}
.gjb-ch-actions .btn{border-radius:8px;padding:6px 10px;font-size:12px;line-height:1.2}
.gjb-ch-actions .btn-info{background:#eff6ff;border-color:#bfdbfe;color:#2563eb}
.gjb-ch-actions .btn-warning{background:#fff7ed;border-color:#fed7aa;color:#c2410c}
.gjb-ch-actions .btn-success{background:#ecfdf5;border-color:#bbf7d0;color:#15803d}
.gjb-ch-actions .btn-primary{background:#0f172a;border-color:#0f172a;color:#fff}
.gjb-ch-actions .btn-default{background:#fff;border-color:#e2e8f0;color:#475569}
.gjb-upload-button{margin:0;cursor:pointer}
.gjb-upload-button.disabled{opacity:.6;pointer-events:none}
@media(max-width:860px){
  .gjb-hero{flex-direction:column}
  .gjb-monitor,.gjb-main{grid-template-columns:1fr}
  .gjb-aside{border-right:0;border-bottom:1px solid #f1f5f9}
  .gjb-scan{display:flex;align-items:center;gap:14px;text-align:left}
  .gjb-scan p{margin:0}
  .gjb-grid{grid-template-columns:1fr}
}
@media(max-width:520px){
  .gjb-page{padding:16px 14px 36px}
  .gjb-stats{width:100%}
  .gjb-stat{flex:1}
  .gjb-scan{display:block;text-align:center}
  .gjb-scan p{margin-top:10px}
  .gjb-ch-actions .btn{flex:1;text-align:center}
}
</style>
<div id="content" class="app-content" role="main">
  <div class="app-content-body">
    <div class="gjb-page">
      <input type="hidden" id="csrf_token" value="<?php echo $csrf_token?>">

      <div class="gjb-hero">
        <div>
          <h1>通道管理</h1>
          <p>连接监控端，上传微信 / 支付宝收款码，到账后自动回调订单。</p>
        </div>
        <div class="gjb-stats">
          <div class="gjb-stat"><b><?php echo $activeCount?>/<?php echo count($channels)?></b><span>已开启</span></div>
          <div class="gjb-stat"><b><?php echo $uploadedCount?>/<?php echo count($channels)?></b><span>已上传码</span></div>
        </div>
      </div>

      <section class="gjb-card">
        <div class="gjb-card-hd">
          <h2>监控端</h2>
          <small>先装 APP，再扫码配置</small>
        </div>
        <div class="gjb-monitor">
          <aside class="gjb-aside <?php echo $online ? 'online' : ''?>">
            <div class="gjb-live"><i class="gjb-dot"></i><?php echo $online ? '在线' : '离线'?></div>
            <div class="gjb-meta">最后心跳<strong><?php echo h($lastHeart)?></strong></div>
            <div class="gjb-meta">最近推送<strong title="<?php echo h($lastPush)?>"><?php echo h($lastPush)?></strong></div>
            <a href="softdown.php" class="btn btn-success btn-sm">下载监控 APP</a>
          </aside>
          <div class="gjb-main">
            <div class="gjb-scan">
              <div id="gjb-qr"></div>
              <p>用监控 APP 扫码配置，不要用微信 / 支付宝扫。</p>
            </div>
            <div class="gjb-fields">
              <div class="gjb-field">
                <label for="gjb-cfg">配置数据</label>
                <div class="input-group">
                  <input class="form-control" type="text" id="gjb-cfg" value="<?php echo h($configData)?>" readonly>
                  <span class="input-group-btn"><button class="btn btn-default" type="button" onclick="copyText('gjb-cfg')">复制</button></span>
                </div>
                <span class="help">APP「手动配置」整串粘贴</span>
              </div>
              <div class="gjb-field">
                <label for="gjb-url">监控地址</label>
                <div class="input-group">
                  <input class="form-control" type="text" id="gjb-url" value="<?php echo h($monitor)?>" readonly>
                  <span class="input-group-btn"><button class="btn btn-default" type="button" onclick="copyText('gjb-url')">复制</button></span>
                </div>
              </div>
              <div class="gjb-field">
                <label for="gjb-key">通讯密钥</label>
                <div class="input-group">
                  <input class="form-control" type="text" id="gjb-key" value="<?php echo h($row['gjb_key'])?>" readonly>
                  <span class="input-group-btn">
                    <button class="btn btn-default" type="button" onclick="copyText('gjb-key')">复制</button>
                    <button class="btn btn-warning" type="button" onclick="resetKey()">重置</button>
                  </span>
                </div>
                <span class="help">仅监控 APP 使用；重置后需重新扫码</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="gjb-card">
        <div class="gjb-card-hd">
          <h2>收款通道</h2>
          <small>目前开放微信、支付宝</small>
        </div>
        <div class="gjb-toolbar">
          <label for="gjb-test-money">测试金额</label>
          <div class="input-group">
            <span class="input-group-addon">¥</span>
            <input class="form-control" type="number" id="gjb-test-money" value="0.01" min="0.01" step="0.01">
          </div>
          <span class="hint">「测试订单 / 模拟推送」共用此金额</span>
        </div>
        <div class="gjb-grid">
<?php foreach($channels as $ch){
	$src = !empty($row[$ch['qr']]) ? '/'.ltrim($row[$ch['qr']], '/').'?v='.time() : '';
	$on = intval($row[$ch['on']] ?? 1) === 1;
	$ready = $src !== '';
?>
          <article class="gjb-ch">
            <div class="gjb-ch-top">
              <div class="gjb-ch-brand">
                <img src="<?php echo h($ch['icon'])?>" alt="">
                <div>
                  <strong><?php echo h($ch['name'])?></strong>
                  <span><?php echo $ready ? '收款码已就绪' : '尚未上传收款码'?></span>
                </div>
              </div>
              <?php echo $on ? '<span class="gjb-badge on">开启</span>' : '<span class="gjb-badge off">关闭</span>'; ?>
            </div>
            <div class="gjb-ch-body">
              <div class="gjb-qr-box">
                <?php if($src){ ?><img src="<?php echo h($src)?>" alt="<?php echo h($ch['name'])?>收款码"><?php }else{ ?><span class="empty">未上传</span><?php } ?>
              </div>
              <div class="gjb-ch-tip"><?php echo h($ch['tip'])?></div>
            </div>
            <div class="gjb-ch-actions">
              <label class="btn btn-info gjb-upload-button" data-label="<?php echo $ready ? '重新上传' : '上传收款码'?>">
                <span><?php echo $ready ? '重新上传' : '上传收款码'?></span>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-field="<?php echo $ch['qr']?>" class="gjb-file" style="display:none">
              </label>
              <button type="button" class="btn btn-<?php echo $on?'warning':'success'?>" onclick="toggleCh('<?php echo $ch['type']?>',<?php echo $on?0:1?>)"><?php echo $on?'关闭通道':'开启通道'?></button>
              <button type="button" class="btn btn-primary" onclick="testOrder('<?php echo $ch['type']?>')">测试订单</button>
              <button type="button" class="btn btn-default" onclick="simulatePush('<?php echo $ch['type']?>')">模拟推送</button>
            </div>
          </article>
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
      jQuery(el).empty().qrcode({text:text, width:140, height:140});
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
          if(window.layer) layer.msg(d.msg || '上传成功');
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
