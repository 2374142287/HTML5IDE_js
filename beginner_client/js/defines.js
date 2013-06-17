/*!
 * [代码说明]
 *
 * Copyright 2010, Cleeki, Inc.
 * All rights reserved
 *
 * 版权所有 未经许可不得传播
 */
//////////////////////////////////////////////////////////////

// 0.5.0
Hanimation.VERSION = 510;

Hanimation.PADDING = 32;
Hanimation.HEADERHEIGHT = 60;

Hanimation.GRADUNIT = Math.PI/180;
Hanimation.COMMAND = 1000;


Hanimation.MAX_VALUE = 99999999;
Hanimation.MIN_VALUE = -99999999;

Hanimation.COMMAND_PLAY = Hanimation.COMMAND + 10;
Hanimation.COMMAND_PAUSE = Hanimation.COMMAND + 11;
Hanimation.COMMAND_STOP = Hanimation.COMMAND + 12;
Hanimation.COMMAND_LOOP = Hanimation.COMMAND + 51;

Hanimation.COMMAND_DELETE_LAYER = Hanimation.COMMAND + 15;
Hanimation.COMMAND_ADD_LAYER = Hanimation.COMMAND + 16;
Hanimation.COMMAND_UP_LAYER = Hanimation.COMMAND + 37;
Hanimation.COMMAND_DOWN_LAYER = Hanimation.COMMAND + 38;
Hanimation.COMMAND_TRANS_LAYER = Hanimation.COMMAND + 39;
Hanimation.COMMAND_CAMERA = Hanimation.COMMAND + 41;
Hanimation.COMMAND_CAMERADEL = Hanimation.COMMAND + 42;
Hanimation.COMMAND_CAMERAVIEW = Hanimation.COMMAND + 43;
Hanimation.COMMAND_CONVERT_MASK = Hanimation.COMMAND + 44;
Hanimation.COMMAND_ADD_MASK = Hanimation.COMMAND + 45;
Hanimation.COMMAND_SWAP_MASK = Hanimation.COMMAND + 46;
Hanimation.COMMAND_INSERT_ANIMATION = Hanimation.COMMAND + 17;
Hanimation.COMMAND_DELETE_ANIMATION = Hanimation.COMMAND + 18;
Hanimation.COMMAND_INSERT_FRAME = Hanimation.COMMAND + 19;
Hanimation.COMMAND_DELETE_FRAME = Hanimation.COMMAND + 20;
Hanimation.COMMAND_INSERT_KEYFRAME = Hanimation.COMMAND + 21;
Hanimation.COMMAND_DELETE_KEYFRAME = Hanimation.COMMAND + 22;
Hanimation.COMMAND_COPY_KEYFRAME = Hanimation.COMMAND + 67;
Hanimation.COMMAND_PASTE_KEYFRAME = Hanimation.COMMAND + 68;
Hanimation.COMMAND_COPY_FRAMES = Hanimation.COMMAND + 71;
Hanimation.COMMAND_CUT_FRAMES = Hanimation.COMMAND + 72;
Hanimation.COMMAND_PASTE_FRAMES = Hanimation.COMMAND + 73;

Hanimation.COMMAND_CLEAR_KEYFRAME = Hanimation.COMMAND + 40;
Hanimation.COMMAND_HIDE_LAYER = Hanimation.COMMAND + 23;
Hanimation.COMMAND_LOCK_LAYER = Hanimation.COMMAND + 24;

Hanimation.COMMAND_INSERT_PROGRESS = Hanimation.COMMAND + 69;
Hanimation.COMMAND_DELETE_PROGRESS = Hanimation.COMMAND + 70;

Hanimation.COMMAND_GROUP = Hanimation.COMMAND + 25;
Hanimation.COMMAND_UNGROUP = Hanimation.COMMAND + 26;
Hanimation.COMMAND_DELETE_OBJECT = Hanimation.COMMAND + 27;
Hanimation.COMMAND_REGROUP = Hanimation.COMMAND + 29;
Hanimation.COMMAND_EDITGROUP = Hanimation.COMMAND + 74;
Hanimation.COMMAND_EXPORTANIMATION = Hanimation.COMMAND + 75;
Hanimation.COMMAND_LOCK = Hanimation.COMMAND + 82;
Hanimation.COMMAND_UNLOCKALL = Hanimation.COMMAND + 83;

