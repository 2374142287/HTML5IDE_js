/*
MColorPicker class javascript files
*/

var MColorPicker = (function(){
	
	//adjust touch device
	var istouch = 'ontouchstart' in window;
	var eventstart = istouch ? 'touchstart' : 'mousedown';
	var eventmove = istouch ? 'touchmove' : 'mousemove';
	var eventend = istouch ? 'touchend' : 'mouseup';
	
	//ColorPicker class
	function ColorPicker(options){
		this.options = options || {};
		this.init();
	}
	
	ColorPicker.prototype = {
		//initialize ColorPicker
		init: function(){
		    var that = this;
			
			var box = document.createElement('div');
			document.body.appendChild(box);
			box.className = 'colorPickerBox';
			box.id = 'colorPickerBox';
			
			box.innerHTML = '<canvas id="colorBlock" width="255" height="255"></canvas>'
			+ '<canvas id="colorBar" width="25" height="255"></canvas>'
			+ '<div id="blockBtn"></div>'
			+ '<div id="barBtn"></div>';
			
			this.colorPickerBox = document.getElementById('colorPickerBox');
			this.barCvs = document.getElementById('colorBar');
			this.barCtx = this.barCvs.getContext('2d');
			
			this.blockCvs = document.getElementById('colorBlock');
			this.blockCtx = this.blockCvs.getContext('2d');
			
			that.barBtn = document.getElementById('barBtn');
			that.blockBtn = document.getElementById('blockBtn');
			
			this.barCvsBorderWidth = parseInt(getComputedStyle(that.barCvs).borderBottomWidth);
			this.blockCvsBorderWidth = parseInt(getComputedStyle(that.blockCvs).borderBottomWidth);
			
			this.barCvsCenterX = that.barCvs.width/2;
			
			this.barMax = that.barCvs.offsetTop + that.barCvs.offsetHeight - that.barBtn.offsetHeight/2 - 2*that.barCvsBorderWidth - 1;
			this.barMin = that.barCvs.offsetTop - that.barBtn.offsetHeight/2 + that.barCvsBorderWidth + 1;  //+1:must be on colorBar
			
			this.blockMaxX = that.blockCvs.offsetLeft + that.blockCvs.offsetWidth - that.blockBtn.offsetWidth;
			this.blockMinX = that.blockCvs.offsetLeft + that.blockCvsBorderWidth;
			
			this.blockMaxY = that.blockCvs.offsetTop + that.blockCvs.offsetHeight - that.blockBtn.offsetHeight;
			this.blockMinY = that.blockCvs.offsetTop + that.blockCvsBorderWidth;
			
			var barImage = new Image();
			barImage.src = '../colorPicker/images/picker_bar.png';
			
			//draw image on canvas
			barImage.addEventListener('load', function(){
				that.barCtx.drawImage(barImage, 0, 0);
				
				that.barImageData = that.barCtx.getImageData(0, 0, that.barCvs.width, that.barCvs.height);
				
				//get image color data
				that.barBtnY = (that.barBtn.offsetTop + Math.ceil(that.barBtn.offsetHeight/2) - that.barCvs.offsetTop)*2;
				that.barDataR = that.barImageData.data[4*that.barCvsCenterX*that.barBtnY + 0];
				that.barDataG = that.barImageData.data[4*that.barCvsCenterX*that.barBtnY + 1];
				that.barDataB = that.barImageData.data[4*that.barCvsCenterX*that.barBtnY + 2];
				that.barDataA = that.barImageData.data[4*that.barCvsCenterX*that.barBtnY + 3];
				
				that.drawBlock();
			}, false);
			
			that.startClone = function(e){that.start(e)};
			that.moveBarClone = function(e){that.moveBar(e)};
			that.moveBlockClone = function(e){that.moveBlock(e)};
			that.endClone = function(e){that.end(e)};
			
			that.barBtn.addEventListener(eventstart, that.startClone, false);
			that.blockBtn.addEventListener(eventstart, that.startClone, false);
			
			//click to move slider
			that.barCvs.addEventListener(eventstart, that.startClone, false);
			that.barCvs.addEventListener(eventend, that.moveBarClone, false);
			that.blockCvs.addEventListener(eventstart, that.startClone, false);
			that.blockCvs.addEventListener(eventend, that.moveBlockClone, false);
		},
		
		start:  function(e){
			e.preventDefault();
			var that = this;
			var targetID = e.target.id;
			that.barStartY = that.barBtn.offsetTop;
			
			that.blockStartX = that.blockBtn.offsetLeft;
			that.blockStartY = that.blockBtn.offsetTop;
			switch(targetID){
				case 'colorBar':
					that.startY = that.barBtn.offsetTop + that.colorPickerBox.offsetTop + that.barBtn.offsetHeight/2;
				break;
				
				case 'colorBlock':
					that.startX = that.blockBtn.offsetLeft + that.colorPickerBox.offsetLeft + that.blockBtn.offsetWidth/2;
					that.startY = that.blockBtn.offsetTop + that.colorPickerBox.offsetTop + that.blockBtn.offsetHeight/2;
				break;
				
				default:
					that.startX = istouch ? e.changedTouches[0].pageX : e.pageX;
					that.startY = istouch ? e.changedTouches[0].pageY : e.pageY;
					
					switch(targetID){
						case 'barBtn':
							document.addEventListener(eventmove, that.moveBarClone, false);
						break;
						
						case 'blockBtn':
							document.addEventListener(eventmove, that.moveBlockClone, false);
						break;
					}
					
					document.addEventListener(eventend, that.endClone, false);
				break;
			}
		},
		
		//move the triangle slider
		moveBar:  function(e){
			var that = this;
			var endY = istouch ? e.changedTouches[0].pageY : e.clientY;
			var distance = endY - that.startY;
			
			that.barBtn.style.top = that.barStartY + distance + 'px';
			
			if(that.barBtn.offsetTop < that.barMin){
				that.barBtn.style.top = that.barMin + 'px';
			}else if(that.barBtn.offsetTop > that.barMax){
				that.barBtn.style.top = that.barMax + 'px';
			}
			
			//get image color data
			var barBtnY = (that.barBtn.offsetTop + Math.ceil(that.barBtn.offsetHeight/2) - that.barCvs.offsetTop)*2;
			that.barDataR = that.barImageData.data[4*that.barCvsCenterX*barBtnY + 0];
			that.barDataG = that.barImageData.data[4*that.barCvsCenterX*barBtnY + 1];
			that.barDataB = that.barImageData.data[4*that.barCvsCenterX*barBtnY + 2];
			that.barDataA = that.barImageData.data[4*that.barCvsCenterX*barBtnY + 3];
			
			that.drawBlock();
		},
		
		//move the circle slider
		moveBlock:  function(e){
			var that = this;
			
			var endX = istouch ? e.changedTouches[0].pageX : e.pageX;
			var endY = istouch ? e.changedTouches[0].pageY : e.pageY;
			
			var distanceX = endX - that.startX;
		    var distanceY = endY - that.startY;
			
			that.blockBtn.style.left = that.blockStartX + distanceX + 'px';
			that.blockBtn.style.top = that.blockStartY + distanceY + 'px';
			
			if(that.blockBtn.offsetLeft < that.blockMinX){
				that.blockBtn.style.left = that.blockMinX + 'px';
			}
			
			if(that.blockBtn.offsetLeft > that.blockMaxX){
				that.blockBtn.style.left = that.blockMaxX + 'px';
			}
			
			if(that.blockBtn.offsetTop < that.blockMinY){
				that.blockBtn.style.top = that.blockMinY + 'px';
			}
			
			if(that.blockBtn.offsetTop > that.blockMaxY){
				that.blockBtn.style.top = that.blockMaxY + 'px';
			} 
			
			that.options.changeColor(that.getColor());
		},
		
		end:  function(e){
			var that = this;
			
			document.removeEventListener(eventmove, that.moveBlockClone, false);
			document.removeEventListener(eventmove, that.moveBarClone, false);
			document.removeEventListener(eventend, that.endClone, false);
		},
		
		drawBlock:  function(){
			var that = this;
			
			//change blockCvs color
			that.blockCtx.fillStyle = 'rgba(' + that.barDataR + ',' + that.barDataG + ',' + that.barDataB + ',' + that.barDataA + ')';
			that.blockCtx.fillRect(0, 0, that.blockCvs.width, that.blockCvs.height);
			
			//draw block image
			that.blockImage = new Image();
			that.blockImage.src = '../colorPicker/images/picker_block.png';
			that.blockImage.addEventListener('load', function(){
				that.blockCtx.drawImage(that.blockImage, 0, 0);
				that.blockImageData = that.blockCtx.getImageData(0, 0, that.blockCvs.width, that.blockCvs.height);
			    that.options.changeColor(that.getColor());
			}, false);
		},
		
		getColor:  function(){
			var that = this;
			
			that.blockBtnX = that.blockBtn.offsetLeft - that.blockCvs.offsetLeft;
			that.blockBtnY = that.blockBtn.offsetTop - that.blockCvs.offsetTop;
	
			var r = that.blockDataR = that.blockImageData.data[4*(that.blockBtnY*that.blockCvs.width + that.blockBtnX)+0];
			var g = that.blockDataG = that.blockImageData.data[4*(that.blockBtnY*that.blockCvs.width + that.blockBtnX)+1];
			var b = that.blockDataB = that.blockImageData.data[4*(that.blockBtnY*that.blockCvs.width + that.blockBtnX)+2];
			var a = that.blockDataA = that.blockImageData.data[4*(that.blockBtnY*that.blockCvs.width + that.blockBtnX)+3];
			
			var color = [r, g, b, a];
			return color; 
		},
		
		show:  function(){
			var that = this;
			that.colorPickerBox.style.display = 'block';
		},
		
		hide:  function(){
			var that = this;
			that.colorPickerBox.style.display = 'none';
		}
	}
	
	return ColorPicker;
})();