<?php
require_once(dirname(__FILE__) . '/../sys_config.php');
require_once(ROOT_PATH . '/session.php');
StartMugedaSession(true, false, true);  // 增加了最后一个参数为true防止跳转。
$urid = GetMugedaUserRefId();  // urid存在表示已登录，否则未登录。
if (!$urid) {
    header('Location:index.php');
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">


<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Mugeda: Cloud-based HTML5 Animation Platform-<?php echo $_GET['name']?></title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" href="css/conf/anilist.css" />
<script src='js/helper.js'></script>
<script src='js/anidetail.js'></script>
<script>
	id = "<?php echo $_GET['id']?>";
</script>
</head>
<body>
<div class="warp">
<!-- 内容 -->
<div class="main">
	<div class="content_top">
	    <div class="top_btn"><a href="javascript:logout()">Logout</a></div>
    	<span class="title"><?php echo $_GET['name']?></span>
        <div class="btn_create"><a href="javascript:create()">Create</a></div>
        <div class="btn_back"><a href="javascript:location='anilist.php'">Back</a></div>

    </div>
    
    <div class="content_conn">
    	<div class="detail_top"></div>
    	<div class="detail_conn">
    		<div class="animation"><iframe style="border:0;overflow:hidden;" width=640px height=480px src='beginner_client/preview.html?id=<?php echo $_GET["id"]?>'></iframe></div>
        </div>
        <div class="clearfix"></div>
    	<div class="detail_bottom">
       		<div class="btn_edit"><a href="javascript:location='beginner_client/ui.php?contentid=<?php echo $_GET['id']?>'">Edit</a></div>    
        </div>
    </div>
    
	<div class="content_bottom">
    </div>    
   
    
</div>
<!-- /内容 -->


</div>


<!-- foot -->
<div class="warp_footer clearfix">
	<div class="footer">
    <div class="footer_top"></div>
    <div class="footer_content">
    <div class="footer_center">
        <div class="foot_l"><a href="#" class="footlogo"><img src="images/bottom_logo.jpg" width="150" height="65" /></a></div>
        <div class="foot_r">
          <div id="copyright">Mugeda Inc. © 2013</div>
        </div>
    </div>
        <div class="clearfix"></div>
    </div>
    </div>
    
</div>
<!--/foot-->
</body>
</html>