Hanimation.COMMAND_TRACK_ANCHORS = Hanimation.COMMAND + 61;
Hanimation.COMMAND_INSERT_CAMERA = Hanimation.COMMAND + 62;
Hanimation.COMMAND_DELETE_CAMERA = Hanimation.COMMAND + 63;
Hanimation.COMMAND_DISPLAY_PATH = Hanimation.COMMAND + 64;
Hanimation.COMMAND_CUSTOMIZE_PATH = Hanimation.COMMAND + 65;
Hanimation.COMMAND_DISPLAY_CAMERA = Hanimation.COMMAND + 66;

Hanimation.COMMAND_CUT = Hanimation.COMMAND + 4;
Hanimation.COMMAND_COPY = Hanimation.COMMAND + 5;
Hanimation.COMMAND_PASTE = Hanimation.COMMAND + 6;
Hanimation.COMMAND_DELETE = Hanimation.COMMAND + 7;

Hanimation.COMMAND_UNDO = Hanimation.COMMAND + 8;
Hanimation.COMMAND_REDO = Hanimation.COMMAND + 9;

Hanimation.COMMAND_UNION = Hanimation.COMMAND + 31;
Hanimation.COMMAND_JOINT = Hanimation.COMMAND + 32;
Hanimation.COMMAND_DIFF = Hanimation.COMMAND + 33;

Hanimation.COMMAND_NEW = Hanimation.COMMAND + 1;
Hanimation.COMMAND_OPEN = Hanimation.COMMAND + 2;
Hanimation.COMMAND_SAVE = Hanimation.COMMAND + 3;
Hanimation.COMMAND_SAVEAS = Hanimation.COMMAND + 28;
Hanimation.COMMAND_PREVIEW = Hanimation.COMMAND + 13;
Hanimation.COMMAND_HELP = Hanimation.COMMAND + 14;
Hanimation.COMMAND_TIMELINE = Hanimation.COMMAND + 34;
Hanimation.COMMAND_IMPORT = Hanimation.COMMAND + 50;

Hanimation.ALT_KEY = 1;
Hanimation.CTRL_KEY = 2;
Hanimation.SHIFT_KEY = 4;
Hanimation.MASTER_KEY = 8;

Hanimation.FM_EDIT = 0;
Hanimation.FM_SCALE = 1;
Hanimation.FM_NODE = 2;

Hanimation.PLAYING = 0;
Hanimation.PAUSED = 1;
Hanimation.STOPPED = 2;
var ROOTDIR = '/';

Hanimation.ImageURL = ROOTDIR + 'myani/saveimage';
Hanimation.AudioURL = ROOTDIR + 'myani/saveaudio';
Hanimation.LoginURL = ROOTDIR;
Hanimation.SaveURL = ROOTDIR + 'myani/save';
Hanimation.PublishURL = ROOTDIR + 'animation/publish';
Hanimation.MyWorksAPI = ROOTDIR + 'myani/myworksapi';
Hanimation.ShareWorksAPI = ROOTDIR + 'myani/shareworksapi';
Hanimation.AssetServer = ROOTDIR + 'asset/list';
Hanimation.ShareURL = ROOTDIR + 'myani/share';

