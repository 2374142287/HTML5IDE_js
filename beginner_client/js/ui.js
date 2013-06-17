MugedaUI = {
	istouch : isMobile(),
	defaultCmd : Hanimation.SHAPE_SELECT,
	useGlassBoard : false,
	movingGlassMode : 0,
	glassBefore : 1,
	glassAfter : 0,
	// TODO: Support other types. 
	type: "beginner",
	displayCamera : false,
	init : function (param) {
		for (var k in param) {
			this[k] = param[k];
		}		
		this.context = this.objCanvas.getContext('2d');
		window.objCanvas = this.objCanvas;
		Hanimation.PADDING = 0;
		
		if (!window.aniData) {
			window.engineReady = true;
			window.g_aniObj = [];
			window.objSelect = createNewObject(Hanimation.SHAPE_SELECT);
			window.objCamera = createNewObject(Hanimation.SHAPE_CAMERA);
			
			var layers = getEmptyLayers();
			window.aniData = createAniData();
			window.aniData.layers = layers;
			window.aniLayers = window.aniData.layers;
			window.aniData.width = window.objCanvas.offsetWidth;
			window.aniData.height = window.objCanvas.offsetHeight;
			window.currentFrame = 0;
			window.currentLayer = 0;
			this.setStageSize();
			
			processCommand(Hanimation.SHAPE_SELECT);
			
			aniDataIsChange();
		}
		
		var that = this;
		E(function (e) {
			that.drawStart(e)
		}, this.istouch ? 'touchstart' : 'mousedown', window.objCanvas);
		E(function (e) {
			that.drawMove(e)
		}, this.istouch ? 'touchmove' : 'mousemove', document);
		E(function (e) {
			that.drawEnd(e)
		}, this.istouch ? 'touchend' : 'mouseup', document);

	},
	setStageSize : function () {
		var zoomInfo = window.aniData.zoomInfo[0];
		var paddedW = Math.floor(window.aniData.width * zoomInfo.zoomLevel + 2 * Hanimation.PADDING);
		var paddedH = Math.floor(window.aniData.height * zoomInfo.zoomLevel + 2 * Hanimation.PADDING);
		var canvas = window.objCanvas;
		canvas.style.width = paddedW + 'px';
		canvas.style.height = paddedH + 'px';
		canvas.width = paddedW;
		canvas.height = paddedH;
	},
	resetGround : function () {
	},
	setDefaultCommand : function (cmd) {
		this.defaultCmd = cmd;
	},
	drawStart : function (event) {
        if (isMiddleMode){
            var len = getActiveObjectLength();
            var activeObject = len == 1 ? window.objSelect.getObjectAt(0) : null;
            if (activeObject){
                var frameId = window.currentFrame;
                var layerId = activeObject.layerId;
                var tmUnit = getTimelineUnit(layerId, frameId);
                if (window.activeCommand == Hanimation.SHAPE_SELECT){

                }else
                if (tmUnit && tmUnit.animated && tmUnit.aniType == 'record_animation' && !window.cTimeline.getRecordStatus()){
                    if (frameId != tmUnit.frameStart && frameId != tmUnit.frameStart+tmUnit.frameCount-1){
                        clearSelection();
                        return;
                    }
                }
            }
            event.preventDefault();
            window.Hop = len==1 ? JSON.clone(window.objSelect.getObjectAt(0).dataRef.param) : null;
        }
		this.isdrawing = true;//绘图标志位置为1
		
		var isShiftPressed = window.isShift || event.shiftKey;//定义触发事件按键
		var isCtrlPressed = window.isCtrl || event.ctrlKey;
		var isAltPressed = window.isAlt || event.altKey;

		var keyMask = isShiftPressed ? 4 : 0;//按键标记位置位
		keyMask = keyMask | (isCtrlPressed ? 2 : 0);
		keyMask = keyMask | (isAltPressed ? 1 : 0);

		this.mouseCaptured = true;//鼠标获取标志位置位
		
		this.targetObj = event.target;//获取目标对象
		
		this.isNotOnCanvas = false;//将非位画板标志位置位false(意思就是现在在画板上)
		
		if (!this.istouch) {
			if (event.which != 1) // Right button or touch screen,event.which maches any key in the keyboard;
				return;
		}
		
		var isCtrlPressed = event.ctrlKey;
		
		var objCanvas = window.objCanvas;
		var position = getEventPosition(event, objCanvas);//获得画板的事件位置
		var len = getActiveObjectLength();
		var selectObject = len == 1 ? window.objSelect.getObjectAt(0) : null;
		
		if (this.prevPos &&
			this.prevPos.x == position.x &&
			this.prevPos.y == position.y &&
			window.activeCommand == Hanimation.SHAPE_CURVE) {
			finishPreviousDraw();
			return;
		}
		
		this.prevPos = position;
		
		this.moveAfterDown = false;
		this.downPosition = position;
		
		var bDrawPending = typeof window.isDrawing == "undefined" ? false : window.isDrawing;
		
		// Buf fix for Safari (iPad)
		if (typeof this.focusType == "undefined")
			this.focusType = Hanimation.HITTEST_NONE;
		
		if (window.objSelect)
			this.focusType = window.objSelect.hitTest(position.x, position.y, 1 + (isCtrlPressed ? 2 : 0) + 4);
		
		window.selectMode = 0; // && hitRe.mode == Hanimation.HITTEST_NONE
		if ((window.activeCommand == Hanimation.SHAPE_SELECT ||
				window.activeCommand == Hanimation.SHAPE_SCALE ||
				window.activeCommand == Hanimation.SHAPE_NODE) &&
			len > 0 && this.focusType != Hanimation.HITTEST_NONE) {
			// Editing an object
			var ctx = this.context;
			if (ctx)
				window.bufferData = ctx.getImageData(0, 0, window.objCanvas.width, window.objCanvas.height);//获取画布信息
			
			if (len == 1 && window.activeCommand == Hanimation.SHAPE_SELECT)
				selectObject.setEditStartPoint(position.x, position.y, this.focusType, keyMask);
			else if (len == 1 && window.activeCommand == Hanimation.SHAPE_NODE)
				selectObject.setEditStartPoint(position.x, position.y, this.focusType, keyMask);
			else
				window.objSelect.setEditStartPoint(position.x, position.y, this.focusType, keyMask);
			
			this.isEditing = true;

            if (isMiddleMode && window.cTimeline.getRecordStatus()){
                var pencilObject = createNewObject(Hanimation.SHAPE_PENCIL);
                pencilObject.dataRef.param.smooth = 5;
                var param = window.objSelect.getObjectAt(0).dataRef.param
                pencilObject.setStartPoint(param.left+param.rotateCenterX, param.top+param.rotateCenterY);
                pencilObject.setEndPoint(param.left+param.rotateCenterX, param.top+param.rotateCenterY);
                cTimeline.setPencilObject(pencilObject);
            }
			
			return;
		}
		
		var activeObject = null;
		switch (window.activeCommand) {
		case Hanimation.SHAPE_LINE:
		case Hanimation.SHAPE_RECTANGLE:
		case Hanimation.SHAPE_POLYGON:
		case Hanimation.SHAPE_ROUNDED:
		case Hanimation.SHAPE_PICTURE:
		case Hanimation.SHAPE_TEXT:
		case Hanimation.SHAPE_ELLIPSE:
		case Hanimation.SHAPE_GROUP:
		case Hanimation.SHAPE_CURVE:
		case Hanimation.SHAPE_SPLINE:
		case Hanimation.SHAPE_PENCIL:
			if (!window.isDrawing && window.engineReady) {
				activeObject = createNewObject(window.activeCommand);
				
				if (window.lastLineWidth && activeObject.dataRef.param.lineWidth != undefined)
					activeObject.dataRef.param.lineWidth = window.lastLineWidth;
				else if(MugedaUI.type == "beginner")
					// For beginners
					activeObject.dataRef.param.lineWidth = 4;
					
				if (window.lastStrokeColor && activeObject.dataRef.param.strokeColor != undefined)
					activeObject.dataRef.param.strokeColor = window.lastStrokeColor;
				else if(MugedaUI.type == "beginner")
					// For beginners
					activeObject.dataRef.param.strokeColor = "#E00039";//所画的线条为红色
					//activeObject.dataRef.param.strokeColor = gradient.synTextColor(r,g,b,a);
					//activeObject.dataRef.param.strokeColor = window.lastStrokeColor;

				if (window.lastFillInfo && activeObject.dataRef.param.fillInfo != undefined)
					activeObject.dataRef.param.fillInfo = JSON.clone(window.lastFillInfo);
				else if(MugedaUI.type == "beginner")
				{
					// For beginners
					activeObject.dataRef.param.fillInfo.fillColors = COLOR.toFillColors("#A1FF00");
					activeObject.dataRef.param.fillInfo.fillStyle = 0;
				}
				
				if (window.lastSmooth)
					activeObject.dataRef.param.smooth = window.lastSmooth;
				
				if (window.activeCommand == Hanimation.SHAPE_PENCIL) {
					// For pencil, always use empty filling by defaults
					var fillInfo = createFillInfo();
					fillInfo.fillColors = [createColorStop(0, 0, 0, 0, 0)];
					activeObject.dataRef.param.fillInfo = fillInfo;
				}
				
				window.objCanvas.className = "canvasDraw";
				window.isDrawing = true;
			} else if (Hanimation.SHAPE_CURVE == window.activeCommand) {
				activeObject = selectObject;
			}
			break;
		case Hanimation.SHAPE_SELECT:
		case Hanimation.SHAPE_NODE:
		case Hanimation.SHAPE_SCALE:
			if (!window.isDrawing) {
				window.isDrawing = true;
				window.selectMode = 1;
			}
			
			break;
		case Hanimation.SHAPE_ZOOM:
			window.selectMode = 3;
			setZoomOffset(window.currentFrame, 0, 0, 0);
			
			break;
		default:
			window.objCanvas.className = "canvasNormal";
			break;
		}
		
		if (window.isDrawing) {
			var ctx = window.objCanvas.getContext('2d');
			if (ctx && !bDrawPending) {
				window.bufferData = ctx.getImageData(0, 0, window.objCanvas.width, window.objCanvas.height);
			}
		}
		
		if (window.objSelect) {
			window.objSelect.setStartPoint(position.x, position.y);
			window.objSelect.setEndPoint(position.x, position.y);
		}
		
		if (activeObject) {
			if (!isCtrlPressed || window.selectMode == 0)
				clearSelection();
			
			if (window.selectMode == 0)
				toggleActiveObject(activeObject);
			
			activeObject.setStartPoint(position.x, position.y);
			activeObject.setEndPoint(position.x, position.y);
		} else if (window.selectMode == 0 && len > 0 && this.focusType == Hanimation.HITTEST_NONE && !window.isDrawing && !isCtrlPressed)
			clearSelection();
	},
	drawMove : function (event) {
		if (this.movingGlassMode != 0)
			this.processGlassBoard(event);
		
		var objCanvas = window.objCanvas;
		var position = getEventPosition(event, objCanvas);
		
		var isShiftPressed = window.isShift || event.shiftKey;
		var isCtrlPressed = window.isCtrl || event.ctrlKey;
		var isAltPressed = window.isAlt || event.altKey;
		
		if (this.lastMousePos && this.lastMousePos.x == position.x && this.lastMousePos.y == position.y)
			// No actual move, skip
			return;
		
		this.lastMousePos = position;
		
		// nearCurve(event);
		curveHitTest(event, position);
		
		if (this.mouseCaptured && (this.downPosition.x != position.x || this.downPosition.y != position.y))
			this.moveAfterDown = true;
		
		var keyMask = isShiftPressed ? 4 : 0;
		keyMask = keyMask | (isCtrlPressed ? 2 : 0);
		keyMask = keyMask | (isAltPressed ? 1 : 0);
		
		var len = getActiveObjectLength();
		
		if (!window.isDrawing && !this.isEditing && window.objSelect)
			this.focusType = window.objSelect.hitTest(position.x, position.y, 1 + (event.ctrlKey ? 2 : 0));
		
		if (window.activeCommand == Hanimation.SHAPE_NODE || window.activeCommand == Hanimation.SHAPE_SELECT)
			updateActiveNodes(position.x, position.y, position.x, position.y, (this.mouseCaptured ? 8 : 0) + (event.ctrlKey ? 2 : 0));
		
		var activeObject = len == 1 ? window.objSelect.getObjectAt(0) : null;
		var ctx = saveGetCanvasCtx();
		
		ctx.save();
		ctx.translate(Hanimation.PADDING, Hanimation.PADDING);
		
		if (window.activeCommand == Hanimation.SHAPE_ZOOM) {
			if (window.selectMode == 3) {
				if (!Zoom.getZoomInfo(window.aniData, -1, 2)) {
					this.informCameraZoom = true;
					window.objCanvas.style.cursor = "url('res/NoCursor.png'), default";
				} else {
					setZoomOffset(window.currentFrame, position.rawX - this.downPosition.rawX, position.rawY - this.downPosition.rawY, 1);
					window.objCanvas.style.cursor = "move";
				}
			} else // if(this.lastMousePos.x != position.x || this.lastMousePos.y != position.y)
			{
				// this.lastMousePos = position;
				
				if (isShiftPressed) // Reset to 1.
					window.objCanvas.style.cursor = "url('res/Zoom-Reset-icon.png'), default";
				else if (isAltPressed) // Zoom out
					window.objCanvas.style.cursor = "url('res/Zoom-Out-icon.png'), default";
				else // Zoom in
					window.objCanvas.style.cursor = "url('res/Zoom-In-icon.png'), default";
			}
		} else if (window.selectMode && window.isDrawing) {
			window.objSelect.setEndPoint(position.x, position.y, keyMask);
			
			invalidateRegion(ctx, [window.objSelect], 0);
			
			window.objSelect.draw(ctx, 0);
			
			window.selectMode = 2;
		} else if (activeObject || this.focusType != Hanimation.HITTEST_NONE) {
			if (activeObject && window.isDrawing) {
				
				activeObject.setEndPoint(position.x, position.y, keyMask);
				
				invalidateRegion(ctx, [activeObject], 0);
				
				activeObject.draw(ctx, 1);
			} else if (this.isEditing) {
				
				if (activeObject && (window.activeCommand == Hanimation.SHAPE_SELECT || window.activeCommand == Hanimation.SHAPE_NODE)) {
					activeObject.setEditEndPoint(position.x, position.y, this.focusType, keyMask);
					invalidateRegion(ctx);
					activeObject.draw(ctx, 1);

                    if (isMiddleMode){
                        if (window.cTimeline.getRecordStatus() && window.activeCommand == Hanimation.SHAPE_SELECT){
                            var param = window.objSelect.getObjectAt(0).dataRef.param;
                            // window.cTimeline.getPencilObject().setEndPoint(position.x, position.y, keyMask);
                            window.cTimeline.getPencilObject().setEndPoint(param.left+param.rotateCenterX, param.top+param.rotateCenterY, keyMask);
                            window.cTimeline.getPencilObject().draw(ctx, 1);
                        }
                    }
					// } else if (activeObject && window.activeCommand == Hanimation.SHAPE_NODE) {
					//     activeObject.setEditEndPoint(position.x, position.y, this.focusType, keyMask);
					//     activeObject.draw(ctx, 1);
				} else {
					window.objSelect.setEditEndPoint(position.x, position.y, this.focusType, keyMask);
					// TODO: !!! Use selected objects to update, instead of window.objSelect
					invalidateRegion(ctx);
					
					for (var i = 0; i < len; i++)
						window.objSelect.getObjectAt(i).draw(ctx, 1);
				}
			} else if (window.activeCommand == Hanimation.SHAPE_SELECT) {
				// this.focusType = hit;
			} else if (window.activeCommand == Hanimation.SHAPE_NODE) {
				// this.focusType = hit;
			} else if (window.activeCommand == Hanimation.SHAPE_SCALE) {
				// this.focusType = hit;
				switch (this.focusType) {
				case Hanimation.HITTEST_LEFTTOP:
					window.objCanvas.style.cursor = "nw-resize";
					break;
				case Hanimation.HITTEST_RIGHTBOTTOM:
					window.objCanvas.style.cursor = "se-resize";
					break;
				case Hanimation.HITTEST_RIGHTTOP:
					window.objCanvas.style.cursor = "ne-resize";
					break;
				case Hanimation.HITTEST_LEFTBOTTOM:
					window.objCanvas.style.cursor = "sw-resize";
					break;
				case Hanimation.HITTEST_TOP:
					window.objCanvas.style.cursor = "n-resize";
					break;
				case Hanimation.HITTEST_BOTTOM:
					window.objCanvas.style.cursor = "s-resize";
					break;
				case Hanimation.HITTEST_LEFT:
					window.objCanvas.style.cursor = "e-resize";
					break;
				case Hanimation.HITTEST_RIGHT:
					window.objCanvas.style.cursor = "w-resize";
					break;
				case Hanimation.HITTEST_WITHIN:
					window.objCanvas.style.cursor = "move";
					break;
				case Hanimation.HITTEST_ROTATE:
					window.objCanvas.style.cursor = "url('res/rotate.png') 8 8, default";
					break;
				case Hanimation.HITTEST_PIVOT:
				case Hanimation.HITTEST_NONE:
				default:
					window.objCanvas.style.cursor = "default";
					break;
				}
			}
		} else if (this.focusType == Hanimation.HITTEST_NONE && window.activeCommand == Hanimation.SHAPE_SCALE) {
			// TODO: this is an ugly patch. try to merge it into other branches.
			window.objCanvas.style.cursor = "default";
		}
		
		ctx.restore();
		
		saveReleaseCanvasCtx(ctx);
	},
	drawEnd : function (event) {
		
		if (!this.isdrawing)
			return;
		this.isdrawing = null;
		
		this.mouseCaptured = false;
		this.timelineCaptured = false;
		
		if (!window.isMaskOn() &&
			!(this.targetObj && (this.targetObj.nodeName == "INPUT" || this.targetObj.nodeName == "TEXTAREA")) &&
			!(event.target && (event.target.nodeName == "INPUT" || event.target.nodeName == "TEXTAREA")))
			clearHighlight();
		
		document.onselectstart = function () {
			return true
		};
		
		if (this.informCameraZoom) {
			alert(Hanimation.Message.CameraZoom);
			this.informCameraZoom = false;
		}
		
		if (event.which != 1 && !this.istouch) // Right button or touch screen
			return;
		
		var objCanvas = window.objCanvas;
		var position = lastPosition; // getEventPosition(event, objCanvas);
		var isButton = (event.target.className == "button") || (event.target.parentNode && event.target.parentNode.className == "button");
		
		if (isButton && !window.isDrawing && !this.isEditing)
			return;
		
		var len = getActiveObjectLength();
		var activeObject = len == 1 ? window.objSelect.getObjectAt(0) : null;
		var isCamera = activeObject && this.objCamera && activeObject == this.objCamera;
		
		var isShiftPressed = window.isShift || event.shiftKey;
		var isCtrlPressed = window.isCtrl || event.ctrlKey;
		var isAltPressed = window.isAlt || event.altKey;
		
		this.movingGlassMode = 0;
		
		var recheckActive = (!this.moveAfterDown && (window.activeCommand == Hanimation.SHAPE_SELECT || window.activeCommand == Hanimation.SHAPE_NODE) && window.selectMode == 0);
		
		if (window.selectMode) {
			if (window.activeCommand == Hanimation.SHAPE_ZOOM) {
				if (this.moveAfterDown) {
					setZoomOffset(window.currentFrame, position.rawX - this.downPosition.rawX, position.rawY - this.downPosition.rawY, 2);
				} else {
					setZoom(window.currentFrame, position.x, position.y, isShiftPressed ? 2 : ((isAltPressed ? 1 : 0) + (isCtrlPressed ? 4 : 0)));
				}
			}
			
			if (window.isDrawing) {
				window.objSelect.setFinished(position.x, position.y);
				var par = window.objSelect.getParam();
				
				var numNodes = 0;
				if (window.activeCommand == Hanimation.SHAPE_NODE)
					numNodes = updateActiveNodes(par.left, par.top, par.right, par.bottom, isCtrlPressed ? 2 : 0);
				
				if (numNodes == 0 || window.activeCommand == Hanimation.SHAPE_SELECT || window.activeCommand == Hanimation.SHAPE_NODE) {
					if (!isCtrlPressed)
						clearSelection();
					updateActiveObjects(par.left, par.top, par.right, par.bottom, window.selectMode);
				}
				
				window.isDrawing = false;
				
				if (checkObjectConversion()) {
					var answer = confirm(Hanimation.Message.ConfirmCurveConvert);
					if (answer) {
						convertActiveObjects();
					} else
						clearSelection();
				}
			}
			
			window.selectMode = 0;
			
		} else if (this.isEditing || window.activeCommand == Hanimation.SHAPE_SCALE) {
			updateActiveNodes(position.x, position.y, position.x, position.y, 8 + (isCtrlPressed ? 2 : 0));
			if (len == 1 && window.activeCommand == Hanimation.SHAPE_SELECT)
                if (isMiddleMode)
                {
                    var dx = position.x - this.prevPos.x;
                    var dy = position.y - this.prevPos.y;
                    window.objSelect.setEditFinished(position.x, position.y, this.focusType);
                    var frameId = window.currentFrame;
                    var layerId = activeObject.layerId;
                    var tmUnit = getTimelineUnit(layerId, frameId);

                    if (tmUnit.animated && tmUnit.aniType == 'record_animation' && !window.cTimeline.getRecordStatus()){
                        for (var k=0;k<tmUnit.keyframes.length;k++){
                            var tk = tmUnit.keyframes[k];
                            tk.param.top += dy;
                            tk.param.left += dx;
                            tk.param.right += dx;
                            tk.param.bottom += dy;
                            tk.param.startY += dy;
                            tk.param.startX += dx;
                            tk.param.endY += dy;
                            tk.param.endX += dx;
                        }
                        if(tmUnit.pathMode == Hanimation.PATHMODE_UPDATE_KEYFRAME)
                            tmUnit.pathMode = Hanimation.PATHMODE_UPDATE_PATH;

                    }

                    updateAnimationPath(tmUnit);
                }
				else {
                    activeObject.setEditFinished(position.x, position.y, this.focusType);
                }
			else if (len == 1 && window.activeCommand == Hanimation.SHAPE_NODE)
				activeObject.setEditFinished(position.x, position.y, this.focusType);
			else if (window.objSelect) {
				window.objSelect.setEditFinished(position.x, position.y, this.focusType);
				// window.objSelect.updateRotationParams();
			}
			
			this.isEditing = false;

            if (isMiddleMode && window.cTimeline.getRecordStatus()){

                var param = window.objSelect.getObjectAt(0).dataRef.param;
                //window.cTimeline.getPencilObject().setFinished(position.x, position.y);
                window.cTimeline.getPencilObject().setFinished(param.left+param.rotateCenterX, param.top+param.rotateCenterY);
                window.cTimeline.setUnitPath();
                window.cTimeline.deletePencilObject();
                if(tmUnit.pathMode == Hanimation.PATHMODE_UPDATE_KEYFRAME)
                    tmUnit.pathMode = Hanimation.PATHMODE_UPDATE_PATH;
                //    aniDataIsChange();
            }
			
			var addKeyframe = !this.isPath;
			if (!this.isNotOnCanvas && this.moveAfterDown) {
				if (!isCamera)
					// updateKeyframe();
					updateSelectedKeyframes(addKeyframe);
				
				onGetProperties(true);
			}
		} else if (activeObject) {
			if (window.isDrawing) {
				if (isButton) {
					finishPreviousDraw();
				} else if (activeObject.isFinished(position.x, position.y)) {
					activeObject.setFinished(position.x, position.y);
					window.isDrawing = false;
					
					if (activeObject.isValid()) {
						addCanvasObject(activeObject);
					} else {
						clearSelection();
						if (this.prevObject)
							toggleActiveObject(this.prevObject);
						
						processCommand(this.defaultCmd);
						if (this.oncommand)
							this.oncommand(this.defaultCmd);
					}
				} else {}
			}
		}
		
		if (recheckActive && this.focusType != Hanimation.HITTEST_CONTROL && event.target.id == "canvasPanel") {
			// Mouse is not moved (no editing action). Switch to object selection instead
			// window.objSelect.setEditFinished(position.x, position.y);
			var par = window.objSelect.getParam();
			if (!isCtrlPressed)
				clearSelection();
			window.selectMode = 1;
			
			updateActiveObjects(position.x, position.y, position.x, position.y, window.selectMode);
			
			window.selectMode = 0;
			window.isDrawing = false;
		}
		
		if (isCamera && !this.isNotOnCanvas) {
			var par = this.objCamera.getParam();
			
			// TODO: An ugly trick to adjust camera position (avoiding overflow. i.e., out of canvas boundary).
			var params = {
				'direct' : par,
				'aux' : par
			};
			this.objCamera.move(params, 0, 0);
			this.objCamera.updateBoundRect();
			
			var par = this.objCamera.getParam();
			var zoomInfo = Zoom.getZoomInfo(window.aniData, window.currentFrame, 2);
			if (zoomInfo) {
				zoomInfo.zoomLevel = window.objCanvas.offsetWidth / par.width;
				zoomInfo.offsetLeft = par.left;
				zoomInfo.offsetTop = par.top;
				zoomInfo.rotation = par.rotate;
				
				Zoom.setZoomInfo(window.aniData, window.currentFrame, zoomInfo);
			}
		}
	    setPropTools(window.objSelect);

		if (!this.moveAfterDown)
			clickCurve(event);

        if (window.activeCommand == Hanimation.SHAPE_TEXT){
            Page.selectCommand('SHAPE_SELECT');
        }

        if (isMiddleMode){
            updateTimeline();
            var op = window.Hop;
            if (op && window.activeCommand == Hanimation.SHAPE_SCALE){
                var frameId = window.currentFrame;
                var layerId = activeObject.layerId;
                var tmUnit = getTimelineUnit(layerId, frameId);
                var np = tmUnit.objects[0].param;//window.objSelect.getObjectAt(0).dataRef.param;
                if (tmUnit && tmUnit.animated && tmUnit.aniType == 'record_animation' && !window.cTimeline.getRecordStatus()){
                    var tos = 0;
                    if (frameId == tmUnit.frameStart + tmUnit.frameCount - 1){
                        var tos = 0;//tmUnit.frameStart;
                        var t_op = 1;
                    }
                    if (frameId == tmUnit.frameStart){
                        var tos = tmUnit.keyframes.length-1;//tmUnit.frameStart + tmUnit.frameCount - 1;
                        var t_op = -1;
                    }
                    var beParam = JSON.clone(tmUnit.keyframes[tos].param);
                    var frameCount = tmUnit.frameCount;
                    for (var k=0;k<tmUnit.keyframes.length;k++){
                        var tk = tmUnit.keyframes[k];
                        if (frameId == tk.id) continue;
                        var tmpPa = createParam();
                        Param.tweenParam(tmpPa, beParam, np, t_op*(tk.id-tmUnit.keyframes[tos].id)/(frameCount - 1));
                        tk.param.rotate = tmpPa.rotate;
                        //    var t_scale = t_op*(tk.id-tos)/(frameCount - 1);
                        var offY = np.top - op.top + np.rotateCenterY - op.rotateCenterY;
                        var offX = np.left - op.left + np.rotateCenterX - op.rotateCenterX;
                        var dy = (tk.param.height - tmpPa.height)/2;
                        var dx = (tk.param.width - tmpPa.width)/2;

                        tk.param.width = tmpPa.width;
                        tk.param.height = tmpPa.height;
                        tk.param.rawWidth = tmpPa.rawWidth;
                        tk.param.rawHeight = tmpPa.rawHeight;

                        tk.param.top += dy + offY;
                        tk.param.left += dx + offX;
                        tk.param.right -= dx - offX;
                        tk.param.bottom -= dy - offY;

                        tk.param.startY += dy + offY;
                        tk.param.startX += dx + offX;
                        tk.param.endY -= dy - offY;
                        tk.param.endX -= dx - offX;

                        tk.param.rotateCenterX = (tk.param.right - tk.param.left)/2;
                        tk.param.rotateCenterY = (tk.param.bottom - tk.param.top)/2;
                    }
                    if(tmUnit.pathMode == Hanimation.PATHMODE_UPDATE_KEYFRAME)
                        tmUnit.pathMode = Hanimation.PATHMODE_UPDATE_PATH;
                }

                updateAnimationPath(tmUnit);
                // this.redrawAll();
                updateTimeline();
            }
        }

        if (!window.isDrawing && !isButton)
            this.redrawAll();
	},
	redrawAll : function (p, undoMode) {
		
		var undoMode = (undoMode == undefined) ? 0 : undoMode;

		if (!p)
			p = {};
		if (!p.layers)
			p.layers = window.aniLayers;
		if (!p.canvas)
			p.canvas = window.objCanvas;
		if (p.repair)
			p.layers = buildLayers(p.layers);
		
		var currentFrame = (!p.currentFrame) ? window.currentFrame : p.currentFrame;
		
		if (typeof this.maskDrawMode == "undefined")
			this.maskDrawMode = true;
		
		// It seems Canvas has its own dual-buffer mechanism...
		var canvas = p.canvas; // G('canvasMemory');
		
		// TODO: Setting canvas dimension should be somewhere else.
		canvas.width = p.canvas.offsetWidth;
		canvas.height = p.canvas.offsetHeight;
		
		window.previewRender = true;
		var ctx = canvas.getContext('2d');
		ctx.save();
		
        var scale = p.scale ? Math.max(0.05, parseFloat(p.scale)) : 1.;
		if (Math.abs(scale - 1) > 1E-3){
            ctx.scale(scale, scale);
        }
        
		ctx.translate(Hanimation.PADDING, Hanimation.PADDING);
		
		// This needs to be optimized
		// ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
		
		var zoomInfo = Zoom.getZoomInfo(window.aniData, -1);
		if (this.prevZoomInfo) {
			var factor = zoomInfo.zoomLevel / this.prevZoomInfo.zoomLevel;
			if (this.prevZoomInfo.offsetLeft != zoomInfo.offsetLeft ||
				this.prevZoomInfo.offsetTop != zoomInfo.offsetTop ||
				Math.abs(factor - 1) > 0.001)
				// Zoom info has been changed.
				Zoom.updateLayersAfterZoom(window.aniLayers, factor);
		}
		this.prevZoomInfo = JSON.clone(zoomInfo);
		ctx.translate(-zoomInfo.offsetLeft, -zoomInfo.offsetTop);
		
		if (p.color) {
			ctx.fillStyle = p.color;
			ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
		}
		if (p.image) {
			ctx.drawImage(p.image, 0, 0, p.image.width, p.image.height, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
		}
		if (p.clear)
			return;
		
		var obj;
		var objs;
		var tmUnit;
		var curObj;
		var objCount = 0;
		var unitCount = 0;
		var prevKey = null;
		var keyObject = null;
		var aryKeyObjects = null;
		var frameId = currentFrame;
		var layerId = this.currentLayer;
		var tempParam;
		var keyframe;
		var items;
		var layer;
		var layers = p.layers;
		var len = layers.length;
		var xlayers = [];
		
		var savedParam;
		var drawStatus = [];
		var aryPathUnits = [];		
		var from = this.useGlassBoard ? Math.max(0, currentFrame - this.glassBefore) : currentFrame;
		var to = this.useGlassBoard ? currentFrame + this.glassAfter : currentFrame;
		for (var count = from; count <= to; count++) {
			frameId = count;
			if (frameId != currentFrame)
				g_alpha = 0.4;
			else
				g_alpha = 1.;
			
			var storedAlpha = g_alpha;
			for (var i = len - 1; i >= 0; i--) {
				layer = layers[i];
				layer.objs = [];
				if (layer.hide)
					continue;
				unitCount = layer.units.length;
				
				for (var j = 0; j < unitCount; j++) {
					tmUnit = layer.units[j];
					
					objCount = tmUnit.objects.length;
					if (tmUnit && objCount && frameId >= tmUnit.frameStart && frameId < tmUnit.frameStart + tmUnit.frameCount) {
						if (!tmUnit.animated) {
							TimelineUnit.distributeProgress(tmUnit, this.playStatus != Hanimation.PLAYING ? 1 : 0);
							if (drawStatus[i + '_' + j] == 1)
								continue;
							else if (currentFrame >= tmUnit.frameStart && currentFrame < tmUnit.frameStart + tmUnit.frameCount)
								g_alpha = 1.;
							else
								g_alpha = storedAlpha;
						}
						for (var k = 0; k < objCount; k++) {
							objData = tmUnit.objects[k];
							obj = getAniObject(objData);
							
							if (tmUnit.animated && objCount == 1) {
								keyframe = TimelineUnit.getKeyframe(tmUnit, frameId);
								
								if (keyframe) {
									prevKey = keyframe;
									Param.exchange(keyframe.param, objData.param, true);
								} else {
									var param = TimelineUnit.getTweenParam(tmUnit, frameId);
									if (param) {
										Param.exchange(param, objData.param, true);
										// window.isAniTween=true;
									}
								}
								
								if (frameId == currentFrame)
									obj.saveParam();
							} else if (this.playStatus == Hanimation.PLAYING && tmUnit.pg && (obj.progressMode == 4 || obj.progressMode == 5)) {
								var param = TimelineUnit.getProgressParam(tmUnit, obj, frameId, {
										tween : 'Elastic.EaseOut'
									});
								if (param) {
									Param.exchange(param, objData.param, true);
								}
							}
							
							if (obj.dataRef.type == Hanimation.SHAPE_CLIP)
								obj.setRealtime(false);
							
							if (Zoom.objectInScene(obj, zoomInfo, canvas.width / scale, canvas.height / scale)) {
								
								if (this.maskDrawMode && !this.useGlassBoard) {
									layer.objs.push(tmUnit.objects[k]);
								} else {
									obj.draw(ctx, 0);
								}
								drawStatus[i + '_' + j] = 1;
							}
							
							if (frameId > currentFrame)
								obj.restoreParam();
						}
						
						if (tmUnit.animated && tmUnit.displayPath && frameId == currentFrame) {
							if (this.maskDrawMode) {
								aryPathUnits.push(tmUnit);
							} else
								drawAnimationPath(ctx, tmUnit);
						}
					}
				}
			}
			
			if (this.maskDrawMode) {
				HaniMask.drawLayer(ctx, layers, zoomInfo, 3);
			}
		}
		
		var unitLen = aryPathUnits.length;
		if (this.maskDrawMode) {
			for (i = 0; i < unitLen; i++) {
				drawAnimationPath(ctx, aryPathUnits[i]);
			}
		}
		
		delete drawStatus;
		
		var frameChanged = ((this.lastRenderFrame == undefined) || this.lastRenderFrame != currentFrame);
		
		if (!window.isDrawing && this.playStatus != Hanimation.PLAYING && !this.mouseCaptured && !p.hideSelect) {
			setFocusObjects(ctx);
			
			// TODO: window.isAniTween is problematic especially for multiple layers
			if ((undoMode == 2) || (!frameChanged && undoMode == 0 && !window.isAniTween)) {
				aniDataIsChange();
			}
			window.isAniTween = false;
			setMenuStatus();
			
			this.lastRenderFrame = currentFrame;
			this.lastRenderLayer = this.currentLayer;
			
			if (window.isEditSymbol) {
				if (currentFrame == 0)
					HSymbol.updateThumbnail();
			} else {
				window.aniData.layers = aniLayers;
			}
		}
		
		var zoomInfo = Zoom.getZoomInfo(window.aniData, currentFrame);
		var isKeyCamera = (zoomInfo.type == 1);
		
		if (zoomInfo && !window.isEditSymbol) {
			if (!this.objCamera)
				this.objCamera = createNewObject(Hanimation.SHAPE_CAMERA);
			
			this.objCamera.updateCamera(p.canvas.offsetWidth, p.canvas.offsetHeight, zoomInfo);
			
			var canvasZoom = Zoom.getZoomInfo(window.aniData, -1);
			if (this.displayCamera && window.aniData.zoomInfo.length > 1 && Math.abs(canvasZoom.zoomLevel - 1) < 0.001) {
				this.objCamera.draw(ctx, isKeyCamera ? 2 : 0);
			}
		}
		
		var zoomInfo = window.aniData.zoomInfo[0];
		if (window.isEditSymbol) {
			// For symbol editing, draw a center cross to align the coordination.
			var size = 4;
			ctx.strokeStyle = "#080";
			var w = window.aniData.width * zoomInfo.zoomLevel;
			var h = window.aniData.height * zoomInfo.zoomLevel;
			ctx.beginPath();
			ctx.moveTo(w / 2 - size, h / 2);
			ctx.lineTo(w / 2 + size, h / 2);
			ctx.moveTo(w / 2, h / 2 - size);
			ctx.lineTo(w / 2, h / 2 + size);
			ctx.stroke();
		}
		
		ctx.restore();
		
		ctx.strokeStyle = "#333";
		ctx.globalAlpha = 0.5;
        
        if(Hanimation.PADDING > 0)
            ctx.strokeRect( Hanimation.PADDING, Hanimation.PADDING,
                            window.aniData.width * zoomInfo.zoomLevel, 
                            window.aniData.height * zoomInfo.zoomLevel);
		
	},
	setParam : function (param) {
		//var time=new Date().getTime();
		//if(this.paramTimer==undefined)this.paramTimer=0;
		//if(time-this.paramTimer>(istouch?100:10)){
			//this.paramTimer=time;
			this.setParamReal(param);
		//}
	},
	setParamReal : function (param) {
		var len = getActiveObjectLength();
		if (len == 0) {
			if (param.lineWidth != undefined) {
				window.lastLineWidth=param.lineWidth;
				return;
			}
			if (param.fillInfo != undefined) {
				window.lastFillInfo=param.fillInfo;
				return;
			}
			if (param.strokeColor != undefined) {
				window.lastStrokeColor=param.strokeColor;
				return;
			}
			
			if (param.color != undefined) {
				window.aniData.color = param.color;
			}
			if (param.image != undefined) {
				window.aniData.image = param.image;
			}
			if (param.width != undefined) {
				window.aniData.width = parseFloat(param.width);
				this.setStageSize();
			}
			if (param.height != undefined) {
				window.aniData.height = parseFloat(param.height);
				this.setStageSize();
			}
			if (param.rate != undefined) {
				var rate=parseFloat(param.rate||12);
				window.timerSpan = 1000/rate;
				window.aniData.rate = rate;
			}
		} else { //objects
			var params = window.selectParams;
			var len = getActiveObjectLength();
			if (param.left != undefined)
				param.xleft = param.left - window.regionParam.left;
			if (param.top != undefined)
				param.xtop = param.top - window.regionParam.top;
			if (param.tween != undefined && keyUnit)
				keyUnit.tween = param.tween;
			for (var i = 0; i < len; i++) {
				var p = params[i];
				var dp = window.dataParams[i];
				var b = 0;
				//图形
				var curObj = window.objSelect.getObjectAt(i);

                if (isMiddleMode){
                    var frameId = window.currentFrame;
                    var layerId = curObj.layerId;
                    var tmUnit = getTimelineUnit(layerId, frameId);
                }

				if (param.fillInfo != undefined) {
					window.lastFillInfo = param.fillInfo;
					p.fillInfo = param.fillInfo;
				}
				
				var zoomInfo = Zoom.getZoomInfo(window.aniData, window.currentFrame, 2);
				if (param.cameraTween != undefined && window) {
					zoomInfo.tween = param.cameraTween;
					Zoom.setZoomInfo(window.aniData, window.currentFrame, zoomInfo);
				}
				
				// URL applies to the object, instead of keyframes.
				if (param.action != undefined)
					dp.action = param.action;
				if (param.url != undefined)
					dp.url = param.url;
				if (param.form != undefined)
					dp.form = param.form;
				if (param.behavior != undefined)
					dp.behavior = param.behavior;
				
				if (param.strokeColor != undefined) {
					window.lastStrokeColor = p.strokeColor = param.strokeColor;
				}
				if (param.lineWidth != undefined) {
					window.lastLineWidth = p.lineWidth = param.lineWidth;
				}
				if (param.lineCap != undefined)
					p.lineCap = param.lineCap;
				if (param.lineJoin != undefined)
					p.lineJoin = param.lineJoin;
				if (param.smooth != undefined)
					p.smooth = param.smooth;
				if (param.alpha != undefined) {
                    if (isMiddleMode && tmUnit.animated && tmUnit.aniType == 'record_animation'){
                        if (frameId == 0 || (frameId == tmUnit.frameCount-1)){
                            b = 1;
                            p.alpha = param.alpha;

                            if (frameId == 0){
                                var tmpalpha = tmUnit.keyframes[tmUnit.keyframes.length-1].param.alpha;
                                for (var k=0;k<tmUnit.keyframes.length;k++){
                                    var tk = tmUnit.keyframes[k];
                                    tk.param.alpha = (tmpalpha-p.alpha) * (tk.id/tmUnit.keyframes[tmUnit.keyframes.length-1].id) + p.alpha;
                                }
                            }else{
                                var tmpalpha = tmUnit.keyframes[0].param.alpha;
                                for (var k=0;k<tmUnit.keyframes.length;k++){
                                    var tk = tmUnit.keyframes[k];
                                    tk.param.alpha = (p.alpha-tmpalpha) * (tk.id/tmUnit.keyframes[tmUnit.keyframes.length-1].id) + tmpalpha;
                                }
                            }
                        }else{
                            alert(Lang.M_LockedRecord);
                        }
                    }else{
                        b = 1;
                        p.alpha = param.alpha;
                    }
				}
				if (param.rotate != undefined) {
					b = 1;
					p.rotate = param.rotate * Hanimation.GRADUNIT;
				}
				
				//文字
				if (param.fontSize != undefined)
					p.fontSize = param.fontSize;
				if (param.fontStyle != undefined)
					p.fontStyle = param.fontStyle;
				if (param.fontWeight != undefined)
					p.fontWeight = param.fontWeight;
				if (param.fontFamily != undefined)
					p.fontFamily = param.fontFamily;
				if (param.textAlign != undefined)
					p.textAlign = param.textAlign;
				if (param.textVAlign != undefined)
					p.textVAlign = param.textVAlign;
				if (param.textContent != undefined)
					p.textContent = escape(param.textContent);
				if (param.textDecoration != undefined)
					p.textDecoration = param.textDecoration;
				
				//图像
				if (param.imageSrc != undefined) {
					p.imageSrc = param.imageSrc;
					var img = new Image();
					img.src = p.imageSrc;
					
					var imageSrcGuid;
					var obj = window.objSelect.getObjectAt(0);
					if (obj instanceof Hanimation.Picture) {
						imageSrcGuid = obj.dataRef.guid;
					}
					
					ImageCache.updateImage(imageSrcGuid, img);
				}
				
				if (param.name != undefined) {
					var re = setIdName(obj.dataRef.guid, param.name);
					if (re == 1)
						alert(Hanimation.Message.DuplicateName);
					else if (re == 0)
						p.name = param.name;
				}
				
				//位置
				var deltaX = 0;
				var deltaY = 0;
				var newW = curObj.getParam().width;
				var newH = curObj.getParam().height;
				var changePos = false;
				var changeSize = false;
				if (param.left != undefined) {
					b = 1;
					changePos = true;
					deltaX = param.xleft;
				}
				if (param.top != undefined) {
					b = 1;
					changePos = true;
					deltaY = param.xtop;
				}
				if (param.width != undefined) {
					b = 1;
					
					changeSize = true;
					newW = param.width;
				}
				if (param.height != undefined) {
					b = 1;
					
					changeSize = true;
					newH = param.height;
				}
				
				if (changePos)
					curObj.setPosition(deltaX, deltaY, true);
				
				if (changeSize)
					curObj.setSize(newW, newH);
				
				if (changePos || changeSize)
					updateKeyframe();
			}
		}
		
		this.redrawAll();
	},
	combineObjects : function (cmd) {
		combineObjects(cmd);
	},
	deleteObject : function () {
		deleteObject();
	},
	processGlassBoard : function (e) {
		var frameId = getClickFrameId(e);
		switch (this.movingGlassMode) {
		case 1: // Begin
			this.glassBefore = Math.max(1, window.currentFrame - frameId);
			break;
		case 2: // End
			this.glassAfter = Math.max(1, frameId - window.currentFrame);
			break;
		}
	},
	getBufferCanvas:function(id,width,height) {
		if(!id)id='bufferCanvas';
		var canvas=G(id);
		if(!canvas){
			canvas=document.createElement("canvas");
			canvas.id=id;
			canvas.style.visibility='hidden';
			document.body.appendChild(canvas);
		}
		if(!width)width=660;
		if(!height)height=440;
		canvas.width=width;
		canvas.height=height;
		canvas.style.width=width+'px';
		canvas.style.height=height+'px';
		return canvas;
	}
}

function setMenuStatus() {
	var len = getActiveObjectLength();
	var clip = !!Storage['clip'];
	var undo = Hedit.canUndo('HA_ST');
	var redo = Hedit.canRedo('HA_ST');
	var ungroup = canUngroup();
	
	MugedaUI.updateStatus(len, {
		clip : clip,
		undo : undo,
		redo : redo,
		ungroup : ungroup
	});
};

function getClickFrameId(e) {
	return 0;
};

function curveHitTest(event, pos) {
	var isShiftPressed = window.isShift || event.shiftKey;
	var isCtrlPressed = window.isCtrl || event.ctrlKey;
	var isAltPressed = window.isAlt || event.altKey;
	if (window.moveAfterDown || (window.activeCommand != Hanimation.SHAPE_NODE) || (!isCtrlPressed && !isAltPressed)) {
		if (/Cursor.png/.test(window.objCanvas.style.cursor))
			window.objCanvas.style.cursor = 'default';
		window.addpt = null;
		return;
	}
	
	var len = getActiveObjectLength();
	if (!len)
		return;
	var x = pos.x;
	var y = pos.y;
	var p;
	var q;
	var obj;
	var ary;
	var ret;
	var par;
	var that = this;
	clearTimeout(that.moving);
	that.moving = setTimeout(function () {
			for (var i = 0; i < len; i++) {
				obj = that.objSelect.getObjectAt(i);
				if (!obj)
					break;
				ary = obj.dataRef.curve.points;
				par = obj.getParam();
				o = Bezier.hitTest(x - par.left, y - par.top, ary);
				if (o && o.mode) {
					o.obj = obj;
					break;
				}
			}
			if (!o) {
				window.objCanvas.style.cursor = 'default';
				return
			};
			
			if (isCtrlPressed && o.mode == 2) {
				window.objCanvas.style.cursor = 'url(res/Append-Cursor.png), default';
			} else if (isAltPressed && o.mode == 1) {
				window.objCanvas.style.cursor = 'url(res/Remove-Cursor.png), default';
			} else {
				window.objCanvas.style.cursor = 'default';
			}
			window.addpt = o; //保存检测函数返回值
		}, 30);
};

function clickCurve(event) {
	var isShiftPressed = window.isShift || event.shiftKey;
	var isCtrlPressed = window.isCtrl || event.ctrlKey;
	var isAltPressed = window.isAlt || event.altKey;
	var that = this;
	var o = window.addpt; // 获取在mousemove函数中存储的结果
	window.addpt = null;
	if (!o || !o.mode)
		return; // 不在顶点也不在边界上，不做处理
	if (isCtrlPressed && o.mode == 2) { // 在边界上（在顶点上除外）
		Bezier.subDivision(o.curve, o.data, o.index); // 细分曲线
		toggleActiveObject(o.obj, true); //激活选中
		MugedaUI.redrawAll(); // 重新绘制
	} else if (isAltPressed) {
		// 在顶点上
		Bezier.removeVertex(o.index, o.curve); // 删除顶点
		MugedaUI.redrawAll(); // 重新绘制
	}
};

var getEventPosition = function (event, object) {
	var pos = Mugeda.getEventPosition(window.aniData, event, object);
	
	pos.x -= Hanimation.PADDING;
	pos.y -= Hanimation.PADDING;
	
	if (!window.lastPosition)
		lastPosition = new Object();
	lastPosition.x = pos.x;
	lastPosition.y = pos.y;
	
	return pos;
}
var getActiveObjectLength = function () {
	if (!window.objSelect && window.window.engineReady)
		window.objSelect = createNewObject(Hanimation.SHAPE_SELECT);
	
	if (window.objSelect)
		return window.objSelect.getActiveObjectLength();
	else
		return 0;
}

function clearSelection() {
	window.objSelect.clearSelection();
};

function isMaskOn() {
	
	return false;
}

function clearHighlight() {
	if (window.getSelection) {
		window.getSelection().removeAllRanges();
	} else if (document.selection) {
		document.selection.empty();
	}
}

function saveGetCanvasCtx(objCanvas) {
	var ctx = window.objCanvas.getContext('2d');
	
	ctx.save();
	var zoomInfo = Zoom.getZoomInfo(window.aniData, -1);
	ctx.translate(-zoomInfo.offsetLeft, -zoomInfo.offsetTop);
	
	return ctx;
};

function saveReleaseCanvasCtx(ctx) {
	if (ctx)
		ctx.restore();
};

function getEmptyLayers() {
	var layerid = 0;
	var layer = createLayer(layerid);
	var unit = createUnit(layerid);
	TimelineUnit.addKeyframe(unit, unit.frameStart);
    if (isMiddleMode)
        unit.frameCount = 12;
	layer.units.push(unit);
	return [layer];
};
function showPropTool(list, display){
    for (var i=0;i<list.length;i++){
        var tr = document.getElementById('tr_'+list[i]);
        tr.className = display;
        tr = document.getElementById('tip_'+list[i]);
        tr.className = display;
        tr.style.display = display ? 'none' : 'block';
        //console.log(tr.style.display);
    }
}
function setPropTools(objs){
    showPropTool(['font', 'fillinfo', 'stroke', 'thick', 'alpha'], 'hide');
    if (objs.getActiveObjectLength() <= 0) {return;}
    if (objs.getActiveObjectLength() > 1){showPropTool(['alpha'], ''); return;}
    switch(objs.getObjectAt(0).constructor){
        case Hanimation.Text:
            showPropTool(['font'], '');
        case Hanimation.Pencil:
        case Hanimation.BLine:
        case Hanimation.BRectangle:
        case Hanimation.BEllipse:
            showPropTool(['fillinfo', 'stroke', 'thick'], '');
        case Hanimation.Picture:
        case Hanimation.Group:
            showPropTool(['alpha'], '');
    }
}

function setFocusObjects(ctx) {
	if (!window.engineReady)
		return;
	
	if (window.objSelect == null) {
		window.objSelect = createNewObject(Hanimation.SHAPE_SELECT);
	}
	
	window.bufferData = ctx.getImageData(0, 0, window.objCanvas.width, window.objCanvas.height);
	
	var len = getActiveObjectLength();
	
	var rect;
	var object;
	
	var par = window.objSelect.getParam();
	
	par.left = Hanimation.MAX_VALUE;
	par.top = Hanimation.MAX_VALUE;
	par.right = Hanimation.MIN_VALUE;
	par.bottom = Hanimation.MIN_VALUE;
	
	for (var i = 0; i < len; i++) {
		object = window.objSelect.getObjectAt(i);
		
		var frameId = object.frameId;
		var layerId = object.layerId;
		var tmUnit = getTimelineUnit(layerId, frameId);
		if (tmUnit && (tmUnit.frameStart > window.currentFrame || tmUnit.frameStart + tmUnit.frameCount - 1 < window.currentFrame)) {
			// As long as there is at least one object is not in current frame, de-select all objects and quit.
			clearSelection();
			break;
		}
		
		if (window.playStatus != Hanimation.PLAYING) {
			if (window.activeCommand == Hanimation.SHAPE_SELECT) {
				object.drawHighlight(ctx);
				if (len == 1) {
					object.drawFillControls(ctx);
				}
			} else if (window.activeCommand == Hanimation.SHAPE_NODE)
				object.drawControls(ctx);
			else {
				if (len > 1 && !MugedaUI.istouch)
					object.drawControls(ctx);
				rect = object.getBoundRect(len > 1 ? false : true);
				window.objSelect.updateBound(rect.left, rect.top);
				window.objSelect.updateBound(rect.right, rect.bottom);
			}
		}
	}
	window.objSelect.updateRotationParams();
	
	if (window.playStatus != Hanimation.PLAYING && window.activeCommand == Hanimation.SHAPE_SCALE && len > 0) {
		if (window.objSelect.hasRotation && len > 1)
			window.objSelect.drawHighlight(ctx);
		else
			window.objSelect.draw(ctx, 0);
	}
	
	onGetProperties();
};

function aniDataIsChange() {
	if (window.notSaveChanges)
		return;
	shortNumber(window.aniLayers);
	if (window.aniData.layers.length == 0)
		window.aniData.layers = getEmptyLayers();
	var data = JSON.stringify(window.aniData);
	if (data == window.aniDataLast)
		return;
	if (window.aniDataLast)
		updateProptiesPanel(window.aniData, JSON.parse(window.aniDataLast));
	Hedit.registerOp('HA_ST', "[" + JSON.stringify(getSelectGuidArray()) + "," + data + "]");
	window.aniDataLast = data;
};
window.aniDataIsChange = aniDataIsChange;

function undoObject() {
	redoObject(true);
};

function redoObject(isUndo) {
	var data = Hedit[isUndo ? 'undoOp' : 'redoOp']('HA_ST');
	if (!data)
		return;
	if (isUndo && window.isEditSymbol && !window.isEditGroup && data[1].symbols.length == 0) {
		redoObject();
		return;
	}
	window.notSaveChanges = true;
	window.aniData = data[1];
	
	var layers;
	if (window.isEditSymbol) {
		if (window.aniData.symLayers) {
			layers = window.aniData.symLayers;
		} else {
			layers = window.aniData.layers;
		}
	} else {
		layers = window.aniData.layers;
	}
	window.prevZoomInfo = null;
	clearSelection();
	window.aniLayers = buildLayers(layers);
    if (isMiddleMode){
        for (var i=0;i<layers.length;i++){
            for (var j=0;j<layers[i].units.length;j++){
                updateAnimationPath(layers[i][j]);
            }
        }
    }

	MugedaUI.setStageSize();
	MugedaUI.resetGround();
	
	setSelection(data[0]);
	updateTimeline();
	MugedaUI.redrawAll();
	window.aniDataLast = JSON.stringify(window.aniData);
	window.notSaveChanges = false;
	if (isUndo)
		setMenuStatus();
};

function updateTimeline(cursorFlag) {
    if (isMiddleMode){
        window.cTimeline.updateTimeline(cursorFlag);
    }else{
	    MTimeline.updateTimeline();
    }
};

function shortNumber(data) {
	for (var k in data) {
		var c = data[k];
		if (typeof(c) == 'object') {
			arguments.callee(c);
		} else if (typeof(c) == 'number' && /\./.test(c)) {
			data[k] = parseFloat(c.toFixed(2));
		}
	}
};

function updateProptiesPanel(anidata1, anidata2) {
	if (!anidata1 || !anidata2)
		return;
	var a1 = anidata1.layers;
	var a2 = anidata2.layers;
	if (!a1 || !a2 || !a1.length || !a2.length)
		return;
	a1 = a1[0].units;
	a2 = a2[0].units;
	if (!a1.length || !a2.length)
		return;
	a1 = a1[0].objects;
	a2 = a2[0].objects;
	if (a1.length != a2.length)
		return;
	var b;
	var ap = 'left,right,top,bottom'.split(',');
	for (var i = 0; i < a1.length; i++) {
		for (var j = 0; j < ap.length; j++) {
			if (a1[i].param[ap[j]] != a2[i].param[ap[j]]) {
				b = 1;
				break;
			}
		}
		if (b)
			break;
	}
	if (b)
		onGetProperties(true);
};

function onGetProperties(ischange) {
	var len = getActiveObjectLength();
	if (len == 0) {
		if (window.isEditSymbol)
			return;
		window.lastPropArray = '';
		window.selectParams = window.aniData;
		MugedaUI.updateParam('canvas', window.aniData);
		return;
	}
	var obj;
	var arr = [];
	var showSmooth = len ? true : false;
	
	if (window.activeCommand == Hanimation.SHAPE_PENCIL)
		showSmooth = true;
	
	for (var i = 0; i < len; i++) {
		var o = window.objSelect.getObjectAt(i);
		if (i == 0)
			obj = o;
		if (o.dataRef.type != Hanimation.SHAPE_PENCIL)
			showSmooth = false;
		arr.push(window.objSelect.getObjectAt(i).dataRef.guid);
	}
	arr = JSON.stringify(arr.sort());
	if (!ischange && arr == window.lastPropArray)
		return;
	window.lastPropArray = arr;
	
	var type = 'shape';
	switch (obj.dataRef.type) {
	case Hanimation.SHAPE_TEXT:
		type = 'text';
		break;
	case Hanimation.SHAPE_PICTURE:
		type = 'image';
		break;
	case Hanimation.SHAPE_GROUP:
		type = 'group';
		break;
	case Hanimation.SHAPE_CAMERA:
		type = 'camera';
		break;
	case Hanimation.SHAPE_PATH:
		type = 'path';
		break;
	case Hanimation.SHAPE_CLIP:
		type = 'instance';
		break;
	}
	
	var params = [];
	window.dataParams = [];
	
	for (var i = 0; i < len; i++) {
		var param = null;
		var data = window.objSelect.getObjectAt(i).dataRef;
		var tmUnit = getUnit(window.currentLayer, window.currentFrame);
		if (tmUnit && tmUnit.animated) {
			var keyUnit = TimelineUnit.getKeyframe(tmUnit, window.currentFrame);
			window.dataParams[i] = data.param;
			if (keyUnit) {
				param = keyUnit.param;
			}
		}
		if (!param) {
			param = data.param;
			window.dataParams[i] = data.param;
		}
		
		if (data.param && data.param.action)
			param.action = data.param.action;
		if (data.param && data.param.url)
			param.url = data.param.url;
		if (data.param && data.param.form)
			param.form = data.param.form;
		if (data.param && data.param.behavior)
			param.behavior = data.param.behavior;
		
		params.push(param);
	}
	
	var param = getPropParam(params);
	window.selectParams = params;
	window.regionParam = JSON.clone(param);
	
	MugedaUI.updateParam(type, param);
}

function getPropParam(params) {
	if (!params || !params.length)
		return createParam();
	var param = JSON.clone(params[0]);
	var c;
	var p;
	var o = {
		left : [param.left],
		top : [param.top],
		right : [param.right],
		bottom : [param.bottom],
		width : [param.width],
		height : [param.height]
	};
	for (var k in param) {
		c = JSON.stringify(param[k]);
		for (var i = 1; i < params.length; i++) {
			p = params[i][k];
			if (/^(left|top|right|bottom|width|height)$/.test(k)) {
				o[k].push(p);
				continue;
			} else if (k != 'fillInfo' && JSON.stringify(p) != c) {
				delete(param[k]);
				break;
			}
		}
	}
	param.left = Math.min.apply(Math, o.left);
	param.top = Math.min.apply(Math, o.top);
	param.right = Math.max.apply(Math, o.right);
	param.bottom = Math.max.apply(Math, o.bottom);
	param.width = param.right - param.left;
	param.height = param.bottom - param.top;
	
	if (params.length == 1 && 　params[0].name)
		param.name = params[0].name;
	
	return param;
};

function getSelectGuidArray() {
	var ret = [];
	var len = getActiveObjectLength();
	for (var i = 0; i < len; i++) {
		var object = window.objSelect.getObjectAt(i);
		ret.push(object.dataRef.guid);
	}
	return ret;
};

function processCommand(command) {
	finishPreviousDraw();
	var updateCommand = false;
	var needRedraw = false;
	
	if (Hanimation[command]) {
		command = Hanimation[command];
	}
	
	switch (command) {
	case 'COMMAND_Forward':
	case 'COMMAND_Backward':
	case 'COMMAND_Front':
	case 'COMMAND_Back':
	case 'COMMAND_Left':
	case 'COMMAND_Right':
	case 'COMMAND_Top':
	case 'COMMAND_Bottom':
	case 'COMMAND_HorizontalCenter':
	case 'COMMAND_VerticalCenter':
	case 'COMMAND_DistributeWidths':
	case 'COMMAND_DistributeHeights':
	case 'COMMAND_FlipHorizontal':
	case 'COMMAND_FlipVertical':
		needRedraw = true;
		arrangeObject[command.split('_')[1]]();
		break;
		
	case Hanimation.COMMAND_HIDE_LAYER:
	case Hanimation.COMMAND_LOCK_LAYER:
		return;
	case Hanimation.COMMAND_NEW:
		top.location.reload();
		break;
	case Hanimation.COMMAND_DELETE:
	case Hanimation.COMMAND_DELETE_OBJECT:
		deleteObject();
		break;
	case Hanimation.COMMAND_UNION:
	case Hanimation.COMMAND_JOINT:
	case Hanimation.COMMAND_DIFF:
		combineObjects(command);
		break;
	case Hanimation.COMMAND_UP_LAYER:
		upLayer();
		break;
	case Hanimation.COMMAND_DOWN_LAYER:
		downLayer();
		break;
	case Hanimation.COMMAND_ADD_LAYER:
		createNewLayer( - 1, true);
		break;
	case Hanimation.COMMAND_DELETE_LAYER:
		if (!confirm(Hanimation.Message.ConfirmLayerDeletion))
			return;
		deleteLayer();
		break;
	case Hanimation.COMMAND_TRANS_LAYER:
		toggleGlassBoard();
		break;
	case Hanimation.COMMAND_CAMERA:
		toggleCamera();
		break;
	case Hanimation.COMMAND_CONVERT_MASK:
		convertToMask();
		break;
	case Hanimation.COMMAND_ADD_MASK:
		addToMask();
		break;
	case Hanimation.COMMAND_SWAP_MASK:
		swapMask();
		break;
	case Hanimation.COMMAND_INSERT_FRAME:
		insertFrames();
		break;
	case Hanimation.COMMAND_DELETE_FRAME:
		removeFrames();
		break;
	case Hanimation.COMMAND_INSERT_ANIMATION:
		toggleAnimations(true);
		break;
	case Hanimation.COMMAND_DELETE_ANIMATION:
		toggleAnimations(false);
		break;
	case Hanimation.COMMAND_INSERT_PROGRESS:
		toggleProgresses(true);
		break;
	case Hanimation.COMMAND_DELETE_PROGRESS:
		toggleProgresses(false);
		break;
	case Hanimation.COMMAND_INSERT_KEYFRAME:
		insertKeyFrames();
		break;
	case Hanimation.COMMAND_CLEAR_KEYFRAME:
		clearKeyframes();
		break;
	case Hanimation.COMMAND_INSERT_CAMERA:
		insertCameraPosition();
		break;
	case Hanimation.COMMAND_DELETE_CAMERA:
		deleteCameraPosition();
		break;
	case Hanimation.COMMAND_DISPLAY_CAMERA:
		toggleCameraDisplay();
		break;
	case Hanimation.COMMAND_DISPLAY_PATH:
		toggleDisplayPath();
		break;
	case Hanimation.COMMAND_CUSTOMIZE_PATH:
		toggleCustomPath();
		break;
	case Hanimation.COMMAND_DELETE_KEYFRAME:
		deleteKeyframe();
		break;
	case Hanimation.COMMAND_COPY_KEYFRAME:
		copyKeyframe();
		break;
	case Hanimation.COMMAND_PASTE_KEYFRAME:
		pasteKeyframe();
		break;
	case Hanimation.COMMAND_COPY_FRAMES:
		copyFrames();
		break;
	case Hanimation.COMMAND_CUT_FRAMES:
		cutFrames();
		break;
	case Hanimation.COMMAND_PASTE_FRAMES:
		pasteFrames();
		break;
	case Hanimation.COMMAND_PLAY:
		play();
		break;
	case Hanimation.COMMAND_PAUSE:
		pause();
		break;
	case Hanimation.COMMAND_PREVIEW:
		updateScript();
		preview();
		break;
	case Hanimation.COMMAND_STOP:
		stop();
		break;
	case Hanimation.COMMAND_LOOP:
		loop();
		break;
	case Hanimation.COMMAND_TIMELINE:
		WinTimeline.swap();
		break;
	case Hanimation.COMMAND_HELP:
		window.open('mugeda_cheat_sheet.pdf');
		break;
	case Hanimation.SHAPE_PROPERTY:
		WinProp.swap();
		break;
	case Hanimation.COMMAND_TRACK_ANCHORS:
		trackAnchors();
		break;

    case Hanimation.SHAPE_TEXT:
    case Hanimation.SHAPE_PENCIL:
    case Hanimation.SHAPE_LINE:
    case Hanimation.SHAPE_RECTANGLE:
    case Hanimation.SHAPE_ELLIPSE:
    case Hanimation.SHAPE_PICTURE:
	case Hanimation.SHAPE_CURVE:
	case Hanimation.SHAPE_SPLINE:
    case Hanimation.SHAPE_POLYGON:
    case Hanimation.SHAPE_ROUNDED:
    case Hanimation.SHAPE_AUDIO:
        showPropTool(['fillinfo', 'stroke', 'thick', 'alpha'], '');
        showPropTool(['font'], 'hide');
		if (window.objCanvas) {
			window.objCanvas.className = "canvasDraw";
			window.objCanvas.style.cursor = "crosshair";
		}
		
		updateCommand = true;
		if (command == Hanimation.SHAPE_PICTURE) {
			commandPicture();
		} else if (command == Hanimation.SHAPE_AUDIO) {
			importAudio();
		}
		break;
	case Hanimation.COMMAND_OPEN:
		WinWorks.show();
		break;
	case Hanimation.COMMAND_IMPORT:
		WinImport.show();
		break;
	case Hanimation.COMMAND_SAVEAS:
		saveasWork();
		break;
	case Hanimation.COMMAND_SAVE:
		saveWork();
		break;
	case Hanimation.COMMAND_GROUP:
		groupObjects();
		break;
	case Hanimation.COMMAND_UNGROUP:
		ungroupObjects();
		break;
	case Hanimation.COMMAND_REGROUP:
		regroupObjects(true);
		break;
	case Hanimation.COMMAND_EDITGROUP:
		editGroup();
		break;
	case Hanimation.COMMAND_EXPORTANIMATION:
		_exportAnimation(3);
		break;
	case 8065:
	case 9065:
		convertToSymbol();
		break;
	case Hanimation.COMMAND_CUT:
		cutObject();
		break;
	case Hanimation.COMMAND_COPY:
		copyObject();
		break;
	case Hanimation.COMMAND_PASTE:
		pasteObject();
		break;
	case Hanimation.COMMAND_LOCK:
		lockObjects();
		break;
	case Hanimation.COMMAND_UNLOCKALL:
		unlockAllObjects();
		break;		
	case Hanimation.COMMAND_UNDO:
		undoObject();
		break;
	case Hanimation.COMMAND_REDO:
		redoObject();
		break;
	case Hanimation.SHAPE_SELECT:
	case Hanimation.SHAPE_NODE:
	case Hanimation.SHAPE_SCALE:
		window.objCanvas.className = "canvasNormal";
		window.objCanvas.style.cursor = "default";
        setPropTools(window.objSelect);
		updateCommand = true;
		if (window.objSelect) {
			if (command == Hanimation.SHAPE_SELECT)
				window.objSelect.setFocusMode(Hanimation.FM_EDIT);
			else if (command == Hanimation.SHAPE_SCALE)
				window.objSelect.setFocusMode(Hanimation.FM_SCALE);
			else if (command == Hanimation.SHAPE_NODE)
				window.objSelect.setFocusMode(Hanimation.FM_NODE);
		}
		
		needRedraw = true;
		break;
	case Hanimation.SHAPE_ZOOM:
		window.objCanvas.className = "canvasZoom";
		
		updateCommand = true;
		break;
	default:
		if (window.objCanvas)
			window.objCanvas.className = "canvasNormal";
		break;
	}
	
	if (updateCommand) {
		window.activeCommand = command;
	}
	
	if (needRedraw) {
		window.objSelect.setFinished(0, 0);
		MugedaUI.redrawAll();
	}
	
};

function finishPreviousDraw(mode) {
	var len = getActiveObjectLength();
	var activeObject = len == 1 ? window.objSelect.getObjectAt(0) : null;
	
	if (activeObject && window.isDrawing) {
		activeObject.setFinished();
		window.isDrawing = false;
		
		if (activeObject.isValid()) {
			addCanvasObject(activeObject);
			this.prevObject = activeObject;
		}
		
		// clearSelection();
		MugedaUI.redrawAll();
	}
};

function invalidateRegion(ctx, objects, mode) {
	var len = objects ? objects.length : 0;
	var needInValidate = false;
	for (var i = 0; i < len; i++) {
		var obj = objects[i];
		if (obj.needInvalidate(mode)) {
			needInValidate = true;
			break;
		}
	}
	
	if (objects == null || needInValidate)
		ctx.putImageData(window.bufferData, 0, 0);
	
}

function updateActiveNodes(left, top, right, bottom, mode) {
	var len = getActiveObjectLength();
	var activeObject = len == 1 ? window.objSelect.getObjectAt(0) : null;
	
	var force = mode & 8;
	var numNodes = 0;
	if (activeObject && (force || window.isDrawing)) {
		numNodes = activeObject.updateActiveNodes(left, top, right, bottom, mode);
	}
	
	return numNodes;
}

function updateActiveObjects(left, top, right, bottom, mode) {
	var hitRe = Mugeda.hitTest(window.aniLayers, this.currentLayer, this.currentFrame, left, top, 0);
	if (hitRe.object) {
		this.currentLayer = hitRe.layer;
		setActiveLayer();
	}
	
	var activeObject = hitRe.object;
	
	var layerid = this.currentLayer;
	var frameid = this.currentFrame;
	var len = this.aniLayers.length;
	var layer;
	var unitCount = 0;
	var objCount = 0;
	var tmUnit;
	var object;
	var obj;
	var par;
	var crossed;
	var done = false;
	var found = false;
	var foundCount = 0;
	this.isPath = false;
	
	// Camera has the highest priority to be selected
	var canvasZoom = Zoom.getZoomInfo(this.aniData, -1);
	if (!window.isEditSymbol && this.displayCamera && this.objCamera && Math.abs(canvasZoom.zoomLevel - 1.) < 0.001) {
		var zoomInfo = Zoom.getZoomInfo(this.aniData, this.currentFrame, 2);
		if (zoomInfo) {
			found = objectHittest(this.objCamera, left, top, right, bottom, mode);
			if (found) {
				toggleActiveObject(this.objCamera);
				this.objSelect.setAspectRatio(true);
				// this.objSelect.enableRotation(false);
				// Search no more
				return;
			}
		}
	}
	
	var selLayerIdx = -1;
	this.objSelect.setAspectRatio(false);
	this.objSelect.enableRotation(true);
	for (var i = 0; i < len && !done; i++) {
		layer = this.aniLayers[i];
		if (layer.hide || layer.lock)
			continue;
		
		unitCount = layer.units.length;
		
		for (var j = 0; j < unitCount && !done; j++) {
			tmUnit = layer.units[j];
			if (!(frameid >= tmUnit.frameStart && frameid < tmUnit.frameStart + tmUnit.frameCount))
				continue;
			
			objCount = tmUnit.objects.length;
			for (var k = objCount; k >= 0 && !done; k--) {
				
				this.isPath = false;
				if (k == objCount && tmUnit.animated && tmUnit.displayPath && tmUnit.pathMode) {
					// Animation path has a higher priority to be selected
					object = getPathObject(tmUnit);
					if (!object)
						continue;
					else
						this.isPath = true;
				} else if (k == objCount)
					continue;
				else {
					obj = tmUnit.objects[k];
					object = getAniObject(obj);
				}
				
				found = objectHittest(object, left, top, right, bottom, mode);
				if (found) {
					if (this.isPath) {
						// When an animation path is selected, clear any current selection. And search no more.
						clearSelection();
						done = true;
					}
					
					foundCount++;
					toggleActiveObject(object);
					
					selLayerIdx = i;
					
					if (mode == 1)
						done = true;
				}
			}
		}
	}
	
	if (foundCount == 1) {
		this.currentLayer = selLayerIdx;
		setActiveLayer(4);
	}
	
	if (!foundCount)
		clearSelection();
};

function checkObjectConversion() {
	var len = getActiveObjectLength();
	var needConvert = false;
	var isScale = this.objSelect.focusMode == Hanimation.FM_SCALE;
	for (var i = 0; i < len; i++) {
		var activeObject = this.objSelect.getObjectAt(i);
		if (!activeObject.supportFreeTransform() && isScale) {
			needConvert = true;
			break;
		}
	}
	
	return needConvert;
};

function toggleActiveObject(object, isadd) {
	var len = getActiveObjectLength();
	
	var pos = null;
	var curObj = null;
	var add = true;
	for (var i = 0; i < len; i++) {
		curObj = this.objSelect.getObjectAt(i);
		if (curObj == object) {
			add = false;
			this.objSelect.removeObjectAt(i);
		}
	}
	if (!object.locked && (add || isadd))
		this.objSelect.addObject(object);
	
	var len = getActiveObjectLength();
	
	// Update selection mode
	this.objSelect.hasRotation = false;
	for (var i = 0; i < len; i++) {
		curObj = this.objSelect.getObjectAt(i);
		var param = curObj.getParam();
		if (Math.abs(param.rotate) > 0.001) {
			this.objSelect.hasRotation = true;
			break;
		}
	}
};
function addCanvasObject(object) {
	addObject(this.currentLayer, this.currentFrame, object);
};

function addObject(layerid, frameid, object, tmUnit) {
	if (isMiddleMode){
        if (!tmUnit)
            tmUnit = getUnit(layerid, frameid);
        if (!tmUnit || !tmUnit.visible)
        //[dk647] NOW
        // return;
            insertKeyFrame(layerid, frameid);
        tmUnit = getUnit(layerid, frameid);
        //tmUnit = createUnit(layerid, frameid, 1);
        //units.push(tmUnit);
        if (!tmUnit || !tmUnit.visible){
            return;
        }
        // TODO: NOT for animated unit
        if (tmUnit) {
            if (!TimelineUnit.addObject(tmUnit, object))
                return;
            // object.setLayerFrame(layerid, frameid);
            window.cTimeline._setCurrentUnitId(getUnitId(layerid, frameid));
            window.cTimeline.addUnit();
            setKeyframeStatus(layerid, tmUnit.frameStart, 1);

            //g_aniObj[object.dataRef.guid] = object;
        }
    }else{
        if (!tmUnit)
            tmUnit = getTimelineUnit(layerid, frameid);
        if (!tmUnit)
            return;

        // TODO: NOT for animated unit
        if (tmUnit) {
            if (!TimelineUnit.addObject(tmUnit, object))
                return;
            // object.setLayerFrame(layerid, frameid);

            setKeyframeStatus(layerid, tmUnit.frameStart, 1);

            // g_aniObj[object.dataRef.guid] = object;
        }
    }
};

function getTimelineUnit(layerid, frameid) {
	var object = null;
	var len = this.aniLayers.length;
	//if (layerid < 0 || layerid >= len) return null;
	
	var layer = getLayerObj(layerid);
	if (!layer || !layer.units)
		return null;
	
	len = layer.units.length;
	var frames = null;
	var tmUnit;
	
	for (var i = 0; i < len; i++) {
		tmUnit = layer.units[i];
		if (tmUnit && frameid >= tmUnit.frameStart && frameid < tmUnit.frameStart + tmUnit.frameCount) {
			object = tmUnit;
			break;
		}
	}
	
	return object;
};

function getLayerObj(layerid) {
	var layers = this.aniLayers;
	for (var i = layers.length - 1; i >= 0; i--) {
		if (layers[i].id == layerid)
			return layers[i];
	}
};

function setKeyframeStatus(layerid, frameid, status) {};

function setActiveLayer(mode, noUpdateFrame) {};

function objectHittest(object, left, top, right, bottom, mode) {
	if(object.locked)
			return false;
			
	par = object.getParam();
	var aryFirst = [];
	
	var found = false;
	if (Math.abs(par.rotate) > 0.001) {
		var center = object.getRotationCenter();
		var centerX = center.x;
		var centerY = center.y;
		var ptLT = rotatePoint(centerX, centerY, left, top, -par.rotate);
		var ptRB = rotatePoint(centerX, centerY, right, bottom, -par.rotate)
			aryFirst.push(createTriPoint(ptLT.x, ptLT.y, ptLT.x, ptLT.y, ptLT.x, ptLT.y));
		aryFirst.push(createTriPoint(ptRB.x, ptLT.y, ptRB.x, ptLT.y, ptRB.x, ptLT.y));
		aryFirst.push(createTriPoint(ptRB.x, ptRB.y, ptRB.x, ptRB.y, ptRB.x, ptRB.y));
		aryFirst.push(createTriPoint(ptLT.x, ptRB.y, ptLT.x, ptRB.y, ptLT.x, ptRB.y));
	} else {
		aryFirst.push(createTriPoint(left, top, left, top, left, top));
		aryFirst.push(createTriPoint(right, top, right, top, right, top));
		aryFirst.push(createTriPoint(right, bottom, right, bottom, right, bottom));
		aryFirst.push(createTriPoint(left, bottom, left, bottom, left, bottom));
	}
	
	var arySecond = [];
	
	var useBezier = object.dataRef.type != Hanimation.SHAPE_PICTURE &&
		object.dataRef.type != Hanimation.SHAPE_SPLINE &&
		object.dataRef.type != Hanimation.SHAPE_TEXT && !MugedaUI.istouch;
	if (object.dataRef.curve &&
		object.dataRef.curve.points &&
		object.dataRef.curve.points.length > 0 && useBezier) {
		var count = object.dataRef.curve.points.length;
		var pt;
		for (var l = 0; l < count; l++) {
			pt = createTriPoint();
			TriPoint.copy(pt, object.dataRef.curve.points[l]);
			TriPoint.offset(pt, par.left, par.top);
			arySecond.push(pt);
		}
	} else {
		arySecond.push(createTriPoint(par.left, par.top, par.left, par.top, par.left, par.top));
		arySecond.push(createTriPoint(par.right, par.top, par.right, par.top, par.right, par.top));
		arySecond.push(createTriPoint(par.right, par.bottom, par.right, par.bottom, par.right, par.bottom));
		arySecond.push(createTriPoint(par.left, par.bottom, par.left, par.bottom, par.left, par.bottom));
	}
	
	var status = isCurveCrossing(aryFirst, arySecond);
	var iscross = false;
	if (status == 0 || (status == 3 && useBezier))
		iscross = Bezier.isCross(aryFirst, arySecond);
	if (status == 1 || status == 2 || iscross || (!useBezier && status == 3))
		// crossed = Hanimation.RectCrossTest(left, top, right, bottom, par.left, par.top, par.right, par.bottom);
		// if(crossed)
	{
		found = true;
	}
	
	return found;
}

function updateKeyframe(layerid, frameid, addKeyframe) {
	var layerid = (layerid == undefined || layerid < 0) ? getLayerID(this.currentLayer) : layerid;
	var frameid = (frameid == undefined || layerid < 0) ? this.currentFrame : frameid;
	// var layerId = getLayerID(layeridx);
	
	var tmUnit = getTimelineUnit(layerid, frameid);
	
	if (tmUnit && tmUnit.animated) {
		var object = tmUnit.objects[0];
		var keyframe = TimelineUnit.findKeyframe(tmUnit, frameid);
		
		if (!keyframe && addKeyframe) {
			keyframe = TimelineUnit.addKeyframe(tmUnit, frameid);
			updateTimeline();
		}
		if (keyframe && object.type == Hanimation.SHAPE_GROUP) {
			Param.exchange(keyframe.param, object.param, false);
		}
		
		if (this.isPath)
			tmUnit.pathMode = 3;
		else if (tmUnit.pathMode == 1 || tmUnit.pathMode == 3) // Switch the stage machine
			tmUnit.pathMode = 2;
		
		updateAnimationPath(tmUnit);
	} else if (tmUnit.pg) {
		var len = tmUnit.objects.length;
		for (var i = 0; i < len; i++) {
			var objData = tmUnit.objects[i];
			obj = getAniObject(objData);
			if (obj.anchorParam && (obj.progressMode == 4 || obj.progressMode == 5)) {
				Param.exchange(obj.anchorParam, objData.param, false);
			}
		}
	}
};

function updateSelectedKeyframes(addKeyframe) {
	var len = getActiveObjectLength();
	for (var i = len - 1; i >= 0; i--) {
		var curObj = this.objSelect.getObjectAt(i);
		if (curObj) {
			var layerId = curObj.layerId;
			var frameId = this.currentFrame; // curObj.frameId;
			updateKeyframe(layerId, frameId, addKeyframe);
		}
	}
};

function getTriPoints() {
	var obj;
	var ary;
	var ret = [];
	var len = getActiveObjectLength();
	var invalid = false;
	for (var i = 0; i < len; i++) {
		obj = this.objSelect.getObjectAt(i);
		ary = obj.dataRef.curve.points.slice(0);
		par = obj.getParam();
		if (ary.length > 0) {
			for (var j = 0; j < ary.length; j++)
				TriPoint.offset(ary[j], par.left, par.top);
			
			ret.push(ary);
		} else {
			invalid = true;
			break;
		}
		
	}
	return invalid ? null : ret;
};

function getObjectsLayer() {
	var len = getActiveObjectLength();
	if (len < 2)
		return;
	
	var layerId = -1;
	var frameId = -1;
	var crossLayers = false;
	
	var curObj = null;
	for (var i = 0; i < len; i++) {
		curObj = this.objSelect.getObjectAt(i);
		if (layerId == -1)
			layerId = curObj.layerId;
		else if (curObj.layerId != layerId) {
			// Selected objects are located at different layers
			crossLayers = true;
			break;
		}
		
		if (frameId == -1)
			frameId = curObj.frameId;
		else if (frameId != curObj.frameId) {
			// Selected objects are located at different layers
			crossLayers = true;
			break;
		}
	}
	
	return {
		'cross' : crossLayers,
		'layerid' : layerId,
		'frameid' : frameId
	};
}

function combineObjects(command) {
	
	var re = getObjectsLayer();
	if (!re)
		return;
	
	var layerId = re.layerid;
	var frameId = re.frameid;
	var crossLayers = re.cross;
	
	// Only group objects on the same layers
	if (crossLayers) {
		alert(Hanimation.Message.CombineError);
		return;
	}
	
	var type = 1;
	switch (command) {
	case Hanimation.COMMAND_UNION:
		type = 1;
		break;
	case Hanimation.COMMAND_JOINT:
		type = 2;
		break;
	case Hanimation.COMMAND_DIFF:
		type = 3;
		break;
	}
	
	// var layerId = getLayerIndex(this.currentLayer);
	var layerId = this.currentLayer;
	var frameId = this.currentFrame;
	var tmUnit = null;
	var lenObj = getActiveObjectLength();
	var ret = [];
	
	if (lenObj > 0) {
		var param = JSON.parse(JSON.stringify(this.objSelect.getObjectAt(lenObj - 1).getParam()));
		
		var re = getTriPoints();
		if (re) {
			ret = Bezier.mergeCurves(re, type);
			deleteObject(false);
			
			for (var i = 0; i < ret.length; i++) {
				var obj = createNewObject(Hanimation.SHAPE_CURVE);
				obj.dataRef.param.fillInfo = param.fillInfo;
				obj.dataRef.param.lineWidth = param.lineWidth;
				obj.dataRef.param.strokeColor = param.strokeColor;
				obj.dataRef.param.alpha = param.alpha;
				
				obj.addPoints(ret[i], true);
				addObject(layerId, frameId, obj);
				toggleActiveObject(obj);
			}
			
			MugedaUI.redrawAll();
		} else {
			alert(Hanimation.Message.InvalidCurve);
		}
	}
}

function deleteObject(redraw) {
	var redraw = typeof redraw == "undefined" ? true : redraw;
	var frameId = this.currentFrame;
	var tmUnit = null;
	var len = getActiveObjectLength();
	for (var i = 0; i < len; i++) {
		object = this.objSelect.getObjectAt(i);
		var layerIdx = window.currentLayer;
		tmUnit = getTimelineUnit(object.layerId, object.frameId);
		
		if (tmUnit) {
			if (tmUnit.animated) {
				if (!confirm(Hanimation.Message.DelObjWithAnimation))
					continue;
				if (isMiddleMode)
                    window.cTimeline.deleteRecordAnimation();
				toggleAnimation(layerIdx, object.frameId, false);
			}
			
			var objCount = tmUnit.objects.length;
			for (var k = objCount - 1; k >= 0; k--) {
				var objSeed = getAniObject(tmUnit.objects[k]);
				if (objSeed == object) {
					tmUnit.objects.splice(k, 1);
					if (tmUnit.objects.length == 0)
						setKeyframeStatus(object.layerId, tmUnit.frameStart, 0);
				}
			}
		}
	}
	
	clearSelection();
	
	if (redraw)
		MugedaUI.redrawAll();
};

function lockObjects() {
    var arr = [];
    var len = getActiveObjectLength();
    for (var i=len-1;i>=0;i--){
        var obj = this.objSelect.getObjectAt(i);
        obj.locked = true;
        toggleActiveObject(obj);
    }
    
    MugedaUI.redrawAll();
};

function unlockAllObjects() {
    function unlockLayers(layers)
    {
        // Adjust objects
        var aryLayers=layers;
        var layerLen = aryLayers.length;
        for (var i = 0; i < layerLen; i++) {
            var layer = aryLayers[i];            
            var units = aryLayers[i].units;
            var unitLen = units.length;
            
            for (var j = 0; j < unitLen; j++) {
                var objUnit = units[j];
                var objects = objUnit.objects;
                var objLen = objects.length;
                
                for (var k = 0; k < objLen; k++) {
                    var objdata = objects[k];
                    var object = getAniObject(objdata);
                    object.locked = false; 
                }
            }
        }
    }
    
    unlockLayers(aniData.layers);
    for(var k=0;k<aniData.symbols.length;k++)
    {
        unlockLayers(aniData.symbols[k].layers);
    }
        
    MugedaUI.redrawAll();
};
	
function copyObject() {
	var arr = [];
	var len = getActiveObjectLength();
	for (var i = 0; i < len; i++) {
		arr.push(this.objSelect.getObjectAt(i).dataRef);
	}
	Storage['clip'] = arr.length ? JSON.stringify(arr) : "";
	setMenuStatus();
	
	this.mugeda_copy_counter = 0; 
};

function cutObject() {
	var layerId = getLayerID(this.currentLayer);
	var frameId = this.currentFrame;
	var tmUnit = getTimelineUnit(layerId, frameId);
	var obj;
	var arr = [];
	var len = getActiveObjectLength();
	var objs = tmUnit.objects;
	for (var i = objs.length - 1; i >= 0; i--) {
		for (var j = 0; j < len; j++) {
			obj = this.objSelect.getObjectAt(j);
			if (obj.dataRef == objs[i]) {
				objs.splice(i, 1);
				arr.push(obj);
			}
			
			if (objs.length == 0)
				// No more object. Toggle animation
				toggleAnimation(this.currentLayer, this.currentFrame, false);
		}
	}
	Storage['clip'] = arr.length ? JSON.stringify(arr) : "";
	Storage['iscut'] = 1;
	clearSelection();
	updateTimeline();
	MugedaUI.redrawAll();
	
	this.mugeda_copy_counter = -1; 
};

function pasteObject() {
	var arr = json(Storage['clip']);
	if (!arr)
		return;
	
	var layerId = getLayerID(this.currentLayer);
	var frameId = this.currentFrame;
	var tmUnit = getTimelineUnit(layerId, frameId);
	if (!tmUnit)
		return;
	var iscut = Storage['iscut'] == 1;
	if (!iscut)
		arr = sortObjects(arr);
	
	clearSelection();
	
	if (iscut) {
		Storage['iscut'] = 0;
		Storage['clip'] = '';
	};
	
    var shiftMode = window.isShift || window.event.shiftKey;
            
	var obj;
	var objdata;
	this.mugeda_copy_counter++;
    var offset = shiftMode ? 0 : this.mugeda_copy_counter;
	for (var i = arr.length - 1; i >= 0; i--) {
		objdata = arr[i].dataRef;
		obj = duplicateObject(objdata, layerId, frameId);
		if (!TimelineUnit.addObject(tmUnit, obj))
			continue;
		// tmUnit.objects.push(obj.dataRef);
		// obj.setLayerFrame(layerId, frameId);
		
		obj.setPosition(16*offset,16*offset,true);
		
		toggleActiveObject(obj);
	};
	updateTimeline();
	MugedaUI.redrawAll();
};

function setSelection(guids) {
	if (!(window.aniLayers && window.aniLayers[0] && window.aniLayers[0].units))
		return;
	
	var objects = window.aniLayers[0].units[0].objects;
	for (var i = 0; i < objects.length; i++) {
		var guid = objects[i].guid;
		for (var j = 0; j < guids.length; j++) {
			if (guid == guids[j]) {
				toggleActiveObject(g_aniObj[guid], true);
			}
		}
	}
};

function getUnit(layerid, frameid) {
    if (!this.aniLayers[layerid]) return false;
	var units = this.aniLayers[layerid].units;
	for (var i = 0; i < units.length; i++) {
		var tmUnit = units[i];
		if (frameid >= tmUnit.frameStart && frameid < tmUnit.frameStart + tmUnit.frameCount) {
			return tmUnit;
		}
	}
};

function getUnitId(layerid, frameid) {
    if (!this.aniLayers[layerid]) return false;
    var units = this.aniLayers[layerid].units;
    for (var i = 0; i < units.length; i++) {
        var tmUnit = units[i];
        if (frameid >= tmUnit.frameStart && frameid < tmUnit.frameStart + tmUnit.frameCount) {
            return i;
        }
    }
};

function getLayerID(index) {
	return this.aniLayers[index || 0].id;
};

function canUngroup() {
	var len = getActiveObjectLength();
	if (!len)
		return false;
	
	var arySelObjs = this.objSelect.aryObjects.slice();
	for (var i = 0; i < len; i++) {
		curObj = arySelObjs[i];
		if (curObj.dataRef.type != Hanimation.SHAPE_GROUP)
			return false;
	}
	return true;
};

function toggleAnimation(layerid, frameid, animated, noUpdateORaniType) {
	// var layerid = this.currentLayer;
	// var frameid = this.currentFrame;
	var layer = this.aniLayers[layerid];
	if (layer.lock || layer.hide) {
		alert(Hanimation.Message.LockedLayer);
		return;
	}
	var units = layer.units;
	var len = units.length;
	var tmUnit = units[len - 1];
	for (var i = len - 1; i >= 0; i--) {
		tmUnit = units[i];
		if (frameid >= tmUnit.frameStart && frameid < tmUnit.frameStart + tmUnit.frameCount && tmUnit.frameCount > 1) {
			TimelineUnit.setAnimated(tmUnit, animated); //插值动画
            if (isMiddleMode && noUpdateORaniType!=undefined){
                tmUnit.aniType = noUpdateORaniType;
            }
			
			if (animated)
				updateAnimationPath(tmUnit);
			else
				resetAnimationPath(tmUnit);
			
			break;
		}
	}
	
	if (!isMiddleMode && !noUpdateORaniType)
		updateTimeline();
};

function toggleAnimations(animated) {
	var endLayer = (this.selEndLayer == undefined) ? this.selStartLayer : this.selEndLayer;
	
	var minLayer = Math.min(this.selStartLayer, endLayer);
	var maxLayer = Math.max(this.selStartLayer, endLayer);
	
	for (var k = minLayer; k <= maxLayer; k++) {
		var layer = this.aniLayers[k];
		if (layer.lock || layer.hide) {
			alert(Hanimation.Message.LockedLayer);
			continue;
		}
		
		toggleAnimation(k, this.currentFrame, animated, true);
	}
	
	updateTimeline();
	MugedaUI.redrawAll();
};

function sortObjects(objs) {
	var ret = [];
	if (!objs) {
		objs = [];
		var len = getActiveObjectLength();
		for (var i = len - 1; i >= 0; i--) {
			var curObj = this.objSelect.getObjectAt(i);
			if (curObj) {
				objs.push(curObj.dataRef);
			}
		}
	}
	var layers = this.aniLayers;
	for (var i = layers.length - 1; i >= 0; i--) {
		var units = layers[i].units;
		for (var j = 0; j < units.length; j++) {
			var objects = units[j].objects;
			for (var k = 0; k < objects.length; k++) {
				for (var m = objs.length - 1; m >= 0; m--) {
					var obj = objs[m];
					if (obj.guid == objects[k].guid) {
						obj = getAniObject(obj);
						ret.unshift(obj);
						objs.splice(m, 1);
						m--;
					}
				}
			}
		}
	}
	return ret;
};

function groupObjects(undraw) {
	var len = getActiveObjectLength();
	if (len == 0)
		return;
	if (len == 1) {
		var obj = this.objSelect.getObjectAt(0);
		if (obj.dataRef.type == Hanimation.SHAPE_GROUP) {
			ungroupObjects(undraw);
			return;
		}
	}
	
	var re = getObjectsLayer();
	
	var layerId = re.layerid;
	var frameId = re.frameid;
	var crossLayers = re.cross;
	
	// Only group objects on the same layers
	if (!crossLayers) {
		var objs = [];
		var objGroup = createNewObject(Hanimation.SHAPE_GROUP);
		objGroup.setLayerFrame(frameId, layerId);
		
		objs = sortObjects();
		
		for (var i = objs.length - 1; i >= 0; i--) {
			objGroup.addObject(objs[i]);
		}
		
		objGroup.getRawBound();
		
		// Delete current selected objects (that have been grouped)
		deleteObject(false);
		// Add the grouped object into the timeline
		addObject(layerId, frameId, objGroup);
		
		// Set the grouped object as the selected object
		this.objSelect.addObject(objGroup);
		
		if (!undraw)
			MugedaUI.redrawAll();
	} else
		alert(Hanimation.Message.GroupError);
};

function ungroupObjects(undraw, raw) {
	if (!canUngroup())
		return;
	var len = getActiveObjectLength();
	
	var layerId = -1;
	var frameId = -1;
	
	var curObj = null;
	var crossLayers = false;
	var arySelObjs = this.objSelect.aryObjects.slice();
	
	// Delete current selected objects
	deleteObject(false);
	
	for (var i = 0; i < len; i++) {
		curObj = arySelObjs[i];
		layerId = curObj.layerId;
		frameId = curObj.frameId;
		if (curObj.dataRef.type == Hanimation.SHAPE_GROUP) {
			var objects = curObj.restoreObjects(raw);
			var objLen = objects.length;
			for (var j = 0; j < objLen; j++) {
				// Add the grouped object into the timeline
				addObject(layerId, frameId, objects[j]);
				
				// Set the grouped object as the selected object
				this.objSelect.addObject(objects[j]);
			}
		}
	}
	
	if (!undraw)
		MugedaUI.redrawAll();
};

function regroupObjects(redraw) {
	if (!canUngroup())
		return;
	var len = getActiveObjectLength();
	
	var layerId = -1;
	var frameId = -1;
	
	var curObj = null;
	var crossLayers = false;
	var arySelObjs = this.objSelect.aryObjects.slice();
	
	for (var i = 0; i < len; i++) {
		curObj = arySelObjs[i];
		layerId = curObj.layerId;
		frameId = curObj.frameId;
		if (curObj.dataRef.type == Hanimation.SHAPE_GROUP)
			var objects = curObj.regroupObjects();
	}
	
	if (redraw)
		MugedaUI.redrawAll();
};

function loopObjects(callback) {
	var len = this.aniLayers.length;
	var frameId = this.currentFrame;
	var layerId = getLayerID(this.currentLayer);
	var layer;
	var unitCount = 0;
	var objCount = 0;
	var tmUnit;
	var prevKey = null;
	var aryKeyObjects = null;
	var keyObject = null;
	for (var i = len - 1; i >= 0; i--) {
		layer = this.aniLayers[i];
		unitCount = layer.units.length;
		for (var j = 0; j < unitCount; j++) {
			tmUnit = layer.units[j];
			objCount = tmUnit.objects.length;
			if (tmUnit && objCount && frameId >= tmUnit.frameStart && frameId < tmUnit.frameStart + tmUnit.frameCount) {
				for (var k = objCount - 1; k >= 0; k--) {
					if (callback(tmUnit.objects[k], tmUnit.objects, k))
						k++;
				}
			}
		}
	}
};

function loopSelects(callback, isAniObject) {
	var ret = {};
	var layerId = getLayerID(this.currentLayer);
	var frameId = this.currentFrame;
	var len = getActiveObjectLength();
	var tmUnit = null;
	var obj = null;
	var pos = null;
	
	for (var i = 0; i < len; i++) {
		object = this.objSelect.getObjectAt(i);
		pos = object.getLayerFrame();
		tmUnit = getTimelineUnit(pos.layer, pos.frame);
		if (tmUnit) {
			var objCount = tmUnit.objects.length;
			for (var j = 0; j < objCount; j++) {
				var obj = tmUnit.objects[j];
				var objSeed = getAniObject(obj);
				if (objSeed == object) {
					if (callback)
						callback(isAniObject ? object : obj);
					else
						ret[obj.guid] = 1;
				}
			}
		}
	}
	return ret;
};

//对齐方式
var arrangeObject = {
	//左对齐
	Left : function () {
		var num;
		var arr = [];
		var deltaX = 0;
		var deltaY = 0;
		loopSelects(function (obj) {
			arr.push(obj.param.left);
		});
		num = Math.min.apply(Math, arr);
		loopSelects(function (obj) {
			deltaX = num - obj.dataRef.param.left;
			obj.setPosition(deltaX, deltaY, true);
		}, true);
	},
	//右对齐
	Right : function () {
		var num;
		var arr = [];
		var deltaX = 0;
		var deltaY = 0;
		loopSelects(function (obj) {
			arr.push(obj.param.right);
		});
		num = Math.max.apply(Math, arr);
		loopSelects(function (obj) {
			deltaX = num - obj.dataRef.param.right;
			obj.setPosition(deltaX, deltaY, true);
		}, true);
	},
	//上对齐
	Top : function () {
		var num;
		var arr = [];
		var deltaX = 0;
		var deltaY = 0;
		loopSelects(function (obj) {
			arr.push(obj.param.top);
		});
		num = Math.min.apply(Math, arr);
		loopSelects(function (obj) {
			deltaY = num - obj.dataRef.param.top;
			obj.setPosition(deltaX, deltaY, true);
		}, true);
	},
	//下对齐
	Bottom : function () {
		var num;
		var arr = [];
		var deltaX = 0;
		var deltaY = 0;
		loopSelects(function (obj) {
			arr.push(obj.param.bottom);
		});
		num = Math.max.apply(Math, arr);
		loopSelects(function (obj) {
			deltaY = num - obj.dataRef.param.bottom;
			obj.setPosition(deltaX, deltaY, true);
		}, true);
	},
	//水平居中对齐
	HorizontalCenter : function () {
		var num;
		var arr = [];
		var deltaX = 0;
		var deltaY = 0;
		loopSelects(function (obj) {
			arr.push(obj.param.left);
			arr.push(obj.param.right);
		});
		num = Math.min.apply(Math, arr);
		num += (Math.max.apply(Math, arr) - num) / 2;
		loopSelects(function (obj) {
			deltaX = num - obj.dataRef.param.left - obj.dataRef.param.width / 2;
			obj.setPosition(deltaX, deltaY, true);
		}, true);
	},
	//垂直居中对齐
	VerticalCenter : function () {
		var num;
		var arr = [];
		var deltaX = 0;
		var deltaY = 0;
		loopSelects(function (obj) {
			arr.push(obj.param.top);
			arr.push(obj.param.bottom);
		});
		num = Math.min.apply(Math, arr);
		num += (Math.max.apply(Math, arr) - num) / 2;
		loopSelects(function (obj) {
			deltaY = num - obj.dataRef.param.top - obj.dataRef.param.height / 2;
			obj.setPosition(deltaX, deltaY, true);
		}, true);
	},
	//均分宽度
	DistributeWidths : function () {
		var start;
		var len;
		var now;
		var arr = [];
		loopSelects(function (obj) {
			now = obj.param.left + obj.param.width / 2;
			for (var i = 0; i < arr.length; i++) {
				if (now < arr[i].param.left + arr[i].param.width / 2) {
					arr.splice(i, 0, obj);
					return;
				}
			}
			arr.push(obj);
		});
		len = arr.length;
		if (len < 3)
			return;
		now = ((arr[len - 1].param.left + arr[len - 1].param.width / 2) - (arr[0].param.left + arr[0].param.width / 2)) / (len - 1);
		start = arr[0].param.left + arr[0].param.width / 2;
		for (var i = 1; i < len - 1; i++) {
			var obj = getAniObject(arr[i]);
			var deltaX = start + (now * i) - obj.dataRef.param.width / 2 - obj.dataRef.param.left;
			obj.setPosition(deltaX, 0, true);
		}
	},
	//均分高度
	DistributeHeights : function () {
		var start;
		var len;
		var now;
		var arr = [];
		loopSelects(function (obj) {
			now = obj.param.top + obj.param.height / 2;
			for (var i = 0; i < arr.length; i++) {
				if (now < arr[i].param.top + arr[i].param.height / 2) {
					arr.splice(i, 0, obj);
					return;
				}
			}
			arr.push(obj);
		});
		len = arr.length;
		if (len < 3)
			return;
		now = ((arr[len - 1].param.top + arr[len - 1].param.height / 2) - (arr[0].param.top + arr[0].param.height / 2)) / (len - 1);
		start = arr[0].param.top + arr[0].param.height / 2;
		for (var i = 1; i < len - 1; i++) {
			var obj = getAniObject(arr[i]);
			var deltaY = start + (now * i) - obj.dataRef.param.height / 2 - obj.dataRef.param.top;
			obj.setPosition(0, deltaY, true);
		}
	},
	//水平翻转
	FlipHorizontal : function () {
		regroupObjects();
		
		var num;
		var arr = [];
		var off;
		var point;
		loopSelects(function (obj) {
			arr.push(obj.param.left);
			arr.push(obj.param.right);
		});
		
		var left = Math.min.apply(Math, arr);
		var right = Math.max.apply(Math, arr);
		base = (left + right) / 2;
		
		loopSelects(function (obj) {
			var object = getAniObject(obj);
			if (object)
				object.horizontalFlip(base);
		});
	},
	//垂直翻转
	FlipVertical : function () {
		regroupObjects();
		
		var num;
		var arr = [];
		var off;
		var point;
		loopSelects(function (obj) {
			arr.push(obj.param.top);
			arr.push(obj.param.bottom);
		});
		var top = Math.min.apply(Math, arr);
		var bottom = Math.max.apply(Math, arr);
		base = (top + bottom) / 2;
		
		loopSelects(function (obj) {
			var object = getAniObject(obj);
			if (object)
				object.verticalFlip(base);
		});
	},
	//上移一层
	Forward : function () {
		var selects = loopSelects();
		loopObjects(function (obj, objs, i) {
			if (selects[obj.guid]) {
				delete(selects[obj.guid]);
				if (i < objs.length - 1) {
					objs.splice(i + 2, 0, obj);
					objs.splice(i, 1);
				}
			}
		});
	},
	//下移一层
	Backward : function () {
		var selects = loopSelects();
		loopObjects(function (obj, objs, i) {
			if (selects[obj.guid]) {
				delete(selects[obj.guid]);
				if (i > 0) {
					objs.splice(i - 1, 0, obj);
					objs.splice(i + 1, 1);
				}
			}
		});
	},
	//移到最前
	Front : function () {
		var selects = loopSelects();
		loopObjects(function (obj, objs, i) {
			if (selects[obj.guid]) {
				delete(selects[obj.guid]);
				if (i < objs.length - 1) {
					objs.splice(objs.length + 1, 0, obj);
					objs.splice(i, 1);
				}
			}
		});
		
	},
	//移到最后
	Back : function () {
		var selects = loopSelects();
		loopObjects(function (obj, objs, i) {
			if (selects[obj.guid]) {
				delete(selects[obj.guid]);
				if (i > 0) {
					objs.splice(0, 0, obj);
					objs.splice(i + 1, 1);
					return 1;
				}
			}
		});
	}
};

function setZoomOffset(frameId, x, y, mode) {
	// Masked for the new zooming mechanism.
	return;
	
	var canvasW = this.aniData.width;
	var canvasH = this.aniData.height;
	
	var zoomInfo = Zoom.getZoomInfo(this.aniData, -1, 2);
	if (!zoomInfo)
		return;
	
	switch (mode) {
	case 0:
		// Set
		this.editZoomLeft = zoomInfo.offsetLeft;
		this.editZoomTop = zoomInfo.offsetTop;
		break;
	case 1:
		// Update
		var maxLeft = zoomInfo.zoomLevel * canvasW - canvasW;
		var maxTop = zoomInfo.zoomLevel * canvasH - canvasH;
		zoomInfo.offsetLeft = Math.max(0, Math.min(maxLeft, this.editZoomLeft - x));
		zoomInfo.offsetTop = Math.max(0, Math.min(maxTop, this.editZoomTop - y));
		Zoom.setZoomInfo(this.aniData, -1, zoomInfo);
		
		break;
	case 2:
		// Finish
		break;
	}
	
	MugedaUI.redrawAll();
}

function setZoom(frameId, x, y, mode) {
	var MAX_CANVAS_WIDTH = 1920;
	var MAX_CANVAS_HEIGHT = 1080;
	var MIN_CANVAS_WIDTH = 32;
	var MIN_CANVAS_HEIGHT = 32;
	var MAX_ZOOM = 32.;
	var MIN_ZOOM = 1.;
	
	var zoomInfo = Zoom.getZoomInfo(this.aniData, -1, 2);
	if (!zoomInfo) {
		alert(Hanimation.Message.CameraZoom);
		return;
	}
	
	var zoomFactor;
	switch (mode) {
	case 0: // Zoom in
	default:
		zoomFactor = 1.5;
		break;
	case 1: // Zoom out
		zoomFactor = 1. / 1.5;
		break;
	case 2: // Reset
		zoomFactor = 1. / zoomInfo.zoomLevel;
		break;
	case 4: // linear increase
		zoomFactor = 1.1;
		break;
	case 5: // linear descrease
		zoomFactor = 1 / 1.1;
		break;
	}
	
	var oldZoom = zoomInfo.zoomLevel;
	zoomInfo.zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom * zoomFactor));
	if (Math.abs(zoomInfo.zoomLevel - 1.) < 0.01)
		zoomInfo.zoomLevel = 1.;
	
	// Calculate zoomed window range
	var canvasW = this.aniData.width;
	var canvasH = this.aniData.height;
	
	var newW;
	var newH;
	
	var changed = false;
	newW = canvasW * zoomInfo.zoomLevel;
	newH = canvasH * zoomInfo.zoomLevel;
	
	if (MAX_CANVAS_WIDTH < newW || MAX_CANVAS_HEIGHT < newH) {
		alert(Hanimation.Message.MaxZoom);
		return;
	}
	
	var paddedW = Math.floor(newW + 2 * Hanimation.PADDING);
	var paddedH = Math.floor(newH + 2 * Hanimation.PADDING);
	
	objCanvas.style.width = paddedW + "px";
	objCanvas.style.height = paddedH + "px";
	objCanvas.width = paddedW;
	objCanvas.height = paddedH;
	
	if (Math.abs(oldZoom - zoomInfo.zoomLevel) > 0.001) {
		// Zoom level has been changed.
		zoomFactor = zoomInfo.zoomLevel / oldZoom;
		changed = true;
	}
	
	if (changed) {
		// Move (x,y) to the center of the screen (if applicable)
		var centerX = x * zoomFactor;
		var centerY = y * zoomFactor;
		
		/*
		var left = centerX - (x - zoomInfo.offsetLeft);
		var top = centerY - (y - zoomInfo.offsetTop);
		
		left = Math.max(0, Math.min(newW - objCanvas.offsetWidth, left));
		top = Math.max(0, Math.min(newH - objCanvas.offsetHeight, top));
		 */
		var left = 0;
		var top = 0;
		
		var oldLeft = zoomInfo.offsetLeft * zoomFactor;
		var oldTop = zoomInfo.offsetTop * zoomFactor;
		zoomInfo.offsetLeft = left;
		zoomInfo.offsetTop = top;
		
		Zoom.setZoomInfo(this.aniData, -1, zoomInfo);
		
		Zoom.updateLayersAfterZoom(window.aniLayers, zoomFactor);
		this.prevZoomInfo = JSON.clone(zoomInfo);
	}
	
	onGetProperties(true);
	
	MugedaUI.redrawAll();
}

