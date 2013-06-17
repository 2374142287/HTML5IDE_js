UIPicture={
	hash:{},
	init:function(param){
		for(var k in param)this[k]=param[k];
	},
	openPictureLibrary:function(){
		var win = this.PictureWin;
		if(!win){
			win = new Window({
				title: Lang["ImageLibrary"],
				content: '<div id="pictureLibraryBox" class="libraryBox">'
					+'<ul id="pictureLibraryL" class="libraryBoxL">'
					+'<li id="pictureLibrary0">Library</li>'
					+'<li id="pictureLibrary1">Network</li>'
					+'<li id="pictureLibrary2">Upload</li>'
					+'</ul>'
					+'<div id="pictureLibraryR" class="libraryBoxR">'
					+'<div id="pictureLibrary0box" class="libraryList" style="display:none"></div>'
					+'<div id="pictureLibrary1box" class="libraryList" style="display:none"></div>'
					+'<div id="pictureLibrary2box" class="libraryList" style="display:none"></div>'
					+'</div>'
					+'</div>',
				width: 760,
				height: 496,
				resizable: false,
				hidden: true,
				modal: true
			});
			this.PictureWin=win;
			var _=this;
			
			E(function(e){
				e=e.target;
				if(e.tagName=='LI'){
					_.tabPictureLibrary(e);
				}
			},eventstart,G('pictureLibraryL'));
			
			_.init({
				container:G('pictureLibrary0box'),
				callback:function(data){
					_.PictureWin.hide();
					Page.selectPictureCallback(data);
				}
			});
			
			_.tabPictureLibrary(G('pictureLibraryL').childNodes[0]);
			
			G('pictureLibrary1box').innerHTML=''
				+'<form class="fileSelectBox" onsubmit="UIPicture.submitNetworkImage(this);return false">'
				+'<div class="fileSelectThumb" id="fileThumbNetwork"></div>'
				+'<div class="fileSelectInput">'
				+'<input class="touch_input" placeholder="Please input the URL" style="width:400px;"> '
				+'<input class="touch_input" type="submit" value="Fetch"> '
				+'<input class="touch_input" type="button" value="Select" id="pictureLibrarySubmit1">'
				+'</div>'
				+'</form>';
				
			G('pictureLibrary2box').innerHTML=''
				+'<form class="fileSelectBox" action="' + Hanimation.ImageURL + '" method="post" onsubmit="return UIPicture.submitUploadImage()" enctype="multipart/form-data" target="fileFrame">'
				+'<iframe id="fileFrame" name="fileFrame" style="display:none"></iframe>'
				+'<input type="hidden" name="type" value="0"><input type="hidden" name="ref_id" value="'+Math.random()+'">'
				+'<div class="fileSelectThumb" id="fileThumbUpload"></div>'
				+'<div class="fileSelectInput">'
				+'<input class="touch_input" type="file" name="file" id="upload_file"> '
				+'<input class="touch_input" type="submit" value="Upload"> '
				+'<input class="touch_input" type="button" value="Select" id="pictureLibrarySubmit2">'
				+'</form>';
			G('fileFrame').onload=this.submitUploadImageCallback;
		}
		win.show();
	},
	submitNetworkImage:function(form){
		var url=form[0].value;
		if(!url){
			alert(Lang['M_SelectImage']);
			return;
		}
		Page.loading();
		$.ajax({
			type: "POST",
			url: Hanimation.ImageURL,
			data: {type:1,ref_id:Math.random(),url:url},
			dataType: "text",
			timeout: 8000,
			success: function(s){
				Page.loading(1);
			    s=json(s);
			    if(!s){alert(Hanimation.Message.ServerError);return};
				var url=s.url;
				UIPicture.submitImageCallback(url,0);
			},
			error:function(){
				Page.loading(1);
			  if(confirm(Hanimation.Message.NeedLoginConfirm)){
				window.open(Hanimation.LoginURL);
			  }
			}
		});
	},
    submitUploadImage: function() {
		if(!G('upload_file').value){
			alert(Lang['M_SelectImage']);
			return false;
		}
		Page.loading();
	},
    submitUploadImageCallback: function() {
		Page.loading(1);
      var o=G('fileFrame');
      if(!o)return;
      o=o.document||o.contentDocument;
      if(!o)return;
      o=o.contentDocument||o.body;
      if(!o)return;
      var s=o.innerHTML;
      if(/(\{.+\})/.test(s))s=RegExp.$1;
      var data=json(s);
      if(!data){
        if(confirm(Hanimation.Message.NeedLoginConfirm)){
          window.open(Hanimation.LoginURL);
        }
        return;
      };
      UIPicture.submitImageCallback(data.url,1);
    },
	submitImageCallback:function(url,isupload){
		var img=new Image();
		img.src=url;
		Page.loading();
		img.onload=function(){
			ImageCache.updateImage(url, img);
			Page.loading(1); 
			var width=this.width;
			var height=this.height;
			var obj=G(isupload?'fileThumbUpload':'fileThumbNetwork');
			var w=obj.offsetWidth;
			var h=obj.offsetHeight;
			if(width>w||height>h){
				if(width/height>w/h){
					height=height*w/width;
					width=w;
				}else{
					width=width*h/height;
					height=h;
				}
			}
			obj.style.backgroundSize=width+'px '+height+'px';
			obj.style.backgroundImage='url('+img.src+')';
			G(isupload?'pictureLibrarySubmit2':'pictureLibrarySubmit1')['on'+eventstart]=function(e){
				UIPicture.click({url:url,width:width,height:height});
			}
		}
		img.onerror=function(){
			Page.loading(1);
			alert('image is not found');
		}
	},
	tabPictureLibrary:function(obj){
		var c=this.tabPictureLibraryLast;
		if(obj==c)return;
		if(c){
			c.className='';
			G(c.id+'box').style.display='none';
		}
		this.tabPictureLibraryLast=obj;
		var id=obj.id;
		obj.className='on';
		G(id+'box').style.display='';
		if(id=='pictureLibrary0'){
			UIPicture.load();
		}else if(id=='pictureLibrary1'){
			
		}
	},
	load:function(page){
		var _=this;
		var o=_.container;
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
			_.fill(r);
		},500);
		*/

		$.ajax({
			type: "GET",
			url: Hanimation.AssetServer,
			dataType: "json",
			data: {
				type:"image",
				tag:"object",
				page:page||1,
				cpp:30
			},
			success: function(r){
				o.style.backgroundImage='';
				_.fill(r);
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
	click:function(data){
		var ret=this.hash[data],callback=this.callback;
		if(ret){
			data=ret;
			var url=data.url;
			var img=ImageCache.getImage(url);
			if(img){
				data.width=img.width;
				data.height=img.height;
				callback(data);
			}else{
				img=new Image();
				img.src=data.url;
				Page.loading();
				img.onload=function(){
					Page.loading(1);
					ImageCache.updateImage(data.url, img);
					data.width=this.width;
					data.height=this.height;
					callback(data);
				}; 
	            img.onerror=function(){
	                Page.loading(1); 
	                alert(Hanimation.Message.ImageError);
                };
            }
		}else{
			if(callback)callback(data);
		}
	},
	fill:function(r){
		// var c,s='',r=r||{},a=r.data||[],ev=('ontouchstart' in window)?'ontouchstart':'onclick';
        var c,s='',r=r||{},a=r.data||[],ev=isMobile()?'ontouchstart':'onclick';
		for(var i=0;i<a.length;i++){
			c=a[i];
			this.hash[c.id]=c;
			s+='<li>'
            // +'<a target="_top" href="" '+ev+'="UIPicture.click(\''+c.id+'\');return false">'
			// +'<i><img src="'+c.thumbnail+'" style="'+this.getStyle(c)+'"></i>'
            +'<div onclick="UIPicture.click(\''+c.id+'\');return false;" style="cursor:pointer;border: 1px solid #ccc; width:94px;height:62px;background-image:url('+c.thumbnail+');background-position:center;background-size:contain;background-repeat:no-repeat;background-color:rgba(0,0,0,0);"></div>'
			// +'</a>'
            +'</li>';
		}
		if(s){
			s='<ul>'+s+'<div style="clear:both"></div></ul>';
			s+=getpage({total:r.total,size:r.cpp,now:r.page,href:'javascript:void(UIPicture.load({0}))'});
		} else {
			s='<table style="width:100%;height:100%;"><tr><td align="center">'+Hanimation.Message.NoData+'</td></tr></table>';
		};
		this.container.innerHTML=s;
	}
}







