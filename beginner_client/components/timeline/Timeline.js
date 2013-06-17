/*
* Timeline class JavaScript File
*
*/

var Timeline = (function (){
	
	//private attribute
	//HTML template
	Timeline.template = "<div class='dragger'><span><span></div>" 
                      + "<div class='command'><span class='add'></span><span class='del'></span><span class='insertAnimation'></span><span class='recordAnimation'></span></div>"
	                  + "<div class='Timeline'>"
					  + "<div class='statusTip'></div>"
				      + "<div class='head'>"
				      + "<div class='play'></div>"
				      + "<div class='ruler'></div></div>" 
	                  + "<div class='layers'>"
				      + "<div class='layerThumb'>"
				      + "<ul></ul>"
					  + "</div>"
				      + "<div class='layerContent'>"
				      + "<ul></ul>"
					  + "</div></div></div></div>";

    Timeline.cursorTemplate   = "<div class='cursor'><p>0s</p><span></span></div>";
	Timeline.thumbTemplate    = "<img src='#'/>";
	Timeline.TimeUnitTemplate = "<span id='unit_#' class='timeUnit'></span>";
    Timeline.headTemplate     = "<span class='prevUnit'></span><span class='leftHead'></span><span class='rightHead'></span>";
	Timeline.rulerTemplate    = "<span style='width:#px'><b><a>#</a><i></i></b></span>";
	Timeline.keyframeTemplate = "<b id='#' class='#' style='left:#px;visibility:visible'></b>";
     
    var _userAgent_           = window.navigator.userAgent.toLowerCase(),
        _clientStyle_         = /chrome/.test(_userAgent_) ? '-webkit-' :
                                /firefox/.test(_userAgent_) ? '-moz-'   : '-webkit-',
        _regTransformMatrix_  = /^matrix\((\d*\.?\d+)\,\s(\d*\.?\d+)\,\s(\d*\.?\d+)\,\s(\d*\.?\d+)\,\s(\d*\.?\d+)\,\s(\d*\.?\d+)\)$/,
        _transformStyle_      = _clientStyle_ + 'transform',
        _transitionStyle_     = _clientStyle_ + 'transition';
    var _lastTimeUnitWidth = 0, _lastLayerId = 0,_lastUnitId = 0;

    //Timeline class
	function Timeline (options){
	    this.options         = options || {};
		this.layer           = 0;
		this.frame           = 0;
		this.lastLayer       = 0;
		this.scale           = [1];  
	    this.timeLength      = 18; //18s is the original the length of animation time
		this.pathNode        = []; //node list in path
		this.offset          = 15;
		this.clickTiming     = 150;
		this.delayTiming     = 1500;
		this.keyframeIdReg   = /^(\d+)\_(\d+)$/;
		this.recordStatus    = false;

		if (!this.options.renderTo){
			throw new Error("cann't to initialize this element");
	    }

		this.initialize();
	}

	Timeline.prototype = {
	    constructor: Timeline,	

		initialize: function (){
			this.options.renderTo.innerHTML = Timeline.template;
			/*contianer*/
			this.layerThumbElement   = this.options.renderTo.querySelector('div.layerThumb ul');
			this.layerContentElement = this.options.renderTo.querySelector('div.layerContent ul');
			this.rulerElement        = this.options.renderTo.querySelector('div.ruler');
			this.playElement         = this.options.renderTo.querySelector('div.play');
			this.draggerElement      = this.options.renderTo.querySelector('div.dragger'); 
			this.allLayerElement     = this.options.renderTo.querySelector('div.layers');
			this.commandElement      = this.options.renderTo.querySelector('div.command');

			//init ruler element
			this._initRuler();
			//first update
			this.updateTimeline(true);
			//set current layer
			this._setCurrentLayer(0);
			this._selectLayer(this.layerContentElement.firstChild);
            //add total event
			this._addEvent();
	    },

		//==================================================
        //update the UI of timeline
		//public method
		addUnit: function (){
		    var layer   = window.aniLayers[this._getCurrentLayer() || 0],
			    units   = layer.units,
				len     = units.length,
                tmUnit  = units[this._getCurrentUnitId()],
			    objects = tmUnit.objects,
				defaultFrameCount = this._getFPS();
            
			if (objects.length === 1 && tmUnit.frameCount < 1){
			    //insert frame for animation
		        this.options.modifyFrames(this._getCurrentLayer(), this._getCurrentUnitId(), this._getCurrentFrame(), defaultFrameCount);
			}
		    this.updateTimeline();

		},

		updateTimeline: function (reset){
			var layers = window.aniLayers;


            if (reset){
                this._updateRuler();
                this._addAllLayerElementEvent(true);
			}

			this.layerContentElement.innerHTML = '';
			this.layerThumbElement.innerHTML   = '';

			for (var i = 0, l = layers.length; i < l; i++){
			    var layer = layers[i],
			 	    units = layer.units;

				this._addLayerContent(i, layer.id);

			 	//this._layerElement_ = this._getLayerElement(layer.id);
			    //this._thumbElement_ = this._getThumbElement(layer.id); 	

			 	if (!this._layerElement_ || !this._thumbElement_) continue;
                this._layerElement_.innerHTML = Timeline.headTemplate;

			 	for (var j = 0, k = units.length; j < k; j ++){
				//	if (j != units.length - 1) continue;
                    if (units[j].visible == false) continue;

					var frameStart = units[j].frameStart,
					    frameCount = units[j].frameCount,
						objNumber  = units[j].objects.length;

                    if (objNumber === 1 && units[j].frameCount < 1){
						frameCount = this._getFPS(); 
				    }
					
					this._updateThumbnail(units[j].objects);
				    this._addTimeUnitElement(frameStart, frameCount, j, units[j].animated ? units[j].aniType : '');
					this._addKeyFrameElements(units[j].keyframes, units[j].animated, units[j].aniType, j);
			 	}
                if (units.length == 1 && units[0].objects.length === 0){
                    this._layerElement_.innerHTML = '';
                }
			 	
			}
            
		},

		setUnitPath: function (){
			var pencilObject  = this.getPencilObject(),
		        points        = pencilObject.dataRef.curve.points,
				layer         = window.aniLayers[this._getCurrentLayer()],
				len           = layer.units.length,
				tmUnit        = layer.units[this._getCurrentUnitId()],
				keyframes     = tmUnit.keyframes,
				frameStart    = tmUnit.frameStart,
				frameCount    = tmUnit.frameCount,
				recordElement = this.commandElement.querySelector('span.recordAnimation'); 

			if (!points.length) return false;
            if (points.length > frameCount){
                if (!confirm(Lang.M_NeedMoreFrames))
                     return false;
            }

			tmUnit.guidPath    = pencilObject.dataRef.guid;

		    var pointsCount  = points.length,
			    step         = pointsCount >= frameCount ? Math.round(pointsCount / frameCount) : 1,
                keyframeId, currentKeyframe;

			for (var i = 1; i <= keyLength - 2; i ++){
			    if (tmUnit.hashKey['key_' + keyframes[i].id])
					delete tmUnit.hashKey['key_' + keyframes[i].id];
			}

            keyframes.splice(1, keyLength - 2);

		    for (var i = 1; i < pointsCount - 1; i += step){
				keyframeId  = frameStart + Math.round(i * frameCount / pointsCount);
				currentKeyframe = TimelineUnit.findKeyframe(tmUnit, keyframeId);
				    
				if (keyframeId < frameStart + frameCount - 1 && keyframeId > 0 && !currentKeyframe){
		    	    var newKeyframe = TimelineUnit.addKeyframe(tmUnit, keyframeId);
		    	    points[i].id = newKeyframe.nodeId = keyframeId; 
				}
		    }

		    var keyLength = keyframes.length;
            points[0].id = keyframes[0].nodeId = 0;
		    points[pointsCount - 1].id = keyframes[keyLength - 1].nodeId = frameCount - 1;

			//decide whick frame will be to keyframe
		    tmUnit.pathMode    = 3;
            updateAnimationPath(tmUnit);
		    tmUnit.path        = points;
			tmUnit.displayPath = true;

			//this.setRecordStatus();
            this.recordStatus = false;
            recordElement.className = 'recordAnimation'; 
			this.updateTimeline();
		},

		//recordStatus  getter/setter Method
		getRecordStatus: function (){
			return this.recordStatus;
		},

        setRecordStatus: function (){
            var currentUnitElement = this._getLayerElement(this._getLayerId(this._getCurrentLayer())).querySelector('span#unit_'+this._getCurrentUnitId()),
			    keyframesElement   = currentUnitElement.childNodes, 
			    recordElement      = this.commandElement.querySelector('span.recordAnimation'), 
			    flag               = currentUnitElement && !this.recordStatus;
//				                     keyframesElement.length === 1 &&
//				                     /animation$/.test(currentUnitElement.className) && 
//									 !this.recordStatus;
            var left      = this._getStyle(currentUnitElement, 'left')
                width     = currentUnitElement.offsetWidth,
                correct   = this._correct(currentUnitElement, left, width),
                left  = correct.left;
                width = correct.width;
            var frame          = (left + width) / this._getScale() - 1,
                startFrame     = left / this._getScale() - 1;

            if (parseInt(currentUnitElement.getAttribute('frameCount'))  < 2)
            {
                alert(Lang.M_TimeUnitTooShort);
                return false;
            }

            if (/record_recording$/.test(currentUnitElement.className) || this.getRecordStatus()) return ;
            if (/animation$/.test(currentUnitElement.className) || keyframesElement.length > 1)
            {
                flag = flag && confirm(Lang.M_ConfirmFramesDeletion);
                this._clearFrames();
            }
			if (flag)
            {
                currentUnitElement.className = 'timeUnit record_animation';
	            toggleAnimation(this._getCurrentLayer(), Math.floor((frame + startFrame) / 2), true, 'record_animation');
                recordElement.className = 'recordAnimation recording'; 
			    this.recordStatus       = true;
                this._cursorMoveToLast(2);
            }else
            {
            }
            this.options.drawAll();
	        this.updateTimeline();	
    },

		//pencilObject  getter/setter Method
		getPencilObject: function (){
			return this.pencilObject;
		},

		setPencilObject: function (object){
			this.pencilObject        = object;
			this.currentPointsLength = object.dataRef.curve.points.length; 
		},
        deletePencilObject: function(){
            delete this.pencilObject;
        },

        //==================================================
		//private method
		//Attribute getter/setter Method
		//currentLayer getter/setter Method
		_getCurrentLayer: function (){
		    return window.currentLayer;
		},
        _getCurrentLayerId: function (){
            return window.aniLayers[window.currentLayer].id;// ? window.aniLayeidrs[window.currentLayer].id : 0;
        },

		_setCurrentLayer: function (layer){
	        window.currentLayer = layer;		
		},

        _getCurrentUnitId: function(){
            return window.currentUnitId;
        },
        _setCurrentUnitId: function(unitid){
            window.currentUnitId = parseInt(unitid);
        },

        //currentFrame getter/setter Method
		_getCurrentFrame: function (){
		    return window.currentFrame;	
		},

		_setCurrentFrame: function (frame){
			window.currentFrame = parseInt(frame);
		},

		//FPS  getter Method
		_getFPS: function (){
			return window.aniData.rate;
		},

		//get the length of units in current layer
		_getUnitsLength: function (){
			return window.aniLayers[this._getCurrentLayer()].units.length;
		},

        //scale getter/setter Method
		_getScale: function (){
        //    layer = this._getCurrentLayer(); 
            layer = 0;
			return this.scale[layer];
		},

		_setScale: function (scale){
        //    layer = this._getCurrentLayer();
            layer = 0;
		    this.scale[layer] = scale;	
		},

		_getLayerElement: function (layer){
			return G('layer_' + layer);
		},

		_getThumbElement: function (layer){
			return G('thumb_' + layer);
		},

		_frame2second: function (frame){
			//frame = frame === 0 ? -1 : frame;
			var second = new Number((frame) / this._getFPS());
			return second.toFixed(2);
		},

        //计算每帧的位置。
		_frame2position: function (frame){
		    return (frame) * this._getScale();
		},

		_correct: function (element, left, width){
            var left  = left || 0,
			    width = width || 0, 
                item  = {'left': left, 'width': width};

			for (var key in item){
			    if (item[key] && (item[key] % this._getScale() != 0)){
			       item[key] = Math.round(item[key] / this._getScale()) * this._getScale();
				   element.style[key] = item[key] + 'px';
				}	
			}

			return item;
		},

		_correctDist: function (dist){
			if (dist % this._getScale() != 0){
			     dist = Math.round(dist / this._getScale()) * this._getScale();
			    // dist = Math.floor(dist / this._getScale()) * this._getScale();
			}
			return dist;
		},

		_getStyle: function (element, style){
			return parseInt(getComputedStyle(element)[style]);
		},

		_getFramePosition: function (){
			var layerElements = this.layerContentElement.querySelectorAll('span.timeUnit'),
			    maxLeft       = 0, minLeft = 1000;

			for (var i = 0, l = layerElements.length; i < l; i ++){
				var min = this._getStyle(layerElements[i], 'left'),
				    max = min + layerElements[i].offsetWidth;
			    maxLeft  = max > maxLeft ? max : maxLeft;	
				minLeft  = min < minLeft ? min : minLeft;
			}

			return {max: (maxLeft / this._getScale()), min: (minLeft / this._getScale())};
		},

        //binary search
		_findKeyFramePosition: function (list, value){
			var left   = 0, 
			    right  = list.length - 1,
				middle;

			while (left <= right){
				middle = (left + right) >> 1;  
			    if (value < list[middle]){
				    right = middle - 1;	
				}else if (value == list[middle]){
					return middle; 
				}else {
					left = middle + 1;
				}
			}

			return -1;
		},

		_getLayerIndex: function (layerid){
            var index   = -1,
			    layers  = window.aniLayers;

			for (var i = 0, l = layers.length; i < l; i ++){
               if (layerid == layers[i].id){
				  index = i;   
				  break;
			   }
			}

			return index;
		},

		_getLayerId: function (index){
			index = index != undefined ? index : this._getCurrentLayer(); 
			return window.aniLayers[index].id;
		},

		_getKeyframes: function (){
			var layer  = window.aniLayers[this._getCurrentLayer()],
				len    = layer.units.length,
				tmUnit = layer.units[this._getCurrentUnitId()];

			return tmUnit.keyframes;
		},

	    _findKeyframe: function (id){
			var index     = -1,
			    layer     = window.aniLayers[this._getCurrentLayer()],
				len       = layer.units.length,
			    keyframes = layer.units[this._getCurrentUnitId()].keyframes;

			for (var i = 0, l = keyframes.length; i < l; i ++){
			    if (id == keyframes[i].id){
					index = i;
					break;
				}	
			}

			return index;
		},

		_findEndKeyframe: function (){
		    var keyframeid = -1,
			    layer      = window.aniLayers[this._getCurrentLayer()],
				len        = layer.units.length,
		        keyframes  = layer.units[this._getCurrentUnitId()].keyframes;

			keyframeid = keyframes[keyframes.length - 1].id;
			return keyframeid;
		},

		_findStartKeyframe: function (){
            var keyframeid = -1,
			    layer      = window.aniLayers[this._getCurrentLayer()],
				len        = layer.units.length,
		        keyframes  = layer.units[this._getCurrentUnitId()].keyframes;

            if (keyframes[1])
		     	keyframeid = keyframes[1].id;

			return keyframeid;
		},

        _modifyUnitStartFrame: function (update){
			var layerElement = this._getLayerElement(this._getLayerId()),
			    layer        = window.aniLayers[this._getCurrentLayer()],
				len          = layer.units.length;

			if (!layerElement.querySelector('span.timeUnit'))
				layer.units[len-1].frameStart = this._getCurrentFrame();

            if (update)
			   this.updateTimeline();

		},

		_updateRuler: function (length){
            if (length != undefined && length > this.timeLength){
            
                for (var i = this.timeLength; i < length; i ++){
                    var tempSpan = document.createElement('span');
                    tempSpan.style.width = this._correctDist(1 * this._getFPS() * this._getScale()) + 'px';
                    tempSpan.innerHTML = '<b><a>'+i+'</a><i></i></b>'
                    this.rulerElement.appendChild(tempSpan);
                }
                this.timeLength = length;
                var rulerWidth = this._correctDist(Math.ceil(this.timeLength * this._getFPS() * this._getScale()));
			    this.rulerElement.style.width  = rulerWidth + 'px';
                
                return ;
            }
            var ft = Math.round(this.layerContentElement.parentNode.offsetWidth * 0.1);//1.8 / this.timeLength);
		    // this._setScale(Math.ceil(ft / this._getFPS()));
			// [Lucas] TODO: Remove the magic number and put it into a const or similar. 
			this._setScale(16);
		    this.rulerElement.innerHTML = '';

		    var thumbWidth  = this.layerThumbElement.offsetWidth,
				rulerWidth  = this._correctDist(Math.ceil(this.timeLength * this._getFPS() * this._getScale())),
				zoomMin     = document.body.offsetWidth - thumbWidth;

            this.rulerElement.innerHTML = Timeline.cursorTemplate;

            for (var i = 0, l = this.timeLength; i < l; i ++){
				var spanWidth = this._correctDist(1 * this._getFPS() * this._getScale());
	            this.rulerElement.innerHTML += Timeline.rulerTemplate.replace('#', spanWidth).replace('#', i);		
			}

			this.cursorElement       = this.options.renderTo.querySelector('div.cursor'); 
			this.cursorSpanElement   = this.cursorElement.querySelector('p');
            //reset the rulerElement style
			this.rulerElement.style.left   = thumbWidth + 'px';
			this.playElement.style.width   = thumbWidth - 20 + 'px';
			this.rulerElement.style.width  = rulerWidth + 'px';

		},

		//initialize the staff
		_initRuler: function (){
			if (!this.rulerElement) return false;

            var layerPosition, 
				startPosition,
			    thumbWidth,
				staffMin,
			    self = this;

			var sliderRuler = new Slider({
			    renderTo : self.rulerElement,	
				attr     : ['left'], 
				direc    : 'X',
				start    : function (){
					self.playing  = false;
		            thumbWidth    = self.layerThumbElement.offsetWidth;
					startPosition = self._getStyle(self.rulerElement, 'left');
				    staffMin      = self.rulerElement.parentNode.offsetWidth - self.rulerElement.offsetWidth;

				},
				correct  : function (value){
				    return value > thumbWidth ? thumbWidth : value < staffMin ? staffMin : value;
				},
				change   : function (value, dist){
					layerPosition  = value - thumbWidth; 
					self.layerContentElement.style.marginLeft = layerPosition + 'px';
				},
				callback: function (time, value, position){
                    var layerLeft   = self._correctDist(self._getStyle(self.layerContentElement, 'marginLeft')), 
						cursorLeft  = self._getStyle(self.cursorElement, 'left'),
						endPosition = self._getStyle(self.rulerElement, 'left'),
                        timeSpan, frame;

					//self.layerContentElement.parentNode.style.marginLeft = layerLeft + 'px';
				    self.playing = false;

					if (time < self.clickTiming && startPosition === endPosition){
                        timeSpan = self._correctDist(position - thumbWidth + Math.abs(layerLeft));
						if(timeSpan + layerLeft >= 0)
						{
							frame = timeSpan / self._getScale(); 
							self._setCurrentFrame(frame);
							self._updateCursor(self._frame2second(frame), self._frame2position(frame));
							self.options.drawAll();	
							self._modifyUnitStartFrame();
						}
					}
				}
			});

            this.sliderRuler = sliderRuler;

			var zoomMin = document.body.offsetWidth - self.layerThumbElement.offsetWidth,
			    timeUnitElements,
				prevUnitElements,
				keyframesElements,
				frameStart,
				frameCount;

			var zoomRuler = new MZoom({
				renderTo : self.rulerElement, 
				attr     : 'width',
				direc    : 'X',
				scale    : 2,
				start    : function (){
					var leftHeadsElement  = self.layerContentElement.querySelectorAll('span.leftHead'),
					    rightHeadsElement = self.layerContentElement.querySelectorAll('span.rightHead');

                    timeUnitElements  = self.layerContentElement.querySelectorAll('span.timeUnit');
					prevUnitElements  = self.layerContentElement.querySelectorAll('span.prevUnit');
					keyframesElements = self.layerContentElement.querySelectorAll('b.keyframe');

                    for (var i = 0, l = leftHeadsElement.length; i < l; i ++){
					    leftHeadsElement[i].style.visibility  = 'hidden';	
					    rightHeadsElement[i].style.visibility = 'hidden';	
					}

					for (var i = 0, l = keyframesElements.length; i < l; i ++){
					    keyframesElements[i].style.visibility = 'hidden';	
					}

				},
                correct  : function (value){
					return value < zoomMin ? zoomMin : value;
				},
				change   : function (value){
					var avgWidth         = Math.floor(value / self.timeLength),
						scale            = Math.ceil(avgWidth / self._getFPS());

                    self._setScale(scale);

					for (var i = 0, l = self.rulerElement.childNodes.length; i < l; i ++){
					    self.rulerElement.childNodes[i].style.width = self._correctDist(1 * self._getFPS() * self._getScale()) + 'px';	
					}
			        self.rulerElement.style.width = value + 'px';

					if (timeUnitElements.length){
					   for (var i = 0, l = timeUnitElements.length; i < l; i ++){
						  frameStart = parseInt(timeUnitElements[i].getAttribute('frameStart'));
						  frameCount = parseInt(timeUnitElements[i].getAttribute('frameCount'));
                          timeUnitElements[i].style.left  = frameStart * self._getScale() + 'px';
                          //timeUnitElements[i].style.marginLeft  = frameStart * self._getScale() + 'px';
                          timeUnitElements[i].style.width       = frameCount * self._getScale() + 'px';
						  if (prevUnitElements[i]){
					          prevUnitElements[i].style.width = frameStart * self._getScale() + 'px'; 
						  }
					   }	
					}

                    self._cursorMoveTo((self._getCurrentFrame() + 1) * self._getScale());
				},
				callback: function (){
				    //var keyFramesElement  = self.layerContentElement.querySelectorAll('span.keyframe');

					//for (var i = 0, l = keyFramesElement.length; i < l; i ++){
					//    keyFramesElement[i].style.left = parseInt(keyFramesElement[i].getAttribute('time')) * self._getScale() + 'px';
					//	keyFramesElement[i].style.visibility = 'visible'; 
					//}
					self.updateTimeline();
				}
			});

		},

        //add the total event of timeline
		_addEvent: function (){
			//add whole layer element event
			this._addAllLayerElementEvent();
			//add command element event
			this._addCommandEvent();
			//add dragger element event
			this._addDraggerEvent();
		},

        _addAllLayerElementEvent: function (justCursor){
			var self            = this,
			    position        = 0,
				startPosition   = 0, 
				startTime       = 0,
				currentPosition = 0,
				newPosition     = 0, 
				endPosition     = 0,
				callback        = {'Start': null, 'Move': null, 'End': null},
				direction;

			self.targetElement = null;

            if (justCursor){
                self.cursorElement.addEventListener(eventstart, _START_, false);
                return ;
            }

			var frameSlider = new Slider({
				renderTo  : self.allLayerElement,
				attr      : ['margin-top'],
				direc     : 'Y',
                correct   : function (value){
					var offset = self.allLayerElement.offsetHeight - self.layerContentElement.offsetHeight;
					if (offset >= 0) return 0;
					return value >= 0 ? 0 : value < offset ? offset : value;
				},
				change    : function (){
				    //TODO	
				},
				callback  : function (){
					//TODO
				} 
			});

			function setEventType (objName){
				['Start', 'Move', 'End'].forEach(function (type){
				    callback[type] = self['_' + objName + type];	
				});
			}

			function setCallback (){
				var flag = false;
			    if (self.targetElement){
					switch (self.targetElement.className){
					     case 'timeUnit': case 'timeUnit animation': case 'timeUnit record_animation':
						     setEventType('timeUnit');
							 direction = 'X';
							 flag      = true;
							 break;
						 case 'leftHead': case 'rightHead':
						     setEventType('head');	
							 direction = 'X';
							 flag      = true;
							 break;
					     case 'keyframe': case 'keyframe selected':
						     setEventType('keyframe');
							 direction = 'X';
							 flag      = true;
							 break;
					     case 'layer': case 'layer current':
						     setEventType('layer');
							 direction = 'Y';
							 flag      = true;
							 break;
					     default:
						     break;
						
					}

                    if (self.targetElement.parentNode.className === 'cursor' && self.targetElement.tagName === 'P'){//cursor
                         setEventType('cursor');
                         direction = 'X';
                         flag      = true;
                    }
				}

				return flag;
			}

            function _START_ (e){
                e.preventDefault();
				e.stopPropagation();
				self.targetElement = e.target;

				var flag = setCallback();
				if (!flag) return false;

		        self.targetElement.style.opacity = 0.6;
				startPosition      = istouch ? e.changedTouches[0]['page' + direction] : e['page' + direction]
				startTime          = e.timeStamp;

				if (flag && callback.Start)
                    position = callback.Start.call(self, startPosition, e);

                document.addEventListener(eventmove, _MOVE_, false);
				document.addEventListener(eventend,  _END_, false);
            }

			function _MOVE_ (e){
				e.preventDefault();
				e.stopPropagation();

				currentPosition = istouch ? e.changedTouches[0]['page' + direction] : e['page' + direction];
                var dist = currentPosition - startPosition;
				position += dist;

                if (callback.Move)
                    callback.Move.call(self, position, dist);

				startPosition = currentPosition;
			}

			function _END_ (e){
                e.preventDefault();
				e.stopPropagation();

				endPosition = istouch ? e.changedTouches[0]['page' + direction] : e['page' + direction];

                if (callback.End)
                    callback.End.call(self, e.timeStamp - startTime, endPosition, e);

		        self.targetElement.style.opacity = 1;
				document.removeEventListener(eventmove, _MOVE_, false);
				document.removeEventListener(eventend,  _END_, false);
			}

            self.cursorElement.addEventListener(eventstart, _START_, false);
		    self.allLayerElement.addEventListener(eventstart, _START_, false);
		},

		_updateCursor: function (time, frameLeftPosition){
			this.cursorSpanElement.innerHTML = time + 's';
            this._cursorMoveTo(frameLeftPosition);
		},

        _cursorMoveTo: function (x){
            this.cursorElement.style[_transformStyle_] = 'translate(' + x + 'px, 0)';
        },
        _cursorMoveToLast: function(aOffset){
            var currentUnitElement = this._getLayerElement(this._getLayerId(this._getCurrentLayer())).querySelector('span#unit_'+this._getCurrentUnitId());
            var left      = this._getStyle(currentUnitElement, 'left')
                width     = currentUnitElement.offsetWidth,
                correct   = this._correct(currentUnitElement, left, width),
                left  = correct.left;
                width = correct.width;
            var frame          = (left + width) / this._getScale() - 1,
                cursorPosition = this._frame2position(frame);

            this._setCurrentFrame(frame);
            this._updateCursor(this._frame2second(frame), cursorPosition+aOffset);
			//this.options.drawAll();
        },

        _cursorStart: function (){
             var self             = this;
                 matrixTransform  = getComputedStyle(self.cursorElement).getPropertyValue(_transformStyle_);

             self.cursorElement.style[_transitionStyle_] = '';
             self.startPosition = parseInt(_regTransformMatrix_.exec(matrixTransform)[5]); 
		     self.timeBar    = self.cursorElement.querySelector('p'),
			 self.playing    = false;
			 self.cursorMax  = self.rulerElement.offsetWidth - self.cursorElement.offsetWidth;         

             return self.startPosition;
        },

        _cursorMove: function (value){
             var self = this;
			 value = value > self.cursorMax ? self.cursorMax : value < 0 ? 0 : value;
             self._cursorMoveTo(value);

             var frame = self._correctDist(value-8) / self._getScale();
			 frame = frame > -1 ? frame : 0;
             self.timeBar.innerHTML = self._frame2second(frame) + 's';

			 self._setCurrentFrame(frame);
			 self.options.drawAll(null, 1);
        },

        _cursorEnd: function (){
              var self = this,
                 matrixTransform  = getComputedStyle(self.cursorElement).getPropertyValue(_transformStyle_),
                 cursorLeft = parseInt(_regTransformMatrix_.exec(matrixTransform)[5]),
			     timeSpan    = self._correctDist(cursorLeft),
				 frame       = timeSpan / self._getScale(),
				 position;

			  self._setCurrentFrame(frame >= 0 ? frame : 0);
			  position = frame === 0 ? 0 : timeSpan;
              self._cursorMoveTo(self._frame2position(frame));
			  self._modifyUnitStartFrame();       
             
              delete self.timeBar;
              delete self.cursorMax;
              delete self.startPosition;

              var tmUnit   = getTimelineUnit(self._getCurrentLayerId(), 0);
              if (tmUnit && tmUnit.aniType == 'record_animation' && self.getRecordStatus()){
                  self._cursorMoveToLast(0);
              }
        },

		_addDraggerEvent: function (){
			var draggerLowLimit  = this._getStyle(this.draggerElement.parentNode, 'bottom'), 
			    draggerUpLimit = 0;

			var draggerSlider = new Slider({
				renderTo : this.draggerElement.parentNode,
				attr     : ['bottom'],
				direc    : 'Y',
				correct  : function (newPosition, position, distance){
					 var value = position - distance;
                     return value > draggerUpLimit ? draggerUpLimit : value < draggerLowLimit ? draggerLowLimit : value;
				},
				change   : function (){
				    //TODO	
				}
			});

		},

        _addCommandEvent: function (){
            var self        = this,
			    comElements = self.commandElement.childNodes,
				playTimer; 

			self.playing = false; 

			//add command event
            for (var i = 0; i < comElements.length; i ++){
				var tag = comElements[i].className;
			    comElements[i].addEventListener(eventend, (function (name){
					return function (){
					   self['_' + name].apply(self);
					}
				})(tag), false);	
			}

            //play animaition
			self.playElement.addEventListener(eventstart, function (){
				self.playing = !self.playing;
				clearInterval(playTimer);	
				if (!self.playing) {
                    self.playElement.className = 'play';
				    self._setCurrentFrame(self._getCurrentFrame() - 1);
                   // self._showUnitPath(true);
					return false;
				}else {
                    self.playElement.className = 'pause';
                   // self._showUnitPath(false);
				}

				var thumbWidth     = self.layerThumbElement.offsetWidth,
				    contentLeft    = Math.abs(self._getStyle(self.layerContentElement, 'marginLeft')),
			        framePosition  = self._getFramePosition(),
                    frame;

                self.cursorElement.style[_transitionStyle_] = '';
			    playTimer = setInterval(function (){
					if (!self.playing) {
                        self.playElement.className = 'play';
						clearInterval(playTimer);
					}

					if (self._getCurrentFrame() < framePosition.max){
                       frame = self._getCurrentFrame();
					   self.options.drawAll(null, 1);
                       self._updateCursor(self._frame2second(frame),
                                          self._frame2position(frame), true);
					   self._setCurrentFrame(self._getCurrentFrame() + 1);
					}else{
					   self._setCurrentFrame(0);	
					}

                    //console.log(self.rulerElement.style.left);
                    var defaultRulerSpan = self.layerThumbElement.offsetWidth;
                    var nowRulerSpan = self.rulerElement.style.left.split('p')[0];
                    var layerWidth = self.layerContentElement.offsetWidth;
                    layerWidth += Number(self.layerContentElement.style.marginLeft.split('p')[0]);
                  //  console.log(defaultRulerSpan - nowRulerSpan+','+self._frame2position(frame)+','+layerWidth);
                    if (((defaultRulerSpan - nowRulerSpan) > self._frame2position(frame)) ||
                    ((defaultRulerSpan - nowRulerSpan + layerWidth) < self._frame2position(frame))){
                        self.rulerElement.style.left = defaultRulerSpan - self._frame2position(frame) + 'px';
                        self.layerContentElement.style.marginLeft = -self._frame2position(frame) + 'px';
                    }


				}, 1000 / self._getFPS());	
				
			}, false);
		},
        _showUnitPath: function(isShow){
            var layer = window.aniLayers;
            for (var i=0;i<layer.length;i++){
                var units = layer[i].units;
                for(var j=0;j<units.length;j++){
                    if (units[j].aniType == 'record_animation'){
                        units[j].displayPath = isShow;
                    }
                }
            }
            MugedaUI.redrawAll();
        },

		_del: function (){
            this._removeLayer();
		},

		_add: function (){
			this._addLayer();
		},

        _clearFrames: function(){
            var frames        = this._getKeyframes();

            for (var i=1;i<=frames.length-1;i++){
	            toggleAnimation(this._getCurrentLayer(), frames[i].id , false, 'animation');	   
            }
        },
        deleteRecordAnimation: function(){
            var recordElement = this.commandElement.querySelector('span.recordAnimation');
            recordElement.className = 'recordAnimation';
            this.isRecordAni = true;
        },

		_insertAnimation: function (){
			var unitElement   = this._getLayerElement(this._getLayerId()).querySelector('span#unit_'+this._getCurrentUnitId()),
			    recordElement = this.commandElement.querySelector('span.recordAnimation'), 
			    layer         = window.aniLayers[this._getCurrentLayer()],
				units         = layer.units; 

			self.playing = false;

            if (parseInt(unitElement.getAttribute('frameCount')) < 2)
            {
                alert(Lang.M_TimeUnitTooShort);
                return false;
            }

			if ((unitElement && !/animation$/.test(unitElement.className)) || (/record/.test(unitElement.className))){
                if (/record/.test(unitElement.className)){
                    if (confirm(Lang.M_ConfirmFramesDeletion)){
                        this._clearFrames();
                        recordElement.className = 'recordAnimation'; 
			            this.recordStatus       = false;
                    }else
                    {
                        return;
                    }
                }

			   unitElement.className = 'timeUnit animation';
               var left      = this._getStyle(unitElement, 'left')
			       width     = unitElement.offsetWidth,
			       correct   = this._correct(unitElement, left, width),
				   layerLeft = this._getStyle(this.layerContentElement, 'marginLeft');  

			   left  = correct.left;
			   width = correct.width;

			   var frame          = (left + width) / this._getScale() - 1,
			       startFrame     = left / this._getScale(),
			       cursorPosition = this._frame2position(frame);

			   //set animation
	           //toggleAnimation(this._getCurrentLayer(), Math.floor((frame + startFrame) / 2), true, false);	   
	           toggleAnimation(this._getCurrentLayer(), Math.floor((frame + startFrame) / 2), true, 'animation');	   
			   this.options.drawAll();
			   this._setCurrentFrame(frame);
			   this.options.drawAll(); //again;
			   this._updateCursor(this._frame2second(frame), cursorPosition);
			   this.updateTimeline();
			   
			}else {
			   return false;
			}
		},

		_recordAnimation: function (){
            this.setRecordStatus();
		},

		_addLayer: function (){
			var len = window.aniLayers.length;
            if (len >= 6){
                alert(Lang.M_ToMuchLayer);
                return ;
            }

			if (len != 0){
				var layers     = window.aniLayers,
				    len        = window.aniLayers.length,
					maxLayerId = layers[len - 1].id;

				for (var i = 0; i < len; i ++){
				   if (layers[i].id > maxLayerId) maxLayerId = layers[i].id;	
				}

				maxLayerId ++; //new Layer ID

				var newLayer = Mugeda.createLayer(maxLayerId),
				    newUnit  = Mugeda.createUnit(maxLayerId);

                newUnit.frameStart = this._getCurrentFrame();
                newUnit.frameCount = this._getFPS();;
				TimelineUnit.addKeyframe(newUnit, newUnit.frameStart);
                newLayer.units.push(newUnit);

			    layers.splice(this._getCurrentLayer(), 0, newLayer);
			}
			this.updateTimeline();
		},

		_selectLayer: function (layerElement){
			if (!layerElement) return false;
            var currentLayerElement = this._getLayerElement(this._getLayerId()),
				currentThumbElement = this._getThumbElement(this._getLayerId()),
                leftHeadElement     = currentLayerElement.querySelector('span.leftHead'),
                rightHeadElement    = currentLayerElement.querySelector('span.rightHead'),
				layerId             = layerElement.id.split('_')[1],
				layerOrThumbElement = /^layer/.test(layerElement.id) ? G('thumb_' + layerId) : G('layer_' + layerId);

            currentLayerElement.className = 'layer';
			currentThumbElement.className = 'thumb';
           // _lastTimeUnitWidth = 0;

			if (leftHeadElement && rightHeadElement){
                leftHeadElement.style.visibility  = 'hidden';
			    rightHeadElement.style.visibility = 'hidden';
			}

            var leftHeadElementInLayerElement  = layerElement.querySelector('span.leftHead') || layerOrThumbElement.querySelector('span.leftHead'),
                rightHeadElementInLayerElement = layerElement.querySelector('span.rightHead') || layerOrThumbElement.querySelector('span.rightHead');

			layerElement.className += ' current';
			layerOrThumbElement.className += ' current';

			if (leftHeadElementInLayerElement && rightHeadElementInLayerElement){
			    leftHeadElementInLayerElement.style.visibility  = 'visible';	
			    rightHeadElementInLayerElement.style.visibility = 'visible';	
			}

		    //this._setCurrentLayer(parseInt(layerId));
			this._setCurrentLayer(this._getLayerIndex(layerId));

	    },

		_addThumbEvent: function (thumbnail){
			if (!thumbnail) return false;

			var self = this;
              
            thumbnail.addEventListener(eventend, function (e){
				self._selectLayer(this);
			}, false);
		},

        //add a new Layer in timeline
		_addLayerContent: function (index, layerid){
			var content  = document.createElement('li'),
			    thumb    = document.createElement('li');

            this.layerContentElement.appendChild(content); 
			this.layerThumbElement.appendChild(thumb);

			content.id = 'layer_' + layerid;
			thumb.id   = 'thumb_' + layerid;
            
			content.className = 'layer';
			thumb.className   = 'thumb';

			content.style.top = thumb.style.top = index * 38 + 'px';
			content.style.visibility = 'visible';

            this._layerElement_ = content;   
			this._thumbElement_ = thumb;
			this._addThumbEvent(thumb);
		},

		_layerStart: function (){
			var self  = this;

            self.targetElement.style.opacity = 1;
            self._itemHeight_ = self.targetElement.offsetHeight,
			self.getSwapLayerIndex = function (height){
                return Math.floor(height / self._itemHeight_);
			}

			self.swapAniLayerPosition = function (currentIndex, targetIndex){
			    var tempLayer = window.aniLayers[currentIndex];	
                window.aniLayers[currentIndex] = window.aniLayers[targetIndex];
				window.aniLayers[targetIndex]  = tempLayer;
			}

			self.updatePosition = function (){
				var layer, thumb, layerId;
                for (var i = 0, l = window.aniLayers.length; i < l; i ++){
					layerId = self._getLayerId(i);
                    layer   = self._getLayerElement(layerId);
					thumb   = self._getThumbElement(layerId);
					layer.style.top = thumb.style.top = i * self._itemHeight_ + 'px';
				}
			}

            self.totalHeight         = window.aniLayers.length * self._itemHeight_;
		    self.startPosition       = self._getStyle(self.targetElement, 'top');
			self.currentLayerId      = parseInt(self.targetElement.id.split('_')[1]); 
			self.layerLen            = window.aniLayers.length;
			self.maxTop              = self.layerLen * self._itemHeight_;
			self.minTop              = 0;
			self.thumbCurrentElement = self._getThumbElement(self.targetElement.id.split('_')[1]);
			self.flag                = false;

		    self.layer_t = setTimeout(function (){
                self._selectLayer(self.targetElement);
				self.flag = true;
				self.changeStyle(self.flag);
			}, self.delayTiming);

			self.changeStyle = function (flag){
				self.targetElement.style.opacity = flag ? 0.8 : 1;
				self.targetElement.style.zIndex  = flag ? 999 : 1;
			}

			return self.startPosition;
		},

		_layerMove: function (value, dist){
			var self = this;
			if (self.flag){
			   value = value < self.minTop ? self.minTop : value > self.maxTop ? self.maxTop : value;	
			}else {
			   value = NaN;
               return;
		    }

            self.targetElement.style.top = self.thumbCurrentElement.style.top = value + 'px';
            //self.thumbCurrentElement.style.webkitTransition = '';

			self.swapLayerIndex  = self.getSwapLayerIndex(value);

			if (self.swapLayerIndex === self._getCurrentLayer() || 
				self.swapLayerIndex < 0 || 
				self.swapLayerIndex >= self.layerLen || 
				self.layerLen === 1) return false;

            self.swapLayerId      = self._getLayerId(self.swapLayerIndex);
			self.swapElement      = self._getLayerElement(self.swapLayerId);
            self.swapThumbElement = self._getThumbElement(self.swapLayerId);
			self.swapCurrentTop   = self._getStyle(self.swapElement, 'top');

            if (self.swapLayerId === self.currentLayerId || self.swapCurrentTop % self._itemHeight_ != 0) return false;

            var currentLayerIndex = dist > 0 ? self.swapLayerIndex - 1 :  self.swapLayerIndex + 1;
			currentLayerIndex = currentLayerIndex < 0 ? 0 : currentLayerIndex;

			self.swapAniLayerPosition(currentLayerIndex, self.swapLayerIndex);
			var targetTop = currentLayerIndex * self._itemHeight_;

            if (self.swapElement && self.swapThumbElement){
			    self.swapElement.style.top = self.swapThumbElement.style.top = targetTop + 'px';
				self._setCurrentLayer(self.swapLayerIndex);
			}
		},

        _layerEnd: function (dt, value){
			var self = this;

			clearTimeout(self.layer_t);
            self.flag = false;
			self.changeStyle(self.flag);

			var endPosition = self._getStyle(self.targetElement, 'top');
			if (self.startPosition != endPosition){
			    var target = endPosition >= self.totalHeight ? self.layerLen - 1 : self.getSwapLayerIndex(endPosition);
			    self.updatePosition();
				self._setCurrentLayer(target);
			    self.options.drawAll();
			}

            delete self._itemHeight_;
			delete self.getTargetLayerIndex;
			delete self.swapAniLayerPosition;
			delete self.updatePosition;
            delete self.totalHeight;
			delete self.startPosition;
			delete self.currentLayerId;
            delete self.layerLen;
			delete self.maxTop;
			delete self.minTop;
			delete self.thumbCurrentElement;
			delete self.flag;
			delete self.layer_t;
			delete self.changeStyle;
		},

        _updateThumbnail: function (objects){
		    if (!objects.length) return false;

			var layerCanvas = MugedaUI.getBufferCanvas('layerCanvas', window.objCanvas.offsetWidth, window.objCanvas.offsetHeight);

			for (var i = 0, l = objects.length; i < l; i ++){
			   	var obj = getAniObject(objects[i]);
                obj.draw(layerCanvas.getContext('2d'), 0);
			}

            this._thumbElement_.innerHTML = Timeline.thumbTemplate.replace('#', layerCanvas.toDataURL('image.png'));
		},

		_addTimeUnitElement: function (frameStart, frameCount, unitid){
			//redraw all element in one layer
            //console.log(this._layerElement_.innerHTML);
            this._layerElement_.innerHTML += Timeline.TimeUnitTemplate.replace('#', unitid);

            var timeUnitElement = this._layerElement_.querySelector('span#unit_'+unitid),
                prevUnitElement  = this._layerElement_.querySelector('span.prevUnit'),
                rightHeadElement = this._layerElement_.querySelector('span.rightHead'),
		        leftHeadElement  = this._layerElement_.querySelector('span.leftHead'),
				leftPosition     = this._frame2position(frameStart),
				timeUnitWidth    = this._frame2position(frameCount),
				rightPosition    = leftPosition + timeUnitWidth,
				layerId          = parseInt(this._layerElement_.id.split('_')[1]),
				self             = this;

            timeUnitElement.setAttribute('frameCount', frameCount);
            timeUnitElement.setAttribute('frameStart', frameStart);
            timeUnitElement.setAttribute('unitId', unitid);
			timeUnitElement.style.width      = timeUnitWidth + 'px';
			timeUnitElement.style.left       = leftPosition + 'px';
           // prevUnitElement.style.width      = leftPosition + 'px';
            if (self._getCurrentUnitId() == undefined){
                self._setCurrentUnitId(unitid);
            }
            if (unitid == self._getCurrentUnitId()){
			    rightHeadElement.style.left      = rightPosition + self.offset + 'px';
                leftHeadElement.style.left       = leftPosition  - self.offset - leftHeadElement.offsetWidth + 'px';
            }

			var correct   = self._correct(timeUnitElement, leftPosition, timeUnitWidth);
			leftPosition  = correct.left;
			timeUnitWidth = correct.width; 

            if (self._getLayerIndex(layerId) === self._getCurrentLayer()){
			    self._selectLayer(this._layerElement_);
			}
            if (self._getStyle(rightHeadElement, 'left') > self._getStyle(self.rulerElement, 'width')/2){
                self._updateRuler(self.timeLength*2);
            }

		},

		_timeUnitStart: function (position){
			var self             = this,
                timeUnitElement  = self.targetElement; 

            self.layerLeft        = self._getStyle(self.layerContentElement, 'marginLeft');
			self.addKeyFrameFlag  = false;
			self.layerElement     = timeUnitElement.parentNode;
		    self.leftHeadElement  = self.layerElement.querySelector('span.leftHead'); 
		    self.rightHeadElement = self.layerElement.querySelector('span.rightHead');
		    self.prevUnitElement  = self.layerElement.querySelector('span.prevUnit');
            self.startPosition    = self._getStyle(timeUnitElement, 'left');

            self._selectLayer(self.layerElement);
            self.playing      = false;

            self.prevUnitElement.style.width = self.startPosition;
            self.rightHeadElement.style.left = self.startPosition + timeUnitElement.offsetWidth + self.offset + 'px';
            self.leftHeadElement.style.left  = self.startPosition - self.leftHeadElement.offsetWidth - self.offset + 'px';
            self._setCurrentUnitId(timeUnitElement.id.split('_')[1]);
          //  self.lastUnitElement  = self.layerElement.querySelector('span#unit_'+(self._getCurrentUnitId()-1));
          //  self.nextUnitElement  = self.layerElement.querySelector('span#unit_'+(self._getCurrentUnitId()+1));
            self.lastUnitElement  = timeUnitElement.previousSibling;
            if (!/timeUnit/.test(self.lastUnitElement.className)){
                self.lastUnitElement = null;
            }
            self.nextUnitElement  = timeUnitElement.nextSibling;
            self.timeUnitSliderMax= self.nextUnitElement ? self._getStyle(self.nextUnitElement, 'left') : self.layerContentElement.offsetWidth;
            self.timeUnitSliderMax -= timeUnitElement.offsetWidth;
            self.timeUnitSliderMin= self.lastUnitElement ? self._getStyle(self.lastUnitElement, 'left') + self.lastUnitElement.offsetWidth : 0;

            position = self._correctDist(position - self.layerThumbElement.offsetWidth + Math.abs(self.layerLeft));

			//self.leftHeadElement.style.visibility  = 'hidden';
			//self.rightHeadElement.style.visibility = 'hidden';
			self.addKeyFrameTimer = setTimeout(function (){//add keyframe element
	           var timingPosition = self._getStyle(timeUnitElement, 'left');
			   if (/animation$/.test(timeUnitElement.className) && self.startPosition === timingPosition && !/record/.test(timeUnitElement.className)){
				   var frame = position / self._getScale();

                   self.addKeyFrameFlag = true;
				   self.options.insertKeyFrames(self._getCurrentLayer(), self._getCurrentUnitId(), frame);
		           self.options.drawAll(null, 2);

                   self._setCurrentFrame(frame);
				   self._updateCursor(self._frame2second(frame), self._frame2position(frame));
				   self.updateTimeline();

			   }
			}, self.delayTiming);

			return self.startPosition;
		},

		_timeUnitMove: function (value){
			var self             = this,
			    timeUnitElement  = self.targetElement;

		    value = value < self.timeUnitSliderMin ? self.timeUnitSliderMin : value > self.timeUnitSliderMax ? self.timeUnitSliderMax : value;

            timeUnitElement.style.left = self.prevUnitElement.style.width = value + 'px';
		    self.rightHeadElement.style.left = value + timeUnitElement.offsetWidth + self.offset + 'px';
		    self.leftHeadElement.style.left  = value - self.leftHeadElement.offsetWidth - self.offset + 'px';
		},

		_timeUnitEnd: function (dt, position){
            var self             = this,
			    timeUnitElement  = self.targetElement;

			clearTimeout(self.addKeyFrameTimer);

		    if (self.addKeyFrameFlag) {
		        self.addKeyFrameFlag = false;
		    	return false;
		    }

		    var endPosition = self._getStyle(timeUnitElement, 'left');

		    if (dt < self.clickTiming && self.startPosition === endPosition){
               var timeSpan = self._correctDist(position - self.layerThumbElement.offsetWidth + Math.abs(self.layerLeft)),
                   frame = timeSpan / self._getScale();
		       self._updateCursor(self._frame2second(frame), self._frame2position(frame));
		       self._setCurrentFrame(frame);
		       self.options.drawAll();	
		       //self.updateTimeline();
		       return false;
		    }

		    timeUnitElement.style[_transitionStyle_] = '';
            
		    var unitLeft    = self._getStyle(timeUnitElement, 'left'),
                unitWidth   = timeUnitElement.offsetWidth,
		    	correct     = self._correct(timeUnitElement, unitLeft, unitWidth);

		    unitLeft  = correct.left;
		    unitWidth = correct.width;

            self.rightHeadElement.style.left = unitLeft + unitWidth + self.offset + 'px';
		    self.leftHeadElement.style.left  = unitLeft - self.offset - self.leftHeadElement.offsetWidth + 'px';

		    var startFrame  = unitLeft / self._getScale(),
		    	endFrame    = (unitLeft + unitWidth) / self._getScale();

            if (self._getStyle(self.rightHeadElement, 'left') > self._getStyle(self.rulerElement, 'width')/2){
                self._updateRuler(self.timeLength*2);
            }                

            delete self.layerLeft;
            delete self.layerElement;
			delete self.addKeyFrameFlag;
			delete self.rightHeadElement; 
			delete self.leftHeadElement;
			delete self.prveUnitElement;
			delete self.startPosition;

		    self.options.updateUnitFrame(self._getCurrentLayer(), self._getCurrentUnitId(), startFrame);
		    self.options.drawAll();
		    self.updateTimeline();
		},

		_headStart: function (p, event){
			var self = this;
                nowUnitId = self._getCurrentUnitId();

			self.rightHeadElement = /^right/.test(self.targetElement) ? self.targetElement : 
				                   self.targetElement.parentNode.querySelector('span.rightHead'); 
			self.timeUnitElement  = self.targetElement.parentNode.querySelector('span#unit_'+nowUnitId);
			self.prevUnitElement  = self.targetElement.parentNode.querySelector('span.prevUnit');
            self.oldClassName = self.timeUnitElement.className;

            self.lastUnitElement  = self.timeUnitElement.previousSibling;
            if (!/timeUnit/.test(self.lastUnitElement.className)){
                self.lastUnitElement = null;
            }
            self.nextUnitElement  = self.timeUnitElement.nextSibling;
            self.timeUnitSliderMax= self.nextUnitElement ? self._getStyle(self.nextUnitElement, 'left') : self.layerContentElement.offsetWidth;
            self.timeUnitSliderMin= self.lastUnitElement ? self._getStyle(self.lastUnitElement, 'left') + self.lastUnitElement.offsetWidth : 0;

            var layerId = self.timeUnitElement.parentNode.id.split("_")[1];
        //    if (_lastTimeUnitWidth == 0 || _lastLayerId != layerId || _lastUnitId != nowUnitId){
                var kf = self._getKeyframes();
                _lastTimeUnitWidth = self.timeUnitElement.offsetWidth/self._getScale();
                _lastLayerId = layerId;
                _lastUnitId = nowUnitId;
        //    }
            if (window.isCtrl || event.ctrlKey){_lastTimeUnitWidth = 0;}

			var startKeyFrame     = self._findStartKeyframe(),
			    endKeyFrame       = self._findEndKeyframe(),
				unitLeft          = self._getStyle(self.timeUnitElement, 'marginLeft'),
			    rightHeadLeft     = self._getStyle(self.rightHeadElement, 'left');

                self.nowUnitId = self._getCurrentUnitId();
				self.keyframeElements = self.timeUnitElement.childNodes;
                self.timeUnitElement.style.minWidth = self._frame2position(self.keyframeElements.length+1) + 'px';
                self.sliderMinWidth   = self._getStyle(self.timeUnitElement, 'minWidth');
                self.animationFlag    = /animation$/.test(self.timeUnitElement.className) ? true : false;
			    self.timeUnitRight    = rightHeadLeft - self.offset;
				self.keyframeLefts    = [];

			if (self.animationFlag) {
                self.startKeyPosition = startKeyFrame * self._getScale();
			    self.endKeyPosition   = (endKeyFrame + 1) * self._getScale();
			    self.rightKeyLeft     = self.endKeyPosition + self.offset;
			    self.leftKeyLeft      = self.startKeyPosition - self.offset - self.rightHeadElement.offsetWidth - self._getScale();
		        self.keyframeOffset   = Math.round(self.keyframeElements[0].offsetWidth / 2); 

                for (var i = 0, l = self.keyframeElements.length; i < l; i ++){
			    	var keyframeid = parseInt(self.keyframeElements[i].id.split('_')[1]);
			    	self.keyframeLefts.push((keyframeid + 1) * self._getScale() + Math.round(self.cursorElement.querySelector('span').offsetWidth / 2) - self.keyframeOffset);	
			    }

				if (self.keyframeElements.length === 1){
				   self.leftKeyLeft = self.startKeyPosition - self.sliderMinWidth - self.offset - self.rightHeadElement.offsetWidth;	
				}

			}

			return self._getStyle(self.targetElement, 'left');
		},

		_headMove: function (value){
			 var self                    = this,
			     timeUnitElementPosition = self._getStyle(self.timeUnitElement, 'left'),
			     unitWidth               = 0;

			 if (/^right/.test(self.targetElement.className)){
			    var minLeft = timeUnitElementPosition +  self.offset + self.sliderMinWidth;
                var maxLeft = self.timeUnitSliderMax + self.offset;

				value = value < minLeft ? minLeft : value > maxLeft ? maxLeft : value;

                unitWidth = value - timeUnitElementPosition - self.offset;
                var timeUnitLeft = timeUnitElementPosition;
			 //   unitWidth = (self.animationFlag && (unitWidth + timeUnitElementPosition < self.endKeyPosition)) ? self.endKeyPosition - timeUnitElementPosition : unitWidth;

			 }else {
				 var maxLeft = self._getStyle(self.rightHeadElement, 'left') - 2 * self.offset - self.targetElement.offsetWidth - self.sliderMinWidth;
                // var minLeft = - self.offset - self.targetElement.offsetWidth;
                 var minLeft = self.timeUnitSliderMin - self.offset - self.targetElement.offsetWidth;
				 value = value > maxLeft ? maxLeft : value;
                 value = value < minLeft ? minLeft : value;

				 var timeUnitLeft = value + self.targetElement.offsetWidth + self.offset,
					 keyframeid;
			     self.timeUnitElement.style.left = self.prevUnitElement.style.width = timeUnitLeft + 'px';
				 unitWidth = self.timeUnitRight - timeUnitLeft;

                 if (self.animationFlag){
				    for (var i = 0, l = self.keyframeElements.length; i < l; i ++){
				        self.keyframeElements[i].style.left = self.keyframeLefts[i] - timeUnitLeft - self.keyframeOffset + 'px';
				    }
				 }
		     }

			 self.targetElement.style.left    = value + 'px';
			 self.timeUnitElement.style.width = unitWidth + 'px';

            //[dk647] TODO scaled while head move
          /*  var frameStart = timeUnitLeft  / self._getScale(),
                frameCount = unitWidth / self._getScale();

            if ((!window.isCtrl && !event.ctrlKey) || /record/.test(self.timeUnitElement.className))
            {
                self._scaleFrames(frameCount/_lastTimeUnitWidth, frameStart, frameCount, true);
            } */

		},

		_headEnd: function (t, p, event){
            var self      = this,
			    left      = self._getStyle(self.timeUnitElement, 'left'),
				width     = self.timeUnitElement.offsetWidth,
			    prevWidth = self.prevUnitElement.offsetWidth, 
				correct   = {'left': left, 'width': width},
				leftHeadElement;

                if (self._getStyle(self.rightHeadElement, 'left') > self._getStyle(self.rulerElement, 'width')/2){
                    self._updateRuler(self.timeLength*2);
                }                
			    if (/^right/.test(self.targetElement.className)){
			    	correct = self._correct(self.timeUnitElement, left, width); 
					leftHeadElement = self.targetElement.parentNode.querySelector('span.leftHead'); 
			    }else {
			    	var unitWidth = Math.round(width / self._getScale()) * self._getScale(),
			    	prevWidth = left + width - unitWidth;
			    	self.prevUnitElement.style.width = self.timeUnitElement.style.left
			                                    = prevWidth + 'px';

			        correct.left = prevWidth;
                    correct.width      = unitWidth;
					leftHeadElement    = self.targetElement;
			    }

			    left  = correct.left;
			    width = correct.width; 
                
			    //adjust head Element position
                self.rightHeadElement.style.left = left + width + self.offset + 'px';
			    leftHeadElement.style.left       = left - self.offset - self.targetElement.offsetWidth + 'px';
    

			    var frameStart = left  / self._getScale(), 
			    	frameCount = width / self._getScale();

                //self.timeUnitElement.setAttribute('frameStart', frameStart);
                //self.timeUnitElement.setAttribute('frameCount', frameCount);
                if ((!window.isCtrl && !event.ctrlKey) || /record/.test(self.timeUnitElement.className))
                {
                    self._scaleFrames(frameCount/_lastTimeUnitWidth, frameStart, frameCount, true);
                }

                self.timeUnitElement.className = self.oldClassName;

                self.options.modifyFrames(self._getCurrentLayer(), self.nowUnitId, frameStart, frameCount);

                delete self.nowUnitId;
                delete self.rightHeadElement;
			    delete self.timeUnitElement;
			    delete self.sliderMinWidth;
			    delete self.prevUnitElement; 
				delete self.keyframeElements;
                delete self.animationFlag;
			    delete self.timeUnitRight;
				delete self.keyframeLefts;
                delete self.startKeyPosition;
			  	delete self.endKeyPosition;
			    delete self.rightKeyLeft;
			  	delete self.leftKeyLeft;
		        delete self.keyframeOffset;
                delete self.oldClassName;

			    //update the frame in time unit
                aniDataIsChange();
			    self.options.drawAll();
                self.updateTimeline();
		},

		_addKeyFrameElements: function (keyframes, animated, aniType, unitid){
            var timeUnitElement  = this._layerElement_.querySelector('span#unit_'+unitid),
                //时间单元的起始位置。
			    timeUnitPosition = this._getStyle(timeUnitElement, 'left'),
				layerid          = parseInt(timeUnitElement.parentNode.id.split('_')[1]),
                //cursor中心对其的位置。
				cursorWidth      = Math.round(this.cursorElement.querySelector('span').offsetWidth / 2),
				keyframeOffset   = 8,
				keyframeId, keyframeClass, keyframeLeft, keyframePosition;

            timeUnitElement.className = animated ? 'timeUnit '+aniType : 'timeUnit';

			for (var i = 0, l = keyframes.length; i < l; i ++){
				 if (i != 0){
			        //this._addKeyFrameElement(timeUnitElement, keyframes[i].id);     
                    keyframeId    = this._getCurrentLayer() + '_' + keyframes[i].id;
					keyframeClass = keyframes[i].id === this._getCurrentFrame() && this._getLayerIndex(layerid) === this._getCurrentLayer() ? 'keyframe selected' : 'keyframe';
					keyframeLeft  = this._frame2position(keyframes[i].id) - timeUnitPosition;// + cursorWidth;// - keyframeOffset;

                    timeUnitElement.innerHTML += Timeline.keyframeTemplate
					                             .replace('#', keyframeId)
												 .replace('#', keyframeClass)
												 .replace('#', keyframeLeft);
			      }
			}
	    },

            
		_keyframeStart: function (){
            var self = this;

            self.playing = false;
			self.timeUnitElement = self.targetElement.parentNode;
			self._selectLayer(self.timeUnitElement.parentNode);

		    var keyframeid = parseInt(self.targetElement.id.split('_')[1]),
		        index      = self._findKeyframe(keyframeid);

		    self.startPosition    = self._getStyle(self.targetElement, 'left');
		    self.timeUnitPosition = self._getStyle(self.timeUnitElement, 'left');
			self.keyframes        = self._getKeyframes();
		    self.keyFrameOffset   = Math.round(self.targetElement.offsetWidth/2);

		    self.prevLeft = self.keyframes[index - 1] ? self._frame2position(self.keyframes[index - 1].id) : self.timeUnitPosition + self.keyFrameOffset;
            self.prevLeft += self.targetElement.offsetWidth;
		    self.nextLeft = self.keyframes[index + 1] ? self._frame2position(self.keyframes[index + 1].id) : self.timeUnitPosition + self.timeUnitElement.offsetWidth;// - self.keyFrameOffset;
       //     self.nextLeft -= self.keyFrameOffset;
			return self.startPosition;
		},

		_keyframeMove: function (value){
			var self = this;

			self.targetElement.style.left = value + 'px';
			value = value + self.timeUnitPosition;// + self.keyFrameOffset;

			self.targetElement.style[_transformStyle_] = value > self.nextLeft || value < self.prevLeft ? 'scale(0.8, 0.8)' : 'scale(1, 1)';
			self.targetElement.className = value > self.nextLeft || value < self.prevLeft ? 'keyframe deleted' :  'keyframe';
		},

		_keyframeEnd: function (){
			var self         = this,
                endPosition  = self._getStyle(self.targetElement, 'left'),
				keyFrameLeft = endPosition + self.keyFrameOffset,
				keyframeElement = self.targetElement,
				keyframeId      = parseInt(self.targetElement.id.split('_')[1]);

            keyFrameLeft = self._correctDist(keyFrameLeft + self.keyFrameOffset + self.timeUnitPosition);

		    if (keyFrameLeft  > self.timeUnitElement.offsetWidth + self.timeUnitPosition + 2*self.keyFrameOffset || keyFrameLeft <= self.timeUnitPosition + self.keyFrameOffset){
		        self.targetElement.style[_transitionStyle_] = 'left 350ms ease-in-out';
		        self.targetElement.style.left             = keyFrameLeft > self.timeUnitPosition + self.timeUnitElement.offsetWidth ? '10000px' : '-10000px';
		        self.options.deleteKeyFrame(self._getCurrentLayer(), keyframeId);  
		        self.options.drawAll();
		        self.updateTimeline();
		    }else if (keyFrameLeft <= self.prevLeft || keyFrameLeft > self.nextLeft){
                self.targetElement.style[_transitionStyle_] = 'left 500ms ease-in-out';
		        self.targetElement.style[_transformStyle_]  = 'scale(1, 1)';
		        self.targetElement.style.left             = self.startPosition + 'px';
                self.targetElement.className              = 'keyframe selected';
		    }else{
		        //update list
                keyFrameLeft = self._correctDist(keyFrameLeft);
		        var updateKeyframe = keyFrameLeft / self._getScale();

                if (endPosition != self.startPosition){
		            var newId      = self._getCurrentLayer() + '_' + updateKeyframe,
		     	        layerLeft  = self._getStyle(self.layerContentElement, 'marginLeft');
						tmUnit     = getTimelineUnit(self._getCurrentLayerId(), keyframeId);

                    updateKeyframe -= 1;
					var keyframe = TimelineUnit.findKeyframe(tmUnit, updateKeyframe);
                    if (keyframe){ 
						 //= updateKeyframe > keyframeId ? updateKeyframe - 1 : updateKeyframe -1;
                        if (updateKeyframe >= tmUnit.frameStart + tmUnit.frameCount - 1){
                            updateKeyframe = tmUnit.frameStart + tmUnit.frameCount - 1;
                        }
                        if (updateKeyframe <= tmUnit.frameStart){
                            updateKeyframe = tmUnit.frameStart+1;
                        }
					}

		            self.options.updateUnitKeyFrame(self._getCurrentLayer(), self.targetElement.id.split('_')[1], updateKeyframe);
		        }else {
		            updateKeyframe = keyframeId;
				}
		        
    	        self._updateCursor(self._frame2second(updateKeyframe), (updateKeyframe) * self._getScale());
                self._setCurrentFrame(updateKeyframe);
                self.options.drawAll(null, 2);  
		        self.updateTimeline();
			}
            
			delete self.timeUnitElement;
            delete self.startPosition;
		    delete self.timeUnitPosition;
			delete self.keyframes;
		    delete self.keyFrameOffset; 
		    delete self.prevLeft;
		    delete self.nextLeft;

		},

		_removeLayer: function (){
			var layerIndex = this._getCurrentLayer();
			    layers     = window.aniLayers;

		    if (layers.length > 1){ //one layer at least
                window.aniLayers.splice(layerIndex, 1);
                if (layerIndex >= layers.length){this._setCurrentLayer(layerIndex-1)}            
                this.options.drawAll();
			}

			this.updateTimeline();
		},

        _scaleFrames: function(scaled, frameStart, lastWidth, isSend){
            var frames = this._getKeyframes();
            var self = this;

            if (frameStart < 0){
                frameStart = 0;
            }

            var tmUnit = getTimelineUnit(self._getCurrentLayerId(), frames[0].id);
            var nCF = Math.round((window.currentFrame-frames[0].id+1) * scaled)+frameStart-1;//frames[0].id-1;
            if (nCF < 0) nCF = 0;
            for (var i=frames.length-1;i>=0;i--){
                if (tmUnit){
                    if (tmUnit.hashKey['key_' +frames[i].id] != undefined){
                        delete tmUnit.hashKey['key_' +frames[i].id];
                    }
                    frames[i].id = Math.round((frames[i].id-frames[0].id+1) * scaled)+frameStart-1;//frames[0].id-1;
                    tmUnit.hashKey['key_'+frames[i].id] = frames[i];
                }
            }
            self._setCurrentFrame(nCF);
            self._updateCursor(self._frame2second(nCF), (nCF) * self._getScale());
            if (isSend){
                _lastTimeUnitWidth = lastWidth;
            }
        }

	}
	
	return Timeline;
	
})()