Hanimation.Message = {};
Hanimation.Message.ImageError = Lang.M_ImageError;
Hanimation.Message.ServerError = Lang.M_ServerError;
Hanimation.Message.UploadError = Lang.M_UploadError;
Hanimation.Message.BezierError = Lang.M_BezierError;
Hanimation.Message.StorageError = Lang.M_StorageError;
Hanimation.Message.ParseError = Lang.M_ParseError;
Hanimation.Message.GroupError = Lang.M_GroupError;
Hanimation.Message.NoData = Lang.M_NoData;
Hanimation.Message.BeforeUnload = Lang.M_BeforeUnload;
Hanimation.Message.NeedLogin = Lang.M_NeedLogin;
Hanimation.Message.NeedLoginConfirm = Lang.M_NeedLoginConfirm;
Hanimation.Message.ImageURL = Lang.M_ImageURL;
Hanimation.Message.AudioURL = Lang.M_AudioURL;
Hanimation.Message.AudioText = Lang.M_AudioText;
Hanimation.Message.ImageExtention = Lang.M_ImageExtention;
Hanimation.Message.AudioExtention = Lang.M_AudioExtention;
Hanimation.Message.NoImage = Lang.M_NoImage;
Hanimation.Message.NoAudio = Lang.M_NoAudio;
Hanimation.Message.SelectImage = Lang.M_SelectImage;
Hanimation.Message.SelectAudio = Lang.M_SelectAudio;
Hanimation.Message.CheckTitle = Lang.M_CheckTitle;
Hanimation.Message.CheckWidth = Lang.M_CheckWidth;
Hanimation.Message.CheckHeight = Lang.M_CheckHeight;
Hanimation.Message.CheckRate = Lang.M_CheckRate;
Hanimation.Message.ImportYet = Lang.M_ImportYet;
Hanimation.Message.NotOpenWork = Lang.M_NotOpenWork;
Hanimation.Message.NotOwnWork = Lang.M_NotOwnWork;
Hanimation.Message.NoObject = Lang.M_NoObject;
Hanimation.Message.NoProgress = Lang.M_NoProgress;
Hanimation.Message.ProgressGroup = Lang.M_ProgressGroup;
Hanimation.Message.LockedUnit = Lang.M_LockedUnit;
Hanimation.Message.LockedLayer = Lang.M_LockedLayer;
Hanimation.Message.NeedSave = Lang.M_NeedSave;
Hanimation.Message.InvalidValue = Lang.M_InvalidValue;
Hanimation.Message.CameraZoom = Lang.M_CameraZoom;
Hanimation.Message.NoCamera = Lang.M_NoCamera;
Hanimation.Message.AjaxError = Lang.M_AjaxError;
Hanimation.Message.ToMuchDeletion = Lang.M_ToMuchDeletion;
Hanimation.Message.MustLogin = Lang.M_MustLogin;
Hanimation.Message.CamerasOnlyStage = Lang.M_CamerasOnlyStage;
Hanimation.Message.DelObjWithAnimation = Lang.M_DelObjWithAnimation;
Hanimation.Message.RestrictedEdit = Lang.M_RestrictedEdit;
Hanimation.Message.NoKeyframe = Lang.M_NoKeyframe;
Hanimation.Message.NotURL = Lang.M_NotURL;
Hanimation.Message.NotEnoughLayers = Lang.M_NotEnoughLayers;
Hanimation.Message.NotBlankFrames = Lang.M_NotBlankFrames;
Hanimation.Message.WholeUnitSelection = Lang.M_WholeUnitSelection;
Hanimation.Message.CombineError = Lang.M_CombineError;
Hanimation.Message.InvalidCurve = Lang.M_InvalidCurve;
Hanimation.Message.DuplicateName = Lang.M_DuplicateName;
Hanimation.Message.ActionFormUrl = Lang.M_ActionFormUrl;
Hanimation.Message.ActionFormUrlFormat = Lang.M_ActionFormUrlFormat;
Hanimation.Message.ActionFormNeedOne = Lang.M_ActionFormNeedOne;
Hanimation.Message.SaveWhileEditingSymbols = Lang.M_SaveWhileEditingSymbols;
Hanimation.Message.SymbolNotIn = Lang.M_SymbolNotIn;
Hanimation.Message.NestedSymbol = Lang.M_NestedSymbol;
Hanimation.Message.DeleteIt = Lang.M_DeleteIt;
Hanimation.Message.TrackAnchorsTip = Lang.M_TrackAnchorsTip;
Hanimation.Message.BehaviorAlready = Lang.M_BehaviorAlready;
Hanimation.Message.MaxZoom = Lang.M_MaxZoom;
Hanimation.Message.ConfirmLayerDeletion = Lang.M_ConfirmLayerDeletion;
Hanimation.Message.ConfirmCurveConvert = Lang.M_ConfirmCurveConvert;
Hanimation.Message.ReferredSymbol = Lang.M_ReferredSymbol;
Hanimation.Message.CloseBlockPopups =Lang.M_CloseBlockPopups;

Hanimation.BehaviorTree = [
	{id:1,pid:0,type:'',name:Lang["bh_PlaybackControl"]},
	{id:2,pid:1,type:'gotoAndPlay',name:Lang["bh_GotoAndPlay"]},
	{id:3,pid:1,type:'gotoAndStop',name:Lang["bh_GotoAndStop"]},
	{id:4,pid:1,type:'pause',name:Lang["bh_Pause"]},
	{id:5,pid:1,type:'play',name:Lang["bh_Play"]},
	{id:6,pid:0,type:'',name:Lang["bh_Transition"]},
	{id:7,pid:6,type:'expandFromLeft',name:Lang["bh_ExpandFromLeft"]},
	{id:8,pid:6,type:'expandFromRight',name:Lang["bh_ExpandFromRight"]},
	{id:9,pid:6,type:'expandFromTop',name:Lang["bh_ExpandFromTop"]},
	{id:10,pid:6,type:'expandFromBottom',name:Lang["bh_ExpandFromBottom"]}
];
Hanimation.BehaviorEvent = [
	{text:Lang["bh_click"],value:'click'},
	{text:Lang["bh_appear"],value:'appear'},
	{text:Lang["bh_slide"],value:'slide'}
];


