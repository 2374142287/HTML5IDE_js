Hedit={
    /**
     *
     函数名称：registerOp
     函数说明：注册外部数据。
     返回值：

         true:   如果当前数据被压栈(即包含更新)
         false:  如果当前数据没有被压栈(即没有更新)
     */
    lowerBound : [], 
    registerOp:function(ctx, data){
        return this.saveStatus(ctx, data);
    },
    /**
     *
     函数名称：removeItem
     函数说明：删除指定的Storage。
     参数：
          ctx: 上下文
          index: 开始索引
     */
    removeItem:function(ctx, index){
        var n;
        var s=Storage.getItem(ctx)||'';
        n=(s?JSON.parse(s):[0,0,0])[2];
        for(var i=index||0;i<=n;i++)Storage.removeItem(ctx+i);
        if(!index)Storage.removeItem(ctx);
    },
	
	//跳至某一步，其后的全部删除
    jump:function(ctx, n){
		var a=JSON.parse(Storage.getItem(ctx)||0)||[0,0,0];
		if(!n)n=a[0];
		a[0]=a[2]=n;
		this.lower=n+1;
        this.removeItem(ctx, n+1);
        Storage.setItem(ctx,JSON.stringify(a));
		return n;
    },

    setUndoLowerBound:function(ctx, index){
        this.lowerBound[ctx] = index;
    },
    
    clearUndoLowerBound:function(ctx){
        this.lowerBound[ctx] = 0;
    },
    /**
     *
     函数名称：saveStatus
     函数说明：将传入的参数data用Storage格式保存起来。
     返回值：保存的数据的标识。
	 数组说明：[3,0,3]: [当前索引，最小索引，最大索引] 
     */
    saveStatus: function(ctx, data){
        var n;
        var o;
        var s=Storage.getItem(ctx)||0;
        o=JSON.parse(s)||[-1,0,0];
        n=o[0]+1;
        o[0]=o[2]=n;
        this.removeItem(ctx, n);
        while(true){
          try{
            if(o[1]<0||o[1]>n){//栈底下标小于0，或者大于最大栈索引，无法压栈
              alert(Hanimation.Message.StorageError);
              return;
            };
            Storage.setItem(ctx+n,data);
            break;
          }catch(e){//当前栈压不下，删除栈底的项
            Storage.removeItem(ctx+o[1]);
            o[1]++;//栈底下标加1
            
            // 华东：这个地方的逻辑需要更新一下以防止死循环。目前如果载入的作品尺寸太大，会死循环 
            // break;
          }
        }
        Storage.setItem(ctx,JSON.stringify(o));//压栈
    },

    /**
     *
     函数名称：undoOp
     函数说明：撤销上一步操作。
     返回值：撤销操作后对应的某个历史数据。如果已经没有操作可撤销，则返回空(null)。
     */
    undoOp: function(ctx){
        return this.redoOp(ctx, true);
    },

    /**
     *
     函数名称：redoOp
     函数说明：恢复下一步操作。
     返回值：恢复操作后对应的某个历史数据。如果已经没有操作可恢复，则返回空(null)。
     */
    redoOp: function(ctx, isUndo){
        if(!this[isUndo?'canUndo':'canRedo'](ctx))return;
        var c;
        var o=JSON.parse(Storage.getItem(ctx))||[0,0,0];
        o[0]+=(isUndo?-1:1);
        if(c=Storage.getItem(ctx+o[0])){
          c=JSON.parse(c);
          Storage.setItem(ctx,JSON.stringify(o));
        }
        return c;
    },

    /**
     *
     函数名称：canUndo
     函数说明：判断是否还有操作可以撤销
     返回值：

        true:   有操作可以撤销
        false:  没有操作可以撤销 (即当前版本指针移动到了栈底)
     */
    canUndo: function(ctx){
        return this.canRedo(ctx, true);
    },

    /**
     *
     函数名称：canRedo
     函数说明：判断是否还有操作可以恢复
     返回值：

        true:   有操作可以恢复
        false:  没有操作可以恢复 (即当前版本指针移动到了栈顶)
     */
    canRedo: function(ctx, isUndo){
        var o=Storage.getItem(ctx);
        if(!o)return;
        o=JSON.parse(o);
        if(!o)return;
        
        //var bound = this.lowerBound[ctx] == undefined ? 0 : this.lowerBound[ctx];
        //var lower = Math.max(bound, o[1]); 
		
        var lower = Math.max(this.lower||0, o[1]); 
        
        // return isUndo?(o[0]>o[1]):(o[0]<o[2]);
        return isUndo?(o[0]>lower):(o[0]<o[2]);
    }
}