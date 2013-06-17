<?php

$lang = isset($_REQUEST['dl']) ? $_REQUEST['dl'] : "en";

if($lang == "cn" || $lang == "zh")
    $lang = "zh_CN";

include_once("lang_" . $lang . ".php");

$theme = $_REQUEST["theme"];
if(!$theme) {
	$theme="summer";
}

if (isset($_GET['mode']) && $_GET['mode'] == 'mid')
{
	$mod_dir = 'middle/';
	echo '<script>isMiddleMode = true;</script>';
}else
{
	$mod_dir = '';
	echo '<script>isMiddleMode = false;</script>';
}
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title><?php echo $Lang["TITLE"] ?></title>
<link href="css/<?php echo $mod_dir?>ui.css?bd=MUGEDA_SCRIPT_BUILD_NO" rel="stylesheet" />
<link href="theme/<?php echo$theme?>/theme.css?bd=MUGEDA_SCRIPT_BUILD_NO" rel="stylesheet" />
<link href="components/timeline/Timeline.css?bd=MUGEDA_SCRIPT_BUILD_NO" rel="stylesheet" />
<link href="components/window/win.css?bd=MUGEDA_SCRIPT_BUILD_NO" rel="stylesheet" />
<link href="js/gradient.css?bd=MUGEDA_SCRIPT_BUILD_NO" rel='stylesheet'/>
<script src="components/window/win.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="lang_js.php?lang=<?php echo $lang ?>&bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/jquery-1.7.1.min.js"></script>
<script src="js/mugeda_player_0.1.0.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/mugeda_utils.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/mugeda_local_storage.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/ui_timeline.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="components/timeline/Timeline.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="components/timeline/Slider.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="components/timeline/Zoom.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/ui_lib.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/ui_picture.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/ui_ground.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/ui_mywork.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/ui_font.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/defines.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/aniobject.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/objhelper.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/undo.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/tpicker.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/vrange.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/ui.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/ui_page.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/popup.js?bd=MUGEDA_SCRIPT_BUILD_NO"></script>
<script src="js/gradient.js?bd = MUGEDA_SCRIPT_BUILD_NO"></script>
<script>
window.onload=function(){
    Page.init('<?php echo$theme ?>');
}
</script>
</head>
<body onselectstart="return false" >

<!--
<a href="ui.php?theme=summer" ontouchstart="location.href='ui.php?theme=summer'" style="position:absolute;z-index:1000;right:10px;bottom:180px;">summer</a>
<a href="ui.php" ontouchstart="location.href='ui.php'" style="position:absolute;z-index:1000;right:10px;bottom:140px;">default</a>
-->

<div id="touchPanel">
<div id="touch_canvas_panel">
<table>
<tr>
<td>
<div id="touch_canvas_box">
<canvas id="myCanvas"></canvas>
</div>
</td>
</tr>
</table>
</div>

<div class="touch_icon" id="touch_bar">
<a><i id="COMMAND_NEW" title='<?php echo $Lang["New"] ?>'></i><span class="commandTip"><?php echo $Lang["New"]?></span></a>
<a><i id="COMMAND_OPEN" title='<?php echo $Lang["Open"] ?>'></i><span class="commandTip"><?php echo $Lang["Open"]?></span></a>
<a><i id="COMMAND_SAVE" title='<?php echo $Lang["Save"] ?>'></i><span class="commandTip"><?php echo $Lang["Save"]?></span></a>
<a class="separator"></a>
<a><i id="COMMAND_UNDO" title='<?php echo $Lang["Undo"] ?>'></i><span class="commandTip"><?php echo $Lang["Undo"]?></span></a>
<a><i id="COMMAND_REDO" title='<?php echo $Lang["Redo"] ?>'></i><span class="commandTip"><?php echo $Lang["Redo"]?></span></a>
<a class="separator"></a>
<a><i id="COMMAND_CUT" title='<?php echo $Lang["Cut"] ?>'></i><span class="commandTip"><?php echo $Lang["Cut"]?></span></a>
<a><i id="COMMAND_COPY" title='<?php echo $Lang["Copy"] ?>'></i><span class="commandTip"><?php echo $Lang["Copy"]?></span></a>
<a><i id="COMMAND_PASTE" title='<?php echo $Lang["Paste"] ?>'></i><span class="commandTip"><?php echo $Lang["Paste"]?></span></a>
<a><i id="COMMAND_DELETE" title='<?php echo $Lang["Delete"] ?>'></i><span class="commandTip"><?php echo $Lang["Delete"]?></span></a>
<a class="separator"></a>
<a><i id="COMMAND_ARRANGE" class="advancedOptions" title='<?php echo $Lang["Arrange"] ?>'></i><span class="commandTip"><?php echo $Lang["Arrange"]?></span></a>
<a><i id="GROUP" class="advancedOptions" title='<?php echo $Lang["Group"] ?>'></i><span class="commandTip"><?php echo $Lang["Group"]?></span></a>

