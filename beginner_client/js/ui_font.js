UIFont={
	_fontFamilies:['Arial', 'Arial Narrow', 'Arial Black', 'Comic Sans M',
		      'Times New Roman', 'Verdana', 'Tahoma', 'Simsun', 'Simhei'],
	_fontSizes:[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48, 56, 64, 72, 80, 96, 128, 160, 256],
	_fontDetail:{},

	init:function(param){
		// var _=this,c,s='',b='ontouchstart' in window;
        var _=this,c,s='',b=isMobile(); // 'ontouchstart' in window;
		for(var k in param)_[k]=param[k];
		var o=_.container;

		o.addEventListener(b?'touchstart':'mousedown',function(e){e.cancelBubble=true;});
		
		var _fs="<select>";
		for (i=0;i<_._fontSizes.length;i++)
		{
			_fs = _fs + "<option value='" + _._fontSizes[i] + "'>" + _._fontSizes[i] + "</option>"
		}
		G("FontSize").innerHTML = _fs + "</select>";
		G("FontSize").onchange = function(){_._change("FontSize", "change")}

		_fs = "<select>";
		for (i=0;i<_._fontFamilies.length;i++)
		{
			_fs = _fs + "<option value='" + _._fontFamilies[i] + "'>" + _._fontFamilies[i] + "</option>"
		}
		G("FontFamily").innerHTML = _fs + "</select>";
		G("FontFamily").onchange = function(){_._change("FontFamily", "change")}

		var buttons = _.container.getElementsByTagName('li');
                for (i=0;i<buttons.length;i++)
                {
			buttons[i].addEventListener(b?'touchstart':'mousedown', function(e)
			{
				var nowClick = e.srcElement;
				_._change(nowClick.id, nowClick.className);
				if (nowClick.className == "")
				{
					nowClick.className = "press";
				}
				else {nowClick.className = ""}
			})
                }
		G("param_text").onkeyup = function(){_._change('param_text', 'press')};

	},
	_change:function(e, a){
		var _ = this;
		switch(e)
		{
			case 'param_text':
				_.onchange({textContent: G("param_text").value}, true)
			break;

			case 'FontSize':
				_.onchange({fontSize: G('FontSize').children[0].value}, true)
			break;
			case 'FontFamily':
				_.onchange({fontFamily: G('FontFamily').children[0].value}, true)
			break;

			case 'FontB':
				if(a == 'press')
					_.onchange({fontWeight: ""}, true)
				else
					_.onchange({fontWeight: "bold"}, true)
			break;
			case 'FontI':
				if (a == 'press')
					_.onchange({fontStyle: ""}, true)
				else
					_.onchange({fontStyle: "italic"}, true)
			break;

			case 'FontTextLeft':
				_._clearPress('align');
				if (a == '')
                                        _.onchange({textAlign: 'left'}, true)
			break;
			case 'FontTextRight':
				_._clearPress('align');
				if (a == '')
                                        _.onchange({textAlign: 'right'}, true)
			break;
			case 'FontTextMiddle':
				_._clearPress('align');
				if (a == '')
					_.onchange({textAlign: 'center'}, true)
			break;

			case 'FontTTop':
				_._clearPress('valign');
				if (a == '')
					_.onchange({textVAlign: 'top'}, true)
			break;
			case 'FontTBottom':
				_._clearPress('valign');
				if (a == '')
					_.onchange({textVAlign: 'bottom'}, true)
			break;
			case 'FontTMiddle':
				_._clearPress('valign');
				if (a == '')
					_.onchange({textVAlign: 'middle'}, true)
			break;
		}
	},
	_clearPress:function(style){
		if (style == "align")
		{
			G("FontTextLeft").className = "";
			G("FontTextRight").className = "";
			G("FontTextMiddle").className = "";
		}else{
			G("FontTTop").className = "";
			G("FontTBottom").className = "";
			G("FontTMiddle").className = "";
		}
	},
	_setFontDetail:function(c){
		var _ = this;
		for (i=0;i<_._fontFamilies.length;i++)
		{
			if (_._fontFamilies[i] == c.fontFamily)
			{
				G("FontFamily").children[0].options[i].selected = true;
			}
		}
		if (c.fontSize != undefined)
		{
			for (i=0;i<_._fontSizes.length;i++)
                	{
				if (_._fontSizes[i] == c.fontSize)
				{
					G("FontSize").children[0].options[i].selected = true;
				}
			}
		}

		G("param_text").value = "";
		if (c.textContent != undefined)
		{
			G("param_text").value = decodeURIComponent(decodeURIComponent(c.textContent));
		}
		
		G("FontB").className = "";
		if (c.fontWeight == "bold")
		{
			G("FontB").className = "press";
		}

		G("FontI").className = "";
		if (c.fontStyle == 'italic')
		{
			G("FontI").className = "press";
		}

		_._clearPress('align');
		switch (c.textAlign)
		{
			case "left":
				 G("FontTextLeft").className = "press";
			break;
			case "right":
				 G("FontTextRight").className = "press";
			break;
			case "center":
				 G("FontTextMiddle").className = "press";
			break;
		}

		_._clearPress('valign');
		switch (c.textVAlign)
		{
			case "top":
				 G("FontTTop").className = "press";
			break;
			case "bottom":
				 G("FontTBottom").className = "press";
			break;
			case "middle":
				 G("FontTMiddle").className = "press";
			break;
		} 
	},
	getFontDetail:function(c){
		var font = {};
		var param;
		var _ = this;
		for (i=0;i<c.length;i++)
		{
			param = c[i];
                	if (param.fontSize != undefined)
                        	font.fontSize = param.fontSize;
                        if (param.fontStyle != undefined)
                                font.fontStyle = param.fontStyle;
                        if (param.fontWeight != undefined)
                                font.fontWeight = param.fontWeight;
                        if (param.fontFamily != undefined)
                                font.fontFamily = param.fontFamily;
                        if (param.textAlign != undefined)
                                font.textAlign = param.textAlign;
			if (param.textVAlign != undefined)
				font.textVAlign = param.textVAlign;
                        if (param.textContent != undefined)
                                font.textContent = escape(param.textContent);
                        //if (param.textDecoration != undefined)
                        //        font.textDecoration = param.textDecoration;

		}
		_._fontDetail = font;
		_._setFontDetail(font);
	},
    //adjust the position of panel
    //2012/7/31 17:06:16
    adjustPosition: function (obj, poi){
        if (!obj) return;           

        var srcPosition       = getAllPosition(obj),
            containerPosition = getAllPosition(this.container),
            offsetY           = srcPosition.y - this.container.offsetHeight / 2;

        //plus 35px
        this.container.style.top = offsetY + 'px';

        if (poi) {
            poi.style.display     = 'block';
            poi.style.background  = '#fff';
            poi.style.borderColor = '#ccc'; 
            poi.style.MozTransform         = 'rotate(135deg)';
            poi.style['-webkit-transform'] = 'rotate(135deg)';
            poi.style.top   = srcPosition.y + obj.offsetHeight / 2 + 'px';
            poi.style.left  = containerPosition.x + this.container.offsetWidth - 7.5 + 'px';
        }
    }
}
