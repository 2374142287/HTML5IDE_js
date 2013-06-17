Tree=function(){this.init.apply(this,arguments)}
Tree.prototype={
  init:function(p){
    var _=this;
    if(p)for(var k in p){_[k]=p[k]}
    if(!_.o)_.o=document.getElementById(_.id||'tree');
    if(!_.o)return;
    if(!_.root)_.root='';
    if(!_.href)_.href='javascript:void(0)';
    if(!_.name)_.name='{name}';
    if(!_.data)_.data=[];
    if(_.expand==undefined)_.expand=100;
    _.o.className='tree';
    _.o.onclick=function(e){return _.click(e)};
    _.show();
    return _;
  },
  show:function(){
    var _=this,o=_.o;
    o.innerHTML='';
    _.bill(o,[{id:0,name:_.root}]);
    _.swap(o.childNodes[0]);
  },
  bill:function(o,g){
    var _=this,a,b,c,d,l=g.length,p=o.p||'';
    for(var i=0;i<l;i++){
      c=g[i];
      c.isleaf=(c.isleaf==1)?1:0;
      c.islast=i==(l-1);
      b=(c.id?(p+(c.islast?0:1)):'');
      c.level=b.length;
      d=[];for(var k in c){d.push(k)}d=eval('/\{('+d.join('|')+')\}/g');
      a=document.createElement('A');
      if(_.target)a.target=_.target;
      a.href=c.href||_.href.replace(d,function(s){return c[s.replace(/\{|\}/g,'')]}).replace(/\{.*?\}/g,'');
      a.className='item';
      a.id=_.id+'_'+c.id;
      a.innerHTML=p.replace(/(0|1)/g,'<div class="img i$1"></div>')
      +'<div class="img i'+(c.isleaf?(c.islast?2:3):((c.islast?6:7)+' swap'))+(c.id?'':' hide')+'"></div>'
      +(_.checkbox?'<input class="chk" type="checkbox">':'')
      +'<div class="ico '+(!c.id?'root':(c.isleaf?'leaf':'fold'))+'"></div>'
      +_.name.replace(d,function(s){return c[s.replace(/\{|\}/g,'')]});
      o.appendChild(a);
      a.swap=a.childNodes[p.length];
      a.data=c;
      if(!c.id&&!_.root)a.style.display='none';
      if(_.checkbox)a.checkbox=a.swap.nextSibling;
      a.ico=_.checkbox?a.checkbox.nextSibling:a.swap.nextSibling;
      d=document.createElement('DIV');
      d.style.display='none';
      d.p=b;
      o.appendChild(d);
      a.container=d;
    }
  },
  swap:function(a,b){
    var _=this,c=a.container,s;
    if(!b&&!c.innerHTML){
      a.ico.className='ico loading';
      _.load(a);
      return
    }
    b=c.style.display!='none';
    s=a.ico.className;
    a.ico.className=b?s.replace('open','fold'):s.replace('fold','open');
    s=a.swap.className;
    a.swap.className=b?s.replace(4,6).replace(5,7):s.replace(6,4).replace(7,5);
    c.style.display=b?'none':'';
  },
  load:function(o){
    var _=this,c,a=[],l=_.data.length,pid=o.data.id;
    for(var i=0;i<l;i++){
      c=_.data[i];
      if(c.pid==pid){
        if(c.isleaf==undefined){c.isleaf=1;for(var j=0;j<l;j++){if(_.data[j].pid==c.id){c.isleaf=0;break}}};
        a.push(c);
      }
    }
    if(!_.ajax){
      _.fill(o,a);
    }else{
      ajax('',function(a){
        a=json(a)||[];
        _.fill(o,a);
      },_.ajax.replace('{0}',pid))
    }
  },
  fill:function(o,a){
    var _=this,c,d,p,l=a.length;
    if(!l){_.swap(o,1);return};
    o.ico.className='ico '+(o.container.p?'open':'root');
    _.bill(o.container,a)
    _.swap(o);
    if(o.container.p.length<_.expand)_.shut(_.expand,1);
  },
  click:function(e){
    var _=this,a,c,e=e||event,o=e.target||e.srcElement;
    if(!o)return;
    a=o;do{if(/item/.test(a.className))break}while(a=a.parentNode);
    c=o.className;
    if(/chk/.test(c)){_.check(a);return}
    if(/root/.test(c)){_.shut();return false}
    if(/swap/.test(c)){_.swap(a);return false}
    if(/img/.test(c)){_.select(a);return false}
    _.select(a);
    if(_.onclick){_.onclick(a.data);return false}
  },
  check:function(o){
    var d,c,b=o.checkbox.checked,a=o.nextSibling.getElementsByTagName('INPUT');
    for(var i=0;i<a.length;i++)if(/chk/.test(a[i].className))a[i].checked=b;
    while(o=o.parentNode.previousSibling){
      if(c=o.checkbox){
        a=o.nextSibling.childNodes;
        if(!b)for(var i=0;i<a.length;i++)if(d=a[i].checkbox)if(d.checked){b=1;continue}
        c.checked=b;
      }
    }
  },
  getcheck:function(b){
    var _=this,r=[],a=_.o.getElementsByTagName('INPUT');
    for(var i=0;i<a.length;i++)if(a[i].className=='chk'&&a[i].checked)r.push(a[i].parentNode.data.id);
    return r;  
  },
  getselect:function(){
    var o=this.selected;
    return o?o.data:'';
  },
  select:function(o){
    var c=this.selected;
    if(c)c.className='item';
    o.className='item on';
    this.selected=o;
  },
  shut:function(n,b){
    var _=this,c,r,o=_.o,a=o.getElementsByTagName('DIV');
    if(!n){b=o.shut?1:0;o.shut=!b}
    for(var i=1;i<a.length;i++){
      c=a[i];
      if((b?/i(6|7)/:/i(4|5)/).test(c.className)){
        c=c.parentNode;
        if(!n||c.parentNode.p.length<n)_.swap(c);
      }
    }
  }
}
