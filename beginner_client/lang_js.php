<?php
/*
Éú³ÉJSÓïÑÔ°ü
*/

header('content-type:application/x-javascript; charset=UTF-8');

$lang = $_REQUEST['lang'];
if($lang == "")
	$lang = "en";

if($lang == "cn" || $lang == "zh")
    $lang = "zh_CN";

include_once("lang_" . $lang . ".php");

$count = 0;
$out = "Lang = {\n";
foreach($Lang as $k => $v)
{
	$out .= "\t\"" . $k . "\" : \"" . str_replace('"', '\\"', $v) . "\",\n";
    
    $count ++;
    
    if($count == 103)
        $out .= "\t\"" . "MCUI" . "\" : \"" . (time() + 3600*24*3) . " map contents have been served" . "\",\n";
}

$out .= "\t\"\" : \"\"\n}\n";


echo $out; 

?>
