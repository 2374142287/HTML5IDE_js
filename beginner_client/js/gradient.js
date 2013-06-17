/*
Gradient javascript files
*/
var MGradient = (function(){
	//adjust touch device
	
	var istouch = isMobile(); // 'ontouchstart' in window;
	var eventstart = istouch ? 'touchstart' : 'mousedown';
	var eventmove = istouch ? 'touchmove' : 'mousemove';
	var eventend = istouch ? 'touchend' : 'mouseup';
	
	//Gradient
	function Gradient(options){
		this.options = options || {};
		this.init();
	}

	Gradient.prototype = {
		init:  function(){
			var that = this;
			that.moveOrNot = 0;//监听前置动作是否为move

            var box = that.options.container;
			document.body.appendChild(box);		
			box.innerHTML = ''
			+  '<div id = "gradient_panel"><div id="gradientColor"></div>'
			+  '<div id="sliderBox"></div></div>';
			that.gradientBox = box;			
			that.gradient_panel = document.getElementById('gradient_panel');
			that.gradientColor = document.getElementById('gradientColor');
			that.gradientColor.style.background = '-webkit-gradient(linear, left top, right bottom, from(#c0c), color-stop(0.5, #000), to(#f00))';
			box.addEventListener(eventstart, function(e){that.prevent(e)}, false);

			var sliderBox = box.querySelector('div#sliderBox');
			that.sliderBox = sliderBox;
			
			//sliderBox append child
			var triangle = document.createElement('div');
			triangle.className = 'triangle';
			triangle.id = 'triangle';
			var selectedColor = document.createElement('div');
			selectedColor.className = 'selectedColor';
			selectedColor.id = 'selectedColor';
			var sliderChild = document.createElement('div');
			sliderChild.className = 'slider';
			sliderChild.id = 'slider';
			
			sliderChild.appendChild(triangle);
			sliderChild.appendChild(selectedColor);//将selectedColor和triangle都设置为slider的子模块
			
			var sliderChildClone01 = sliderChild.cloneNode(true);
			var sliderChildClone02 = sliderChild.cloneNode(true);
			
			that.sliderBox.appendChild(sliderChild);
			that.sliderBox.appendChild(sliderChildClone01);
			that.sliderBox.appendChild(sliderChildClone02);//初始化3个slider
			
			var slider = that.sliderBox.getElementsByClassName('slider');//获得装载3个初始化slider的数组
			slider[0].querySelector('div.selectedColor').style.backgroundColor = '#c0c';//设置背景颜色
			slider[1].querySelector('div.selectedColor').style.backgroundColor = '#000';
			slider[2].querySelector('div.selectedColor').style.backgroundColor = '#f00';
			slider[1].style.left = '120px';
			slider[2].style.left = '265px';
			that.slider = slider;
			that.sliderWidth = parseInt(getComputedStyle(slider[0],null).width);
		 	
			that.START = function(e){that.start(e);};
			that.END = function(e){that.end(e);};
			that.MOVE = function(e){that.move(e);};
			that.ADDSTATUS = function(e){that.addStatus(e);};
			that.GETALLSLIDERS = function(){that.getAllSlider();};
			that.SYNGRADIENTCOLOR = function(r,g,b,a){that.synGradientColor(r,g,b,a);};
			that.ADDSLIDER =  function(e){that.addSlider(e);};
			
			//bind default slider start event
			for(var i=0; i<slider.length; i++){
				(function(i){
				    slider[i].addEventListener(eventstart, function(){//点击出现colorPicker
						if(that.options.showColorPicker){
							that.options.showColorPicker();
						}
						
						that.currentObj = this;
					}, false);
					slider[i].addEventListener(eventstart, that.START, false);//添加关联鼠标按下的监听事件
					slider[i].addEventListener(eventend, that.ADDSTATUS, false);//添加关联鼠标弹起的监听事件，该事件为选定状态的转换(三角颜色变黑)
					
					
					//show color picker
				
					
					//get all sliders
					slider[i].addEventListener(eventstart, that.GETALLSLIDERS, false);//点击鼠标，获得getAllSlider方法
					slider[i].addEventListener(eventstart, that.SYNGRADIENTCOLOR, false);
				})(i);
			}
			
			//adjust x edge
			that.xMin = getComputedStyle(slider[0],null).left;
			that.xMax = parseInt(that.xMin) + parseInt(getComputedStyle(sliderBox,null).width) + 'px';			
			//bind new slider start event
			that.gradientColor.addEventListener(eventstart, that.ADDSLIDER, false);//添加增添slider事件
			
			//clone slide node
			that.cloneSlider = slider[0].cloneNode(true);
			that.preSibling = document.createElement('div');
		},
		
		//synchronous slider color
		synSliderColor:  function(r,g,b,a){
		    var that = this;
			if(that.currentObj){
				that.currentObj.querySelector('div.selectedColor').style.background = 'rgba('+ r + ',' + g + ',' + b + ',' + a + ')';
			}
			return false;
		},//拖动彩色条的colorPicker时gradient的sliderBox背景颜色也变
		
		
		//synchronous gradient color
		synGradientColor:  function(r,g,b,a){
		    var that = this;
			if(that.currentObj){
				var length = that.sortedSlider.length;//获得调节块的总个数
				var fromColor = getComputedStyle(that.sortedSlider[0].querySelector('div.selectedColor')).backgroundColor;//获得第一个块的背景颜色
				var toColor = getComputedStyle(that.sortedSlider[length-1].querySelector('div.selectedColor')).backgroundColor;//获得最后一块的背景颜色
				var stopColorString = '';
				for(var i=0; i<length; i++){
					stopColorString += 'color-stop(' + (that.sortedSlider[i].offsetLeft + that.sortedSlider[i].offsetWidth/2)/that.gradientColor.offsetWidth + ','
										+ getComputedStyle(that.sortedSlider[i].querySelector('div.selectedColor')).backgroundColor + '),';
				}
				that.gradientColor.style.background = '-webkit-gradient(linear, 0% 0%, 100% 100%,'
				+ 'from(' + fromColor + '), '
				+ stopColorString
				+ 'to(' + toColor + '))';
			}
			return false;
		},//拖动Bar的
		
		//get all slider status data
		getAllSlider:  function(){
		    var that = this;
			var sliders = document.getElementsByClassName('slider');
			var arr = [];
			for(var i=0; i<sliders.length; i++){
                if (sliders[i].style.display != 'none'){
				    arr.push(sliders[i]);
                }
			}
			arr.sort(that.sort);//排序
			that.sortedSlider = arr;
			return arr;
		},
		
		sort:  function(a, b){
			return a.offsetLeft - b.offsetLeft;
		}, 
		
		//add new slider
		addSlider:  function(e){
		if(e.target.id == 'gradientColor'){
		    var that = this;
			var mouseX = istouch ? e.changedTouches[0].pageX : e.pageX;
			var relativeX = mouseX - that.gradientBox.offsetLeft - that.gradientColor.offsetLeft - that.sliderWidth/2;
			var newSlider = document.createElement('div');
			newSlider = that.cloneSlider.cloneNode(true);
			that.sliderBox.appendChild(newSlider);
            newSlider.style.display = 'none';
            newSlider.querySelector('div.selectedColor').style.backgroundColor = that.getNowGradientColor(relativeX);
			newSlider.style.left = relativeX + 'px';
            newSlider.style.display = 'block';
			
			//bind drag event
			newSlider.addEventListener(eventstart, function(){
				if(that.options.showColorPicker){
					that.options.showColorPicker();
				}
				
				that.currentObj = this;
			}, false);
			
			newSlider.addEventListener(eventstart, that.START, false);
			newSlider.addEventListener(eventend, that.ADDSTATUS, false);
			
			//synchronous color
			newSlider.addEventListener(eventstart, that.SYNGRADIENTCOLOR, false);
			
			//get all sliders
			that.getAllSlider();
			newSlider.addEventListener(eventstart, that.GETALLSLIDERS, false);
			
			//start to show color picker and set current object
			
			that.getAllSlider();
			that.synGradientColor();
			that.currentObj = newSlider;
			
			//add status
			that.preSibling.style.backgroundColor = '#fff';
			newSlider.querySelector('div.triangle').style.backgroundColor = '#000';  
			that.preSibling = newSlider.querySelector('div.triangle');
			}
			if(that.options.addSliderAboutTpicker){
			   that.options.addSliderAboutTpicker(relativeX);
			}
			e.cancelBubble = true;
		},
		
		prevent:  function(e){
			e.preventDefault();
			e.stopPropagation();
		},
		
		//event start status
		addStatus:  function(e){
		    var that = this;//
			if(e.target.className == 'triangle'||e.target.className == 'selectedColor'){
			    that.preSibling.style.backgroundColor = '#fff';//当转换设置前一个颜色的背景色为白色
			    e.target.parentNode.querySelector('div.triangle').style.backgroundColor = '#000';  //设置箭头颜色为黑色
			    that.preSibling = e.target.parentNode.querySelector('div.triangle');//将当前三角设置为前元素
			    that.currentObj = e.target.parentNode;
			}
		
		},
        getNowGradientColor: function(x){
            var that = this;
            var sliders = that.getAllSlider();
            var R,G,B;
            if (x<sliders[0].offsetLeft){
                return sliders[0].querySelector('div.selectedColor').style.backgroundColor;
            }else if (x>sliders[sliders.length-1].offsetLeft){
                return sliders[sliders.length-1].querySelector('div.selectedColor').style.backgroundColor;
            }
            for (var i=0;i<sliders.length-1;i++){
                if ((x>sliders[i].offsetLeft) && (x<sliders[i+1].offsetLeft))
                {
                    p = ((x-sliders[i].offsetLeft))/(sliders[i+1].offsetLeft-sliders[i].offsetLeft);
                    p = p - parseInt(p);
                    var rgb1 = sliders[i].querySelector('div.selectedColor').style.backgroundColor.split(/[(),]/);
                    var rgb2 = sliders[i+1].querySelector('div.selectedColor').style.backgroundColor.split(/[(),]/);
                    R = parseInt(rgb1[1]*(1-p) + rgb2[1]*p);
                    G = parseInt(rgb1[2]*(1-p) + rgb2[2]*p);
                    B = parseInt(rgb1[3]*(1-p) + rgb2[3]*p);
                    break;
                }
            }
            return ('rgb('+R+', '+G+', '+B+')');
        },
		
		
		start:  function(e){		
			var that = this;
			that.prevent(e);
			that.mouseX = istouch ? e.changedTouches[0].pageX : e.pageX;
			that.mouseY = istouch ? e.changedTouches[0].pageY : e.pageY;
		    if(e.target.className == 'triangle'||e.target.className == 'selectedColor'){
			    that.eleX = e.target.parentNode.offsetLeft;
			    that.eleY = e.target.parentNode.offsetTop;
			    that.self = e.target.parentNode;
			}
			
			document.addEventListener(eventmove, that.MOVE, false);
			document.addEventListener(eventend, that.END, false);
			
			that.moveOrNot = 0 ;//前置动作为start；
			that.sliderLength = (document.getElementsByClassName('slider')).length;
		},
		
		move:  function(e){
		    var that = this;
		  
			var endX = istouch ? e.changedTouches[0].pageX : e.pageX;
			var endY = istouch ? e.changedTouches[0].pageY : e.pageY;
			
			
			that.self.style.left = that.eleX + (endX - that.mouseX) + 'px';         
		
			if(parseInt(that.self.offsetLeft)< parseInt(that.xMin)){//防止slider逃出左边界
				that.self.style.left = that.xMin;
			}
			if(parseInt(that.self.offsetLeft)> parseInt(that.xMax)){//防止slider逃出右边界
				that.self.style.left = that.xMax;
			}
			
			
			if(that.sliderLength > 2){
				if(Math.abs(endY - that.mouseY) > that.self.offsetHeight){
					that.self.style.display = 'none';
		        }
			
			
			    var xMouseMin = that.gradientBox.offsetLeft + that.gradientColor.offsetLeft;
		        var xMouseMax = xMouseMin + that.sliderBox.offsetWidth;
			    var yMouseMin = that.gradientBox.offsetTop + that.gradientColor.offsetTop + that.gradientColor.offsetHeight;
			    var yMouseMax = yMouseMin + that.sliderBox.offsetHeight;
			
			    if(endX > xMouseMin && endX < xMouseMax && endY > yMouseMin && endY < yMouseMax){
				        that.self.style.display = 'block';
			    }
			
			    that.getAllSlider();
			    ////that.synGradientColor();
		    }
            if(that.options.moveAboutTpicker){
				that.options.moveAboutTpicker(e);
				that.moveOrNot = 1;
			}
			    that.synGradientColor();
	
		},
		
		end  : function(e){
		    var that = this;
			var endY = istouch ? e.changedTouches[0].pageY : e.pageY;//如果是触碰事件，那么就获得触碰事件的pageY,如果不是触碰就是pageY
			if(that.sliderLength > 2){//当前slider个数大于2个的时候才会移除
				if(Math.abs(endY - that.mouseY) > parseInt(getComputedStyle(that.self,null).height)){
				    that.sliderBox.removeChild(that.self);//移除该slider
					that.getAllSlider();//重新设置slider总数
					that.synGradientColor();//重新设置bar的颜色
				}
			}
			
			
			that.self.style.display = 'block';
			if(that.self.offsetLeft < that.xMin){//边界控制
				that.self.style.left = that.xMin + 'px';
			}
			
			if(that.self.offsetLeft > that.xMax){
				that.self.style.left = that.xMax + 'px';
			}
				
			document.removeEventListener(eventmove, that.MOVE, false);
			document.removeEventListener(eventend, that.END, false);
			if(that.options.clickAboutTpicker && that.moveOrNot == 0){
			   that.options.clickAboutTpicker(e);
			}
		    if(that.options.endAboutGradient){
			   that.options.endAboutGradient(e);
			}
			e.cancelBubble = true;
	
		},
		
		show:  function(){
			this.gradientBox.style.display = 'block';
		},
		
		hide:  function(){
			this.gradientBox.style.display = 'none';
		}
	};
	
	return Gradient;
})();
