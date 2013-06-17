/*!
 * [代码说明]
 *
 * Copyright 2010, Cleeki, Inc.
 * All rights reserved
 *
 * 版权所有 未经许可不得传播
 */
//////////////////////////////////////////////////////////////

if (typeof Hanimation == 'undefined') {
    var Hanimation = {};
};

function compressCurve(curve, mode)
{
    if(typeof mode == "undefined" || !curve || !curve.points || curve.points.length == 0)
        return null; 
    
    var out = [];
    
    var i = 0;
    
    outi[i++] = mode;
    var points = curve.points;
    if(mode == 0)
    {
        out[i++] = curve.closed ? 1 : 0; 
        var len = points.length; 
        for(var j=0;j<len;j++)
        {
            var pt = points[j];
            out[i++] = pt.nodeX;
            out[i++] = pt.nodeY;
            out[i++] = pt.forwardX;
            out[i++] = pt.forwardY;
            out[i++] = pt.backwardX;
            out[i++] = pt.backwardY;
        }
    }
    else if(mode == 1)
    {
        out[i++] = curve.closed ? 1 : 0; 
        var len = points.length; 
        for(var j=0;j<len;j++)
        {
            var pt = points[j];
            out[i++] = pt.x;
            out[i++] = pt.y;
        }
    }
    
    return out;
};

function decompressCurve(curve)
{
    if(!curve || curve.length == 0)
        return null; 
     
    var mode = curve[0];
    var out = {};
    var i = 0;
    if(mode == 0)
    {
        var len = curve.length; 
        out.closed = curve[1] ? true : false;
        out.points = [];
        var count = Math.floor((len-2)/6);
        var i = 1;
        for(var j=0;j<count;j++)
        {
            var pt = createTriPoint(curve[i], curve[i+1], curve[i+2], curve[i+3], curve[i+4], curve[i+5]);
            out.points.push(pt); 
            i += 6;
        }
    }
    else if(mode == 1)
    {
        var len = curve.length; 
        out.closed = curve[1] ? true : false;
        out.points = [];
        var count = Math.floor((len-2)/2);
        var i = 1;
        for(var j=0;j<count;j++)
        {
            var pt = createPoint(curve[i], curve[i+1]);
            out.points.push(pt); 
            i += 2;
        }
    }   

    return out;
};

function compressParam(param)
{
    if(!param)
        return null;
        
    var out = param.left+','+param.top+','+param.right+','+param.bottom+','+param.startX+','+param.startY+','+param.endX+','+param.endY+','+','+param.alpha+','+param.rotate+','+param.scaleX+','+param.scaleY+','+param.lineWidth+','+param.strokeType+','+param.strokeColor+','+param.lineCap+','+param.lineJoin+','+param.fillInfo.fillStyle+','+param.fillInfo.fillImage+','+param.fillInfo.fillStartPos.x+','+param.fillInfo.fillStartPos.y+','+param.fillInfo.fillEndPos.x+','+param.fillInfo.fillEndPos.y;
    
    
    var clrs = param.fillInfo.fillColors;
    var count = clrs.length;
    var clr = "";
    for(var i=0;i<count;i++)
        clr += clrs[i].p+','+clrs[i].r+','+clrs[i].g+','+clrs[i].b+','+clrs[i].a+',';
        
    out += ','+clr;
    
    return out;
};

function decompressParam(data)
{
    if(!data)
        return null;

    var par = createParam();
     
    var i=0;
    par.left = data[i++];
    par.top = data[i++];
    par.right = data[i++];
    par.bottom = data[i++];
    par.startX = data[i++];
    par.startY = data[i++];
    par.endX = data[i++];
    par.endY = data[i++];
    par.alpha = data[i++];
    par.rotate = data[i++];
    par.scaleX = data[i++];
    par.scaleY = data[i++];
    par.lineWidth = data[i++];
    par.strokeType = data[i++];
    par.strokeColor = data[i++];
    par.lineCap = data[i++];
    par.lineJoin = data[i++];
    
    par.fillInfo = createFillInfo();
    par.fillInfo.fillStyle = data[i++];
    par.fillInfo.fillImage = data[i++];
    
    par.fillInfo.fillStartPos = {};
    par.fillInfo.fillStartPos.x = data[i++];
    par.fillInfo.fillStartPos.y = data[i++];
    
    par.fillInfo.fillEndPos = {};
    par.fillInfo.fillEndPos.x = data[i++];
    par.fillInfo.fillEndPos.y = data[i++];
    
    par.width = par.right - par.left;
    par.height = par.bottom - par.top;
    
    par.fillInfo.fillColors = [];
    var aryColors = data.slice(i);
    var len = Math.floor(aryColors.length/5);
    
    var k=0;
    for(var j=0;j<len;j++)
    {
        var stop = createColorStop(aryColors[k], aryColors[k+1], aryColors[k+2], aryColors[k+3], aryColors[k+4]);
        par.fillInfo.fillColors.push(stop);
    }
    
    return par;
};

