VRange=function(){this.init.apply(this,arguments)}
VRange.prototype={
	min:0,
	max:100,
	step:1,
	em:30,
	len:300,
	init:function(param){
		var _=this,s='',a=_.colors,b=isMobile(); // 'ontouchstart' in window;
		for(var k in param)_[k]=param[k];
		var o=_.container;
		o.innerHTML='<div class="VRange"><b><u><s><i></i></s></u></b></div>'
		+'<style>'
		+'.VRange{position:relative;height:360px;width:60px;background:#ddd;border-radius:10px;box-shadow:0 0 5px black;}'
		+'.VRange b{display:block;position:absolute;left:29px;top:30px;bottom:30px;width:0;border:1px solid gray;border-color:#aaa #fff #fff #aaa;background:#fff;}'
		+'.VRange u{display:table;position:absolute;left:-30px;top:-30px;width:60px;height:60px;cursor:pointer;}'
		+'.VRange s{display:table-cell;vertical-align:middle;}'
		+'.VRange i{display:block;width:10px;height:10px;background-color:#cef;background-image:-webkit-radial-gradient(#cef,#59A6E2);background-image:-moz-radial-gradient(#cef,#59A6E2);'
		+' border:1px solid #65B1DB;border-radius:60px;vertical-align:middle;margin:auto;}'
		+'.VRange i.on{background:-webkit-radial-gradient(#59A6E2,#cef);background:-moz-radial-gradient(#59A6E2,#cef);}'
		+'</style>';

		o.addEventListener(b?'touchstart':'mousedown',function(e){_.start(e)});
		document.addEventListener(b?'touchmove':'mousemove',function(e){_.move(e)});
		document.addEventListener(b?'touchend':'mouseup',function(e){_.end(e)});
		
		_.u=o.getElementsByTagName('u')[0];
		_.i=o.getElementsByTagName('i')[0];
		_.u.style.top='-'+_.em+'px';
	},
	start:function(e){
		e.preventDefault();
		e.cancelBubble=true;
		var e0=e.targetTouches?e.targetTouches[0]:e;
		var _=this,o=e.target,y=e0.pageY;
		if(o.tagName=='I')o=o.parentNode;
		if(o.tagName=='S')o=o.parentNode;
		if(o.tagName!='U'){
			_.sety(y-_.container.getBoundingClientRect().top-_.em*2-document.body.scrollTop);
		}
		o=_.u;
		_.draging={o:o,y:y,sy:parseInt(o.style.top||0)};
		_.i.className='on';
	},
	move:function(e){
		if(!this.draging)return;
		var e0=e.targetTouches?e.targetTouches[0]:e;
		var _=this,p=_.draging,y=e0.pageY-p.y+p.sy;
		_.sety(y);
	},
	end:function(e){
		var _=this,p=_.draging;
		if(!p)return;
		delete(_.draging);
		_.i.className='';
		_.onchange(_.lastp,true);
	},
	sety:function(y){
		var _=this,p,n=_.em,m=_.len;
		if(y<-n)y=-n;
		if(y>m-n)y=m-n;
		p=(y+n)/m;
		if(p==_.per)return;
		_.per=p;
		_.setp(p);
		_.change(p);
	},
	setp:function(p){
		if(p<0)p=0;
		if(p>1)p=1;
		var _=this,y=p*_.len-_.em;
		_.u.style.top=y+'px';
		_.i.style.width=_.i.style.height=10+p*_.em+'px';
	},
	change:function(p){
		var _=this,a=_.min,b=_.max,l=b-a,m=p*l,n=_.step,c=m/n,d=Math.floor(c),e=Math.ceil(c);
		n=a+n*((c-d)<(e-c)?d:e);
		if(n<a)n=a;
		if(n>b)n=b;
		if(n==_.lastp)return;
		_.lastp=n;
		_.onchange(n);
	},
	setval:function(n){
		var _=this,p,a=_.min,b=_.max;
		if(isNaN(n))n=a;
		else n=Number(n);
		p=(n-a)/(b-a);
		_.setp(p);
	},
    //adjust position
    adjustPosition: function (poi){
        var srcEl             = G(/^v(\w+)/.exec(this.container.id)[1]),
            srcPosition       = getAllPosition(srcEl),
            containerPosition = getAllPosition(this.container);

        this.container.style.top = srcPosition.y - this.container.offsetHeight / 2 + 'px';

        if (poi){
            poi.style.display      = 'block';
            poi.style.background   = '#DDDDDD';
            poi.style.borderColor  = '#969696';
            poi.style.MozTransform = 'rotate(135deg)';
            poi.style['-webkit-transform'] = 'rotate(135deg)';
            poi.style.top   = srcPosition.y + srcEl.offsetHeight / 2 + 'px';
            poi.style.left  = containerPosition.x + this.container.offsetWidth - 7.5 + 'px';
        }
    }
}
