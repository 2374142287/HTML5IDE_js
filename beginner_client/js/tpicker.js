TPicker={
	colors:[
		[0,0,0,0],
		[255,255,255,1],
		[230,230,230,1],
		[0,0,0,1],
		[224,0,57,1],
		[200,30,60,1],
		[255,175,32,1],
		[200,100,50,1],
		[161,255,0,1],
		[60,190,90,1],
		[74,174,198,1],
		[0,198,255,1],
		[0,0,255,1],
		[82,130,198,1],
		[33,73,132,1],
		[132,101,165,1],
		[197,0,255,1],
		[255,100,255,1]
	],
	init:function(param){
		// var _=this,c,s='',a=_.colors,b='ontouchstart' in window;
        var _=this,c,s='',a=_.colors,b=isMobile();  // 'ontouchstart' in window;
		for(var k in param)_[k]=param[k];
		for(var i=0;i<a.length;i++){
			c=a[i];
			s+='<li><a index="'+i+'"  id = "colorBlock" style="background-color:rgba('+c[0]+','+c[1]+','+c[2]+','+c[3]+')"></a></li>';
		}
		var o=_.container;
		o.innerHTML='<div class="TPicker"><ul>'+s+'</ul><u></u><i><s></s><b></b></i></div>' 
		+'<div class = "touch_gradient" id = "touch_gradient"><ul ><li><a id = "COMMAND_LINE" class = "advancedOptions" title = "Line_gradient"></a></li><li><a id = "COMMAND_RADIAL" class = "advancedOptions" title = "Radial_gradient"></a></li></ul></div>'
		+'<style>'
		+'.TPicker{width:150px;position:relative;text-align:right;}'
		+'.TPicker ul{width:87px;margin:0 0 0 auto;padding:0;list-style:none;}'
		+'.TPicker ul li{display:inline-block;width:36px;height:36px;border:0 solid #999;margin:3px 6px 0 0;border-radius:5px;box-shadow:0 0 3px #000;cursor:pointer;background:url(res/alpha.gif);}'
		+'.TPicker ul li a{display:block;width:36px;height:36px;border-radius:5px;}'
		+'.TPicker ul li:hover{border-color:#999;}'
		+'.TPicker u{display:block;position:absolute;width:15px;left:30px;top:0;bottom:0;background:#369;border:1px solid #666;border-radius:5px;}'
		+'.TPicker i{display:block;position:absolute;width:30px;height:30px;left:0;top:0;background:#bbb;border:1px solid #666;border-width:1px 1px 1px 1px;border-radius:5px 0 0 5px;cursor:pointer;}'
		+'.TPicker i s{display:block;position:absolute;width:100%;height:100%;left:0;top:0;border-radius:5px 0 0 5px;}'
		+'.TPicker i b{display:block;position:absolute;width:21px;height:21px;right:-12px;top:4px;background:#bbb;-webkit-transform:rotate(45deg);border:1px solid #666;border-width:1px 1px 0 0;}'
		+'</style>';

		o.addEventListener(b?'touchstart':'mousedown',function(e){_.start(e)});
		document.addEventListener(b?'touchmove':'mousemove',function(e){_.move(e)});
		document.addEventListener(b?'touchend':'mouseup',function(e){_.end(e)});
		
		_.u=o.getElementsByTagName('u')[0];
		_.ul=o.getElementsByTagName('ul')[0];
		_.s=o.getElementsByTagName('s')[0];
		_.b=o.getElementsByTagName('b')[0];
		_.i=o.getElementsByTagName('i')[0];
		_.check(_.ul.childNodes[1]);
	},
	getOffsetT:function(){return this.i.offsetHeight/2+5},//滑块长度+5
	getOffsetH:function(){return this.u.offsetHeight},//调色棒缠度
	start:function(e){
		var _=this,o=e.target;
		if(o.tagName=='B'||o.tagName=='S'){o=o.parentNode;}
		if(o.tagName=='I'){
			var e0=e.targetTouches?e.targetTouches[0]:e;
			_.draging={o:o,y:e0.pageY};
		}else if(o.tagName=='A'&& o.id == 'colorBlock'){
			_.check(o);
		}
		e.preventDefault();
		e.cancelBubble=true;
	},
	move:function(e){
		if(!this.draging)return;
		var e0=e.targetTouches?e.targetTouches[0]:e;
		var _=this,n,y=e0.pageY,p=_.draging,t=-_.getOffsetT(),h=_.getOffsetH(),m=h+t;
		n=_.i.offsetTop+y-p.y;
		if(n<t)n=t;//防止跑出界外
		if(n>m)n=m;//
		_.i.style.top=n+'px';
		_.i.childNodes[0].top = n +'px';
		_.i.childNodes[1].top = n +'px';
		p.y=y;
		p=(n-t)/h;
		m=_.rgba;
		n={};
		t=p<.5;//小于0.5为true大于0.5为false;
		n.r=parseInt(t?(m.r*p*2):(m.r+(255-m.r)*(p-.5)*2));
		n.g=parseInt(t?(m.g*p*2):(m.g+(255-m.g)*(p-.5)*2));
		n.b=parseInt(t?(m.b*p*2):(m.b+(255-m.b)*(p-.5)*2));
		n.a=1;
		_.lastColor = n;
		_.change(n);
	},
	end:function(e){
		var _=this,p=_.draging;
		if(!p)return;
		delete(_.draging);
		if(_.lastColor){
			_.onchange(_.lastColor,true);
		}
	},
	check:function(a){
		var _=this,c,a=_.colors[a.getAttribute('index')||0];
		c={r:a[0],g:a[1],b:a[2],a:a[3]};//c是点击色块的像素对象
		_.setper(.5);
		_.setcol(c);
		_.rgba=JSON.parse(JSON.stringify(c));
		_.onchange(c,true);
	},
	setper:function(n){//将滑块位置设置为中间
		var _=this;
		_.i.style.top=_.getOffsetH()*n-_.getOffsetT()+'px';
	},
	setcol:function(c,b){
		var _=this;
		_.u.style.background='-webkit-linear-gradient(rgba(0,0,0,1),rgba('+[c.r,c.g,c.b]+',1),rgba(255,255,255,1))';
		if(!b)_.change(c);//如果没有这句话，点击色块时，滑块的颜色不会立即改变，而是再次点击滑块后才会改变
	},
	change:function(c,b){
		var _=this,s='rgba('+[c.r,c.g,c.b,c.a]+')',a=_.i.childNodes;//s是得到的点击色块的rgba
		if(c.a==0)s='rgba(255,255,255,1)';
		a[0].style.backgroundColor=s;
		a[1].style.backgroundColor=s;
		_.i.style.backgroundColor =s;
		if(!b)_.onchange(c);
	},
	setColor:function(c){
		var _=this,d=_.rgba,c=COLOR.toRGBA(c);
		if(!c)return;
		d.r=Number(c.r);
		d.g=Number(c.g);
		d.b=Number(c.b);
		_.setper(.5);
		_.setcol(c,1);
		_.change(c);
	},
    //adjust the position of panel
    //2012/7/31 17:06:16
    adjustPosition: function (obj, poi){//生成箭头并调整位置
        if (!obj) return;           

        var srcPosition       = getAllPosition(obj),
            containerPosition = getAllPosition(this.container),
            offsetY           = srcPosition.y - this.container.offsetHeight / 2;

        //plus 35px
        this.container.style.top = offsetY + 135 + 'px';

        if (poi) {
            poi.style.display     = 'block';
            poi.style.background  = '#fff';
            poi.style.borderColor = '#ccc'; 
            poi.style.MozTransform         = 'rotate(135deg)';
            poi.style['-webkit-transform'] = 'rotate(135deg)';
            poi.style.top   = srcPosition.y + obj.offsetHeight / 2 + 'px';
            poi.style.left  = containerPosition.x + this.container.offsetWidth - 7.5 + 'px';
        }
    }
}
