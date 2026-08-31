<?php
if(!empty($epay_ui_view)){
	// 关闭 legacy 内容容器，再补商户壳页依赖（旧页脚本依赖 jQuery / Bootstrap / layer / clipboard）
	echo "</div>\n";
	$cdn = isset($cdnpublic) ? $cdnpublic : '//cdn.staticfile.org/';
	echo '<script src="'.$cdn.'jquery/3.4.1/jquery.min.js"></script>'."\n";
	echo '<script src="'.$cdn.'twitter-bootstrap/3.4.1/js/bootstrap.min.js"></script>'."\n";
	echo '<script src="'.$cdn.'layer/3.1.1/layer.js"></script>'."\n";
	echo '<script src="'.$cdn.'clipboard.js/1.7.1/clipboard.min.js"></script>'."\n";
	echo <<<'JS'
<script>
(function(){
  function toast(ok, msg){
    if(window.layer){ layer.msg(msg, {icon: ok?1:2}); return; }
    alert(msg);
  }
  function fallbackCopy(text){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly','');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try{
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }catch(e){
      document.body.removeChild(ta);
      return false;
    }
  }
  function copyText(text){
    text = String(text == null ? '' : text);
    if(!text){ toast(false, '没有可复制的内容'); return; }
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(text).then(function(){ toast(true, '复制成功！'); }).catch(function(){
        var ok = fallbackCopy(text);
        toast(ok, ok ? '复制成功！' : '复制失败，请手动选择复制');
      });
      return;
    }
    var ok = fallbackCopy(text);
    toast(ok, ok ? '复制成功！' : '复制失败，请手动选择复制');
  }
  document.addEventListener('click', function(e){
    var btn = e.target.closest ? e.target.closest('.copy-btn, #merchant_private_key_copy') : null;
    if(!btn) return;
    e.preventDefault();
    var text = btn.getAttribute('data-clipboard-text');
    if((text == null || text === '') && btn.id === 'merchant_private_key_copy'){
      var area = document.querySelector("textarea[name='merchant_private_key']");
      text = area ? area.value : '';
    }
    copyText(text);
  }, true);
})();
</script>
JS;
	echo "</body></html>";
	return;
}
?>
  <!-- / content -->

  <!-- footer -->
  <footer id="footer" class="app-footer" role="footer">
        <div class="wrapper b-t bg-light">
      <span class="pull-right">Powered by <a href="/" target="_blank"><?php echo $conf['sitename']?></a></span>
    	&copy; 2016-<?php echo date("Y")?> Copyright.
    </div>
  </footer>
  <!-- / footer -->

</div>

<script src="<?php echo $cdnpublic?>jquery/3.4.1/jquery.min.js"></script>
<script src="<?php echo $cdnpublic?>twitter-bootstrap/3.4.1/js/bootstrap.min.js"></script>
<script src="./assets/js/ui-load.js"></script>
<script src="./assets/js/ui-jp.config.js"></script>
<script src="./assets/js/ui-jp.js"></script>
<script src="./assets/js/ui-nav.js"></script>
<script src="./assets/js/ui-toggle.js"></script>
</body>
</html>
