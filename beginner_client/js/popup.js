popup = {};
var popupPos = {};
var popup_lis_width = 0;
var popup_lis_height = 0;
var div = document.createElement('div');
var pre_list = div;

 function getPosition(object){
     var objectPos = {};
     
     objectPos.x = object.offsetLeft;
     objectPos.y = object.offsetTop;

     return objectPos;	 
  };

  //get the position of element in all document area
  //2012/7/31 17:06:08
  function getAllPosition(obj) {
     if (obj.nodeType != 1) return;

     var x = 0, y = 0;

     while (obj && obj.tagName != "BODY") {
        x += obj.offsetLeft;
        y += obj.offsetTop;
        obj = obj.offsetParent;
     }
     
     return {x: x, y: y};
  }
 
	
//menu:顶级菜单  poi:箭头  lis:弹出列表项  mode:箭头方向  size:上下方向lis的高或者左右方向lis的宽
popup.start = function(menu, poi, lis, mode, size)
{ 
	//重新获取屏幕高宽，一适用Pad旋转
	var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

	popup.objectSrc = menu.id;

    popupPos.x = getAllPosition(menu).x + 30;
	popupPos.y = getAllPosition(menu).y + 20;

    if(pre_list != lis)
	{
	    pre_list.style.display = 'none';
	}
	pre_list = lis;
	
    var poi_width = poi.offsetWidth;
    var poi_height = poi.offsetHeight;
	
    //上下箭头
    if(mode == 'top' || mode == 'bottom')
    {
        //重新定义宽高
        lis.style.width = '';
        lis.style.height = size + 'px';
        lis.style['white-space'] = 'nowrap';  //阻止换行

        //获取新的宽高
        popup_lis_width = lis.offsetWidth;
        popup_lis_height = lis.offsetHeight;

        poi.style.left = popupPos.x - poi_width/2 + 'px';
        lis.style.left = popupPos.x - popup_lis_width/2 + 'px';

        if(mode == 'top')
        {
			//for firefox tansform attribute
            poi.style.MozTransform = 'rotate(45deg)';
            poi.style['-webkit-transform'] = 'rotate(45deg)';
            poi.style.top = popupPos.y - poi_height/2 + 40 + 'px';
            lis.style.top = popupPos.y + 40 + 'px';
        }
        else if(mode == 'bottom')
        {
            poi.style.MozTransform = 'rotate(-135deg)';
            poi.style['-webkit-transform'] = 'rotate(-135deg)';
            poi.style.top = popupPos.y - poi_height/2 - 40 + 'px';
            lis.style.top = popupPos.y - popup_lis_height - 40 + 'px';
        }
    }

    //左右箭头
    if(mode == 'left' || mode == 'right')
    {
        //重新定义宽高
        lis.style.width = size + 'px';
        lis.style.height = '';
        lis.style['white-space'] = '';
        lis.style['word-wrap'] = 'break-word';
        lis.style['word-break'] = 'normal';

        //获取新的宽高
        popup_lis_width = lis.offsetWidth;
        popup_lis_height = lis.offsetHeight;

        poi.style.top = popupPos.y - poi_height/2 + 'px';
        lis.style.top = popupPos.y - popup_lis_height/2 + 'px';

        if(mode == 'left')
        {
            poi.style.MozTransform = 'rotate(-45deg)';
            poi.style['-webkit-transform'] = 'rotate(-45deg)';
            poi.style.left = popupPos.x - poi_width/2 + 40 + 'px';
            lis.style.left = popupPos.x + 40 + 'px';
        }
        else if(mode == 'right')
        {
            poi.style.MozTransform = 'rotate(135deg)';
            poi.style['-webkit-transform'] = 'rotate(135deg)';
            poi.style.left = popupPos.x - poi_width/2 - 40 + 'px';
            lis.style.left = popupPos.x - popup_lis_width - 40 + 'px';
        }
    }

    //左右边界的判断
    if(lis.offsetLeft < 0)
    {
        lis.style.left = 0;
        if(mode == 'left' || mode == 'right')
        {
            poi.style.left = popup_lis_width -  poi_width/2 + 'px';
        }
    }
    else if(lis.offsetLeft > windowWidth - popup_lis_width)
    {
        lis.style.left =  windowWidth - popup_lis_width + 'px';
        if(mode == 'left' || mode == 'right')
        {
            poi.style.left =  windowWidth - popup_lis_width -poi_width/2 + 'px';
        }
    }

    //上下边界的判断
    if(lis.offsetTop < 0)
    {
        lis.style.top = 0;
        if(mode == 'top' || mode == 'bottom')
        {
            poi.style.top = popup_lis_height - poi_height/2 + 'px';
        }
    }
    else if(lis.offsetTop > (windowHeight - popup_lis_height))
    {
        lis.style.top = windowHeight - popup_lis_height + 'px';
        if(mode == 'top' || mode == 'bottom')
        {
            poi.style.top = windowHeight - popup_lis_height - poi_width/2 + 'px';
        }
    }

}