function insertFrame(layerid, frameid) {
	var layerid = (layerid == undefined) ? this.currentLayer : layerid;
	var frameid = (frameid == undefined) ? this.currentFrame : frameid;
	
	var layer = this.aniLayers[layerid];
	if (layer.lock || layer.hide) {
		alert(Hanimation.Message.LockedLayer);
		return;
	}
	var units = layer.units;
	var len = units.length;
	var tmUnit = units[len - 1];
	if (frameid >= tmUnit.frameStart + tmUnit.frameCount) {
		tmUnit.frameCount = frameid - tmUnit.frameStart + 1;
	} else {
		for (var i = len - 1; i >= 0; i--) {
			tmUnit = units[i];
			if (frameid >= tmUnit.frameStart) {
				tmUnit.frameCount++;
				for (var j = len - 1; j > i; j--) {
					units[j].frameStart++;
					TimelineUnit.repairKeyframe(units[j], frameid, 1);
				}
				if (tmUnit.animated) {
					TimelineUnit.repairKeyframe(tmUnit, frameid, 1);
				}
				break;
			}
		}
	}
};
/*
function toggleAnimation(layerid, frameid, animated) {
	var layer = this.aniLayers[layerid];
	if (layer.lock || layer.hide) {
		alert(Hanimation.Message.LockedLayer);
		return;
	}
	var units = layer.units;
	var len = units.length;
	var tmUnit = units[len - 1];
	for (var i = len - 1; i >= 0; i--) {
		tmUnit = units[i];
		if (frameid >= tmUnit.frameStart && frameid < tmUnit.frameStart + tmUnit.frameCount && tmUnit.frameCount > 1) {
			TimelineUnit.setAnimated(tmUnit, animated); //插值动画
			
			if (animated)
				updateAnimationPath(tmUnit);
			else
				resetAnimationPath(tmUnit);
			
			break;
		}
	}
};
    */