<?php
    if ($mod_dir){
?>
<a><i id="COMMAND_ALIGN" class="advancedOptions" title='<?php echo $Lang["Align"] ?>'></i><span class="commandTip"><?php echo $Lang["Align"]?></span></a>
<a><i id="COMMAND_TRANSFORM" class="advancedOptions" title='<?php echo $Lang["Transform"] ?>'></i><span class="commandTip"><?php echo $Lang["Transform"]?></span</a>
<a><i id="COMMAND_COMBINE" class="advancedOptions" title='<?php echo $Lang["Combine"] ?>'></i><span class="commandTip"><?php echo $Lang["Combine"]?></span></a>
<?php
    }
?>
<!--
<!--
<a><i id="COMMAND_PROPERTIES"></i></a>
<a><i id="COMMAND_TIMELINE"></i></a>
<a><i id="COMMAND_PRESENTATION"></i></a>
<a><i id="COMMAND_HELP"></i></a>
-->
</div>

<div id="touch_tool">
<div id="touch_tool_table">
<div id="touch_tool_cell" class="touch_icon">
<a><i id="SHAPE_SELECT" title='<?php echo $Lang["TL_Select"] ?>'></i><span class="commandTip"><?php echo $Lang["TL_Select"]?></span></a>
<a><i id="SHAPE_SCALE" title='<?php echo $Lang["TL_Scale"] ?>'></i><span class="commandTip"><?php echo $Lang["TL_Scale"]?></span></a>
<a><i id="SHAPE_PENCIL" title='<?php echo $Lang["TL_Pencil"] ?>'></i><span class="commandTip"><?php echo $Lang["TL_Pencil"]?></span></a>
<a><i id="SHAPE_LINE" title='<?php echo $Lang["TL_Line"] ?>'></i><span class="commandTip"><?php echo $Lang["TL_Line"]?></span></a>
<a><i id="SHAPE_RECTANGLE" title='<?php echo $Lang["TL_Rectangle"] ?>'></i><span class="commandTip"><?php echo $Lang["TL_Rectangle"]?></span></a>
<a><i id="SHAPE_ELLIPSE" title='<?php echo $Lang["TL_Ellipse"] ?>'></i><span class="commandTip"><?php echo $Lang["TL_Ellipse"]?></span></a>
<a><i id="SHAPE_TEXT" title='<?php echo $Lang["TL_Text"] ?>'></i><span class="commandTip"><?php echo $Lang["TL_Text"]?></span></a>
<a><i id="SHAPE_PICTURE" title='<?php echo $Lang["TL_Picture"] ?>'></i><span class="commandTip"><?php echo $Lang["TL_Picture"]?></span></a>
<a class="tool_sp"><i></i></a>
<a class="tool_sp"><i></i></a>
<a title='Ctrl'><i id="tool_ctrl"></i><span class="commandTip">Ctrl</span></a>
<a title='Shift'><i id="tool_shift"></i><span class="commandTip">Shift</span></a>
<!--
<a><i id="SHAPE_NODE"></i></a>
<a><i id="SHAPE_ZOOM"></i></a>
<a><i id="SHAPE_POLYGON"></i></a>
<a><i id="SHAPE_CURVE"></i></a>
<a><i id="SHAPE_ROUNDED"></i></a>
-->
</div>
</div>
</div>

<div id="touch_timeline">
<div id="mTimeline"></div>
</div>

<div id="touch_prop">

