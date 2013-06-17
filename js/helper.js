function _G(id)
{
        return document.getElementById(id)
}

function _GetServer(url, callback)
{
	var xmlhttp = _getAjax();
	xmlhttp.onreadystatechange=function()
	{
  		if (xmlhttp.readyState==4 && xmlhttp.status==200)
    		{
    			callback(xmlhttp.responseText);
    		}
  	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function _PostServer(url, data, callback)
{
	var xmlhttp = _getAjax();
	xmlhttp.onreadystatechange=function()
	{
  		if (xmlhttp.readyState==4 && xmlhttp.status==200)
    		{
    			callback(xmlhttp.responseText);
    		}
  	}
	xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xmlhttp.send(data);
}

function _getAjax()
{
	var xmlhttp;
	if (window.XMLHttpRequest)
  	{// code for IE7+, Firefox, Chrome, Opera, Safari
 		xmlhttp=new XMLHttpRequest();
  	}
	else
  	{// code for IE6, IE5
  		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  	}
	return xmlhttp;
}
