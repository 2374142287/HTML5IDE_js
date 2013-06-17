/*
Gradient javascript files
*/

var MGradient = (function(){
	
	//adjust touch device
	var istouch = 'ontouchstart' in window;
	var eventstart = istouch ? 'touchstart' : 'mousedown';
	var eventmove = istouch ? 'touchmove' : 'mousemove';
	var eventend = istouch ? 'touchend' : 'mouseup';
	
	//Gradient class
	function Gradient(options){
		this.options = options || {};
		this.init();
	}
	
	Gradient.prototype = {
		init:  function(){
			var that = this;
			
			var box = document.createElement('div');
			document.body.appendChild(box);
			box.id = 'gradientBox';
			that.gradientBox = box;
			
			box.innerHTML = ''
			+  '<div id="gradientColor"></div>'
			+  '<div class="slider" id="start"> <div class="triangle"></div> <div class="selectedColor" id="startColor"></div> </div>'
			+  '<div class="slider" id="middle"> <div class="triangle"></div> <div class="selectedColor" id="middleColor"></div> </div>'
			+  '<div class="slider" id="end"> <div class="triangle"></div> <div class="selectedColor" id="endColor"></div> </div>';
			
			that.gradientColor = document.getElementById('gradientColor');
			that.gradientColor.style.background = '-webkit-gradient(linear, left top, right bottom, from(#c0c), color-stop(0.5, #000), to(#f00))';
			
			var cursorMin = box.querySelector('div.slider').offsetLeft;
			var cursorMax = box.querySelector('div#end').offsetLeft;
			
			var startSlider = new Slider({
			    renderTo : box.querySelector('div#start'),
				attr     : ['left'],
				direc    : 'X',
				start    : function (){
				    that.setCurrentSlider(box.querySelector('div#start'));
					that.options.change();
				},
				correct  : function (value){
					var min = cursorMin,
					    max = cursorMax;

					return value > max ? max : value < min ? min : value;
				},
				change   : function (value){
					var currentSlider = gradient.getCurrentSlider();
					var gradientColor = currentSlider.parentNode.querySelector('div#gradientColor');
					var percent = (currentSlider.offsetLeft + currentSlider.offsetWidth/2 - gradientColor.offsetLeft)/gradientColor.offsetWidth;
					
					var gradientBackground = getComputedStyle(gradientColor).backgroundImage;
					var replaceBg = gradientBackground.replace(/\d\.\d/g, percent);
					
		            gradientColor.style.background = replaceBg;
				}	
			});
			
			var middleSlider = new Slider({
				renderTo : box.querySelector('div#middle'),
				attr     : ['left'],
				direc    : 'X',
				start    : function (){
				     that.setCurrentSlider(box.querySelector('div#middle'));
					 that.options.change();
				},
				correct  : function (value){
					var min = cursorMin,
					    max = cursorMax;

					return value > max ? max : value < min ? min : value;
				},
				change   : function (value){
					var currentSlider = gradient.getCurrentSlider();
					var gradientColor = currentSlider.parentNode.querySelector('div#gradientColor');
					var percent = (currentSlider.offsetLeft + currentSlider.offsetWidth/2 - gradientColor.offsetLeft)/gradientColor.offsetWidth;
					
					var gradientBackground = getComputedStyle(gradientColor).backgroundImage;
					var replaceBg = gradientBackground.replace(/\d\.\d/g, percent);
					
		            gradientColor.style.background = replaceBg;
				}	
			});
			
			var endSlider = new Slider({
				renderTo : box.querySelector('div#end'),
				attr     : ['left'],
				direc    : 'X',
				start    : function (){
				     that.setCurrentSlider(box.querySelector('div#end'));
					 that.options.change();
				},
				correct  : function (value){
					var min = cursorMin,
					    max = cursorMax;

					return value > max ? max : value < min ? min : value;
				},
				change   : function (value){
					var currentSlider = gradient.getCurrentSlider();
					var gradientColor = currentSlider.parentNode.querySelector('div#gradientColor');
					var percent = (currentSlider.offsetLeft + currentSlider.offsetWidth/2 - gradientColor.offsetLeft)/gradientColor.offsetWidth;
					
					var gradientBackground = getComputedStyle(gradientColor).backgroundImage;
					var replaceBg = gradientBackground.replace(/\d\.\d/g, percent);
					
		            gradientColor.style.background = replaceBg;
				}	
			});
		},
		
		setCurrentSlider: function (slider){
		    this.currentSlider = slider;
		},
		
		getCurrentSlider:  function(){
			return this.currentSlider;
		}
	};
	
	return Gradient;
})();