Converter = {
    compressLayers:function(aryLayers)
	{
        var newLayers = [];
        if(!aryLayers)
            return null; 
            
         var layerCount = aryLayers.length;
        for (var i = 0; i < layerCount; i++) {
            var layer = aryLayers[i];
            var newLayer = {};
            newLayer.gl=layer.id+','+layer.name+','+(layer.hide?1:0)+','+(layer.lock?1:0);
            newLayer.ut=[];
            
            var units = layer.units;
            var unitCount = units.length;
            for (var j = 0; j < unitCount; j++) {
                var unit = units[j];
                var newUnit = {};
                newUnit.gl = unit.layerId+','+unit.frameStart+','+unit.frameCount+','+unit.animated+','+unit.visible;

                newUnit.ob=[];
                newUnit.ky=[];
                
                var objects = unit.objects;
                var objLen = objects.length;
                for (var k = 0; k < objLen; k++) {
                    var object = objects[k];
                    var objImpl = getAniObject(object);
                    if(objImpl)
                    {
                        var newObj = objImpl.compress();
                        newUnit.ob.push(newObj);
                    }
                }
                
                var keyLen = unit.keyframes.length;
                for(var keyIdx=0;keyIdx<keyLen;keyIdx++)
                {
                    var key = unit.keyframes[keyIdx];
                    var newKey = {};
                    newKey.gl = key.id+','+key.mode;
                    newKey.pm = compressParam(key.param);
                    
                    newUnit.ky.push(newKey);
                }
                newLayer.ut.push(newUnit);
            }
            newLayers.push(newLayer);
        }
        
        return newLayers;
    },
    
    decompressLayers:function(layers)
    {
        var newLayers = [];
        if(!layers)
            return null; 
            
        var layerCount = layers.length;
        for (var i = 0; i < layerCount; i++) {
            var layer = layers[i];
            var aryVal = layer.gl.split(',');
            var newLayer = createLayer(aryVal[0]);
            newLayer.name = aryVal[1];
            newLayer.hide = (aryVal[2] ? true : false);
            newLayer.lock = (aryVal[3] ? true : false); 
            
            newLayer.units=[];
            
            var units = layer.ut;
            var unitCount = ut.length;
            for (var j = 0; j < unitCount; j++) {
                var unit = units[j];
                var newUnit = {};
                aryVal = unit.gl.split(',');
                newUnit.layerId = aryVal[0];
                newUnit.frameStart = aryVal[1];
                newUnit.frameCount = aryVal[2];
                newUnit.animated = (aryVal[3] ? true : false);
                newUnit.visible = (aryVal[4] ? true : false); 
                
                newUnit.objects=[];
                var objects = unit.ob;
                var objLen = objects.length;
                for (var k = 0; k < objLen; k++) {
                    var object = objects[k];
                    aryVal = object.gl.spit(',');
                    var type = aryVal[1];
                    var newObj = createNewObject(type);
                    newObj.decompress(object);
                    
                    newUnit.objects.push(newObj);
                }
                
                newUnit.keyframes=[];
                var keyLen = unit.ky.length;
                for(var keyIdx=0;keyIdx<keyLen;keyIdx++)
                {
                    var key = unit.key[keyIdx];
                    var newKey = {};
                    aryVal = key.gl.spit(',');
                    newKey.id = aryVal[0];
                    newKey.mode = aryVal[1];
                    newKey.param = decompressParam(key.pm);
                    
                    newUnit.keyframes.push(newKey);
                }
                newLayer.units.push(newUnit);
            }
            newLayers.push(newLayer);
        }
        
        return newLayers;    
    },
    
    compressAniData:function(data)
    {
        if(!data)
            return null;
            
        var out={};
        out.gl = data.guid+','+data.title+','+data.width+','+data.height+','+data.color+','+data.script+','+(data.loop?1:0);
        out.ly = Converter.compressLayers(data.layers); 
        
        return out;
    },
    
    decompressAniData:function(data)
    {
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    }
}

