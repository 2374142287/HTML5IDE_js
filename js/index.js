function logCheck()
{
	var username = _G('username').value;
	var password = _G('password').value;
    if(!username.length || !password.length)
    {
        ErrorTip('block');
        return; 
    }
    
	var data = 'username='+username+'&password='+password+'';

	_PostServer('/login.php', data, function(data){
		data = eval('('+data+')');
		if (data.status == 0)
		{
			ErrorTip('none');
			location = 'anilist.php';
		}else
		{
			ErrorTip('block');
		}
	})
}

function ErrorTip(e)
{
	_G("login_tip").style.display = e;
}
