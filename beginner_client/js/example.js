MExample = (function(){    

        function Example(options){
		    Example.prototype.options = options || {};
		    this.init();
	    }
		
		Example.prototype = {
		    init: function(){
			  var fontback = document.createElement('div');
		      document.body.appendChild(fontback);
		      fontback.id = 'fontBack';
		      Example.prototype.fontBack = fontback;
			
			  fontback.innerHTML = ''+'<div id="text">Text!!</div>';
		      Example.prototype.text = document.getElementById('text');
			  Example.prototype.text.innerText = "Text!!";
			
			},
			
	    }
	
	return Example;
		
})();