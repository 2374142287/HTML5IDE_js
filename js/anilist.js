function logout()
{
	var data = '';
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

function getlist(page)
{
	var o = _G("albumlistcontent");
	var list = "";
	_GetServer("/creatives.php?state=all&type=animation&cpp=10&tag=all&page="+page,function(data){
		data = eval('('+data+')');
		if (data.status != 0)
		{
			alert('error');
			return ;
		}
		var cs = data.creatives;
		for (var i=0;i<cs.length;i++)
		{
			list = list + 
				'<li id="'+cs[i].ref_id+'">'+
				'<div class="albumlist_conn">'+
                           	'<p class="albumtxt">'+cs[i].title+'</p>'+
                           	'<div class="albumlist_pic">'+
				'<a href="anidetail.php?id='+cs[i].ref_id+'&name='+cs[i].title+'">'+
					'<img src="/phpThumb.php?src=https%3A%2F%2Flocalhost%2Fthumb.php%3Frid%3D'+
					cs[i].thumbnail_ref_id+'&w=113&h=85&f=png" width="113px" height="85px" class="lazyload">'+
			   	'</a></div>'+
	                   	'<a class="btn_edit_s" title="Beginner" href="beginner_client/ui.php?contentid='+cs[i].ref_id+'"></a>'+
                        '<a class="btn_pro_s" title="Advanced" href="/animation/edit/'+cs[i].ref_id+'"></a>'+
                           	'</div>'+
                	   	'</li>';	
		}
		o.innerHTML = list;
		setPage(data.pages, data.current_page);
	})
}

function setPage(all, now)
{
	var start = 1;
	if (now <= 3)
	{
		start = 1;
	}
	else if(now >= all-2)
	{
		start = all-4;
	}
	else
	{
		start = now-2;
	}
    
    var end = Math.min(all+1, start+5);
    
	var pagelist = '';
	for (var i=start;i<end;i++)
	{
		if (i==now)
		{
			pagelist = pagelist + '<a href="javascript:getlist('+i+')"><span class="cur">'+i+'</span></a>';
		}else
		{
			pagelist = pagelist + '<a href="javascript:getlist('+i+')"><span>'+i+'</span></a>';
		}
	}
	_G("pages_comment").innerHTML = pagelist;
}

window.onload = function()
{
        getlist(1);
}

