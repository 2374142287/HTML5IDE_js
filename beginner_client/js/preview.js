window.currentFrame = 0;
window.onload = function () {
	LoadingProcess.updateTo(50,'Loading...',true);

	if (/id=(\w+)\&?/.test(location.search)) {
		var contentid = RegExp.$1;
		ajax({
			type : "GET",
			url : Hanimation.LoadURL,
			data : {
				contentid : contentid
			},
			dataType : "text",
			success : function (s) {
                LoadingProcess.update(50, null, true);
				if (s = json(s))
					s = json(s.data);
				if (!s) {
					alert('parse error');
					return;
				}
				aniData = s;
				draw();
			}
		});
	} else if (parent.AniData) {
        LoadingProcess.update(50, null, true);
		aniData = JSON.parse(parent.AniData);
		aniData.symbols = aniData.symbols || [];
		draw();
	}
}
//播放控制面板
HaniPlayer = {
	init : function () {
		// document.body.onmouseover=function(){HaniPlayer.toggle(true)}
		// document.body.onmouseout=function(){HaniPlayer.toggle()}
	},
	playAndPause : function (o) {
		window.isEnd = false;
		window.isPause = !window.isPause;
		o.className = window.isPause ? 'c0' : 'c1';
	},
	toggle : function (up) {
		var o = G('playbar');
		clearInterval(o.mo);
		o.mo = setInterval(function () {
				var n = o.offsetHeight + (up ? 4 : -4);
				var b = up ? (n > 64) : (n < 0);
				if (b) {
					clearInterval(o.mo);
					return
				}
				o.style.height = n + 'px';
			}, 10);
	}
}