function resetAnimationPath(unit) {
	delete unit.pathMode;
	delete unit.displayPath;
	delete unit.path;
}

function insertKeyFrame(layeridx, frameid) {
    if (isMiddleMode){
        var layeridx = (layeridx == undefined) ? this.currentLayer : layeridx;
        var frameid = (frameid == undefined) ? this.currentFrame : frameid;
        var defaultFrameCount = window.cTimeline._getFPS();

        var layer = this.aniLayers[layeridx];
        if (layer.lock || layer.hide) {
            alert(Hanimation.Message.LockedLayer);
            return;
        }
        var units = layer.units;
        var len = units.length;
        var tmUnit = units[len - 1];

        var addPath = false;
        if (frameid >= tmUnit.frameStart + tmUnit.frameCount) {
            var emptyUnit = createUnit(layer.id, tmUnit.frameStart + tmUnit.frameCount);
            emptyUnit.frameStart = tmUnit.frameStart + tmUnit.frameCount
            emptyUnit.frameCount = frameid - emptyUnit.frameStart;
            emptyUnit.visible = false;
            if (emptyUnit.frameCount){
                TimelineUnit.addKeyframe(emptyUnit, emptyUnit.frameStart);
                units.push(emptyUnit);
            }
            var newUnit = createUnit(layer.id, frameid);
            newUnit.frameCount = defaultFrameCount;
            TimelineUnit.addKeyframe(newUnit, frameid);
            // tmUnit.frameStart=frameid;
            units.push(newUnit);
            addPath = true;

            /*tmUnit.frameCount = frameid - tmUnit.frameStart;
             tmUnit = createUnit(layer.id, frameid);
             TimelineUnit.addKeyframe(tmUnit, frameid);
             // tmUnit.frameStart=frameid;
             units.push(tmUnit);
             addPath = true;     */
        } else if (frameid < units[0].frameStart) {
            tmUnit = createUnit(layer.id, frameid);
            tmUnit.frameStart = frameid;
            tmUnit.frameCount = units[0].frameStart;
            TimelineUnit.addKeyframe(tmUnit, frameid);

            units.splice(0, 0, tmUnit);
        } else if (!units[0].visible && frameid < units[1].frameStart){
            var newUnit = createUnit(layer.id, frameid);
            newUnit.frameStart = frameid;
            newUnit.frameCount = units[1].frameStart > frameid+defaultFrameCount ? defaultFrameCount : units[1].frameStart - frameid;
            TimelineUnit.addKeyframe(newUnit, frameid);

            var emptyUnit1 = createUnit(layer.id);
            emptyUnit1.frameStart = 0;
            emptyUnit1.frameCount = frameid - emptyUnit1.frameStart;
            emptyUnit1.visible = false;
            TimelineUnit.addKeyframe(emptyUnit1, emptyUnit1.frameStart);

            var emptyUnit2 = createUnit(layer.id);
            emptyUnit2.frameStart = newUnit.frameStart + newUnit.frameCount
            emptyUnit2.frameCount = units[1].frameStart - emptyUnit2.frameStart;
            emptyUnit2.visible = false;
            TimelineUnit.addKeyframe(emptyUnit2, emptyUnit2.frameStart);

            units.splice(0, 1, emptyUnit1, newUnit, emptyUnit2);

        } else {
            for (var i = len - 1; i >= 0; i--) {
                tmUnit = units[i];
                if (frameid >= tmUnit.frameStart && frameid < tmUnit.frameStart + tmUnit.frameCount) {
                    len = tmUnit.frameCount;
                    if (tmUnit.animated) {
                        for (var j = 0; j < tmUnit.keyframes.length; j++) {
                            if (tmUnit.keyframes[j].id == frameid)
                                return;
                        }
                        TimelineUnit.addKeyframe(tmUnit, frameid);
                        addPath = true;
                    } else if(!tmUnit.visible){

                        var newUnit = createUnit(layer.id, frameid);
                        newUnit.frameStart = frameid;
                        newUnit.frameCount = units[i+1].frameStart > frameid+defaultFrameCount ? defaultFrameCount : units[i+1].frameStart - frameid;

                        var emptyUnit2 = createUnit(layer.id);
                        emptyUnit2.frameStart = newUnit.frameStart + newUnit.frameCount
                        emptyUnit2.frameCount = units[i+1].frameStart - emptyUnit2.frameStart;
                        emptyUnit2.visible = false;

                        var emptyUnit1 = createUnit(layer.id);
                        emptyUnit1.frameStart = units[i-1].frameStart+units[i-1].frameCount;
                        emptyUnit1.frameCount = frameid - emptyUnit1.frameStart;
                        emptyUnit1.visible = false;

                        if (newUnit.frameCount <= 3){return ;}

                        units.splice(i, 1);
                        if (emptyUnit2.frameCount){
                            TimelineUnit.addKeyframe(emptyUnit2, emptyUnit2.frameStart);
                            units.splice(i, 0, emptyUnit2);
                        }
                        if (newUnit.frameCount){
                            TimelineUnit.addKeyframe(newUnit, frameid);
                            units.splice(i, 0, newUnit);
                        }
                        if (emptyUnit1.frameCount){
                            TimelineUnit.addKeyframe(emptyUnit1, emptyUnit1.frameStart);
                            units.splice(i, 0, emptyUnit1);
                        }

                        // units.splice(i, 1, emptyUnit1, newUnit, emptyUnit2);
                    }
                    else {
                        tmUnit.frameCount = frameid - tmUnit.frameStart;
                        var unit = createUnit(layer.id);
                        unit.frameStart = frameid;
                        unit.frameCount = len - tmUnit.frameCount;
                        var objs = tmUnit.objects;
                        if (objs.length) {
                            for (var j = 0; j < objs.length; j++) {
                                var data = objs[j];

                                var obj = duplicateObject(data, unit.layerId, unit.frameStart);
                                if (!TimelineUnit.addObject(unit, obj))
                                    continue;
                            };
                        }
                        TimelineUnit.addKeyframe(unit, frameid);
                        units.splice(i + 1, 0, unit);
                    }
                    if (addPath)
                        updateAnimationPath(tmUnit);

                    break;
                }
            }
        }
    }else{
        var layeridx = (layeridx == undefined) ? this.currentLayer : layeridx;
        var frameid = (frameid == undefined) ? this.currentFrame : frameid;

        var layer = this.aniLayers[layeridx];
        if (layer.lock || layer.hide) {
            alert(Hanimation.Message.LockedLayer);
            return;
        }
        var units = layer.units;
        var len = units.length;
        var tmUnit = units[len - 1];

        var addPath = false;
        if (frameid >= tmUnit.frameStart + tmUnit.frameCount) {
            tmUnit.frameCount = frameid - tmUnit.frameStart;
            tmUnit = createUnit(layer.id, frameid);
            TimelineUnit.addKeyframe(tmUnit, frameid);
            // tmUnit.frameStart=frameid;
            units.push(tmUnit);
            addPath = true;
        } else if (frameid < units[0].frameStart) {
            tmUnit = createUnit(layer.id, frameid);
            tmUnit.frameStart = frameid;
            tmUnit.frameCount = units[0].frameStart;
            TimelineUnit.addKeyframe(tmUnit, frameid);

            units.splice(0, 0, tmUnit);
        } else {
            for (var i = len - 1; i >= 0; i--) {
                tmUnit = units[i];
                if (frameid >= tmUnit.frameStart && frameid < tmUnit.frameStart + tmUnit.frameCount) {
                    len = tmUnit.frameCount;
                    if (tmUnit.animated) {
                        for (var j = 0; j < tmUnit.keyframes.length; j++) {
                            if (tmUnit.keyframes[j].id == frameid)
                                return;
                        }
                        TimelineUnit.addKeyframe(tmUnit, frameid);
                        addPath = true;
                    } else {
                        tmUnit.frameCount = frameid - tmUnit.frameStart;
                        var unit = createUnit(layer.id);
                        unit.frameStart = frameid;
                        unit.frameCount = len - tmUnit.frameCount;
                        var objs = tmUnit.objects;
                        if (objs.length) {
                            for (var j = 0; j < objs.length; j++) {
                                var data = objs[j];

                                var obj = duplicateObject(data, unit.layerId, unit.frameStart);
                                if (!TimelineUnit.addObject(unit, obj))
                                    continue;
                            };
                        }
                        TimelineUnit.addKeyframe(unit, frameid);
                        units.splice(i + 1, 0, unit);
                    }
                    if (addPath)
                        updateAnimationPath(tmUnit);

                    break;
                }
            }
        }
    }
};

