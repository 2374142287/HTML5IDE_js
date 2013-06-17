var istouch = isMobile(); // 'ontouchstart' in window;
var eventstart = istouch ? 'touchstart' : 'mousedown';
var eventmove = istouch ? 'touchmove' : 'mousemove';
var eventend = istouch ? 'touchend' : 'mouseup';

var commandThreshold = 500;
var THEME = 'summer';//default

Page = {
    //var that = this;
	
	init: function(theme){
	    var that = this;
		if (theme) THEME = theme;
		that.initCommand();
		that.initMugedaUI();
		that.length = 3;//gradient��ĸ���
		window.onkeydown=this.keyDown;
        if (isMiddleMode){
            window.cTimeline = new Timeline({
                renderTo           : G('touch_timeline'),
                createNewLayer     : function (){
                    Mugeda.createNewLayer();
                },
                insertKeyFrames    : function (layerid, unitid, frameid){
                    insertKeyFrameInUnit(layerid, unitid, frameid);
                },
                deleteFrames       : function (layerid, frameid, redraw){
                    deleteFrame(layerid, frameid, redraw);
                },
                updateUnitFrame    : function (layerid, unitid, frameid, endFrame, callback){
                    updateUnitFrame(layerid, unitid, frameid, endFrame, callback);
                },
                updateUnitKeyFrame : function (layerid, orignalKeyframe, updateKeyframe, addKeyframe){
                    updateUnitKeyFrame(layerid, orignalKeyframe, updateKeyframe, addKeyframe);
                },
                drawAll            : function (p, undoMode){
                    MugedaUI.redrawAll(p, undoMode);
                },
                deleteKeyFrame     : function (layerid, frameid){
                    deleteKeyFrame(layerid, frameid);
                },
                modifyFrames       : function (layerid, unitid, startFrame, endFrame){
                    modifyFrames(layerid, unitid, startFrame, endFrame);
                }
            });
        }else{
		    MTimeline.init(G('mTimeline'),{});
        }

		var objT=document.getElementById('tpicker_panel');
	    var objG=document.getElementById('gradientBox');
        that.isShowOfTpicker = 0;//tpicker��ʾ/���ر�־λ��0Ϊ���أ�1Ϊ��ʾ
        that.isShowOfGradient = 0;//gradient��ʾ/���ر�־λ,0Ϊ����,1Ϊ��ʾ		
		that.LinOrRal = 0;//���Խ���ͻ��ν���ѡ��λ��0Ϊ���ԣ�1Ϊ����

		TPicker.init({
			container:objT,
			onchange:function(color){}
		});
	    
		GRadient = new MGradient({
		    container:objG,
			onchange:function(){},
			moveAboutTpicker:function(e){
			   G('tpicker_panel').style.display = 'none';
			   Page.isShowOfTpicker = 0 ;
			},
			clickAboutTpicker:function(e){
			   var obj = e.target;
			   Page.isShowOfTpicker = 1;
			   Page.isShowOfGradient = 1;			   
			   G('tpicker_panel').style.display = '';
               G('touch_gradient').style.display = 'none';
               G('tpicker_panel').style.height = '400px';
			   G('tpicker_panel').style.right = parseInt(getComputedStyle(G('tpicker_panel'),null).width)/2 + parseInt(getComputedStyle(G('sliderBox'),null).width) - parseInt(getComputedStyle(obj.parentNode,null).left) + 'px';
			   GRadient.show();
			},
			endAboutGradient:function(e){
               Page.GradientCallback(GRadient,1);
               Page.setFillGradientColor();			   
			},
			addSliderAboutTpicker:function(left){//�����sliderʱ��tpicker������slider�Ϸ�
			   Page.isShowOfTpicker = 1;           	 
			   G('tpicker_panel').style.display = '';
               G('touch_gradient').style.display = 'none';
               G('tpicker_panel').style.height = '400px';		   
			   G('tpicker_panel').style.right = parseInt(getComputedStyle(G('tpicker_panel'),null).width)/2 + parseInt(getComputedStyle(G('sliderBox'),null).width) - left + 'px';
			   GRadient.show();
			   Page.isShowOfGradient = 1;
			   Page.GradientCallback(GRadient,1);
			}
	    });
        
		var obj = document.getElementById('fontdetail_panel');
		UIFont.init({
			container:obj,
			onchange:function(color){}
		});

		VRangeAlpha=new VRange({
			min:0,
			max:1,
			step:0.01,
			container:G('vrange_alpha'),
			onchange:function(n, isend){
				Page.setAlpha(n);
				if(isend){
					MugedaUI.setParam({alpha:n});
				}
			}
		});//����͸���ȵĶ�����

		VRangeBorder=new VRange({
			min:0,
			max:40,
			step:1,
			container:G('vrange_border'),
			onchange:function(n, isend){
				Page.setBorder(n);
				if(isend){
					MugedaUI.setParam({lineWidth:n});
				}
			}
		});

		VRangeRate=new VRange({
			min:1,
			max:60,
			step:1,
			container:G('vrange_rate'),
			onchange:function(n, isend){
				Page.setRate(n);
				if(isend){
					MugedaUI.setParam({rate:n});
				}
			}
		});
		
        /*
		if(/contentid=(\w+)/.test(location.search)){
			var contentid=RegExp.$1;
			UIMywork.loadDocument(contentid);
		}        
        */
        
        if(window.DebugData){
			UIMywork.openDocument(DebugData);
		}else{
			 UIMywork.loadDocument();
		}        

	},
	initCommand:function(){
		 E(function(e){
            if (e.timeStamp - Page.getStartTime() > commandThreshold) return false;
            var obj=e.target;
            if(obj.tagName != 'INPUT' && obj.parentNode.id != 'share') e.preventDefault();
            Page.hideElements(e);
            if(/COMMAND_(.+)/.test(obj.id) || /^_(.+)/.test(obj.id)){
                Page.processCommand(obj.id);
            }
        }, eventend, document);
		
		E(function(e){
			if(e.target.tagName=='INPUT'){
				e.cancelBubble=true;
				return false;
			}
		},'keydown',document);
		
        //add the same click event in this collection
        //2012/7/31 18:46:13
        [G('range_alpha'),  G('AlphaIcon'), 
         G('range_border'), G('ThickIcon'), 
         G('range_rate'),G('RateIcon')].forEach(function (item, index){
             E(function(e){
			      Page.hideElements(e);
                  if (/range/.test(item.id)) G('v' + item.id).style.display = '';
                  switch (item.id){
                      case 'range_alpha': case 'AlphaIcon':
                        if (item.id === 'AlphaIcon') G('vrange_alpha').style.display = '';
                        VRangeAlpha.adjustPosition(G('panel_direction'));
                        break;
                      case 'range_border': case 'ThickIcon':
                        if (item.id === 'ThickIcon') G('vrange_border').style.display = '';
                        VRangeBorder.adjustPosition(G('panel_direction'));
                        break;
                      case 'range_rate': case 'RateIcon':
                        if (item.id === 'RateIcon') G('vrange_rate').style.display = '';
                        VRangeRate.adjustPosition(G('panel_direction'));
                        break;
                      default:
                        break;
                  }
			      e.cancelBubble=true;
		      }, eventstart, item);
        });

		E(function(e){
			var obj = e.target;
			if (obj.id == 'param_ground' || obj.id == 'GroundIcon') {
				UIGround.openGroundLibrary();
			}
			
			if (obj.id == 'LockIcon') {
				Page.processCommand(Hanimation.COMMAND_LOCK);
			}
			else if(obj.id == 'UnlockIcon') {
				Page.processCommand(Hanimation.COMMAND_UNLOCKALL);
			}
			
			if (obj.id == 'param_fillInfo' || obj.id == 'FillIcon') {
				Page.hideElements();
				G('tpicker_panel').style.display='';
                var computerObj = obj.id == 'FillIcon' ? G('param_fillInfo') : obj;
				var color = computerObj.style.background;
				TPicker.onchange=Page.fillCallback;
				TPicker.setColor(color);
                TPicker.adjustPosition(computerObj, G("panel_direction"));
				e.cancelBubble = true;
			}
			if (obj.id == 'param_strokeColor' || obj.id == 'StrokeIcon') {
				Page.hideElements();
				G('tpicker_panel').style.display='';
                var computerObj = obj.id == 'StrokeIcon' ? G('param_strokeColor') : obj;
				var color = computerObj.style.background;
				TPicker.onchange=Page.strokeCallback;
				TPicker.setColor(color);
                TPicker.adjustPosition(computerObj, G("panel_direction"));
				e.cancelBubble = true;
			}
			if (obj.id == 'detail_font' || obj.id == "FontIcon")
			{
				Page.hideElements();
				G('fontdetail_panel').style.display='';
				UIFont.getFontDetail(window.selectParams);
				UIFont.onchange=Page.fontCallback;
				var computerObj = obj.id == 'FontIcon' ? G('detail_font') : obj;
                		UIFont.adjustPosition(computerObj, G("panel_direction"));
				e.cancelBubble = true;
			} 

		},eventstart,G('touchPanel'));
		
		E(function(e){
			var obj=e.target;
			if (obj.tagName == 'B') {
				if (obj.parentNode.id == 'touch_menu') {
					var box = obj.nextSibling;
					var b = box.style.display == 'none';
					box.style.display = b ? '' : 'none';
				}
			}else if (obj.tagName == 'A') {
				var cmd = obj.getAttribute('cmd');
				if (cmd) {
					Page.processCommand(cmd);
				}
			}
		},eventstart,G('touch_menu'));
		
		E(function(e){
			e=e.target;
			if(e.tagName=='A')e=e.childNodes[0];
			if(e.tagName=='I'){
				var id=e.id;
				if(id=='SHAPE_PENCIL'||id=='SHAPE_LINE'||id=='SHAPE_RECTANGLE'||id=='SHAPE_ELLIPSE'){
					Page.updateParam('shape');
				}else if(id=='SHAPE_TEXT'){
					Page.updateParam('text');
				}
				Page.selectCommand(id);
			}
		},eventstart,G('touch_tool'));	
       
		
		E(function(e){
		     var obj = e.target;
			 if(obj.id == 'COMMAND_LINE'){
			 Page.isShowOfTpicker = 0;
			 Page.LinOrRal = 0;
			 Page.hideElements(e);
			 GRadient.show();
			 Page.isShowOfGradient = 1;
//			 Page.setFillColor();
			 }else if (obj.id == 'COMMAND_RADIAL'){
			 Page.isShowOfTpicker = 0;
			 Page.LinOrRal = 1;
			 Page.hideElements(e);	 			 
			 Page.isShowOfGradient = 1;
			 GRadient.show();
//			 Page.setFillColor();
			 }
			 e.cancelBubble = true;
		},eventend,G('touch_gradient'));
				
		 E(function(e){
            var obj = e.target;
            if (obj.id == 'param_ground' || obj.id == 'GroundIcon') {
                UIGround.openGroundLibrary();
            }

            if (obj.id == 'param_fillInfo' || obj.id == 'FillIcon') {
                Page.hideElements(e);
                if(Page.isShowOfGradient == 1){
				   G('gradientBox').style.display = 'none';
				   Page.isShowOfGradient = 0;
				}//	
				Page.isShowOfTpicker = 1;
		        G('tpicker_panel').style.display='';
				G('touch_gradient').style.display = '';
			    G('tpicker_panel').style.height = '440px';
				G('tpicker_panel').style.right = '140px';
                var computerObj = obj.id == 'FillIcon' ? G('param_fillInfo') : obj;
                var color = computerObj.style.background;
     		    TPicker.onchange=Page.fillCallback;
                TPicker.setColor(color);
                TPicker.adjustPosition(computerObj, G("panel_direction"));	
                e.cancelBubble = true;
            }
            if (obj.id == 'param_strokeColor' || obj.id == 'StrokeIcon') {
			    Page.hideElements(e);
				if(Page.isShowOfGradient == 1){
				   GRadient.hide();
				   Page.isShowOfGradient = 0;
				}
				Page.isShowOfTpicker = 1;
                G('tpicker_panel').style.display='';
			    G('tpicker_panel').style.height = '400px';
				G('tpicker_panel').style.right = '140px';
				G('touch_gradient').style.display = 'none';
                var computerObj = obj.id == 'StrokeIcon' ? G('param_strokeColor') : obj;
                var color = computerObj.style.background;
                TPicker.onchange=Page.strokeCallback;
                TPicker.setColor(color);
                TPicker.adjustPosition(computerObj, G("panel_direction"));
                e.cancelBubble = true;
            }

        },eventstart,G('touchPanel'));

		
		E(function(e){
			e.preventDefault();
			var ison = this.className == 'on';
			this.className = ison ? '' : 'on';
			G('touch_menu').style.display =   ison ? 'none' : '';
		},eventstart,G('touch_menu_bar'));

		E(function(e){
			e.cancelBubble = true;
			var b=G('tool_ctrl').className!='on';
			G('tool_ctrl').className=b?'on':'';
			window.isCtrl = b;
		},eventstart,G('tool_ctrl'));
		
		E(function(e){
			e.cancelBubble = true;
			var b=G('tool_shift').className!='on';
			G('tool_shift').className=b?'on':'';
			window.isShift = b;
		},eventstart,G('tool_shift'));
		
		E(function(e){
			if (e.timeStamp - Page.getStartTime() > commandThreshold) return false;

		    var e = e.target;
			if(e.className == 'advancedOptions' || e.className == 'list')
			{
		        G('touch_menu_list').style.display = 'block';
			    G('direction').style.display = 'block';

				switch(e.id)
				{
				    case 'COMMAND_ARRANGE':
				    G('arrange').style.display = 'block';
				    popup.start(G('COMMAND_ARRANGE'),G('direction'), G('arrange'), 'top', 64);
					break;
				    case 'COMMAND_ALIGN':
				    G('align').style.display = 'block';
				    popup.start(G('COMMAND_ALIGN'),G('direction'), G('align'), 'top', 64);
					break;
					case 'COMMAND_TRANSFORM':
				    G('transform').style.display = 'block';
				    popup.start(G('COMMAND_TRANSFORM'),G('direction'), G('transform'), 'top', 64);
					break;
					case 'GROUP':
				    G('group').style.display = 'block';
				    popup.start(G('GROUP'),G('direction'), G('group'), 'top', 64);
					break;
					case 'COMMAND_COMBINE':
				    G('combine').style.display = 'block';
				    popup.start(G('COMMAND_COMBINE'), G('direction'), G('combine'), 'top', 64);
					break;
                    case 'COMMAND_SETTING':
				    G('setting').style.display = 'block';
					//e.preventDefault();
				    popup.start(G('COMMAND_SETTING'), G('direction'), G('setting'), 'right', 64);
					break;
					case 'COMMAND_TIP':
					break;
					case 'COMMAND_FACEBOOK':
					case 'COMMAND_TWITTER':
					case 'COMMAND_GMAIL':
                    case 'COMMAND_URL':
					Page.shareWork(e);
					break;
				default:
					break;
				}
			}
			else
			{
			    G('direction').style.display = 'none';
			    G('arrange').style.display = 'none';
				G('align').style.display = 'none';
				G('transform').style.display = 'none';
				G('group').style.display = 'none';
				G('combine').style.display = 'none';
				G('setting').style.display = 'none';
			}

		}, eventend, document);

		E(function (e){
			Page.setStartTime(e.timeStamp);
		}, eventstart, document);

		E(function (e){
            document.removeEventListener(eventend, Page.toolBarScrollEnd, false);
		}, eventend, document);

	    E(function (e){
			e.target.style.backgroundColor = '#fec';
            Page.toolBarScrollStart(e);
            E(Page.toolBarScrollMove, eventmove, document);
		}, eventstart, G('touch_bar'));

        E(function (e){
			G('touch_menu_list').style.display = 'none';
			G('direction').style.display = 'none';
		}, 'webkitTransitionEnd', G('touch_bar'));

		E(function (e){
			e.target.style.backgroundColor = '';
		    //remove scroll event in tool bar
            Page.toolBarScrollEnd(e);
            document.removeEventListener(eventmove, Page.toolBarScrollMove, false);
            document.removeEventListener(eventend,  Page.toolBarScrollEnd,  false);
		}, eventend, G('touch_bar'));

	    E(function(e){
			e = e.target;
			if (e.tagName != 'LI' && e.tatName != 'DIV')
				e.style.backgroundColor = '#fec';
		},eventstart,G('touch_menu_list'));
		
	    E(function(e){
			e = e.target;
			e.style.backgroundColor = '';
		},eventend,G('touch_menu_list'));

		Page.setTipStatus(0);
        Page.setToolTip();
	},
	
    toolBar: {
		startX: 0,
        x: 0,
		distX: 0,
		endX: 0,
		endtime: 0,
		rollWidth: 0,
		startPosition: 0
	},
	toolBarScrollStart: function (e){
		Page.toolBar.rollWidth  = G('touch_bar').scrollWidth - document.body.offsetWidth;
		
		if (Page.toolBar.rollWith === 0) return false;// no scroll
		Page.toolBar.startX        = istouch ? e.changedTouches[0].pageX : e.pageX;
		Page.toolBar.startime      = e.timeStamp;
		Page.toolBar.startPosition = parseInt(getComputedStyle(G('touch_bar')).left);
	},
    toolBarScrollMove: function (e){
		e.preventDefault();
		e.stopPropagation();

		G('touch_menu_list').style.display = 'none';
		G('direction').style.display = 'none';

        var toolBar      = G('touch_bar'),
		    leftPosition = parseInt(getComputedStyle(G('touch_bar')).left);

	    Page.toolBar.distX  = (istouch ? e.changedTouches[0].pageX : e.pageX) - Page.toolBar.startX;
		var newPosition = Page.toolBar.startPosition + Page.toolBar.distX;

		if (newPosition <= 0 && Math.abs(newPosition) < Page.toolBar.rollWidth){
		   toolBar.style.left = newPosition + 'px';   
		}else {
		   return false;	
		}

    },
	toolBarScrollEnd: function (e){
		var time        = e.timeStamp - Page.getStartTime(),
			endX        = istouch ? e.changedTouches[0].pageX : e.pageX,
			distX       = endX - Page.toolBar.startX,
			newPosition = Page.toolBar.startPosition + distX;
        
		Page.toolBarScrollTo(newPosition, '350ms' || time);
    },
	toolBarScrollTo: function (x, duration){
		var toolBar = G('touch_bar');
		
        if (x <= 0 && Math.abs(x) < Page.toolBar.rollWidth){
		    //toolBar.style.webkitTransitionProperty       = 'left';
		    //toolBar.style.webkitTransitionTimingFunction = 'ease-in-out';
		    //toolBar.style.webkitTransitionDuration       = duration / 1000 + 'ms' || '350ms';
			toolBar.style.webkitTransition = 'left ' + duration + ' ease-in-out 0.01s';
			toolBar.style.left = x + 'px';
	    }else {
		    return false;	
		}
		
	},
	selectCommand:function(cmd){
		var obj=G(cmd);
		if(!obj)return;
		obj=obj.parentNode;
		if(Page.lastCommand)Page.lastCommand.className='';
		obj.className='on';
		Page.lastCommand=obj;
		Page.processCommand(cmd);
	},
	
	
	
	processCommand:function(cmd){
		switch(cmd){					
			case 'SHAPE_PICTURE':Page.selectPicture();return;
			case 'COMMAND_NEW':Page.newWork();return;
			case 'COMMAND_PRIVIEW':Page.preview();return;
			case 'COMMAND_OPEN':Page.openWork();return;
			case 'COMMAND_SAVE':Page.saveWork();return;
			case 'COMMAND_SAVEIMAGE':Page.toSaveImageWork();return;
			case 'COMMAND_FACEBOOK': 
			case 'COMMAND_TWITTER': 
			case 'COMMAND_GMAIL':
            case 'COMMAND_URL':return;
			case 'COMMAND_TIP': Page.setToolTip();return;
			case 'COMMAND_BACK':location="/beginner/anilist.php";  return;
		}
		processCommand(cmd);
	},
	hideElements:function(e){

		if(Page.isShowOfTpicker == 1&& Page.isShowOfGradient == 1){
 			   Page.isShowOfTpicker = 0;
			   Page.isShowOfGradient = 0;
			   G('tpicker_panel').style.display = 'none';
			   G('vrange_alpha').style.display='none';
		       G('vrange_border').style.display='none';
		       G('vrange_rate').style.display='none';
		       G('panel_direction').style.display='none';
		       G('gradientBox').style.display = "none";
		       G('fontdetail_panel').style.display='none';
			   e.cancelBubble = false;
		}else{
		       G('tpicker_panel').style.display='none';
		       G('vrange_alpha').style.display='none';
		       G('vrange_border').style.display='none';
		       G('vrange_rate').style.display='none';
		       G('panel_direction').style.display='none';
		       G('gradientBox').style.display = "none";
		       G('fontdetail_panel').style.display='none';
			   Page.isShowOfTpikcer = 0;
			   Page.isShowOfGradient = 0;
		}
	},
	//set tool tip
    setToolTip: function (){
		var tips       = getClass('commandTip'),
		    status     = Page.getTipStatus(),
			transition = '0.2s cubic-bezier(0,0,0.25,1) 0s',
			bgsize     = status ? '50px 50px' : '40px 40px';

		    if (tips.length){
			  	  for (var i = 0, l = tips.length; i < l; i++){
			  		 var tip    = tips[i],
			  		     preE   = tip.previousElementSibling,
						 parent = tip.parentNode,
						 flagid = /-tip$/.test(tip.id);

                     if (!flagid && (preE || parent)){
						var elem = preE || parent;

                        if (elem.tagName === 'PREV' || elem.tagName === 'NEXT') continue;
						if (THEME === 'summer'){
			               elem.style.webkitTransition   = 'background-size '    + transition;   
			               elem.style.webkitTransition   = 'background-position' + transition;   
			               elem.style.backgroundSize     = bgsize;    
						}
			            tips[i].style.webkitTransition = 'margin-top ' + transition;   
			            elem.style.backgroundPosition = status ? 'center center' : 'center ' + (THEME === 'summer' ? '5px' : '10px');    
						
						if (elem.parentNode.className === 'mTimeline'){
			               tips[i].style.marginTop  = status ? '0' : THEME === 'summer' ? '38px' : '30px';    
			               elem.style.backgroundPosition = status ? 'center center' : 'center 0px';    
						}else {
			               tips[i].style.marginTop  = status ? '0' : '-20px';    
						}

					 }else if (flagid){
						var parent = tip.parentNode.parentNode,
						    icon   = G(tip.id.split('-')[0]);

						parent.style.display          = status ? 'none' : 'block';
			            parent.style.webkitTransition = 'margin-top ' + transition;   
						parent.style.marginTop        = '-12px';
						if (THEME === 'summer' && icon){
			               icon.style.webkitTransition  = 'background-size ' + transition;   
			               icon.style.backgroundSize    = bgsize;    
					    }
					 }
						 
					 tips[i].style.visibility = status ? 'hidden' : 'visible';   

			  	  }

			  	  Page.setTipStatus(status ? 0 : 1);
		    }
	},
	setFillInfo:function(){
		var color=G('fillColor').value;
		var fillInfo=createFillInfo();
		fillInfo.fillColors = COLOR.toFillColors(color);
		fillInfo.fillStyle = parseInt(G('fillStyle').value||0);
		MugedaUI.setParam({fillInfo:fillInfo});
	},
	keyDown:function(e){
		var sc=Page.selectCommand;
		var pc=Page.processCommand;
		if(e.ctrlKey){
			switch(e.keyCode){
				case 83:Page.saveWork();return false;
				case 88:pc('COMMAND_CUT');return;
				case 67:pc('COMMAND_COPY');return;
				case 86:pc('COMMAND_PASTE');return;
				case 90:pc('COMMAND_UNDO');return;
				case 89:pc('COMMAND_REDO');return;
				case 71:pc('COMMAND_GROUP');return;
				case 73:if(!e.shiftKey)sc('	');return;
			}
		}else{
			var pix=e.shiftKey?10:1;
			switch(e.keyCode){
				case 86:sc('SHAPE_SELECT');return;
				case 80:sc('SHAPE_PENCIL');return;
				case 76:sc('SHAPE_LINE');return;
				case 69:sc('SHAPE_ELLIPSE');return;
				case 82:sc('SHAPE_RECTANGLE');return;
				case 84:sc('SHAPE_TEXT');return;
				case 81:sc('SHAPE_SCALE');return;
				case 65:sc('SHAPE_NODE');return;
				case 46:pc('COMMAND_DELETE');return;
				case 37:moveObject(-pix,0);;return;//left
				case 38:moveObject(0,-pix);;return;//top
				case 39:moveObject(pix,0);;return;//right
				case 40:moveObject(0,pix);;return;//bottom
				case 120:Page.preview();return;
			}
		}
	},
	initMugedaUI:function(){
		MugedaUI.init({
			objCanvas:G('myCanvas'),
			oncommand:function(cmd){
				if(cmd==Hanimation.SHAPE_SELECT){
					Page.selectCommand('SHAPE_SELECT');
				}
			},
			updateStatus:function(num, ext){
				G('COMMAND_UNDO').className=ext.undo?'':'disa';
				G('COMMAND_REDO').className=ext.redo?'':'disa';
				G('COMMAND_PASTE').className=ext.clip?'':'disa';
				G('COMMAND_CUT').className=num>0?'':'disa';
				G('COMMAND_COPY').className=num>0?'':'disa';
				G('COMMAND_DELETE').className=num>0?'':'disa';
			},
			updateParam:function(type, param){
				Page.updateParam(type, param);
			},
			resetGround:function(){
				var type=0;
				var data=aniData.color||'#fff';
				if(aniData.image){
					type=1;
					data={url:aniData.image};
				}
				Page.selectGroundCallback(type,data);
			}
		});
	},
	preview:function(){
        var win=this.previewWin;
		if(!win){
			win = new Window({
				title: Lang["Preview"],
				src: 'about:blank',
				width: 620,
				height: 450,
				hidden: true,
				modal: true,
				onclose: function() {
					Page.previewWin.el.frame.src = 'about:blank';
				}
			});
			this.previewWin=win;
		}
        
        var templete=window.objCanvas;
        var zoomInfo = window.aniData.zoomInfo[0];
        
        window.AniData=JSON.stringify(window.aniData);
        win.show();
        win.o.style.width=Math.floor((templete.offsetWidth-Hanimation.PADDING*2)/zoomInfo.zoomLevel)+2+'px';
        win.o.style.height=Math.floor((templete.offsetHeight-Hanimation.PADDING*2)/zoomInfo.zoomLevel)+win.el.title.offsetHeight+2+'px';
        win.center();
        win.el.frame.src='preview.html?'+Math.random();
		
	},
	updateParam:function(type, param){
		var iscanvas=type=='canvas';
		G('tr_ground').style.display=iscanvas?'':'none';
		G('tr_objects').style.display=iscanvas?'none':'';
		if(!param)return;
		if(type=='canvas'){
			if(!window.VRangeRate)return;
			var rate=param.rate||12;
			Page.setRate(rate);
			VRangeRate.setval(rate);
		}else{
			if(param.fillInfo){
				G('fillStyle').value=param.fillInfo.fillStyle;
				if (param.fillInfo.fillStyle>0){
					Page.setFillGradientColor();
				}else{
					var color=COLOR.toRGBAString(param.fillInfo.fillColors[0]);
					Page.setFillColor(color);
				}
			}
			
			G('param_strokeColor').style.backgroundColor=param.strokeColor;
			
			Page.setAlpha(param.alpha);
			VRangeAlpha.setval(param.alpha);
			
			Page.setBorder(param.lineWidth);
			VRangeBorder.setval(param.lineWidth);
		}
		Page.setFrameThumbnail();
	},
	setFrameThumbnail:function(){
		clearTimeout(Page.thumbTimer);
		Page.thumbTimer=setTimeout(function(){
			MTimeline.setFrameThumbnail();
		},100);
	},
	setAlpha:function(n){
		G('range_alpha_mask').style.opacity=n||0;
	},
	setBorder:function(n){
		G('range_border_weight').style.height=(n||1)+'px';
	},
	setRate:function(n){
        G('range_rate_text').innerHTML=n;
		G('range_rate_weight').style.width=(n||1)*40/60+'px';
	},
	setFillColor:function(color){
		if(typeof color == 'object'){
			if(color.a==undefined)color.a=1;
			color='rgba('+[color.r,color.g,color.b,color.a||0]+')';
		}
		G('param_fillInfo').style.backgroundImage='';
	    G('param_fillInfo').style.backgroundColor=color;
	}, 
	setFillGradientColor:function(){
		var selectObject = window.objSelect.getObjectAt(0);
		var params = selectObject.dataRef.param.fillInfo;//���anidata�еĵ�ǰ���
		var length = params.fillColors.length;
	    if(params.fillStyle == 1  && params){
			var PX = (params.fillStartPos.x + params.fillEndPos.x)/100;
			var PY = (params.fillStartPos.y + params.fillEndPos.y)/100;
		    if(length <= 2){
		       G('param_fillInfo').style.backgroundImage = '-webkit-gradient(linear,' + params.fillStartPos.x/PX + '% ' +  params.fillStartPos.y/PY + '%,'+ params.fillEndPos.x/PX + '% ' + params.fillEndPos.y/PY + '%,' + 'from(rgb(' + params.fillColors[0].r + ',' + params.fillColors[0].g + ',' + params.fillColors[0].b + ')), to(rgb(' + params.fillColors[1].r + ',' + params.fillColors[1].g + ',' + params.fillColors[1].b + ')))';
		    }else{
			   var temp = '-webkit-gradient(linear,' + params.fillStartPos.x/PX + '% ' +  params.fillStartPos.y/PY + '%,'+ params.fillEndPos.x/PX + '% ' + params.fillEndPos.y/PY + '%,' + 'from(rgb(' + params.fillColors[0].r + ',' + params.fillColors[0].g + ',' + params.fillColors[0].b + ')),';
			   for( i = 0;i < length ;i++){
			       temp =  temp + 'color-stop(' + params.fillColors[i].p + ', rgb('+ params.fillColors[i].r + ',' + params.fillColors[i].g + ',' + params.fillColors[i].b + ')),';
			   }
			   temp = temp + 'to(rgb('+ params.fillColors[length - 1].r + ',' + params.fillColors[length - 1].g + ',' + params.fillColors[length - 1].b + ')))';
		       G('param_fillInfo').style.backgroundImage = temp;
		    }
		}else if(params.fillStyle == 2 && params){
		    if(length <= 2){
		       G('param_fillInfo').style.backgroundImage = '-webkit-gradient(radial, 50% 50%, 0, 50% 50%, 20,' + 'from(rgb(' + params.fillColors[0].r + ',' + params.fillColors[0].g + ',' + params.fillColors[0].b + ')), to(rgb(' + params.fillColors[1].r + ',' + params.fillColors[1].g + ',' + params.fillColors[1].b + ')))';
		    }else{
			   var temp = '-webkit-gradient(radial, 50% 50%, 0, 50% 50%, 20, ' + 'from(rgb(' + params.fillColors[0].r + ',' + params.fillColors[0].g + ',' + params.fillColors[0].b + ')),';
			   for( i = 0;i < length;i++){
			       temp =  temp + 'color-stop(' + params.fillColors[i].p + ', rgb('+ params.fillColors[i].r + ',' + params.fillColors[i].g + ',' + params.fillColors[i].b + ')),';
			   }
			   temp = temp + 'to(rgb('+ params.fillColors[length - 1].r + ',' + params.fillColors[length - 1].g + ',' + params.fillColors[length - 1].b + ')))';
		       G('param_fillInfo').style.backgroundImage = temp;
		    }
		}
	},
	
	GradientCallback:function(obj,isend){
	    var slider = obj.getAllSlider();
        var width =  parseInt(window.getComputedStyle(sliderBox,null).width);
		var selectObject = window.objSelect.getObjectAt(0);
		var params = selectObject.dataRef.param.fillInfo;//���anidata�еĵ�ǰ���
		var fillInfo = createFillInfo();
		fillInfo.fillStartPos = params.fillStartPos;
		fillInfo.fillEndPos = params.fillEndPos;
		fillInfo.fillStyle = Page.LinOrRal + 1;
		if(slider.length <= 3){
		    for(i = 0;i<slider.length;i++){
		        var length = parseInt(window.getComputedStyle(slider[i],null).left)+ 16;
			    var sliderColor = window.getComputedStyle(slider[i].childNodes[1],null).backgroundColor;
			    var rgbStr = new String(sliderColor);
			    var rgb = rgbStr.substr(4, rgbStr.length-5);
			    var rgbArray = rgb.split(',');
			    var r = parseInt(rgbArray[0]),
			        g = parseInt(rgbArray[1]),
			        b = parseInt(rgbArray[2]);
			    if(length >= width)length = width;
			    if(length <=0)length = 0;
		        fillInfo.fillColors[i].p = length/width;
			    fillInfo.fillColors[i].r = r;
			    fillInfo.fillColors[i].g = g;
			    fillInfo.fillColors[i].b = b;
			    fillInfo.fillColors[i].a = 1;
			}
		   for(i=slider.length;i<3;i++)
	     	   {
			fillInfo.fillColors[i].p = 1;
			fillInfo.fillColors[i].r = fillInfo.fillColors[i-1].r;
			fillInfo.fillColors[i].g = fillInfo.fillColors[i-1].g;
			fillInfo.fillColors[i].b = fillInfo.fillColors[i-1].b;
			fillInfo.fillColors[i].a = fillInfo.fillColors[i-1].a;
		   }
		}else if(slider.length > 3){
		    for(i = 0;i<3;i++){
		        var length = parseInt(window.getComputedStyle(slider[i],null).left)+ 16;
			    var sliderColor = window.getComputedStyle(slider[i].childNodes[1],null).backgroundColor;
			    var rgbStr = new String(sliderColor);
			    var rgb = rgbStr.substr(4, rgbStr.length-5);
			    var rgbArray = rgb.split(',');
			    var r = parseInt(rgbArray[0]),
			        g = parseInt(rgbArray[1]),
			        b = parseInt(rgbArray[2]);
			    if(length >= width)length = width;
			    if(length <=0)length = 0;
		        fillInfo.fillColors[i].p = length/width;
			    fillInfo.fillColors[i].r = r;
			    fillInfo.fillColors[i].g = g;
			    fillInfo.fillColors[i].b = b;
			    fillInfo.fillColors[i].a = 1;
			}
			for(i = 0;i <slider.length - 3;i++){
			    var length = parseInt(window.getComputedStyle(slider[i+3],null).left) + 16;
			    var sliderColor = window.getComputedStyle(slider[i+3].childNodes[1],null).backgroundColor;
			    var rgbStr = new String(sliderColor);
			    var rgb = rgbStr.substr(4, rgbStr.length-5);
			    var rgbArray = rgb.split(',');
			    var r = parseInt(rgbArray[0]),
			        g = parseInt(rgbArray[1]),
			        b = parseInt(rgbArray[2]);
			    if(length >= width)length = width;
			    if(length <=0)length = 0;
				var newObj = {
			        r:r,
                    g:g,
                    b:b,
                    a:1,
				    p:length/width              				   
			    };
                fillInfo.fillColors.push(newObj);				
			}
		   
		}	
		if(isend){
			MugedaUI.setParam({fillInfo:fillInfo});
			MugedaUI.redrawAll();
			MTimeline.setFrameThumbnail();
		}
	},
		
	addSliderCallback:function(addSlider){
	    if(!addSlider)return false;
		else return true;
	},
	
	gradientFill:function(gradient,color){
	     gradient.synGradientColor(color.r,color.g,color.b,color.a);
		 gradient.synSliderColor(color.r,color.g,color.b,color.a);
	},
	
	fillCallback:function(color, isend){
		if(!color)return;
        var fillStyle = window.objSelect.getObjectAt(0).dataRef.param.fillInfo.fillStyle;
		if(Page.isShowOfGradient ==1 && Page.isShowOfTpicker ==1){//˵��Ҫ��������ѡ��������ɫ���Ч������
		    if(GRadient){
			   Page.gradientFill(GRadient,color);//�޸Ľ���ѡ����ɫ����ɫ��ɫ����ɫ
			   if (isend){
			   	Page.GradientCallback(GRadient,1);//��������Ч��
			   }
			   Page.setFillGradientColor();
			   /***************Ϊ����ɫ��ͬ���滻��ɫ**********/
		    }   
		}else if(Page.isShowOfGradient == 0  && Page.isShowOfTpicker ==1){//�����ֻ��tpicker��ô˵���ǵ�ɫ���Ч��
		    var fillInfo=createFillInfo();
		    fillInfo.fillColors = [color];
		    fillInfo.fillStyle = 0;	
		    Page.setFillColor(color);
            if (fillStyle){Page.setFillGradientColor()}
		    if(isend){
			   MugedaUI.setParam({fillInfo:fillInfo});
			   MTimeline.setFrameThumbnail();
		    }
		}
	},

	fontCallback:function(font, isend){
		if(!font)return;
		console.log(font);
		if(isend){
			MugedaUI.setParam(font);
			MTimeline.setFrameThumbnail();
		}
	},
	fontCallback:function(font, isend){
		if(!font)return;
		if(isend){
			MugedaUI.setParam(font);
			MTimeline.setFrameThumbnail();
		}
	},
	strokeCallback:function(color, isend){
		if(!color)return;
		color=COLOR.toRGBAString(color);
		G('param_strokeColor').style.background=color;				
		if(isend){			
			MugedaUI.setParam({strokeColor:color});
			MTimeline.setFrameThumbnail();
		}
	},
	
	selectGroundCallback:function(type, data){
		var obj1=G('param_ground');
		var obj2=G('myCanvas');
		var bg;
		if(type==0){
			var color=data;
			if(/(\d+)[ ,]+(\d+)[ ,]+(\d+)[ ,]+([\d\.]+)/.test(data)){
				color='rgba('+[RegExp.$1,RegExp.$2,RegExp.$3,RegExp.$4].join(',')+')';
			}
			obj1.style.backgroundImage='';
			obj2.style.backgroundImage='';
			obj1.style.backgroundColor=color;
			obj2.style.backgroundColor=color;
			MugedaUI.setParam({color:color});
			bg=color;																																																																
		}else{
			var ground='url('+data.url+')';
			obj1.style.backgroundColor='';
			obj2.style.backgroundColor='';
			obj1.style.backgroundImage=ground;
            obj1.style.backgroundSize="contain";
            obj1.style.backgroundRepeat="no-repeat";
            obj1.style.backgroundColor="#000";
            obj1.style.backgroundPosition="center";
			obj2.style.backgroundImage=ground;
			MugedaUI.setParam({image:data.url});
			bg=ground;
		}
		Page.setThumbBackground(type,bg);
	},
	
	selectPicture:function(){
		UIPicture.openPictureLibrary();
	},
	selectPictureCallback:function(data){
		addImage(data);
	},
	setThumbBackground:function(type,bg){
		var div=this.thumbBackgroundStyle;
		if(!div){
			div=document.createElement('div');
			document.body.appendChild(div);
			this.thumbBackgroundStyle=div;
		}
		div.innerHTML='<style>.timelinebg{background-'+((type==0)?'color':'image')+':'+bg+'}</style>';
	},
	loading:function(b){
		G('Loading').style.display=b?'none':'';
	},
	saveWork:function(b){
		UIMywork.saveWork();
	},		
	newWork:function(b){		
		if(confirm(Lang['M_BeforeUnload'])){
			location.href=location.href.split('?')[0];	
		}	
	},
	openWork:function(b){
		UIMywork.openWork();
	},

	//preview and save image to local function
    toSaveImageWork: function (){
        UIMywork.toSaveImageWork();            
    },

	//share ainmation function
	shareWork: function (e){
	    UIMywork.shareWork(e);	
    },

    //set status of tooltip
	setTipStatus: function (status){
		localStorage.setItem('tipStatus', status);
    },

    //get status of tooltip
	getTipStatus: function (){
		return parseInt(localStorage.getItem('tipStatus'));
    },

    //set start time of tool bar touch
	setStartTime: function (time){
		localStorage.setItem('toolTime', time);
	},

	//get end time of tool bar touch
	getStartTime: function (){
		return parseInt(localStorage.getItem('toolTime'));
	}
}

