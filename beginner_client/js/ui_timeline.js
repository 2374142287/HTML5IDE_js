MTimeline={
	width:60,
	frameCount:1,
	thumbCache:[],
	istouch:isMobile(), // 'ontouchstart' in window,
	init:function(obj,param){
		obj.innerHTML=''
		+'<div class="mTimeline">'
		+'<section>'
		+'<hgroup>'
		+'<ol></ol>'
		+'<ul></ul>'
		+'<h1></h1>'
		+'</hgroup>'
		+'</section>'
		+'<layer title="'+Lang["TL_Layer"]+'"></layer>'
		+'<play title="'+Lang["TL_Play"]+'"><span class="commandTip indent-10">'+ Lang["TL_Play"]+'</span></play>'
		+'<preview title="'+Lang["TL_Preview"]+'"><span class="commandTip">'+ Lang["TL_Preview"]+'</span></preview>'
		+'<glass title="'+Lang["TL_Glass"]+'"><span class="commandTip indent-10">'+ Lang["TL_Glass"]+'</span></glass>'
		+'<add title="'+Lang["TL_Add"]+'"><span class="commandTip indent-10">'+ Lang["TL_Add"]+'</span></add>'
		+'<del title="'+Lang["TL_Del"]+'"><span class="commandTip indent-10">'+ Lang["TL_Del"]+'</span></del>'
		+'<dup title="'+Lang["TL_Dup"]+'"><span class="commandTip indent-10">'+ Lang["TL_Dup"]+'</span></dup>'
		+'<next title="'+Lang["TL_Next"]+'"><span class="commandTip">'+ Lang["TL_Next"]+'</span></next>'
		+'<prev title="'+Lang["TL_Prev"]+'"><span class="commandTip">'+ Lang["TL_Prev"]+'</span></prev>'
		+'</div>';
		
		this.OL=obj.querySelector('ol');
		this.UL=obj.querySelector('ul');
		this.H1=obj.querySelector('h1');
		this.SE=obj.querySelector('section');
		this.HG=obj.querySelector('hgroup');
		this.Play=obj.querySelector('play');
		
		var that=this;
		obj.addEventListener(eventstart,function(e){that.command(e)},false);
		this.SE.addEventListener(eventstart,function(e){that.start(e)},false);
		document.addEventListener(eventmove,function(e){that.move(e)},false);
		document.addEventListener(eventend,function(e){that.end(e)},false);
		this.Play.addEventListener(eventstart,function(e){that.swapPlay(this)},false);
		

		this.updateTimeline();
	},
	nextPage:function(){
		var left=this.SE.scrollLeft+this.SE.offsetWidth;
		if(left/this.width>this.OL.childNodes.length)return;
		this.SE.scrollLeft=left;
	},
	prevPage:function(){
		var left=this.SE.scrollLeft-this.SE.offsetWidth;
		if(left<0)left=0;
		this.SE.scrollLeft=left;
	},
	addFrame:function(isdel){
		var layerId=window.currentLayer;
		var frameId=window.currentFrame;
		var thumbnail;
		if(this.thumbCache[layerId])thumbnail=this.thumbCache[layerId][frameId];
		
		insertFrame();
		frameId++;
		this.frameCount++;
		this.setFrame(frameId);
		
		insertKeyFrame();
		if(isdel)clearKeyframe();
		var thumb=this.thumbCache[layerId];
		if(thumb)thumb.splice(frameId,0,thumbnail||'');
		this.updateTimeline();
	},
	delFrame:function(){
		removeKeyframes(true);
		if(window.currentFrame==this.frameCount-1){
			this.setFrame(window.currentFrame-1);
		}
		this.updateTimeline();
	},
	updateTimeline:function(){
		var layerId=0;
        var layer = window.aniLayers[layerId];
        var units = layer.units;
        var len = units.length;

		var ol='';
		var ul='';
		for(var i=0;i<len;i++){
			ol+='<li>'+(i+1)+'</li>';
			ul+='<li><i class="timelinebg" id="frame_'+layerId+'_'+i+'"><s></s></i></li>';
		}
		this.OL.innerHTML=ol;
		this.UL.innerHTML=ul;
		this.frameCount=len;
		if(window.currentFrame>len-1){
			this.setFrame(0);
		}
		
		for(var i=0;i<this.thumbCache.length;i++){
			var frames=this.thumbCache[i];
			for(var j=0;j<frames.length;j++){
				var data=frames[j];
				if(data){
					var obj=G('frame_'+i+'_'+j);
					if(obj){
						obj.childNodes[0].style.backgroundImage='url('+data+')';
					}
				}
			}
		}
		MugedaUI.redrawAll();
	},
	command:function(e){
		var o=e.target;
		if(!o||!o.tagName)return;
		switch(o.tagName.toLowerCase()){
			case 'preview':Page.processCommand('COMMAND_PRIVIEW');return;
			case 'add':this.addFrame(true);return;
			case 'del':this.delFrame();return;
			case 'dup':this.addFrame();return;
			case 'glass':this.swapGlass(o);return;
			case 'next':this.nextPage();return;
			case 'prev':this.prevPage();return;
		}
	},
	start:function(e){
		e.preventDefault();
		var e0=e.targetTouches?e.targetTouches[0]:e;
		var bound=this.SE.getBoundingClientRect();
		var istop=e0.pageY-bound.top<=40;
		var d={
			boundX:bound.left,
			pageX:e0.pageX,
			left:this.SE.scrollLeft,
			istop:e0.pageY-bound.top<=40
		};
		this.draging=d;
		if(d.istop){
			var left=e0.pageX-d.boundX+d.left;
			var frame=Math.floor(left/this.width);
			this.setFrame(frame,true);
		}
		this.move(e);
		this.pause();
	},
	move:function(e){
		var d=this.draging;
		if(!d)return;
		e.preventDefault();
		var e0=e.targetTouches?e.targetTouches[0]:e;
		if(d.istop){
			var left=d.left-(e0.pageX-d.pageX),max=(this.OL.childNodes.length-1)*this.width;
			if(left<0)left=0;
			if(left>max)left=max;
			this.SE.scrollLeft=left;
		}else{
			var left=e0.pageX-d.boundX+d.left;
			var frame=Math.floor(left/this.width);
			this.setFrame(frame,true);
		}
	},
	end:function(e){
		var d=this.draging;
		if(!d)return;
		this.draging=null;
	},
	swapGlass:function(o){
		var b=o.className=='on';
		o.className=b?'':'on';
		MugedaUI.useGlassBoard=!b;
		MugedaUI.redrawAll();
	},
	swapPlay:function(o){
		if(this.frameCount==1)return;
		var b=o.className=='on';
		o.className=b?'':'on';
		this[b?'stop':'play']();
	},
	play:function(){
		var that=this;
		this.isplaying=true;
		clearInterval(this.playTimer);
		this.playTimer=setInterval(function(){
			that.setFrame(window.currentFrame++);
			window.currentFrame++;
		},window.timerSpan||83);
	},
	pause:function(){
		this.isplaying=false;
		this.Play.className='';
		clearInterval(this.playTimer);
	},
	stop:function(){
		this.isplaying=false;
		clearInterval(this.playTimer);
		window.currentFrame=-1;
		this.setFrame();
	},
	setFrame:function(frame,hand){
		if(!frame||frame<0)frame=0;
		if(frame>=this.frameCount){
			if(hand)return;
			frame%=this.frameCount;
		}
		if(frame==window.currentFrame)return;
		var left=frame*this.width;
		if(!hand){
			var offx=left-this.SE.scrollLeft;
			if(offx<0||offx>this.SE.offsetWidth){
				this.SE.scrollLeft=left;
			}
		}
		this.H1.style.left=left+'px';
		window.currentFrame=frame;
		MugedaUI.redrawAll();
	},
	setFrameThumbnail:function(aFrameId, isTemp){
		if(this.isplaying)return;
		var layerId=window.currentLayer;
		var tmp = window.currentFrame;
		if (aFrameId == undefined)
		{
			var frameId = window.currentFrame;
		}else{
			var frameId = aFrameId;
		}
		var key=layerId+'_'+frameId;
		var obj=G('frame_'+key);
		if(!obj)return;

        isTemp = true;
		if (isTemp){
            var scale = 0.1;
			var tempCanvas=MugedaUI.getBufferCanvas('thumbBufferCanvas',window.objCanvas.offsetWidth*scale,window.objCanvas.offsetHeight*scale);

			MugedaUI.redrawAll({
				hideSelect:true,
				currentFrame:frameId,
				canvas:tempCanvas,
				scale:scale
			});
		}else{
			var tempCanvas=window.objCanvas;
		}
		
		var that=this;
		var img=new Image();
		img.src=tempCanvas.toDataURL('image/png');
		img.onload=function(){
			if(!that.thumbCache[layerId])that.thumbCache[layerId]=[];
			that.thumbCache[layerId][frameId]=this.src;
            var style = obj.childNodes[0].style;
			style.backgroundImage='url('+this.src+')';
            style.backgroundSize="contain";
            style.backgroundRepeat="no-repeat";
            style.backgroundPosition="center";
		}
	}
}