function clearKeyframe(layeridx, frameid) {
	var layeridx = (layeridx == undefined) ? this.currentLayer : layeridx;
	var frameid = (frameid == undefined) ? this.currentFrame : frameid;
	
	var layer = this.aniLayers[layeridx];
	if (layer.lock || layer.hide) {
		alert(Hanimation.Message.LockedLayer);
		return;
	}
	var units = layer.units;
	for (var i = units.length - 1; i >= 0; i--) {
		var unit = units[i];
		if (frameid >= unit.frameStart && frameid < unit.frameStart + unit.frameCount) {
			unit.objects = [];
			if (unit.animated) {
				TimelineUnit.setAnimated(unit, false); //插值动画
				resetAnimationPath(unit);
				
				break;
			}
		}
	}
};

function removeKeyframes(istouch) {
	if (istouch) {
		this.selStartLayer = this.currentLayer || 0;
		this.selStartFrame = this.currentFrame || 0;
	}
	var endFrame = (this.selEndFrame == undefined) ? this.selStartFrame : this.selEndFrame;
	var endLayer = (this.selEndLayer == undefined) ? this.selStartLayer : this.selEndLayer;
	
	var minFrame = Math.min(this.selStartFrame, endFrame);
	var maxFrame = Math.max(this.selStartFrame, endFrame);
	var minLayer = Math.min(this.selStartLayer, endLayer);
	var maxLayer = Math.max(this.selStartLayer, endLayer);
	
	for (var k = minLayer; k <= maxLayer; k++) {
		var layer = this.aniLayers[k];
		if (layer.lock || layer.hide) {
			alert(Hanimation.Message.LockedLayer);
			continue;
		}
		
		var units = layer.units;
		var len = units.length;
		var tmUnit = units[len - 1];
		for (var i = len - 1; i >= 0; i--) {
			tmUnit = units[i];
			
			if (tmUnit.animated) {
				for (var j = tmUnit.keyframes.length - 1; j > 0; j--) {
					var c = tmUnit.keyframes[j];
					// if(c.id==0||c.id==tmUnit.frameStart+tmUnit.frameCount-1)continue;
					if (c.id == 0)
						continue;
					
					if (minFrame <= c.id && c.id <= maxFrame) {
						delete(tmUnit.hashKey['key_' + c.id]);
						tmUnit.keyframes.splice(j, 1);
						
						updateAnimationPath(tmUnit);
					}
					
					if (tmUnit.keyframes.length == 1)
						// No more tween keyframes. Toggle animation.
						toggleAnimation(k, c.id, false);
				}
			} else {
				if (minFrame <= tmUnit.frameStart && tmUnit.frameStart <= maxFrame) {
					if (len == 1) {
						tmUnit.frameCount = 1;
						tmUnit.objects = [];
					} else {
						if (i < len - 1) {
							var newUnit = units[i + 1];
							var key = 'key_' + newUnit.frameStart;
							delete(newUnit.hashKey[key]);
							
							newUnit.frameStart = tmUnit.frameStart;
							newUnit.frameCount += tmUnit.frameCount;
							
							var c = newUnit.keyframes[0];
							c.id = newUnit.frameStart;
							
							key = 'key_' + tmUnit.frameStart;
							delete(tmUnit.hashKey[key]);
							
							newUnit.hashKey[key] = c;
							
							var objCount = newUnit.objects.length;
							for (var j = 0; j < objCount; j++) {
								var objData = newUnit.objects[j];
								var object = getAniObject(objData);
								if (object)
									object.frameId = newUnit.frameStart;
								
							}
						}
						units.splice(i, 1);
						len = units.length;
					}
				}
			}
		}
	}
};


