
COLOR = {
	// 将hex,rgb,rgba字符串转换成颜色对象
	toColorArray : function (a) {
		var c;
		var r = [];
		for (var i = 0; i < a.length; i++) {
			c = a[i];
			r.push(c.p || 0);
			r.push(this.toRGBAString(c));
		}
		return r;
	},
	// 将hex,rgb,rgba字符串转换成颜色对象
	toRGBA : function (s) {
		s = s.replace(/#|\s/g, '').toLowerCase();
		if (/rgb[a]?\((\d+),(\d+),(\d+)[\,]?([\d+\.]*)\)/.test(s))
			return {
				r : RegExp.$1,
				g : RegExp.$2,
				b : RegExp.$3,
				a : RegExp.$4 || 1
			};
		if (s.length == 3) {
			s = s.split('');
			s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
		};
		s = parseInt(s, 16);
		return {
			r : s >> 16,
			g : (s & 0x00FF00) >> 8,
			b : (s & 0x0000FF),
			a : 1
		};
	},
	// 将颜色对象转换成rgba字符串
	toRGBAString : function (o) {
		return !o ? '' : ('rgba(' + o.r + ', ' + o.g + ', ' + o.b + ', ' + ((o.a != undefined) ? o.a : 1) + ')')
	},
	// 将填充对象转换成背景色
	toBackground : function (fillInfo) {
		if (fillInfo.fillStyle == 0)
			return this.toRGBAString(fillInfo.fillColors[0]);
		var ret = '';
		var a = fillInfo.fillColors;
		var c;
		for (var i = 0; i < a.length; i++) {
			c = this.toRGBAString(a[i]);
			if (this.iswebkit) {
				ret += ',color-stop(' + a[i].p + ', ' + c + ')';
			} else {
				ret += ',' + c + ' ' + Math.round(a[i].p * 100) + '%';
			}
		}
		if (fillInfo.fillStyle == 1) {
			ret = this.iswebkit
				 ? ('-webkit-gradient(linear,left top,right top{0})'.replace('{0}', ret))
				 : ('-moz-linear-gradient(center left{0})'.replace('{0}', ret));
		} else {
			ret = this.iswebkit
				 ? ('-webkit-gradient(radial,10,10,10,10,10,0{0})'.replace('{0}', ret))
				 : ('-moz-linear-gradient(center left{0})'.replace('{0}', ret));
		}
		return ret;
	},
	// 将背景色转换成填充对象
	//-moz-linear-gradient(left center , rgb(255, 0, 0) 0%, rgb(255, 255, 255) 50%, rgb(0, 136, 0) 100%) repeat scroll 0% 0% transparent; color: rgb(0, 0, 0);
	//-webkit-gradient(linear, 0% 0%, 100% 0%, from(rgb(255, 0, 0)), color-stop(0.5, rgb(255, 255, 255)), color-stop(0.72, rgb(0, 0, 255)), to(rgb(0, 136, 0)))
	toFillColors : function (s, n) {
		var a;
		var c;
		var r = [];
		var fillColors = [];
		if (typeof(s) == 'object') {
			r = s;
		} else if (/moz/.test(s)) { //moz
			if (a = s.match(/, ([^%]+)%/g)) {
				for (var i = 0; i < a.length; i++) {
					if (/, (.+) (.+)%/.test(a[i])) {
						r.push(parseFloat(RegExp.$2) / 100);
						r.push(RegExp.$1);
					}
				}
			}
		} else if (/webkit/.test(s)) { //webkit
			s = s.replace('from(', 'color-stop(0, ').replace('to(', 'color-stop(1, ').replace(')))', ')),');
			if (a = s.match(/color-stop\((.+?)\)\,/g)) {
				for (var i = 0; i < a.length; i++) {
					if (/color-stop\(([\d\.]+), (.+)\)\,/.test(a[i])) {
						r.push(parseFloat(RegExp.$1));
						r.push(RegExp.$2);
					}
				}
			}
		}
		if (r.length) { // 渐变
			for (var i = 0; i < r.length; i += 2) {
				a = this.toRGBA(r[i + 1]);
				a.p = parseFloat(r[i]);
				fillColors.push(a);
			}
		} else { // 单色
			fillColors.push(this.toRGBA(s));
		}
		return fillColors;
	}
}

//分页
function getpage(p) {
    var now = p.now || 1;
    var sum = p.sum || 0;
    var step = p.step || 1;
    var href = p.href || '{0}';
    var prev = p.prev || 'Prev';
    var next = p.next || 'Next';
    if(p.size){
      sum=Math.floor(p.total / p.size);
      if (p.total % p.size) sum++;
    }
    if (sum <= 1) return '';
    var each = function (page, text) { return (page < 1 || page > sum) ? '' : ((page == now) ? ('<b>' + page + '</b> ') : ('<a href="' + href.replace(/\{0\}/g, page) + '">' + (text || page) + '</a> ')); }
    var ret = '';
    var len = step * 2 + 1;
    var start = now - step;
    if (start < 1) start = 1;
    if (start + len > sum) start = sum - len;
    var end = start + len;
    if (end > sum) end = sum;
    if (now > 1) ret += each(now - 1, prev);
	
	//ret += each(now);
    if (start > 1) ret += each(1);
    if (start > 2) ret += each(Math.floor((1 + start) / 2), '...');
    for (var i = start; i < end; i++) ret += each(i);
    if (end < sum) ret += each(Math.floor((sum + end) / 2), '...');
    if (end < sum + 1) ret += each(sum);
    if (now < sum) ret += each(now + 1, next);
    return '<div class="xpage">' + ret + '</div>';
}