<div id="touch_prop_table">
<div id="touch_prop_cell" >
<div style="padding:10px 0;">
<table class="table_prop">
<tbody id="tr_ground" style="display:none">
<tr><td class='l'><div id="GroundIcon" title="<?php echo $Lang["TL_Fill"] ?>"></div></td><td>
<div class="fillrect" id="param_ground_box"><div id="param_ground" style="background:#fff;"></div>></div>
</td></tr>
<tr class='hide'>
	<td><span id='GroundIcon-tip' class='commandTip'><?php echo $Lang["TL_Fill"] ?></span></td>
	<td></td>
</tr>
<tr><td class='l'><div id="RateIcon" title="<?php echo $Lang["TL_FPS"] ?>"></div></td><td>
<div id="range_rate" class="fillrect"><div><font id="range_rate_text" size=6>60</font><i id="range_rate_weight"></i></div></div>
</td></tr>
<tr class='hide'>
	<td><span id='RateIcon-tip'  class='commandTip'><?php echo $Lang["TL_FPS"] ?></span></td>
	<td></td>
</tr>
<tr><td class='l'><div id="UnlockIcon" title="<?php echo $Lang["TL_UnlockAll"] ?>"></div></td><td>
</td></tr>
<tr class='hide'>
	<td><span id='UnlockIcon-tip'  class='commandTip'><?php echo $Lang["TL_UnlockAll"] ?></span></td>
	<td></td>
</tr>
</tbody>
<tbody id="tr_objects" style="display:none">

<tr id="tr_fillinfo">
<td class='l'><div id="FillIcon" title="<?php echo $Lang["TL_Fill"] ?>"></div></td>
<td rowspan=2><div class="fillrect" id="param_fillInfo_box"><div id="param_fillInfo" style="background:#A1FF00;"></div></div></td>
</tr>
<tr id='tip_fillinfo' class='hide'>
	<td><span id='FillIcon-tip' class='commandTip'><?php echo $Lang["TL_Fill"] ?></span></td>
</tr>

<tr id='tr_stroke'>
<td class='l'><div id="StrokeIcon" title="<?php echo $Lang["TL_Stroke"] ?>"></div></td>
<td rowspan=2><div class="fillrect" id="param_strokeColor_box"><div id="param_strokeColor" style="background:#E00039;"></div></div></td>
</tr>
<tr id='tip_stroke' class='hide'>
	<td><span id='StrokeIcon-tip' class='commandTip'><?php echo $Lang["TL_Stroke"] ?></span></td>
</tr>

<tr id='tr_thick'>
<td class='l'><div id="ThickIcon" title="<?php echo $Lang["TL_LineWidth"] ?>"></div></td>
<td rowspan=2><div id="range_border" class="fillrect"><div><i id="range_border_weight"></i></div></div></td>
</tr>
<tr id='tip_thick' class='hide'>
	<td><span id='ThickIcon-tip' class='commandTip'><?php echo $Lang["TL_LineWidth"] ?></span></td>
</tr>

<tr id="tr_alpha">
<td class='l'><div id="AlphaIcon" title="<?php echo $Lang["TL_Alpha"] ?>"></div></td>
<td rowspan=2><div id="range_alpha" class="fillrect"><div id="range_alpha_mask"></div></div></td>
</tr>
<tr id='tip_alpha' class='hide'>
	<td><span id='AlphaIcon-tip' class='commandTip'><?php echo $Lang["TL_Alpha"] ?></span></td>
</tr>

<tr id='tr_font' class='hide'>
<td class='l'><div id="FontIcon" title="<?php echo $Lang["TL_Text"] ?>"></div></td>
<td rowspan=2><div id="detail_font_box" class="fillrect"><div id='detail_font'style="background-image:url('res/edit-icon.png');"></div></div></td>
</tr>
<tr id='tip_font' class='hide'>
	<td><span id='FontIcon-tip' class='commandTip'><?php echo $Lang["TL_Text"] ?></span></td>
</tr>

<tr>
<td class='l'><div id="LockIcon" title="<?php echo $Lang["TL_Lock"] ?>"></div></td>
<td rowspan=2></td>
</tr>
<tr class='hide'>
	<td><span id='LockIcon-tip'  class='commandTip'><?php echo $Lang["TL_Lock"] ?></span></td>
