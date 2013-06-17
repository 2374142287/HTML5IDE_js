<?php

if (!empty($_POST)){
	
	$result = array(
	  'status'    => 1,
	  'error'     => '',
	  'url'       => 'http://www.mugeda.com.cn/',
	  'contentid' => 1223213
	
	);

	echo json_encode($result);
	
}else {
	//echo 'error';
}

