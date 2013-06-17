function logout()
{
	var data = 0;
        _PostServer('/logout.php', data, function(data){
                data = eval('('+data+')');
                if (data.status == 0)
                {
                        location = 'index.php';
                }
        })

}

function create()
{
        location = "beginner_client/ui.php"
}

