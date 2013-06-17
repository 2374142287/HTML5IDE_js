<?php
session_start();
$_SESSION['isLogin'] = true;

echo '{"status":0,"error":"Ok"}';
?>