function moveObject(x,y) {
	var obj;
	var len = getActiveObjectLength();
	for (var i=0;i<len;i++){
	  obj = this.objSelect.getObjectAt(i);
	  
	  var isCamera = obj && this.objCamera && obj == this.objCamera;

	  if(isCamera)
	  {
		var par = this.objCamera.getParam();             
		var params = {'direct':par, 'aux':par};              
		this.objCamera.move(params, x, y);  
		this.objCamera.updateBoundRect();
		
		var zoomInfo = Zoom.getZoomInfo(this.aniData, this.currentFrame, 2);
		if(zoomInfo)
		{
			zoomInfo.zoomLevel = this.objCanvas.offsetWidth / par.width;
			zoomInfo.offsetLeft = par.left;
			zoomInfo.offsetTop = par.top; 
			zoomInfo.rotation = par.rotate;
			
			Zoom.setZoomInfo(this.aniData, this.currentFrame, zoomInfo); 
		}            
	  }
	  else
		obj.setPosition(x, y, true); 

	}
	
	MugedaUI.redrawAll();
};

function addImage(data){
	if(!data)
		data = new Object();
		
	var imageSrc = data.url || "res/cnbc.png";
	var imgW = data.width || 128;
	var imgH = data.height || 128; 
	
	var canvasW = this.objCanvas.offsetWidth - Hanimation.PADDING * 2;
	var canvasH = this.objCanvas.offsetHeight - Hanimation.PADDING * 2;
	
	if(imgW > canvasW || imgH > canvasH){
		if (imgW / imgH > canvasW / canvasH){
			var w = canvasW / 2;
			imgH = w * imgH / imgW;
			imgW = w;
		}else{
			var h = canvasH / 2;
			imgW = h * imgW / imgH;
			imgH = h;
		}
	}
	
	var left = canvasW / 2 - imgW / 2; 
	var top = canvasH / 2 - imgH / 2; 
	
	var activeObject = createNewObject(Hanimation.SHAPE_PICTURE);     
	activeObject.dataRef.param.rotate = 0;
	activeObject.dataRef.param.imageSrc = imageSrc;
	activeObject.setStartPoint(left, top);
	activeObject.setEndPoint(left + imgW, top + imgH);         
	activeObject.setFinished(left + imgW, top + imgH);    
	addCanvasObject(activeObject); 
	
	MugedaUI.redrawAll(); 
}

