/*Slider Class JavaScript File*/

var Slider = (function (){
	
	var istouch    = 'ontouchstart' in window ? true : false,
	    eventstart = istouch ? 'touchstart' : 'mousedown',
		eventmove  = istouch ? 'touchmove'  : 'mousemove',
        eventend   = istouch ? 'touchend'   : 'mouseup';
		   

    var direcReg   = /[XY]{1,2}/,
	    limitReg   = /^\((\d*)[\,\s]*(\d*)\)$/,
		numReg     = /\d+/;

	function Slider(options){
	    this.options  = options || {};
		this.dragging = false;

		if (!this.options.renderTo || !this.options.direc){
		   //throw new Error("can't initialize this element");
		   return false;
		}

        if (!direcReg.test(this.options.direc)){
		   //throw new Error("can't get params in this direction");
		   return false;
		}

        if (limitReg.test(this.options.limit)){
		   this.lowerLimit = RegExp.$1;
		   this.upperLimit = RegExp.$2;
		}

		this.initialize();
	}

	Slider.prototype = {
	     constructor: Slider,
		 
		 initialize: function (){
             var start    = {X: 0, Y: 0},
				 end      = {X: 0, Y: 0},
				 newDist  = {X: 0, Y: 0},
				 newPos   = {X: 0, Y: 0},
				 position = {X: 0, Y: 0},
				 self     = this,
				 attrlen  = self.options.direc.length,
				 draggingDist = 0,
				 startTime;

		     var sliderStart = function (e){
		         self.dragging = true;
                 e.preventDefault();
				 e.stopPropagation();

				 startTime = e.timeStamp;
                 for (var i = 0, l = attrlen; i < l; i ++){
					var direction       = self.options.direc[i];
	                start[direction]    = newDist[direction] = istouch ? e.changedTouches[0]['page' + direction] : e['page' + direction];
		            position[direction] = parseInt(getComputedStyle(self.options.renderTo)[self.options.attr[i]]);

				 }

				 if (self.options.start){
					self.options.start.call(self, e, start[direction]); 
				 }

		         document.addEventListener(eventmove, sliderMove, false);
			     document.addEventListener(eventend,  sliderEnd, false);
		     };

		     var sliderMove = function (e){
		         if (!self.dragging) return false;
		         e.preventDefault();
				 e.stopPropagation();
		         if (istouch && e.touches.length != 1) return false;

				 var th = 8;
                 for (var i = 0, l = attrlen; i < l; i ++){
					 var direction   = self.options.direc[i],
		       	         current     = istouch ? e.changedTouches[0]['page' + direction] : e['page' + direction],
		                 dist        = current - newDist[direction],
						 dragDist 	 = Math.abs(current - start[direction]),
						 currentPos  = parseInt(getComputedStyle(self.options.renderTo)[self.options.attr[i]]);
		             
					 if(dragDist < th)
						continue;
						
					 position[direction] += dist;
                     //correct the position
				     newPos[direction] = self.options.correct ? 
					                     self.options.correct(position[direction], currentPos, dist) : 
										 position[direction];

                     if (numReg.test(newPos[direction])){
						 //self.options.renderTo.style.webkitTransitionProperty = self.options.attr[i];
						 //self.options.renderTo.style.webkitTransitionDuration = 0;
		                 self.options.renderTo.style[self.options.attr[i]] = newPos[direction] + 'px';	
		                 newDist[direction] = current;

						 if (self.options.change){
				              self.options.change.call(self, newPos[direction], dist);
						 }
		             }else {
		                   return false;
		             }
				 }
		         
		     };
		     
             var sliderEnd = function (e){
				self.dragging = false;
				e.preventDefault();
				e.stopPropagation();

                var endTime = e.timeStamp, targetPosition;
                for (var i = 0, l = attrlen; i < l; i ++){
					var direction  = self.options.direc[i];

		       	    end[direction] = istouch ? e.changedTouches[0]['page' + direction] : e['page' + direction];

                    if (self.options.callback){
						self.options.callback.call(self, endTime - startTime, newPos[direction], end[direction], start[direction]);
				    }

                    //if set the limeLimit attribute, there will be automatic sliding effect
					//if (self.options.timeLimit && endTime - startTime <= self.options.timeLimit){
					//	targetPosition = self.options.correct((end[direction] - start[direction]) * 10);

					//	self.options.renderTo.style.webkitTransition = self.options.attr[i] + ' 300ms ease-in-out';
					//	self.options.renderTo.style[self.options.attr[i]] = targetPosition + 'px';
					//}
				}

			    document.removeEventListener(eventmove, sliderMove, false);
			    document.removeEventListener(eventend,  sliderEnd,  false);
				
			};

			this.options.renderTo.addEventListener(eventstart, sliderStart, false);
		 },

	     moveTo: function (target){
	     	 var attrlen = this.options.attr.length;

	     	 for (var i = 0; i < attrlen; i ++){
	     		 this.options.renderTo.style[this.options.attr[i]] = target + 'px';
	     		 this.options.renderTo.style.webkitTransition      = this.options.attr[i] + ' 350ms ease-in-out 0';
	     	 }
	     },
		 
		 getPosition: function (){
			if (this.options.renderTo.nodeType != 1) return;

            var x   = 0, y = 0,
			    obj = this.options.renderTo;

            while (obj && obj.tagName != "BODY") {
                x   += obj.offsetLeft;
                y   += obj.offsetTop;
                obj = obj.offsetParent;
            }
     
            return {X: x, Y: y}; 
		 }
	}


	return Slider;
	
})();
