<?php
if(isset($_REQUEST['id'])) 		$id 	= $_REQUEST['id'] =1;
if(isset($_REQUEST['mode']))	$mode 	= $_REQUEST['mode']	= "debug";
if(isset($_REQUEST['refid'])) 	$refid 	= $_REQUEST['refid'] = "sdfjsdljflsdjfsdjfljk";
if(!empty($id) && !empty($mode) && !empty($refid))
{
	$result = array(
		"status"	=> 0,
		"url" 		=> "http://localhost/mugeda_ide/test.php"
		);
	echo json_encode($result);die;
}
else
{
	$result = array("status"	=> 2);
	echo json_encode($result);die;
}