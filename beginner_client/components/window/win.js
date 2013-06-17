function Window(p){this.init(p)}

Window.prototype={

  init:function(p){

    var _=this;

    var m=document.createElement('div');

    var o=m.cloneNode(0);

    for(var k in p)_[k]=p[k];

    if(!_.container)_.container=document.documentElement;

    m.className='win_mask';

    o.className='win_outer';

    o.innerHTML=''

    +'<div class="win_inner">'

    +'<div class="win_full win_bg"><div class="win_bg_n"></div><div class="win_bg_e"></div><div class="win_bg_s"></div><div class="win_bg_w"></div><div class="win_bg_ne"></div><div class="win_bg_se"></div><div class="win_bg_sw"></div><div class="win_bg_nw"></div></div>'

    +'<div class="win_full win_main"><div class="win_title"></div><div class="win_body"><div class="win_full win_content"></div><iframe class="win_full" frameborder="0" style="display:none"></iframe><div class="win_full win_lock" style="display:none"></div></div></div>'

    +'<div class="win_rz"><div class="win_rz_n"></div><div class="win_rz_e"></div><div class="win_rz_s"></div><div class="win_rz_w"></div><div class="win_rz_ne"></div><div class="win_rz_se"></div><div class="win_rz_sw"></div><div class="win_rz_nw"></div></div>'

    +'</div><div class="win_cmd"><a class="win_close" href="javascript:void(0)"></a><a class="win_max" href="" onclick="return false"></a><a class="win_min" href="" onclick="return false"></a></div>';

    _.container.appendChild(m);

    _.container.appendChild(o);

    _.o=o;

    _.el={};

    _.el.mask=m;

    _.el.title=o.childNodes[0].childNodes[1].childNodes[0];

    _.el.content=_.el.title.nextSibling.childNodes[0];

    _.el.frame=_.el.content.nextSibling;

    _.el.lock=_.el.frame.nextSibling;

    _.el.resize=o.childNodes[0].childNodes[2];

    _.el.close=o.childNodes[1].childNodes[0];

    _.el.max=_.el.close.nextSibling;

    _.el.min=_.el.max.nextSibling;

    _.box={l:_.container.offsetLeft,t:_.container.offsetTop};

    _.overflow=document.documentElement.style.overflow;

    if(_.modal===undefined)_.modal=true;

    if(!_.modal){m.style.display='none';m.style.opacity=0;m.style.filter='alpha(opacity=0)';}

    o.style.width=(_.width||600)+'px';

    o.style.height=(_.height||400)+'px';

    if(_.bind)_.el.content.appendChild(_.bind);

    if(_.src){_.el.frame.style.display='';_.el.frame.src=_.src;}

    if(_.alpha!=undefined){_.el.mask.style.opacity=_.alpha/100;_.el.mask.style.filter='alpha(opacity='+_.alpha+')'}

    if(!_.minWidth)_.minWidth=20;

    if(!_.minHeight)_.minHeight=20;

    if(!_.resizable)_.el.resize.style.display='none';

    if(_.content)_.el.content.innerHTML=_.content;

    _.el.content.style.overflow=_.hidden?'hidden':'auto';

    _.el.title.innerHTML=_.title;

    _.el.close.style.display='none';

    _.el.max.style.display='none';

    _.el.min.style.display='none';

    if(_.cmdnum==undefined)_.cmdnum=1;

    if(_.cmdnum>0)_.el.close.style.display='';

    if(_.cmdnum>1)_.el.max.style.display='';

    if(_.cmdnum>2)_.el.min.style.display='';

    E(function(e){fc(e)},'mousedown',_.el.mask);

    E(function(e){fc(e)},'touchstart',_.el.mask);

    E(function(e){_.down(e);fc(e)},'mousedown',o);

    E(function(e){_.down(e);fc(e)},'touchstart',o);

    E(function(e){_.move(e)},'mousemove',document);

    E(function(e){_.move(e)},'touchmove',document);

    E(function(){_.up()},'mouseup',document);

    E(function(){_.up()},'touchend',document);

    //E(function(){_.max()},'dblclick',_.el.title);

    //E(function(){_.max()},'click',_.el.max);

    //E(function(){_.hide()},'click',_.el.min);

    // E(function(){_.close()},(('ontouchstart' in window)?'touchend':'click'),_.el.close);
    E(function(){_.close()},(isMobile()?'touchend':'click'),_.el.close);

    E(function(){_.resize()},'resize',window);

    window.zIndex=_.zIndex||window.zIndex||0;

    _.zindex();

    _.resize();

    _.show(true);

    _.center();

  },

  ishide:function(){

    return this.o.className=='win_outer';

  },

  show:function(b){

    var _=this;

    if(!b){

      _.zindex();

      if(_.onshow)_.onshow();

    }

    _.o.className='win_outer win_now';

    if(_.modal)_.el.mask.style.display='';

    document.documentElement.style.overflow='hidden';

  },

  hide:function(){

    var _=this;

    if(c=_.onhide)if(c()===false)return;

    _.o.className='win_outer';

    _.el.mask.style.display='none';

    document.documentElement.style.overflow=_.overflow;

  },

  close:function(r){

    var _=this;

    var c;

    if(c=_.onclose)if(c(r)===false)return;

    _.hide();

  },

  resize:function(){

    var _=this;

    _.el.mask.style.width=_.container.offsetWidth+'px';

    _.el.mask.style.height=_.container.offsetHeight+'px';

  },

  center:function(){

    var _=this;

    var c;

    var o=_.o;

    if(!(c=_.position))c=[(_.container.offsetWidth-o.offsetWidth)/2,(_.container.offsetHeight-o.offsetHeight)/2];

    if(c[1]<0)c[1]=0;

    o.style.left=c[0]+'px';

    o.style.top=c[1]+'px';

  },

  max:function(e){

    var _=this;

    var b=_.omax;

    var c;

    if(!b)_.omax={left:0,top:0,width:'100%',height:'100%'};

    c=b?null:{left:_.o.style.left,top:_.o.style.top,width:_.o.style.width,height:_.o.style.height};

    _.o.style.left=_.omax.left;

    _.o.style.top=_.omax.top;

    _.o.style.width=_.omax.width;

    _.o.style.height=_.omax.height;

    _.omax=c;

  },

  zindex:function(){var _=this;_.o.style.zIndex=_.el.mask.style.zIndex=++window.zIndex},

  down:function(e){

    var _=this;

    var c;

    var o;

    if(!_.modal)_.zindex();

    if(c=_.onmousedown)if(c(e)===false)return;

    o=(e=e||event).target||e.srcElement;

    c=o.className;

    if(!c)return;

    if(/win_title/.test(c)){

      _.type='move';

      _.moving=o;

      _.offp={x:(e.pageX||e.x)-_.o.offsetLeft,y:(e.pageY||e.y)-_.o.offsetTop};

    }else if(/win_rz_([^ ]+)/.test(c)){

      _.type=RegExp.$1;

      _.moving=o;

      _.offp={x:e.pageX||e.x,y:e.pageY||e.y};

      _.offo={x:_.o.offsetLeft,y:_.o.offsetTop};

      _.size={x:_.o.offsetWidth,y:_.o.offsetHeight};

    }else return;

    if(!_.modal)_.el.mask.style.display='';

    _.el.lock.style.display='';

    _.box.r=_.box.l+_.container.offsetWidth;

    _.box.b=_.box.t+_.container.offsetHeight;

    _.o.onselectstart=function(){return false};

    if(e.preventDefault)e.preventDefault();

  },

  move:function(e){

    if(!this.moving)return;

    var _=this;

    var x;

    var y;

    var m;

    var n;

    var o=_.moving;

    var t=_.type;

    var e=e||event;

    var x=e.pageX||e.x;

    var y=e.pageY||e.y;

    if(x<_.box.l)x=_.box.l;

    if(x>_.box.r)x=_.box.r;

    if(y<_.box.t)y=_.box.t;

    if(y>_.box.b)y=_.box.b;

    x=m=x-_.offp.x;

    y=n=y-_.offp.y;

    if(t.length<=2){

      if(/e|w/.test(t)){

        if(/w/.test(t))m=-m;m=_.size.x+m;

        if(m<_.minWidth){x-=_.minWidth-m;m=_.minWidth;}

        _.o.style.width=m+'px';

      }

      if(/s|n/.test(t)){

        if(/n/.test(t))n=-n;n=_.size.y+n;

        if(n<_.minHeight){y-=_.minHeight-n;n=_.minHeight;}

        _.o.style.height=n+'px';

      }

      if(/w/.test(t))_.o.style.left=_.offo.x+x+'px';

      if(/n/.test(t))_.o.style.top=_.offo.y+y+'px';

      if(_.onresize)_.onresize();

    }else if(t=='move'){

      _.o.style.left=x+'px';

      _.o.style.top=y+'px';

    }

  },

  up:function(){

    var _=this;

    _.moving=null;

    _.el.lock.style.display='none';

    if(!_.modal)_.el.mask.style.display='none';

    _.o.onselectstart=function(){return true};

  }

}