function drawAnimationPath(ctx, unit){
    var data = {guid: unit.guidPath};
    var obj  = getAniObject(data);
    if (obj){
        if (obj.type != Hanimation.SHAPE_PENCIL){
            obj = createNewObject(Hanimation.SHAPE_PENCIL, obj.dataRef);
        }
        obj.locked = true;
        obj.draw(ctx, 1);
        /*  ctx.beginPath();
         ctx.moveTo(points[0].nodeX, points[0].nodeY);
         for (var i=0;i<points.length-1;i++){
         p1 = points[i];
         p2 = points[i+1];
         ctx.bezierCurveTo(p1.forwardX, p1.forwardY, p2.forwardX, p2.forwardY, p2.nodeX, p2.nodeY);
         ctx.strokeStyle ="red";
         //     context.moveTo(25,175);
         }
         ctx.stroke(); */
    }
}

function updateUnitObject(unit){
    if (!unit) return false;

    var objects = unit.objects,
        objectData, object;

    for (var i = 0, l = objects.length; i < l; i ++){
        objectData = objects[i];
        object     = getAniObject(objectData);

        if (object){
            object.frameId = unit.frameStart;
            object.layerId = unit.layerId;
        }
    }
}

function updateUnitFrame(layerid, unitid, frameid){
    var layer     = this.aniLayers[layerid],
        units     = layer.units,
        len       = units.length,
        tmUnit    = units[unitid],
        keyframes = tmUnit.keyframes,
        dist, newId, emptyUnit;

    if (tmUnit){
        dist = frameid - tmUnit.frameStart;
    }

    tmUnit.frameStart = frameid;

    for (var j = 0, k = keyframes.length; j < k; j ++){
        delete tmUnit.hashKey['key_' + keyframes[j].id];
        newId = keyframes[j].id + dist;
        tmUnit.hashKey['key_' + newId] = keyframes[j];
        keyframes[j].id = newId;
    }

    updateUnitObject(tmUnit);

    //del unit
    /* if (unitid > 0 && tmUnit.frameStart == units[unitid-1].frameStart){
     units.slice(unitid-1, 0);
     //add unit
     }else */
    if (frameid > 0 && unitid == 0){
        emptyUnit = createUnit(layer.id);
        emptyUnit.frameStart = 0;
        emptyUnit.frameCount = tmUnit.frameStart;
        emptyUnit.visible = false;
        TimelineUnit.addKeyframe(emptyUnit, emptyUnit.frameStart);
        units.splice(0, 0, emptyUnit);
        unitid ++;
    }else if ((unitid > 0 && units[unitid-1].visible) || (unitid < units.length-1 && units[unitid+1].visible)){
        if (unitid > 0 && frameid > (units[unitid - 1].frameStart+units[unitid - 1].frameCount)){
            emptyUnit = createUnit(layer.id);
            emptyUnit.frameStart = units[unitid - 1].frameStart+units[unitid - 1].frameCount;
            emptyUnit.frameCount = tmUnit.frameStart - emptyUnit.frameStart;
            emptyUnit.visible = false;
            TimelineUnit.addKeyframe(emptyUnit, emptyUnit.frameStart);
            units.splice(unitid, 0, emptyUnit);
            unitid ++;
        }else
        if (unitid < units.length-1 && frameid + tmUnit.frameCount < units[unitid + 1].frameStart){
            emptyUnit = createUnit(layer.id);
            emptyUnit.frameStart = frameid + tmUnit.frameCount;
            emptyUnit.frameCount = units[unitid + 1].frameStart - emptyUnit.frameStart;
            emptyUnit.visible = false;
            TimelineUnit.addKeyframe(emptyUnit, emptyUnit.frameStart);
            units.splice(unitid+1, 0, emptyUnit);
        }
        //upd unit
    }//else
    if ((unitid > 0 && !units[unitid-1].visible) || (unitid < units.length-1 && !units[unitid+1].visible)){
        if (unitid > 0 && !units[unitid-1].visible){
            units[unitid-1].frameCount = tmUnit.frameStart - units[unitid-1].frameStart;
            if (units[unitid - 1].frameCount == 0){
                units.splice(unitid-1, 1);
                unitid --;
            }
        }
        if (unitid < units.length-1 && !units[unitid+1].visible){
            units[unitid+1].frameStart = tmUnit.frameStart + tmUnit.frameCount;
            units[unitid+1].frameCount = units[unitid+2].frameStart - units[unitid+1].frameStart;
            if (units[unitid + 1].frameCount == 0){
                units.splice(unitid+1, 1);
            }
        }
    }

    /*
     if (frameid === 0 && len > 1){//delete unit
     emptyUnit = units[0];
     units.splice(0, 1);
     }else if (frameid > 0 && len === 1){//add unit
     emptyUnit = createUnit(layerid);
     emptyUnit.frameStart = 0;
     emptyUnit.frameCount = tmUnit.frameStart;
     TimelineUnit.addKeyframe(emptyUnit, emptyUnit.frameStart);
     units.splice(0, 0, emptyUnit);
     }else if (frameid > 0 && len > 1){//update unit
     emptyUnit = units[0];
     emptyUnit.frameCount = tmUnit.frameStart;
     }
     */
    if (tmUnit.animated){
        updateAnimationPath(tmUnit);
    }
    window.cTimeline._setCurrentUnitId(unitid);
}

