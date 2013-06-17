<?php
require_once(dirname(__FILE__) . '/../sys_config.php');
require_once(ROOT_PATH . '/session.php');
StartMugedaSession(true, false, true);  // 增加了最后一个参数为true防止跳转。
$urid = GetMugedaUserRefId();  // urid存在表示已登录，否则未登录。
if ($urid) {
    header('Location:anilist.php');
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Mugeda: Cloud-based HTML5 Animation Platform</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" href="css/conf/login.css" />
<script src='js/helper.js'></script>
<script src='js/index.js'></script>
</head>
<body>
<!-- 内容 -->
<div class="warp">
    <div class="main clearfix">
    <form id="loginForm" action ="login_do.php" method="post">
		<!-- loginBox -->
        <div class="loginBox">       	
            <div class="login_top">Mugeda Login</div>
            <div class="login_conn clearfix">
            	<div class="prompt"><span id="login_tip" style="display:none;">Invalid account or password.</span></div>
            	<div class="input">Account&nbsp;<input type="text" id="username" class="login_input" onkeydown="if(event.keyCode==13)logCheck()"/></div>
            	<div class="input">Password&nbsp;<input type="password" id="password" class="login_input" onkeydown="if(event.keyCode==13)logCheck()"/></div>
                <div class="login_btn"><a  href="javascript:logCheck()">Log in</a></div>                 
            	<br class="clearfloat" />
            </div>         
        </div>
        <br class="clearfloat" />
        <!-- /loginBox -->
    </form>
    <div class="login_plate"></div>
    <br class="clearfloat" />
    </div>
</div>
<!-- /内容 -->

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
