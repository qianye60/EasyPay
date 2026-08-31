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
	['type'=>'alipay', 'qr'=>'ali_qr', 'on'=>'ali_on', 'name'=>'支付宝', 'note'=>'上传清晰的支付宝收款码。系统会解析出码内容并重新生成点位图，不会直接展示原图。'],
	['type'=>'qqpay', 'qr'=>'qq_qr', 'on'=>'qq_on', 'name'=>'QQ钱包', 'note'=>'上传清晰的 QQ 收款码。官方 V免签 APP 不听 QQ 通知，需挂机宝等能推 QQ 到账的监控端。'],
];
?>
<div id="content" class="app-content" role="main">
  <div class="app-content-body">
    <div class="bg-light lter b-b wrapper-md hidden-print">
      <h1 class="m-n font-thin h3">通道管理</h1>
    </div>
    <div class="wrapper-md control">
      <input type="hidden" id="csrf_token" value="<?php echo $csrf_token?>">
      <div class="panel panel-default">
        <div class="panel-heading"><h4 class="panel-title">监控端</h4></div>
        <div class="panel-body form-horizontal">
          <div class="form-group">
            <label class="col-sm-2 control-label">软件状态</label>
            <div class="col-sm-9" style="padding-top:7px">
              <?php if($online){ ?><span class="label label-success">在线</span><?php }else{ ?><span class="label label-default">离线</span><?php } ?>
              <a href="softdown.php" class="btn btn-xs btn-success" style="margin-left:8px">软件下载</a>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label">最后心跳</label>
            <div class="col-sm-9" style="padding-top:7px"><?php echo h($lastHeart)?></div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label">最后收款推送</label>
            <div class="col-sm-9" style="padding-top:7px"><?php echo h($lastPush)?></div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label">扫码配置</label>
            <div class="col-sm-9">
              <div id="gjb-qr" style="display:inline-block;padding:8px;background:#fff;border:1px solid #eee"></div>
              <p class="help-block" style="margin-top:8px">打开监控 APP，点「扫码配置」，扫这个码。不要用微信/支付宝扫。</p>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label">配置数据</label>
            <div class="col-sm-9">
              <div class="input-group">
                <input class="form-control" type="text" id="gjb-cfg" value="<?php echo h($configData)?>" readonly>
                <span class="input-group-btn"><button class="btn btn-default" type="button" onclick="copyText('gjb-cfg')">复制</button></span>
              </div>
              <span class="help-block">APP「手动配置」整串粘贴。格式是 地址/密钥，官方监控端只认这一段。</span>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label">监控地址</label>
            <div class="col-sm-9">
              <div class="input-group">
                <input class="form-control" type="text" id="gjb-url" value="<?php echo h($monitor)?>" readonly>
                <span class="input-group-btn"><button class="btn btn-default" type="button" onclick="copyText('gjb-url')">复制</button></span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label">软件通讯密钥</label>
            <div class="col-sm-9">
              <div class="input-group">
                <input class="form-control" type="text" id="gjb-key" value="<?php echo h($row['gjb_key'])?>" readonly>
                <span class="input-group-btn">
                  <button class="btn btn-default" type="button" onclick="copyText('gjb-key')">复制</button>
                  <button class="btn btn-warning" type="button" onclick="resetKey()">重置</button>
                </span>
              </div>
              <span class="help-block">只给监控 APP 用，和网站对接的商户密钥不是同一把。重置后要重新扫码。</span>
            </div>
          </div>
        </div>
      </div>
      <div class="panel panel-default">
        <div class="panel-heading"><h4 class="panel-title">收款通道</h4></div>
        <div class="panel-body" style="padding-bottom:8px">
          <div class="form-inline">
            <label>测试金额</label>
            <div class="input-group" style="width:180px;margin-left:8px">
              <span class="input-group-addon">¥</span>
              <input class="form-control" type="number" id="gjb-test-money" value="0.01" min="0.01" step="0.01">
            </div>
            <span class="help-block" style="display:inline;margin-left:8px">点某通道的「测试订单」会按这个金额下单</span>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-striped" style="margin:0">
            <thead><tr><th>通道</th><th>收款码</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
<?php foreach($channels as $ch){
	$src = !empty($row[$ch['qr']]) ? '/'.ltrim($row[$ch['qr']], '/').'?v='.time() : '';
	$on = intval($row[$ch['on']] ?? 1) === 1;
?>
              <tr>
                <td>
                  <strong><?php echo h($ch['name'])?></strong>
                  <div class="text-muted" style="font-size:12px;max-width:280px"><?php echo h($ch['note'])?></div>
                </td>
                <td>
                  <?php if($src){ ?><img src="<?php echo h($src)?>" alt="" style="height:72px;border:1px solid #eee"><?php }else{ ?><span class="text-muted">未上传</span><?php } ?>
                </td>
                <td><?php echo $on ? '<span class="label label-success">开启</span>' : '<span class="label label-default">关闭</span>'; ?></td>
                <td>
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-field="<?php echo $ch['qr']?>" class="gjb-file" style="margin-bottom:6px">
                  <button type="button" class="btn btn-xs btn-<?php echo $on?'warning':'success'?>" onclick="toggleCh('<?php echo $ch['type']?>',<?php echo $on?0:1?>)"><?php echo $on?'关闭':'开启'?></button>
                  <button type="button" class="btn btn-xs btn-primary" onclick="testOrder('<?php echo $ch['type']?>')">测试订单</button>
                </td>
              </tr>
<?php } ?>
            </tbody>
          </table>
        </div>
      </div>
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
        if(d.code === 0){ location.reload(); }
        else { alert(d.msg || '上传失败'); }
      }catch(e){ alert('上传失败'); }
    };
    xhr.send(fd);
  });
});
</script>
<?php include '/var/www/html/user/foot.php'; ?>