function updateUnitKeyFrame(layerid, orignalKeyframe, updateKeyframe, addKeyframe){
    var tmUnit    = getUnit(layerid, orignalKeyframe),
        keyframes = tmUnit.keyframes;

    for (var i = 0, l = keyframes.length; i < l; i ++){
        if (orignalKeyframe == keyframes[i].id){
            delete tmUnit.hashKey['key_' + keyframes[i].id];
            tmUnit.hashKey['key_' + updateKeyframe] = keyframes[i];
            keyframes[i].id = updateKeyframe;
            updateAnimationPath(tmUnit);
            break;
        }
    }

}

function deleteKeyFrame(layerid, frameid){
    var tmUnit    = getUnit(layerid, frameid),
        keyframes = tmUnit.keyframes;

    for (var i = 0, l = keyframes.length; i < l; i ++){
        if (frameid == keyframes[i].id){
            delete tmUnit.hashKey['key_' + keyframes[i].id];
            keyframes.splice(i, 1);

            if (keyframes.length === 1){
                toggleAnimation(layerid, frameid, false, true);
            }

            if(tmUnit.pathMode == Hanimation.PATHMODE_UPDATE_KEYFRAME)
                tmUnit.pathMode = Hanimation.PATHMODE_UPDATE_PATH;

            updateAnimationPath(tmUnit);
            break;
        }
    }

}

