UIMywork={

    getContentId:function(){
		var contentid = null;
		if(parent.contentid)
			contentid = parent.contentid;
		else{
		//	var val = parent.location.href.split('/edit/')[1];
		//	if(val)
		//		contentid = val.split('?')[0];
			var val = parent.location.href.split('contentid=')[1];
			if(val)
				contentid = val.split('&')[0];
		}
		
		return contentid;
	},
    
	loadDocument:function (contentid) {
        var contentid = this.getContentId();
        if(!contentid){ 
            UIMywork.openDocument(window.aniData);
            return;
        }

        top.contentid = contentid;
        Page.loading();
        
		$.get(Hanimation.LoadURL,{contentid:contentid,from_ha:"true"},function(s){Page.loading(1);
		  if(s=json(s)){
			if(!s.data){
			  alert(Hanimation.Message.NotOwnWork);
			  top.location.href=top.location.href.split('?')[0];
			  return;
			}
			s=json(s.data);
		  }
		  if(!s){
			alert(Hanimation.Message.ParseError);
			return;
		  }
		  
		  UIMywork.openDocument(s);
		},'text');
	},
    
	openDocument:function (data) {
//		data = eval("("+global_test_data.data+")");
//		console.log(data); 
		data=uncompressAniData(data);
		Hedit.removeItem('HA_ST');
		window.aniData=data;
		window.aniData.script=data.script||'';
		window.RegionData=JSON.stringify(window.aniData||'');
		
		if(!window.aniData.zoomInfo || !window.aniData.zoomInfo[0])
			window.aniData.zoomInfo = [{zoomLevel: 1., offsetLeft: 0, offsetTop: 0, rotation: 0}];
		
		var zoomInfo = window.aniData.zoomInfo[0];
		window.aniData.symbols=data.symbols||[];
		window.aniData.layers=buildLayers(data.layers);
		window.aniLayers=window.aniData.layers;
		
		MugedaUI.setStageSize();
		MugedaUI.updateParam('canvas', window.aniData);
		if(MugedaUI.resetGround)MugedaUI.resetGround();

        var contentid = this.getContentId();
        MugedaLocalStorage.setLocalStorage((contentid ? contentid : "unsaved") + '_cached', window.aniData, {"origin":1}); 
		
		//缓存图片
		ImageCache.init(aniData,function(){
			//缓存元件
			Symbol.build(aniData.symbols,function(){            
				//绘制图形
				// TODO: This is a workaround for getZoomInfo() getting called even 
				// before the content is ready. A better solution is needed. 
				this.prevZoomInfo = null; 
				MugedaUI.redrawAll();
			/*	MTimeline.updateTimeline();
				
				function _setFrameThumb(curr){
					if (curr<MTimeline.frameCount){
						MTimeline.setFrameThumbnail(curr, true);
						curr ++;
						setTimeout(function(){_setFrameThumb(curr)}, 100);
					}
				}
				setTimeout(function(){_setFrameThumb(0)}, 100);*/
			});
		});
	},
	saveWork:function(b){
		var win=this.saveWin;
		if(!win){
			win = new Window({
				title: Lang["SaveDocument"],
				width: 400,
				height: 360,
				hidden: true,
				modal: true,
				content: ''
				  +'<form id="winsave" method="post" style="padding:20px;" onsubmit="return false">'
				  +'<div class="save_name"><span>' + Lang["Name"] + ': </span><input id="save_name" /></div>'
				  +'<div class="save_thumb" id="save_thumb"></div>'
				  +'<div style="text-align:center;padding-top:10px;">'
				  +'<input class="touch_input" type="submit" value="' + Lang["Save"] + '" id="winSave" on'+eventstart+'="UIMywork.saveDocument()" style="display:none" /> '
				  +'<input class="touch_input" type="button" value="' + Lang["Save As"] + '" id="winSaveAs" on'+eventstart+'="UIMywork.saveDocument(1)" style="display:none" /> '
				  +'<input class="touch_input" type="button" value="' + Lang["ShowData"] + '" id="winShowData" on'+eventstart+'="UIMywork.saveDocument(1,1)" style="display:none" /> '
				  +'<input class="touch_input" type="button" value="' + Lang["Cancel"] + '" on'+eventstart+'="UIMywork.saveWin.hide()" />'
				  +'</div>'
				  +'<div style="display:none"><canvas id="canvasSaveBuffer"></canvas></div>'
				  +'</form>'
			});
			this.saveWin=win;
		}
        if(!window.client_mode){
            G('winShowData').style.display='';
        }		
        G('save_name').value=window.aniData.title;
        G('winSaveAs').style.display=b?'':'none';
        G('winSave').style.display=b?'none':'';
        win.show();
		
		clearSelection();
		
		var tempCanvas=MugedaUI.getBufferCanvas('bufferCanvas',window.objCanvas.offsetWidth,window.objCanvas.offsetHeight);
		var imageurl=window.objCanvas.style.backgroundImage;
		var image;
		if(imageurl){
			image=new Image();
			image.src=imageurl.split('(')[1].split(')')[0];
		}
		
		MugedaUI.redrawAll({
			canvas:tempCanvas,
			color:window.objCanvas.style.backgroundColor,
			image:image
		});
		
		var maxW=270;
		var maxH=180;
		var pad=Hanimation.PADDING||0;	
        var w=tempCanvas.offsetWidth;
        var h=tempCanvas.offsetHeight;			
		var nw=w-pad*2;
		var nh=h-pad*2;
		var oCanvas=G('canvasSaveBuffer');
		
		oCanvas.width=nw;
		oCanvas.height=nh;
		oCanvas.style.width=nw+'px';
		oCanvas.style.height=nh+'px';
		
		var ctx=oCanvas.getContext('2d');
		ctx.drawImage(tempCanvas, pad, pad, nw, nh, 0, 0, nw, nh);
		
		var nCanvas=document.createElement("canvas");
		
		nCanvas.width=maxW;
		nCanvas.height=maxH;
		nCanvas.style.width=maxW+'px';
		nCanvas.style.height=maxH+'px';
		
		var sx = 0;
		var sy = 0;
		var sw = maxW;
		var sh = maxH;
		if(nw>maxW || nh>maxH){
			if(nw/nh < maxW/maxH){
				sw = nw*maxH/nh;
			}else{
				sh = nh*maxW/nw;
			}
		}else{
			sw = nw;
			sh = nh;
		}
		sx = (maxW-sw)/2;
		sy = (maxH-sh)/2;
		
		var nctx=nCanvas.getContext('2d');
		nctx.drawImage(oCanvas, 1, 1, nw-2, nh-2, sx, sy, sw, sh);
		
        G('save_thumb').innerHTML='';
        G('save_thumb').appendChild(nCanvas);
        window.thumbnail=nCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");
        if(!b&&top.contentid)UIMywork.saveDocument();
	},

    //create request params
	getAniDataForRequest: function (){
        window.aniData.lastModified = new Date().getTime();
		var data = JSON.clone(window.aniData);
        data.version = Hanimation.VERSION;
		
        shortNumber(data);
        data = compressAniData(data);
        data = JSON.stringify(data);
        
        var params = {
          title     : window.aniData.title,
          width     : window.aniData.width,
          height    : window.aniData.height,
          thumbnail : window.thumbnail,
          data      : data
        };

		return params;
	},

	saveDocument:function(isSaveAs,isShowData,isNotAlert){
        window.aniData.title=G('save_name').value;
        if(!isShowData&&!window.aniData.title){
          UIMywork.saveWork();
          if(!isNotAlert)alert(Hanimation.Message.CheckTitle);
          return;
        }

        var params = UIMywork.getAniDataForRequest();

        G('save_thumb').innerHTML='<textarea style="width:350px;height:175px;" onclick="window.select()">' + params.data + '</textarea>';

        if(isShowData)return;

        if(!isSaveAs&&top.contentid) params.contentid = top.contentid;
        this.saveWin.hide();
		
        Page.loading();
        $.ajax({
            type: "POST",
            url: Hanimation.SaveURL,
            data: params,
            dataType: "text",
            timeout: 300000,
            success: function(s){
				Page.loading(1);
                var obj=json(s);
                if(!obj){
					alert(Hanimation.Message.ParseError);
					return;
                };
                top.contentid = obj.contentid;
                
                MugedaLocalStorage.setLocalStorage(parent.contentid+"_saved", window.aniData);
            },
            error:function(xmlhttp, status, errMsg){
				Page.loading(1);
				if(xmlhttp.status == 403){
					var loginMsg = "\n\n" + Hanimation.Message.MustLogin;
					if(confirm(Hanimation.Message.AjaxError + "\n\n" + xmlhttp.status+" ("+xmlhttp.statusText + ")" + loginMsg)){
						window.open(Hanimation.LoginURL);
					}
				}else{
					alert(Hanimation.Message.AjaxError + xmlhttp.status);
				}
			}
        });
	},
	openWork:function(){
		this.loadWorks();
	},
	loadWorks:function(page){
		var win = this.loadWorkWin;
		if(!win){
			win = new Window({
				title: Lang["ImageLibrary"],
				content: '<div style="height:100%;">'
					+'<div id="loadWorkBox" class="work_list"></div>'
					+'</div>',
				width: 810,
				height: 512,
				resizable: false,
				hidden: true,
				modal: true
			});
			this.loadWorkWin=win;
			var _=this;
		}
		win.show();
		
		var o=G('loadWorkBox');
		o.innerHTML='';
		o.style.backgroundImage='url(res/loading_small.gif)';
		

		// //test data
		// settimeout(function(r){
			// o.style.backgroundimage='';
			
			// var data=[];
			// var cpp=18;
			// for(var i=1;i<=cpp;i++){
				// var w,h,m,n=math.random();
				// if(n>.7){
					// data.push({
						// id:i,
						// width:96,
						// height:64,
						// title:'title'+i,
						// thumbnail:'res/img1s.jpg',
						// url:'res/img1.png'
					// });
				// }else if(n>.3){
					// data.push({
						// id:i,
						// width:96,
						// height:64,
						// title:'title'+i,
						// thumbnail:'res/img2s.jpg',
						// url:'res/img2.png'
					// });
				// }else{
					// data.push({
						// id:i,
						// width:96,
						// height:64,
						// title:'title'+i,
						// thumbnail:'res/img3s.jpg',
						// url:'res/img3.png'
					// });
				// }
			// }
			// var r={
				// total:1000,
				// cpp:cpp,
				// page:page||1,
				// data:data
			// }
			
			// uimywork.fillopenwork(r);
			
		// },500);
		
		// return;
		
		ajax({
			type: "GET",
			url: Hanimation.MyWorksAPI,
			dataType: "json",
			data: {page:page||1,cpp:18},
			success: function(r){
				o.style.backgroundImage='';
				UIMywork.fillOpenWork(r);
			},
			error:function(e){
			  o.style.backgroundImage='';
			  o.innerHTML=Hanimation.Message.ServerError;
			}
		});
	},
	fillOpenWork: function (r){
		var a,c,s='';
		if(r&&(a=r.data)){
			for(var i=0;i<a.length;i++){
			  c=a[i];
			  s+='<li><a target="_top" href="?contentid='+c.id+'"><img src="/'+c.thumbnail+'"><b>'+c.title+'</b></a></li>';
			}
		}
		if(s){
			s='<ul>'+s+'<div style="clear:both"></div></ul>';
			s+=getpage({total:r.total,size:r.cpp,now:r.page,href:'javascript:void(UIMywork.loadWorks({0}))'});
		} else {
			s='<table style="width:100%;height:100%;"><tr><td align="center">'+Hanimation.Message.NoData+'</td></tr></table>';
		};
		G('loadWorkBox').innerHTML=s;
	},

    //preview image and save to local
    toSaveImageWork: function (){
        var win = this.saveImageWin;

		if (!win) {
			win = new Window({
				title: Lang['SaveImage'],
				width: window.objCanvas.width,
				height: window.objCanvas.height + 48,
				hidden: true,
				modal: true,
				content: '<div id="saveImage"><img style="margin:30% 50%;" src="res/loading_small.gif"/></div>'
			});

		    this.saveImageWin = win;
		}

        win.show();
        G("saveImage").innerHTML = "<img src='" + window.objCanvas.toDataURL('image/png') + "'/>";

    },

	openShareFrame: function (e){
		
		
		Link = {
		    'FACEBOOK': 'http://m.facebook.com/sharer.php?t='+Lang["SH_Message"]+'&u=' + UIMywork.shareLink, //or http://www.facebook.com/sharer.php?u=%s&t=%s
			'TWITTER' : 'http://twitter.com/home?status=' + Lang["SH_Message"]+" "+UIMywork.shareLink,
			'GMAIL'   : 'https://mail.google.com/mail/?view=cm&fs=1&tf=1&su='+Lang["SH_Message"]+'&body=' +UIMywork.shareLink 	
		};
        var cmd = e.id;
        var frameId    = cmd.split('_')[1];
		targetLink = Link[frameId]; 
        //    win        = this[frameId + 'win'];

        var agent  = navigator.userAgent.toLowerCase();
		
		
		if(/ipad/.test(agent)){
		   var win = window.open(targetLink);
		   if(typeof win === 'undefined'){
				setTimeout(function(){
					window.open(targetLink);
				}, 1000);
		   }
		}else{
		   window.open(targetLink,'newWindow','height=540.width=720,top=100,left=100,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no');
		}

		return false; 
	},

    //load a frame to share animation message, include facebook, twitter, gmail.
	shareWork: function (e){
	    var shareLink = UIMywork.shareLink;
		    win       = this.shareWin,
		    contentid = top.contentid,
			refid     = (Math.random() + '').split('.')[1],
			mode      = ""; //reserved param

		if (!contentid){
		    alert(Hanimation.Message.NeedSave);
			return false;
		} 
					
        //send a request to the server and return a share link
		if(!shareLink){
            $.ajax({
                // /sharecode.php?crid=50342e24698863d80d000002&action=get
                type     : 'GET',
                url      : '/sharecode.php',
                dataType : 'JSON',
                data     : 'crid=' + contentid + '&mode=' + mode + '&action=request',  
                beforeSend:  function(){
                    Page.loading(0);
                },			
                success  : function (result){
                    if (result && result.hasOwnProperty('status')){
                       Page.loading(1);
                       if (result.share_code){
                          //TODO
                          //get a link to share facebook, gmail, tiwtter
                       }else {
                          //TODO
                          //action to request a share_code again
                       }
                       if (result.status == 0){
                          UIMywork.shareLink = encodeURIComponent(location.protocol + "//" + location.hostname + "/beginner/anidetail.php?id=" + result.share_code);				   
                          UIMywork.openShareFrame(e);	
                       }else {
                          alert(result.status);   
                       }
                    }else {
                       //TODO
                       alert(Hanimation.Message.AjaxError);
                    }
                },
                error: function(){
                    alert(Hanimation.Message.AjaxError);
                    Page.loading(1);
                }
            }); 
		}else{
		  UIMywork.openShareFrame(e);
		}	
    }
}


//离开页面确认，未做修改不提示
window.onbeforeunload=function(){
    
    var contentid = UIMywork.getContentId();
    var type = contentid ? "saved" : "cached";
    var localData = MugedaLocalStorage.getLocalStorage((contentid || "unsaved") + "_" + type);
    var needSave = true;
    
    if(localData)
    {
        var origin = localData.params && localData.params.origin; 
        var aniData = (localData && localData.value) || {};
        var lastSaved = JSON.stringify(aniData);
        if(contentid || origin)
        {
            needSave = lastSaved != JSON.stringify(window.aniData||'');
        }
    }
    
    // if(window.RegionData!=JSON.stringify(window.aniData||''))
    if(needSave)
      return Hanimation.Message.BeforeUnload;
};
