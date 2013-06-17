/*MZoom Class JavaScript File*/

var MZoom = (function (){

    //private attribute
	var istouch    = 'ontouchstart' in window ? true : false,
	    eventstart = istouch ? 'touchstart' : 'mousedown',
		eventmove  = istouch ? 'touchmove'  : 'mousemove',
        eventend   = istouch ? 'touchend'   : 'mouseup';

    //Zoom Class
	function Zoom(options){
	   this.options = options || {};

       if (!this.options.renderTo){
		   throw new Error("MZoom: can't not intialize the element")
		   return false;   
	   }

	   this.initialize();
     
	}

	Zoom.prototype = {
	   constructor: Zoom,
	   
	   initialize: function (){
           this.startPosition   = [], //{X: 0, Y: 0}
	       this.endPosition     = [], //{X: 0, Y: 0}
	       this.currentPosition = [], //{X: 0, Y: 0}
		   this.zoomFlag        = false;
		   this.lastPosition    = 0;
		   this.callbackFlag    = false;

		   var self = this;

           //register the event
           this.startEvent = function (e){self.start(e)};
		   this.moveEvent  = function (e){self.move(e)};
		   this.endEvent   = function (e){self.end(e)};
		   //add zoom event
		   this.options.renderTo.addEventListener(eventstart, this.startEvent, false);
	   },
	   
	   start: function (e){
		   e.preventDefault();
		   e.stopPropagation();
		   if (!istouch || (istouch && e.touches.length <= 1)) return false;

		   if (this.options.start){
			  this.options.start.call(self);   
		   }

           MZoom.animationObject = this.options.renderTo;
		   this.setStartPosition(e);
		   this.setZoomFlag(true);
		   this.originValue = parseInt(getComputedStyle(MZoom.animationObject)[this.options.attr]);
           document.addEventListener(eventmove, this.moveEvent, false);
		   document.addEventListener(eventend,  this.endEvent,  false);
	   }, 
	   
	   move: function (e){
		   if (!this.getZoomFlag()) return false;

           e.preventDefault();
		   e.stopPropagation();
		   if (!istouch || (istouch && e.touches.length <= 1)) return false;

		   this.setCurrentPosition(e);

		   var dist    = {X: 0, Y: 0}, //{X: 0, Y: 0}
		       current = this.getCurrentPosition(),
			   start   = this.getStartPosition(),
			   origin  = parseInt(getComputedStyle(this.options.renderTo)[this.options.attr]),
			   newValue;

           if (start.length != current.length) return false;

		   for (var i = 0, l = current.length; i < l; i ++){
			   dist[this.options.direc] += current[i][this.options.direc] - start[i][this.options.direc];
		   }

		   this.setStartPosition(e);
           newValue = origin + dist[this.options.direc] * (this.options.scale || 1);

		   if (this.options.correct){
			   newValue = this.options.correct.call(this, newValue);
		   }

		   if (this.options.change){
			   this.options.change.call(this, newValue);   
		   }

		   this.options.renderTo.style[this.options.attr] = newValue + 'px';
		   this.options.renderTo.style.webkitTransition   = '';
		   this.lastPosition = newValue;
	   },	

	   end: function (e){
           e.preventDefault();
		   e.stopPropagation();

		   if (this.options.callback){
			  this.options.callback.call(this, this.lastPosition);   
		   }

		   this.setEndPosition(e);
		   this.setZoomFlag(false);
		   document.removeEventListener(eventmove,  this.moveEvent,  false);
		   document.removeEventListener(eventend,  this.endEvent,  false);
	   },

       //=====================================================
	   //attribute getter/setter method
	   setStartPosition: function (e){
		   this.startPosition = this.setPosition(e);
	   },

	   getStartPosition: function (){
		   return this.startPosition;  
	   },

	   setEndPosition: function (e){
		   this.endPosition = this.setPosition(e);
	   },

	   getEndPosition: function (){
		   return this.endPosition;
	   },

	   setCurrentPosition: function (e){
		   this.currentPosition = this.setPosition(e);  
	   },

	   getCurrentPosition: function (){
	       return this.currentPosition;	   
	   },

	   setZoomFlag: function (flag){
		   this.zoomFlag = flag;
	   },

	   getZoomFlag: function (){
		   return this.zoomFlag;  
	   },

       setCallbackFlag: function (flag){
		   this.callbackFlag = flag;
	   },

	   getCallbackFlag: function (){
		   return this.callbackFlag;  
	   },

	   setPosition: function (e){
		   var result = [];

		   if (istouch){
			  for (var i = 0, l = e.touches.length; i < l; i ++){
				 result.push({X: e.touches[i].pageX, Y: e.touches[i].pageY});
		      }   
		   }else {
			  result.push({X: e.pageX, Y: e.pageY});
		   }

		   return result;
	   }

	}

	return Zoom;
	
})();