function modifyFrames(layerid, unitid, frameStart, frameCount){
    var layer     = this.aniLayers[layerid],
        units     = layer.units,
        len       = units.length,
        tmUnit    = units[unitid],
        keyframes = tmUnit.keyframes,
        emptyUnit;

    delete tmUnit.hashKey['key_' + keyframes[0].id];
    tmUnit.hashKey['key_' + frameStart] = keyframes[0];
    tmUnit.frameStart = keyframes[0].id = frameStart === 1 ? 0 : frameStart;

    tmUnit.frameCount = frameCount;
    updateUnitObject(tmUnit);

    if (unitid > 0 && tmUnit.visible && !units[unitid-1].visible)
    {
        emptyUnit = layer.units[unitid - 1];
        emptyUnit.frameCount = frameStart - units[unitid-1].frameStart;
        emptyUnit.visible = false;
    }
    else if (unitid === 0 && frameStart > 1)
    {
        emptyUnit = createUnit(layer.id);
        emptyUnit.frameStart = 0;
        emptyUnit.frameCount = tmUnit.frameStart;
        emptyUnit.visible = false;
        TimelineUnit.addKeyframe(emptyUnit, emptyUnit.frameStart);
        units.splice(0, 0, emptyUnit);
        window.cTimeline._setCurrentUnitId(1);
    }
    else if (unitid > 0 && tmUnit.visible && units[unitid-1].visible)
    {
        if (frameStart > (units[unitid - 1].frameStart+units[unitid - 1].frameCount)){
            emptyUnit = createUnit(layer.id);
            emptyUnit.frameStart = units[unitid - 1].frameStart+units[unitid - 1].frameCount;
            emptyUnit.frameCount = tmUnit.frameStart - emptyUnit.frameStart;
            emptyUnit.visible = false;
            TimelineUnit.addKeyframe(emptyUnit, emptyUnit.frameStart);
            units.splice(unitid-1, 0, emptyUnit);
            window.cTimeline._setCurrentUnitId(unitid+1);
        }
    }
    //[dk647] NOW
    /*
     if (len > 1){
     emptyUnit = layer.units[0];
     emptyUnit.frameCount = frameStart;
     }else if (len === 1 && frameStart > 1){
     emptyUnit = createUnit(layerid);
     emptyUnit.frameStart = 0;
     emptyUnit.frameCount = tmUnit.frameStart;
     TimelineUnit.addKeyframe(emptyUnit, emptyUnit.frameStart);
     units.splice(0, 0, emptyUnit);
     } */
}

function insertKeyFrameInUnit(layerid, unitid, frameid){
    var layer  = this.aniLayers[layerid],
        len    = layer.units.length,
        tmUnit = layer.units[unitid];

    if (tmUnit.animated && frameid > tmUnit.frameStart && frameid < tmUnit.frameStart + tmUnit.frameCount){
        for (var j = 0; j < tmUnit.keyframes.length; j++) {
            if (tmUnit.keyframes[j].id == frameid) return;
        }

        TimelineUnit.addKeyframe(tmUnit, frameid);
        if (tmUnit.pathMode == Hanimation.PATHMODE_UPDATE_KEYFRAME)
            tmUnit.pathMode = Hanimation.PATHMODE_UPDATE_PATH;
        updateAnimationPath(tmUnit);
    }

}