</tr>
</tbody>
<tbody style="display:none">
<tr><td align="right">type:</td><td>
<select id="fillStyle" onchange="G('gradient').style.display=this.value==0?'none':''">
<option value="0">solid</option>
<option value="1">linear</option>
<option value="2">radial</option>
</select>
</td></tr>
<tr><td align="right">color:</td><td>
<input id="fillColor" onchange="Page.setFillInfo()">
<input type="button" id="gradient" value="gradient" style="display:none"
onclick="G('fillColor').value='-webkit-gradient(linear, 0% 0%, 100% 0%, from(rgb(255, 0, 0)), color-stop(0.5, rgb(255, 255, 255)), to(rgb(0, 136, 0)))';Page.setFillInfo()">
<br>
</td></tr>
</tbody>
<tr><td width="50"></td><td></td></tr>
</table>

</div>
</div>
</div>


<div id="touch_setting_table">
<div id="touch_setting_cell" >
<div class = "touch_setting">
<a><i id = "COMMAND_SETTING" class="advancedOptions" title = "Setting" ></i><span class="commandTip">Setting</span></a>
</div>
</div>
</div>
</div>


<div id="touch_menu_bar" style='display:none;'></div>

<div id="touch_menu" style="display:none">
<b>Arrange</b><div style="display:none">
<a id="COMMAND_Forward">Bring Forward</a>
<a id="COMMAND_Backward">Bring Backward</a>
<a id="COMMAND_Front">Bring Front</a>
<a id="COMMAND_Back">Bring Back</a>
</div>
<b>Align</b><div style="display:none">
<a id="COMMAND_Left">Left</a>
<a id="COMMAND_Right">Right</a>
<a id="COMMAND_Top">Top</a>
<a id="COMMAND_Bottom">Bottom</a>
<a id="COMMAND_HorizontalCenter">HorizontalCenter</a>
<a id="COMMAND_VerticalCenter">VerticalCenter</a>
</div>
<b>Transfrom</b><div style="display:none">
<a id="COMMAND_FlipHorizontal">FlipHorizontal</a>
<a id="COMMAND_FlipVertical">FlipVertical</a>
</div>
<b>Group</b><div style="display:none">
<a id="COMMAND_GROUP">Group</a>
<a id="COMMAND_UNGROUP">Ungroup</a>
</div>
<b>Combine</b><div style="display:none">
<a id="COMMAND_UNION">Union</a>
<a id="COMMAND_JOINT">Joint</a>
<a id="COMMAND_DIFF">Difference</a>
</div>
<b>Setting</b><div style="display:none">
<a id="COMMAND_SAVEIMAGE">Image</a>
<a id="COMMAND_FACEBOOK">Facebook</a>
<a id="COMMAND_TWITTER">Twitter</a>
<a id="COMMAND_GMAIL">Gmail</a>
<a id="COMMAND_TIP">Tip</a>
<a id="COMMAND_BACK">Back</a>

</div>
</div>
</div>


<div id="tpicker_panel" style="display:none">
<div id="tpicker_container" style="min-height:100px;"></div>
</div>
<div id = "gradientBox">
</div>

<div id="fontdetail_panel" style="display:none">
<div id="fontdetail_container" style="min-height:100px;">
<div>
	<ul class='listItem'>
		<li id='FontFamily'></li>
		<li id='FontSize'></li>
		<li><div class='separator'></div></li>
		<li id="FontB"></li>
		<li id="FontI"></li>
	</ul>
	<ul class='listItem'>
		<li id="FontTextLeft"></li>
		<li id="FontTextMiddle"></li>
		<li id="FontTextRight"></li>
		<li><div class='separator'></div></li>
		<li id="FontTTop"></li>
		<li id="FontTMiddle"></li>
		<li id="FontTBottom"></li>
	</ul>
</div>
<div>
	<textarea id="param_text"></textarea>
</div>
</div>
</div>

<div id="vrange_alpha" class="vrange_panel" style="display:none"></div>
<div id="vrange_border" class="vrange_panel" style="display:none"></div>
<div id="vrange_rate" class="vrange_panel" style="display:none"></div>

