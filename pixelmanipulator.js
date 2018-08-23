/*
	This is a cellular automata JavaScript library. For information about how to use this script, see https://github.com/Lazerbeak12345/pixelmanipulator
    Copyright (C) 2018  Nathan Fritzler

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
window.p=window.pixelManipulator=(function () {
	var licence="pixelmanipulator.js v1.65.145 (beta-proposed) Copyright (C) 2018  Nathan Fritzler\nThis program comes with ABSOLUTELY NO WARRANTY\nThis is free software, and you are welcome to redistribute it\nunder certain conditions, as according to the GNU GENERAL PUBLIC LICENSE.";
	/*function ret(v) {
		return (function() {
			return v;
		});
	}*/
	return Object.create({
		getPixel:function() {},
		confirmElm:function() {},
		whatIs:function() {},
		loopint:0,
		imageData:{},
		zoomX:0,
		zoomY:0,
		row:0,
		elementTypeMap:{
			"blank":{
				color:[0,0,0,255],
			},
		},
		mode:"paused",
		zoomScaleFactor:20,
		ctx:{},
		canvas:{},
		zoomelm:{},
		zoomctx:{},
		zoomctxStrokeStyle:"gray",
		defaultElm:'blank',
		onZoomClick:function(clickEvent,confirmElmInstance) {return window.pixelManipulator.defaultElm;},
		onIterate:function() {},
		onAfterIterate:function() {},
		pixelCounts:{},
	},{
		licence:{
			value:licence,
		},
		__LIFE_TEMPLATES__:{
			value:{
				__LIVE__:function(numtodie,loop,elm) {
					return (function(rel) {
						var nearbyTotal=rel.mooreNearbyCounter(elm,loop),willLive=true;//count how many are nearby (moore style)
						if(numtodie.search(nearbyTotal)<=-1) window.pixelManipulator.setPixel(rel.x,rel.y,window.pixelManipulator.defaultElm);// if any match is found, it dies
					});
				},
				__DEAD__:function(numtolive,loop,elm) {
					return (function(rel) {
						var nearbyTotal=rel.mooreNearbyCounter(elm,loop);//count how many are nearby
						if(numtolive.search(nearbyTotal)>-1) p.setPixel(rel.x,rel.y,elm);// if any match is found, it lives
					});
				},
			}
		},
		__WOLFRAM_TEMPLATE__:{
			value:function(elm,binStates,loop) {
				return (function(rel) {
					if (rel.y!==window.pixelManipulator.row) return;//if it is not in the active row, exit before anything happens
					var lives=false;
					for (var i=0; i<8; i++) if(binStates[i]=="1") if (rel.wolframNearby(elm,(7-i).toString(2).padStart(3,"0"),loop)) lives=true;//for every possible state, if the state is "on", if there is a wolfram match (wolfram code goes from 111 to 000), then it lives
					if (lives) window.pixelManipulator.setPixel(rel.x,rel.y,elm);
				});
			},
		},
		addMultipleElements:{
			value:function(map) {
				for (var elm in map) {
					window.pixelManipulator.addElement(elm,map[elm]);
				}
			},
		},
		addElement:{
			value:function(elm,data) {
				if (typeof elm==="undefined") elm=data.name;
				if (typeof data.color==="undefined") data.color=[255,255,255,255];
				while (data.color.length<4) data.color.push(255);
				if (typeof data.pattern==="string") {
					if (data.pattern.search(/B\d{0,9}\/S\d{0,9}/gi)>-1) {
						var numbers=data.pattern.split(/\/*[a-z]/gi),
							born=numbers[1],die=numbers[2];
						if (typeof data.liveCell==="undefined") data.liveCell=window.pixelManipulator.__LIFE_TEMPLATES__.__LIVE__(die,data.loop,elm);
						if (typeof data.deadCell==="undefined") data.deadCell=window.pixelManipulator.__LIFE_TEMPLATES__.__DEAD__(born,data.loop,elm);
						console.log("life pattern found: ",elm,data);
					}else if (data.pattern.search(/Rule \d*/gi)>-1) {
						var number=data.pattern.split(/Rule /gi)[1]-0,
							binStates=number.toString(2).padStart(8,"0");
						if (typeof data.deadCell==="undefined") data.deadCell=window.pixelManipulator.__WOLFRAM_TEMPLATE__(elm,binStates,data.loop);
						console.log("wolfram pattern found: ",elm,data);
					}
				}
				window.pixelManipulator.elementTypeMap[elm]=data;//for each element
			}
		},
		WhatIs:{
			value:function(f) {
				var specialConfirm=window.pixelManipulator.ConfirmElm(f);
				return (function(x,y,loop) {
					for (var i in window.pixelManipulator.elementTypeMap) {
						if (specialConfirm(x,y,i,loop)) return i;
					}
				});
			}
		},
		setCanvasSizes:{
			value:function(canvasSizes) {
				//console.log("setCanvasSizes");
				window.pixelManipulator.canvas.width=canvasSizes.canvasW||window.pixelManipulator.canvas.width;
				window.pixelManipulator.canvas.height=canvasSizes.canvasH||window.pixelManipulator.canvas.height;
				window.pixelManipulator.zoomelm.width=(canvasSizes.zoomW||window.pixelManipulator.zoomelm.width/window.pixelManipulator.zoomScaleFactor)*window.pixelManipulator.zoomScaleFactor;
				window.pixelManipulator.zoomelm.height=(canvasSizes.zoomH||window.pixelManipulator.zoomelm.height/window.pixelManipulator.zoomScaleFactor)*window.pixelManipulator.zoomScaleFactor;
				window.pixelManipulator.updateData();
			},
		},
		zoomClick:{
			value:function(e) {
				//console.log("zoomClick",e);
				var zoomXPos=Math.floor(e.offsetX/window.pixelManipulator.zoomScaleFactor)+Math.floor(window.pixelManipulator.zoomX-(window.pixelManipulator.zoomScaleFactor/2)),
					zoomYPos=Math.floor(e.offsetY/window.pixelManipulator.zoomScaleFactor)+Math.floor(window.pixelManipulator.zoomY-(window.pixelManipulator.zoomScaleFactor/2));
				//console.log(zoomXPos,"=Math.floor(",e.offsetX,"/",window.pixelManipulator.zoomScaleFactor,")+Math.floor(",window.pixelManipulator.zoomX,"-(",window.pixelManipulator.zoomScaleFactor,"/",2,"))");
				//console.log(zoomYPos,"=Math.floor(",e.offsetY,"/",window.pixelManipulator.zoomScaleFactor,")+Math.floor(",window.pixelManipulator.zoomY,"-(",window.pixelManipulator.zoomScaleFactor,"/",2,"))");
				window.pixelManipulator.setPixel(zoomXPos,zoomYPos,//Where to set the pixel
					window.pixelManipulator.onZoomClick(e,//pass in the click event
						{x:zoomXPos,y:zoomYPos}));//as well as the position on the main canvas that this click was regestered to be at
				window.pixelManipulator.update();
				window.pixelManipulator.zoom({
					x:window.pixelManipulator.zoomX,
					y:window.pixelManipulator.zoomY,
				});
			},
		},
		play:{
			value:function(canvasSizes) {
				//console.log("play");
				window.pixelManipulator.mode="playing";
				window.pixelManipulator.loopint=setInterval(window.pixelManipulator.iterate,1);
			},
		},
		reset:{
			value:function(canvasSizes) {
				//console.log("reset");
				clearInterval(window.pixelManipulator
.loopint);
				window.pixelManipulator.setCanvasSizes(canvasSizes);
				for (var x=0; x<window.pixelManipulator.canvas.width; x++) {
					for (var y=0; y<window.pixelManipulator.canvas.height; y++) {
						window.pixelManipulator.setPixel(x,y,window.pixelManipulator.defaultElm);
					}
				}
				window.pixelManipulator.update();
				window.pixelManipulator.ctx.putImageData(window.pixelManipulator.imageData,0,0);
				window.pixelManipulator.row=0;
			},
		},
		pause:{
			value:function() {
				window.pixelManipulator.mode="paused";
				clearInterval(window.pixelManipulator.loopint);
			},
		},
		zoom:{
			value:function(e) {
				//console.log("zoom",e);
				if (e.x>=0&&e.y>=0) {
					window.pixelManipulator.zoomX=e.x;
					window.pixelManipulator.zoomY=e.y;
				}
				if (window.pixelManipulator.canvas.height<2) window.pixelManipulator.canvas.height=400;//it would be pointless to have a canvas this small
				if (window.pixelManipulator.canvas.width<2) window.pixelManipulator.canvas.width=400;
				window.pixelManipulator.zoomctx.clearRect(0,0,window.pixelManipulator.zoomelm.width,window.pixelManipulator.zoomelm.height);//clear the screen
				window.pixelManipulator.zoomctx.drawImage(window.pixelManipulator.canvas,//draw the selected section of the canvas onto the zoom canvas
								  (window.pixelManipulator.zoomX - Math.floor(window.pixelManipulator.zoomScaleFactor/2)),
								  (window.pixelManipulator.zoomY - Math.floor(window.pixelManipulator.zoomScaleFactor/2)),
								  Math.floor(window.pixelManipulator.zoomelm.width/window.pixelManipulator.zoomScaleFactor),Math.floor(window.pixelManipulator.zoomelm.height/window.pixelManipulator.zoomScaleFactor),
								  0,0,
								  window.pixelManipulator.zoomelm.width,window.pixelManipulator.zoomelm.height);
				window.pixelManipulator.zoomctx.beginPath();//draw the grid
				for (var i=1; i<(window.pixelManipulator.zoomelm.width/window.pixelManipulator.zoomScaleFactor); i++) {
					window.pixelManipulator.zoomctx.moveTo(i*window.pixelManipulator.zoomScaleFactor,0);
					window.pixelManipulator.zoomctx.lineTo(i*window.pixelManipulator.zoomScaleFactor,window.pixelManipulator.zoomelm.height);
				}
				for (i=1; i<(window.pixelManipulator.zoomelm.height/window.pixelManipulator.zoomScaleFactor); i++) {
					window.pixelManipulator.zoomctx.moveTo(0,i*window.pixelManipulator.zoomScaleFactor);
					window.pixelManipulator.zoomctx.lineTo(window.pixelManipulator.zoomelm.width,i*window.pixelManipulator.zoomScaleFactor);
				}
				window.pixelManipulator.zoomctx.stroke();
			}
		},
		GetPixel:{
			value:function(d) {
				//console.log("GetPixel");
				return (function (x,y,loop) {
					//           (#,#)
					//console.log("get(old?)Pixel");
					loop=typeof loop!=="undefined"?loop:true;
					if (loop) {
						while (x<0) x=window.pixelManipulator.canvas.width+x;
						while (y<0) y=window.pixelManipulator.canvas.height+y;
						while (x>=window.pixelManipulator.canvas.width) x=x-window.pixelManipulator.canvas.width;
						while (y>=window.pixelManipulator.canvas.height) y=y-window.pixelManipulator.canvas.height;
					}else if (x<0||x>=window.pixelManipulator.canvas.width||y<0||x>=window.pixelManipulator.canvas.height) return "Blocks";
					return d.slice(((window.pixelManipulator.canvas.width*y)+x)*4,(((window.pixelManipulator.canvas.width*y)+x)*4)+4);
				});
			},
		},
		update:{
			value:function() {
				//console.log("update");
				window.pixelManipulator.ctx.putImageData(window.pixelManipulator.imageData,0,0);
			},
		},
		ConfirmElm:{
			value:function(f) {
				//console.log("ConfirmElm");
				//loop=typeof loop!=="undefined"?loop:true;
				return function(x,y,name,loop) {
					//console.log("ConfirmElm");
					var colors=f(x,y,loop), arry=window.pixelManipulator.elementTypeMap[name].color;
					return colors[0]==(arry[0]||0)&&colors[1]==(arry[1]||0)&&colors[2]==(arry[2]||0)&&colors[3]==(arry[3]||255);
				};
			},
		},
		MooreNearbyCounter:{
			value:function(x,y,f) {
				//console.log("MooreNearbyCounter");
				var specialConfirm=window.pixelManipulator.ConfirmElm(f);
				return (function (name,loop) {
					//console.log("mooreNearbyCounter");
					return (specialConfirm(x-1,y-1,name,loop))+//nw
					(specialConfirm(x-1,y,name,loop))+         //w
					(specialConfirm(x-1,y+1,name,loop))+       //sw
					(specialConfirm(x,y-1,name,loop))+         //n
					(specialConfirm(x,y+1,name,loop))+         //s
					(specialConfirm(x+1,y-1,name,loop))+       //ne
					(specialConfirm(x+1,y,name,loop))+         //e
					(specialConfirm(x+1,y+1,name,loop));       //se
				});
			},
		},
		WolframNearby:{
			value:function(x,y,f) {
				//console.log("WolframNearby");
				var specialConfirm=window.pixelManipulator.ConfirmElm(f);
				return (function (name,a,loop) {
					//console.log("wolframNearby");
					loop=typeof loop!=="undefined"?loop:false;//one-dimentional detectors by default don't loop around edges
					var near=[specialConfirm(x-1,y-1,name,loop),//the three spots above (nw,n,ne)
					          specialConfirm(x,y-1,name,loop),
					          specialConfirm(x+1,y-1,name,loop)];
					return (near[0]==a[0]&&near[1]==a[1]&&near[2]==a[2]);
				});
			},
		},
		setPixel:{
			value:function(x,y,name,loop) {
				//console.log("setPixel",x,y,name,loop);
				var arry=window.pixelManipulator.elementTypeMap[name].color;
				window.pixelManipulator.rawSetPixel(x,y,arry,loop);
			},
		},
		rawSetPixel:{
			value:function(x,y,arry,loop) {
				//console.log("rawSetPixel",x,y,name,loop);
				x=Math.floor(x);//Fix any bad math done further up the line.
				y=Math.floor(y);//...
				loop=typeof loop!=="undefined"?loop:true;
				if (loop) {
					while (x<0) x=window.pixelManipulator.canvas.width+x;
					while (y<0) y=window.pixelManipulator.canvas.height+y;
					while (x>=window.pixelManipulator.canvas.width) x=x-window.pixelManipulator.canvas.width;
					while (y>=window.pixelManipulator.canvas.height) y=y-window.pixelManipulator.canvas.height;
				}else if (x<0||x>=window.pixelManipulator.canvas.width||y<0||x>=window.pixelManipulator.canvas.height) return; //if it can't loop, and it's outside of the boundaries, exit
				for (var i=0; i<4; i++) window.pixelManipulator.imageData.data[(((window.pixelManipulator.canvas.width*y)+x)*4)+i]=arry[i];//arry.length is alwase going to be 4. Checking wastes time.
			},
		},
		iterate:{
			value:function() {
				//console.log("iterate");
				window.pixelManipulator.onIterate();
				var old=[];
				for (var i=0;i<window.pixelManipulator.imageData.data.length;i++) {
					old[i]=window.pixelManipulator.imageData.data[i]-0;
				}
				var getOldPixel=window.pixelManipulator.GetPixel(old);
				window.pixelManipulator.pixelCounts={};
				for (var x=0; x<window.pixelManipulator.canvas.width; x++) {
					for (var y=0; y<window.pixelManipulator.canvas.height; y++) { //iterate through x and y
						var confirmOldElm=window.pixelManipulator.ConfirmElm(getOldPixel),//initiallises a confirmElement(),that returns a bool of if this pixel is the inputted element
							mooreNearbyCounter=window.pixelManipulator.MooreNearbyCounter(x,y,getOldPixel),
							wolframNearby=window.pixelManipulator.WolframNearby(x,y,getOldPixel),
							rel={
								x:x,
								y:y,
								getOldPixel:getOldPixel,
								confirmOldElm:confirmOldElm,
								mooreNearbyCounter:mooreNearbyCounter,
								wolframNearby:wolframNearby,
							};
						if (window.pixelManipulator.confirmElm(x,y,"blank")) {
							for (var elm in window.pixelManipulator.elementTypeMap) {
								if (typeof window.pixelManipulator.elementTypeMap[elm].deadCell==="function") {
									window.pixelManipulator.elementTypeMap[elm].deadCell(rel);//execute function-based externals (dead)
								}
							}
						}else{
							var currentPix=window.pixelManipulator.whatIs(x,y);
							if (typeof window.pixelManipulator.elementTypeMap[currentPix].liveCell==="function") {
								window.pixelManipulator.elementTypeMap[currentPix].liveCell(rel);//execute function-based externals (live)
							}
							if (typeof window.pixelManipulator.pixelCounts[currentPix]==="undefined") {
								window.pixelManipulator.pixelCounts[currentPix]=1;
							}else window.pixelManipulator.pixelCounts[currentPix]++;
						}
					}
				}
				window.pixelManipulator.row++;
				if (window.pixelManipulator.row>window.pixelManipulator.canvas.height) window.pixelManipulator.row=0;
				window.pixelManipulator.update();
				window.pixelManipulator.zoom({
					x:window.pixelManipulator.zoomX,
					y:window.pixelManipulator.zoomY,
				});
				window.pixelManipulator.onAfterIterate();
			},
		},
		updateData:{
			value:function() {
				//console.log("updateData");
				window.pixelManipulator.imageData=window.pixelManipulator.ctx.getImageData(0,0,window.pixelManipulator.canvas.width,window.pixelManipulator.canvas.height);
				window.pixelManipulator.ctx.imageSmoothingEnabled=false;
				window.pixelManipulator.ctx.mozImageSmoothingEnabled=false;
				window.pixelManipulator.ctx.webkitImageSmoothingEnabled=false;
				window.pixelManipulator.ctx.msImageSmoothingEnabled=false;
				window.pixelManipulator.zoomctx.imageSmoothingEnabled=false;
				window.pixelManipulator.zoomctx.mozImageSmoothingEnabled=false;
				window.pixelManipulator.zoomctx.webkitImageSmoothingEnabled=false;
				window.pixelManipulator.zoomctx.msImageSmoothingEnabled=false;
				window.pixelManipulator.getPixel=window.pixelManipulator.GetPixel(window.pixelManipulator.imageData.data);
				window.pixelManipulator.confirmElm=window.pixelManipulator.ConfirmElm(window.pixelManipulator.getPixel);
				window.pixelManipulator.whatIs=window.pixelManipulator.WhatIs(window.pixelManipulator.getPixel);
				window.pixelManipulator.zoomctx.strokeStyle=window.pixelManipulator.zoomctxStrokeStyle;
			},
		},
		setCanvas:{
			value:function(v) {
				//console.log("setCanvas");
				window.pixelManipulator.canvas=v;
				window.pixelManipulator.ctx=window.pixelManipulator.canvas.getContext('2d');
				window.pixelManipulator.canvas.addEventListener('click',function(event) {
					window.pixelManipulator.zoom({
						x:event.offsetX,
						y:event.offsetY,
					});
				});
				return window.pixelManipulator.canvas;
			},
		},
		setZoomelm:{
			value:function(v) {
				//console.log("setZoomelm");
				window.pixelManipulator.zoomelm=v;
				window.pixelManipulator.zoomctx=window.pixelManipulator.zoomelm.getContext('2d');
				window.pixelManipulator.zoomelm.addEventListener('click',window.pixelManipulator.zoomClick);
				window.pixelManipulator.zoomelm.addEventListener('drag',window.pixelManipulator.zoomClick);
				window.pixelManipulator.updateData();
				window.pixelManipulator.zoom({
					x:Math.floor(window.pixelManipulator.canvas.width/2)-(Math.floor(window.pixelManipulator.zoomelm.width/2)*window.pixelManipulator.zoomScaleFactor),
					y:Math.floor(window.pixelManipulator.zoomelm.height/2)-(Math.floor(window.pixelManipulator.zoomelm.height/2)*window.pixelManipulator.zoomScaleFactor),
				});
				return window.pixelManipulator.zoomelm;
			},
		},
		canvasPrep:{
			value:function(e) {
				window.pixelManipulator.setCanvas(e.canvas);
				window.pixelManipulator.setZoomelm(e.zoom);
			},
		},
	});
})();