function draw() {

	var canvas = G('previewCanvas');
	
    if(aniData.vr && aniData.vr > 500){
		aniData=uncompressAniData(aniData);
	}
	else if(!aniData.isunzip){
    	HaniData.unzip(aniData);
	}

	if (!aniData.zoomInfo || !aniData.zoomInfo[0])
		aniData.zoomInfo = [{
				zoomLevel : 1.,
				offsetLeft : 0,
				offsetTop : 0
			}
		];
		
    var zoomInfo = window.aniData.zoomInfo[0];
    var factor = 1. / zoomInfo.zoomLevel;
        
    window.prevZoomInfo = JSON.clone(zoomInfo);  
    Zoom.setZoomInfo(aniData, -1, {zoomLevel: 1., offsetLeft: 0, offsetTop: 0, rotation: 0});
    
	if (aniData.title) //标题
		window.title = aniData.title; 
	if (aniData.color) //颜色
		canvas.style.backgroundColor = aniData.color; 
	if (aniData.image){ //图片
		var url=aniData.image;    
		canvas.style.backgroundPosition='center';    
		canvas.style.backgroundRepeat='no-repeat';    
		canvas.style.backgroundSize="100% 100%";    
		canvas.style.backgroundImage='url('+url+')';    
	}
	if (aniData.width) { //宽度
		canvas.width = aniData.width;
		canvas.style.width = aniData.width + 'px';
	};
	if (aniData.height) { //高度
		canvas.height = aniData.height;
		canvas.style.height = aniData.height + 'px';
	};
	Mugeda.setupInput(aniData);
	//缓存声音
	AudioCache.init(aniData, function () {
		//缓存图片
		ImageCache.init(aniData, function (errorCount) 
        {
			if (errorCount > 0)
				alert(Hanimation.Message.ImageError);
			
            aniData.layers=buildLayers(aniData.layers);
            
			//缓存元件
			Symbol.build(aniData.symbols, function () {
			
				//缓存对象
				ObjectCache.init(aniData, function () 
                {
				
					//快速结束当前进度
					LoadingProcess.finish(function(){
					
						//加载脚本
						try {
							eval((aniData.script || ''));
						} catch (e) {
							// alert(e.stack);
                            alert(e);
						};
                        
                        Mugeda.onRenderReady(aniData); 
                        
						var len = getFrameLength(aniData.layers);
						var layers = aniData.layers;
						
						if (false) // len <= 1) 
						{
							//绘制图形
							redrawCanvas({
								canvas : canvas,
								layers : layers,
								repair : true
							});
							
							

							Mugeda.setTrackAnchors(aniData);/*设置跟踪链接*/
							
							
							
						} else {
							//加载播放控制面板
							// attachPopup(G('viewbox'));
							
							//播放动画
							gotoAndPlay = function (frameId) {
								currentFrame = frameId;
							};
							
							Mugeda.startAnimation(canvas, aniData);
							/*
							var timerSpan = 1000/(aniData.rate);
							var mo=setInterval(function(){
							if(window.isEnd)return;
							redrawCanvas({canvas:canvas,layers:layers,repair:true});
							// if(window.enterFrame)enterFrame(currentFrame);
							// if(!window.isPause)currentFrame++;
							Mugeda.postRender();
							
							if(currentFrame>=len){
							currentFrame=0;
							if(aniData.loop!==true){
							window.isEnd=true;
							window.isPause=true;
							G('play_and_pause').className='c0';
							}
							}
							},timerSpan);
							 */
						}
					});
				});
			});
		});
	});
}
//获取最大帧
function getFrameLength(layers) {
	var frameLenth = 1;
	for (var i = layers.length - 1; i >= 0; i--) {
		var layer = layers[i];
		var unitCount = layer.units.length;
		for (var j = 0; j < unitCount; j++) {
			var tmUnit = layer.units[j];
			var len = tmUnit.frameStart + tmUnit.frameCount;
			if (frameLenth < len)
				frameLenth = len;
		}
	}
	return frameLenth;
}
//加载声音文件
function loadAudio(src) {
	var audioElement = document.createElement('audio');
	audioElement.setAttribute('src', src);
	audioElement.load();
	return audioElement;
}
//弹出播放控制面板
function attachPopup(target) {
	var _ = arguments.callee;
	var pop = _.pop;
	if (!pop) {
		pop = document.createElement('div');
		pop.className = 'mugeda_pop';
		pop.innerHTML = ''
			 + '<style>'
			 + '.mugeda_pop{position:absolute;bottom:0;width:100%;height:0;overflow:hidden;}'
			 + '.mugeda_pop .x{display:block;position:absolute;right:5px;top:5px;width:23px;height:23px;background-image:url(res/player_close.png);}'
			 + '.mugeda_pop ul{height:64px;background:rgba(0,0,0,0.6);margin:0 auto;}'
			 + '.mugeda_pop ul li{float:left;width:64px;height:64px;overflow:hidden;}'
			 + '.mugeda_pop ul li a{display:block;width:60px;height:60px;margin:2px;background-image:url(res/player.png);}'
			 + '.mugeda_pop ul li a:hover{background-color:rgba(0,0,0,0.6);}'
			 + '.mugeda_pop ul li a.c0{background-position:0 0;}'
			 + '.mugeda_pop ul li a.c1{background-position:-60px 0;}'
			 + '.mugeda_pop ul li a.c2{background-position:-120px 0;}'
			 + '.mugeda_pop ul li a.c3{background-position:-180px 0;}'
			 + '.mugeda_pop ul li a.c4{background-position:-240px 0;}'
			 + '.mugeda_pop ul li a.c5{background-position:-300px 0;}'
			 + '</style>'
			 + '<ul>'
			 + '<li><a class="c1" target="_blank" href="#" onclick="playAndPause(this);return false" id="play_and_pause"></a></li>'
			 + '<li><a class="c2" target="_blank" href="http://www.facebook.com/"></a></li>'
			 + '<li><a class="c3" target="_blank" href="http://www.twitter.com/"></a></li>'
			 + '<li><a class="c4" target="_blank" href="http://www.google.com/"></a></li>'
			 + '<li><a class="c5" target="_blank" href="http://www.mugeda.com/"></a></li>'
			 + '</ul>'
			 + '<a class="x" href="" onclick="attachPopup.toggle(true);return false"></a>'
			_.pop = pop;
		_.toggle = function (min) {
			clearInterval(pop.mo);
			pop.mo = setInterval(function () {
					var n = pop.offsetHeight + (min ? -4 : 4);
					var b = min ? (n < 0) : (n > 64);
					if (b) {
						clearInterval(pop.mo);
						return
					}
					pop.style.height = n + 'px';
				}, 10);
		}
		if (!target)
			target = document.body;
		if (target.tagName == 'DIV')
			target.style.position = 'relative';
		target.appendChild(pop);
	}
	_.toggle();
}
//播放/暂停
function playAndPause(o) {
	window.isEnd = false;
	window.isPause = !window.isPause;
	o.className = window.isPause ? 'c0' : 'c1';
}
//进度条
LoadingProcess={
	step:1,
	percent:10,
	timespan:100,
	update:function(per,text, force){
        if(force)
            clearInterval(this.mo);    
            
        this.percent = per; 
		G('loading_length').style.width=per+'%';
		G('loading_percent').innerHTML=per+'%';
		if(text)G('loading_text').innerHTML=text;
	},
	updateTo:function(percent,text, damp){
		var that=this;
        
        // TODO: Why do we have this here? 
		// this.update(percent,text);
        
		clearInterval(this.mo);
        
        var start = that.percent; 
        var delta = Math.max(0, percent - start); 
        var index = 0; 
            
        
		this.mo=setInterval(function(){
            step = that.step;
            
            if(damp)
            {
                that.percent = Math.floor(start + delta * (1. - 1./Math.pow(2.37, (index+0.)/delta)));
            }
            else            
                that.percent = start + index;
                
            // that.percent+=that.step;
            index += step;
            
			if(that.percent>percent){
				that.percent=percent;
				that.update(that.percent);
				clearInterval(that.mo);
				if(percent==100){
					if(that.callback){
						that.hide();
						that.callback()
					}
				}
				return;
			}
			that.update(that.percent);
		},this.timespan);
	},
	finish:function(callback){
		this.callback=callback;
		this.step=150;
		this.updateTo(100);
	},
	hide:function(){
		G('loading').style.display='none';
	}
}