<div id="direction"></div>
<div id="panel_direction"></div>
<div id='touch_menu_list'>
<div id="arrange">
<ul class='listItem'>
<li><a id="COMMAND_Forward" class='list' title='<?php echo $Lang["Bring Forward"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Bring Forward"] ?></span></li>
<li><a id="COMMAND_Backward" class='list' title='<?php echo $Lang["Bring Backward"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Bring Backward"] ?></span></li>
<li><a id="COMMAND_Front" class='list' title='<?php echo $Lang["Bring to Front"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Bring to Front"] ?></span></li>
<li><a id="COMMAND_Back" class='list' title='<?php echo $Lang["Bring to Back"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Bring to Back"] ?></span></li>
</ul>
</div>
<div id="align">
<ul class="listItem">
<li><a id="COMMAND_Left" class='list' title='<?php echo $Lang["Left"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Left"] ?></span></li>
<li><a id="COMMAND_Right" class='list' title='<?php echo $Lang["Right"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Right"] ?></span></li>
<li><a id="COMMAND_Top" class='list' title='<?php echo $Lang["Top"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Top"] ?></span></li>
<li><a id="COMMAND_Bottom" class='list' title='<?php echo $Lang["Bottom"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Bottom"] ?></span></li>
<li><a id="COMMAND_HorizontalCenter" class='list' title='<?php echo $Lang["Horizontal Center"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Horizontal Center"] ?></span></li>
<li><a id="COMMAND_VerticalCenter" class='list' title='<?php echo $Lang["Vertical Center"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Vertical Center"] ?></span></li>
</ul>
</div>
<div id="transform">
<ul class="listItem">
<li><a id="COMMAND_FlipHorizontal" class='list' title='<?php echo $Lang["Flip Horizontal"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Flip Horizontal"] ?></span></li>
<li><a id="COMMAND_FlipVertical" class='list' title='<?php echo $Lang["Flip Vertical"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Flip Vertical"] ?></span></li>
</ul>
</div>
<div id="group">
<ul class="listItem">
<li><a id="COMMAND_GROUP" class='list' title='<?php echo $Lang["GroupOn"] ?>'></a>
<span class="commandTip"><?php echo $Lang["GroupOn"] ?></span></li>
<li><a id="COMMAND_UNGROUP" class='list' title='<?php echo $Lang["Ungroup"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Ungroup"] ?></span></li>
</ul>
</div>
<div id="combine">
<ul class="listItem">
<li><a id="COMMAND_UNION" class='list' title='<?php echo $Lang["Union"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Union"] ?></span></li>
<li><a id="COMMAND_JOINT" class='list' title='<?php echo $Lang["Joint"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Joint"] ?></span></li>
<li><a id="COMMAND_DIFF" class='list' title='<?php echo $Lang["Difference"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Difference"] ?></span></li>
</ul>
</div>
<div id="setting">
<ul class="listItem">
<li><a id="COMMAND_SAVEIMAGE" class='list' title='<?php echo $Lang["SaveImage"] ?>'></a>
<span class="commandTip"><?php echo $Lang["SaveImage"] ?></span></li>
<li class='separator'></li>
<li><a id="COMMAND_FACEBOOK"  target="_blank" class='list' title='<?php echo $Lang["Facebook"] ?>'></a> 
<span class="commandTip"><?php echo $Lang["Facebook"] ?></span></li>
<li><a id="COMMAND_TWITTER" target="_blank" class='list' title='<?php echo $Lang["Twitter"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Twitter"] ?></span></li>
<li><a id="COMMAND_GMAIL" target="_blank" class='list' title='<?php echo $Lang["Gmail"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Gmail"] ?></span></li>
<li><a id="COMMAND_URL"  target="_blank" class='list' title='<?php echo $Lang["Url"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Url"] ?></span></li>
<li class='separator'></li>
<li><a id="COMMAND_TIP" class='list' title='<?php echo $Lang["Tip"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Tip"] ?></span></li>
<li class='separator'></li>
<li><a id="COMMAND_BACK" class='list' title='<?php echo $Lang["Back"] ?>'></a>
<span class="commandTip"><?php echo $Lang["Back"] ?></span></li>
</ul>
</div>

</div>
<div id="Loading" style="display:none"></div>
</body>
</html>
