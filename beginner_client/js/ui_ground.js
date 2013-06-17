UIGround={
	hash1:{},
	hash2:{},
	colors:[
		[255,255,255,1],
		[0,0,0,1],
		[230,230,230,1],
		[33,73,132,1],
		[82,130,198,1],
		[198,81,74,1],
		[156,190,90,1],
		[132,101,165,1],
		[74,174,198,1],
		[239,150,74,1],
		[214,219,222,1],
		[132,132,132,1],
		[222,219,198,1],
		[194,218,242,1],
		[214,231,241,1],
		[239,219,231,1],
		[236,240,225,1],
		[226,217,238,1],
		[218,237,244,1],
		[248,238,226,1],
		[216,216,216,1],
		[87,87,87,1],
		[198,189,150,1],
		[139,179,228,1],
		[187,203,226,1],
		[225,187,186,1],
		[216,228,188,1],
		[203,193,220,1],
		[180,222,236,1],
		[252,215,186,1],
		[190,190,190,1],
		[63,63,63,1],
		[147,137,88,1],
		[89,139,208,1],
		[147,180,215,1],
		[216,150,150,1],
		[197,215,155,1],
		[178,160,200,1],
		[148,206,218,1],
		[251,191,139,1],
		[165,165,165,1],
		[38,38,38,1],
		[74,66,43,1],
		[22,54,92,1],
		[54,96,146,1],
		[146,57,49,1],
		[117,147,59,1],
		[96,73,119,1],
		[55,132,150,1],
		[220,107,13,1],
		[127,127,127,1],
		[13,13,13,1],
		[29,27,15,1],
		[13,36,70,1],
		[32,65,100,1],
		[107,34,28,1],
		[75,100,34,1],
		[61,49,89,1],
		[28,89,108,1],
		[153,70,0,1],
		[189,4,0,1],
		[255,0,0,1],
		[255,204,0,1],
		[255,255,0,1],
		[156,190,90,1],
		[0,174,82,1],
		[7,168,236,1],
		[16,105,198,1],
		[0,36,99,1],
		[115,73,165,1]
	],
	init:function(param){
		for(var k in param)this[k]=param[k];
	},
	openGroundLibrary:function(){
		var win = this.GroundWin;
		if(!win){
			win = new Window({
				title: Lang["ImageLibrary"],
				content: '<div id="groundLibraryBox" class="libraryBox">'
					+'<ul id="groundLibraryL" class="libraryBoxL">'
					+'<li id="groundLibrary0">Plain</li>'
					+'<li id="groundLibrary1">Indoor</li>'
					+'<li id="groundLibrary2">Outdoor</li>'
					+'</ul>'
					+'<div id="groundLibraryR" class="libraryBoxR">'
					+'<div id="groundLibrary0box" class="libraryList libraryList2" style="display:none"></div>'
					+'<div id="groundLibrary1box" class="libraryList" style="display:none"></div>'
					+'<div id="groundLibrary2box" class="libraryList" style="display:none"></div>'
					+'</div>'
					+'</div>',
				width: 760,
				height: 496,
				resizable: false,
				hidden: true,
				modal: true
			});
			this.GroundWin=win;
			var _=this;
			
			E(function(e){
				e=e.target;
				if(e.tagName=='LI'){
					_.tabGroundLibrary(e);
				}
			},eventstart,G('groundLibraryL'));
			
			UIGround.init({
				plain:G('groundLibrary0box'),
				indoor:G('groundLibrary1box'),
				outdoor:G('groundLibrary2box'),
				callback:function(type,data){
					_.GroundWin.hide();
					Page.selectGroundCallback(type,data);
				}
			});
			
			_.tabGroundLibrary(G('groundLibraryL').childNodes[0]);
		}
		win.show();
	},
	tabGroundLibrary:function(obj){
		var c=this.tabGroundLibraryLast;
		if(obj==c)return;
		if(c){
			c.className='';
			G(c.id+'box').style.display='none';
		}
		this.tabGroundLibraryLast=obj;
		var id=obj.id;
		obj.className='on';
		G(id+'box').style.display='';
		if(id=='groundLibrary0'){
			UIGround.loadPlain();
		}else if(id=='groundLibrary1'){
			UIGround.loadIndoor();
		}else if(id=='groundLibrary2'){
			UIGround.loadOutdoor();
		}
	},
	loadPlain:function(page){
		// var c,s='',r=r||{},a=this.colors,ev=('ontouchstart' in window)?'ontouchstart':'onclick';
        var c,s='',r=r||{},a=this.colors,ev=isMobile()?'ontouchstart':'onclick';
		this.hash={};
		for(var i=0;i<a.length;i++){
			c=a[i];
			s+='<li><a target="_top" href="" '+ev+'="UIGround.click(0,\''+c+'\');return false">'
			+'<i style="background:rgba('+c+');"></i></a></li>';
		}
		if(s){
			s='<ul>'+s+'<div style="clear:both"></div></ul>';
			s+=getpage({total:r.total,size:r.cpp,now:r.page,href:'javascript:void(UIGround.loadInDoor({0}))'});
		} else {
			s='<table style="width:100%;height:100%;"><tr><td align="center">'+Hanimation.Message.NoData+'</td></tr></table>';
		};
		this.plain.innerHTML=s;
	},
	loadIndoor:function(page){
		this.loadImage(page,1);
	},
	loadOutdoor:function(page){
		this.loadImage(page,2);
	},
	loadImage:function(page,type){
		var _=this;
		var o=_[type==1?'indoor':'outdoor'];
		o.innerHTML='';
		o.style.backgroundImage='url(res/loading_small.gif)';    
		
		//test data
		/*
		setTimeout(function(r){
			o.style.backgroundImage='';
			
			var data=[];
			var cpp=30;
			for(var i=1;i<=cpp;i++){
				var w,h,m,n=Math.random();
				if(n>.7){
					data.push({
						id:i,
						width:96,
						height:64,
						title:'Title'+i,
						thumb:'res/img1s.jpg',
						url:'res/img1.png'
					});
				}else if(n>.3){
					data.push({
						id:i,
						width:96,
						height:64,
						title:'Title'+i,
						thumb:'res/img2s.jpg',
						url:'res/img2.png'
					});
				}else{
					data.push({
						id:i,
						width:96,
						height:64,
						title:'Title'+i,
						thumb:'res/img3s.jpg',
						url:'res/img3.png'
					});
				}
			}
			var r={
				total:1000,
				cpp:cpp,
				page:page||1,
				data:data
			}
			_.fillImage(r,type);
		},500);
		*/
		
		$.ajax({
			type: "GET",
			url: Hanimation.AssetServer,
			dataType: "json",
			data: {
				type:"image",
				tag:type==1?'indoor':'outdoor',
				page:page||1,
				cpp:30
			},
			success: function(r){
				o.style.backgroundImage='';
				_.fillImage(r,type);
			},
			error:function(e){
				o.style.backgroundImage='';
				o.innerHTML=Hanimation.Message.ServerError;
			}
		});
	},
	getStyle:function(c){
		var w=96;
		var h=64;
		var width=c.width||w;
		var height=c.height||h;
		var left=0;
		var top=0;
		if(width/height>w/h){
			if(width>w){
				//height=height*w/width;
				//width=w;
				width=width*h/height;
				height=h;
			}
		}else{
			if(height>h){
				//width=width*h/height;
				//height=h;
				height=height*w/width;
				width=w;
			}
		}
		left=(w-width)/2;
		top=(h-height)/2;
		return 'left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px;';
	},
	click:function(type,data){
		if(type==1)data=this.hash1[data];
		if(type==2)data=this.hash2[data];
		if(this.callback)this.callback(type,data);
	},
	fillImage:function(r,type){
		// var c,s='',r=r||{},a=r.data||[],ev=('ontouchstart' in window)?'ontouchstart':'onclick',hash=this[type==1?'hash1':'hash2'];
        var c,s='',r=r||{},a=r.data||[],ev=isMobile()?'ontouchstart':'onclick',hash=this[type==1?'hash1':'hash2']
		for(var i=0;i<a.length;i++){
			c=a[i];
			hash[c.id]=c;
			s+='<li><a target="_top" href="" '+ev+'="UIGround.click('+type+',\''+c.id+'\');return false">'
			+'<i><img src="'+c.thumbnail+'" style="'+this.getStyle(c)+'"></i>'
			+'</a></li>';
		}
		if(s){
			s='<ul>'+s+'<div style="clear:both"></div></ul>';
			s+=getpage({total:r.total,size:r.cpp,now:r.page,href:'javascript:void(UIGround[\''+(type==1?'loadIndoor':'loadOutdoor')+'\']({0}))'});
		} else {
			s='<table style="width:100%;height:100%;"><tr><td align="center">'+Hanimation.Message.NoData+'</td></tr></table>';
		};
		this[type==1?'indoor':'outdoor'].innerHTML=s;
	}
}