//数据缓存
Storage={
  getItem:function(key){
    return this[key]||'';
  },
  setItem:function(key, data){
    this[key]=data||'';
  },
  removeItem:function(key){
    delete this[key];
  }
}

//数据压缩转换
HaniData={
  zip:function(data){
    return this.unzip(data,true);
  },
  unzip:function(data,zip){
    var layers = data.layers;
    for(var i=layers.length-1;i>=0;i--){
      var layer=layers[i];
      var units=layer.units;
      for(var j=0;j<units.length;j++){
        var unit=units[j];
        var objs=unit.objects;
        for(var k=0;k<objs.length;k++){
          this.fobjs(objs[k],zip);
        }
      }
    }
    return data;  
  },
  fobjs:function(obj,zip){
    if(obj.items&&obj.items.length){
      for(var i=0;i<obj.items.length;i++){
        var o=obj.items[i];
        if(o.items&&o.items.length){
          this.fobjs(o,zip);
        }else{
          this.fobj(o,zip);
        }
      }
    }else{
      this.fobj(obj,zip);
    }
  },
  fobj:function(obj,zip){
    var points=obj.curve.points;
    var len=points.length;
    if(!len)return;
    var pt;
    var ret=[];
    var isString=typeof points=='string';
    var isBezier=obj.type!=Hanimation.SHAPE_SPLINE;
    if(zip){
      if(isString)return;
      for(var i=0;i<len;i++){
        pt=points[i];
        pt=isBezier?[pt.backwardX,pt.backwardY,pt.forwardX,pt.forwardY,pt.nodeX,pt.nodeY]:[pt.x,pt.y];
        ret.push(pt.join(','));
      }
      ret=ret.join(';');
    }else{
      if(!isString)return;
      points=points.split(';');
      for(var i=0;i<points.length;i++){
        pt=points[i].split(',');
        pt=isBezier?{
          backwardX:Number(pt[0]),
          backwardY:Number(pt[1]),
          forwardX:Number(pt[2]),
          forwardY:Number(pt[3]),
          nodeX:Number(pt[4]),
          nodeY:Number(pt[5])
        }:{
          x:Number(pt[0]),
          y:Number(pt[1])
        };
        ret.push(pt);
      }
    }
    obj.curve.points=ret;
  }
}

createKeyframe = function(keyframe, param) {
    var key = {
        id: keyframe ? keyframe: 0,
        mode: 0,
        tween: '',
        param: null
    };

    if (param) key.param = JSON.clone(param);
    else key.param = createParam();

    return key;
};

createUnit = function(layer, s, c) {

    var unit_param = {
        id: guidGen(),
        layerId: layer ? layer: 0,
        frameStart: s ? s: 0,
        frameCount: c ? c: 1,

        animated: false,
        visible: true,
        objects: [],

        keyframes: [],
        hashKey: []
    };

    return unit_param;
};

createLayer = function(layer) {
    
    var id = layer ? layer: 0;
    
    var layer_param = {
        id: id,
        name: Lang["LayerAttr"] + id,
        hide: false,
        lock: false,
        units: []
    };

    return layer_param;
};

createAniData = function() {
    var ani_data = {
        version: Hanimation.VERSION,
        guid: "",
        title: "",
        width: 600,
        height: 400,
        rate:12,
        color: "#fff",
        script: "",
        loop: true,
        useCamera: false,
        symbols: [],
        layers: []
    };
    
    var zoom_data = {
        zoomLevel: 1., 
        offsetLeft: 0, 
        offsetTop: 0, 
        rotation: 0
    };
    
    ani_data.zoomInfo = [zoom_data];
    
    return ani_data;
};

getOffsetX = function(e){
	return (e.offsetX === undefined) ? ((e.layerX === undefined) ? 0 : e.layerX) : e.offsetX;
};

getOffsetY = function(e){
	return (e.offsetY === undefined) ? ((e.layerY === undefined) ? 0 : e.layerY) : e.offsetY;
};
