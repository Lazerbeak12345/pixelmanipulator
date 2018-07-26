/*
	This is a javascript file that is in charge of interacting with canvas elements and such. For information about how to use this script, see https://github.com/Lazerbeak12345/pixelmanipulator
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
	var licence="pixelmanipulator.js v1.52.135 (beta) Copyright (C) 2018  Nathan Fritzler\nThis program comes with ABSOLUTELY NO WARRANTY\nThis is free software, and you are welcome to redistribute it\nunder certain conditions, as according to the GNU GENERAL PUBLIC LICENSE.";
	/*function ret(v) {
		return (function() {
			return v;
		});
	}*/
	return Object.create({
		getPixel:function() {},
		loopint:0,
		imageData:{},
		data:[],
		zoomX:0,
		zoomY:0,
		row:0,
		elementTypeMap:{
			"Test Elm":[122,122,122,122],
		},
		mode:"paused",
		zoomScaleFactor:20,
		ctx:{},
		canvas:{},
		zoomelm:{},
		zoomctx:{},
		zoomctxStrokeStyle:"gray",
		onZoomClick:function(clickEvent,confirmColorInstance) {return "blank";},
		onIterate:function() {},
	},{
		licence:{
			value:licence,
		},
		setCanvasSizes:{
			value:function(canvasSizes) {
				//console.log("setCanvasSizes");
				window.pixelManipulator.canvas.width=canvasSizes.canvasW||100;
				window.pixelManipulator.canvas.height=canvasSizes.canvasH||100;
				window.pixelManipulator.zoomelm.width=(canvasSizes.zoomW||20)*window.pixelManipulator.zoomScaleFactor;
				window.pixelManipulator.zoomelm.height=(canvasSizes.zoomH||20)*window.pixelManipulator.zoomScaleFactor;
				window.pixelManipulator.updateCanvasData();
			},
		},
		zoomClick:{
			value:function(e) {
				//console.log("zoomClick",e);
				var zoomXPos=Math.floor(e.offsetX/window.pixelManipulator.zoomScaleFactor)+Math.floor(window.pixelManipulator.zoomX-(window.pixelManipulator.zoomScaleFactor/2)),
					zoomYPos=Math.floor(e.offsetY/window.pixelManipulator.zoomScaleFactor)+Math.floor(window.pixelManipulator.zoomY-(window.pixelManipulator.zoomScaleFactor/2)),
					old=[];
				//console.log(zoomXPos,"=Math.floor(",e.offsetX,"/",window.pixelManipulator.zoomScaleFactor,")+Math.floor(",window.pixelManipulator.zoomX,"-(",window.pixelManipulator.zoomScaleFactor,"/",2,"))");
				//console.log(zoomYPos,"=Math.floor(",e.offsetY,"/",window.pixelManipulator.zoomScaleFactor,")+Math.floor(",window.pixelManipulator.zoomY,"-(",window.pixelManipulator.zoomScaleFactor,"/",2,"))");
				for (var i=0;i<window.pixelManipulator.data.length;i++) {
					old[i]=window.pixelManipulator.data[i]-0;
				}
				window.pixelManipulator.setPixel(zoomXPos,zoomYPos,//Where to set the pixel
					window.pixelManipulator.onZoomClick(e,//pass in the click event
						p.makeConfirmColor(zoomXPos,zoomYPos,window.pixelManipulator.createGetPixel(old))));//as well as a confirmColor instance
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
		rewind:{
			value:function(canvasSizes) {
				//console.log("rewind");
				clearInterval(window.pixelManipulator.loopint);
				window.pixelManipulator.setCanvasSizes(canvasSizes);
				for (var i=0; i < window.pixelManipulator.data.length; i+=4) {
					for (var ii=0; ii <=2; ii++) window.pixelManipulator.data[i+ii]=0;
					window.pixelManipulator.data[i+3]=255;
				}
				window.pixelManipulator.ctx.putImageData(window.pixelManipulator.imageData,0,0);
				window.pixelManipulator.play();
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
				window.pixelManipulator.zoomctx.strokeStyle=window.pixelManipulator.zoomctxStrokeStyle;//draw the grid
				window.pixelManipulator.zoomctx.beginPath();
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
		createGetPixel:{
			value:function(d) {
				//console.log("createGetPixel");
				return (function (x,y,loop) {
					//           (#,#)
					//console.log("get(old?)Pixel");
					loop=typeof loop!=="undefined"?loop:true;
					if (loop) {
						while (x<0) {
							x=window.pixelManipulator.canvas.width+x;
						}
						while (y<0) {
							y=window.pixelManipulator.canvas.height+y;
						}
						
						while (x>=window.pixelManipulator.canvas.width) {
							x=x-window.pixelManipulator.canvas.width;
						}
						while (y>=window.pixelManipulator.canvas.height) {
							y=y-window.pixelManipulator.canvas.height;
						}
					}else{
						if (x<0||x>=window.pixelManipulator.canvas.width||y<0||x>=window.pixelManipulator.canvas.height) return "Blocks";
					}
					
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
		makeConfirmColor:{
			value:function(x,y,f,loop) {
				//console.log("makeConfirmColor");
				loop=typeof loop!=="undefined"?loop:true;
				var colors=f(x,y,loop);
				return function(name) {
					//console.log("ConfirmColor");
					var arry=window.pixelManipulator.elementTypeMap[name];
					return colors[0]==(arry[0]||0)&&colors[1]==(arry[1]||0)&&colors[2]==(arry[2]||0)&&colors[3]==(arry[3]||255);
				};
			},
		},
		makeMooreNearbyCounter:{
			value:function(x,y,f) {
				//console.log("makeMooreNearbyCounter");
				return (function (name,loop) {
					//console.log("mooreNearbyCounter");
					return (window.pixelManipulator.makeConfirmColor(x-1,y-1,f,loop)(name))+
					(window.pixelManipulator.makeConfirmColor(x-1,y,f,loop)(name))+
					(window.pixelManipulator.makeConfirmColor(x-1,y+1,f,loop)(name))+
					(window.pixelManipulator.makeConfirmColor(x,y-1,f,loop)(name))+
					(window.pixelManipulator.makeConfirmColor(x,y+1,f,loop)(name))+
					(window.pixelManipulator.makeConfirmColor(x+1,y-1,f,loop)(name))+
					(window.pixelManipulator.makeConfirmColor(x+1,y,f,loop)(name))+
					(window.pixelManipulator.makeConfirmColor(x+1,y+1,f,loop)(name));
				});
			},
		},
		makeWolframNearby:{
			value:function(x,y,f) {
				//console.log("makeWolframNearby");
				return (function (name,a,loop) {
					//console.log("wolframNearby");
					loop=typeof loop!=="undefined"?loop:false;//one-dimentional detectors by default don't loop around edges
					var near=[window.pixelManipulator.makeConfirmColor(x-1,y-1,f,loop)(name),window.pixelManipulator.makeConfirmColor(x,y-1,f,loop)(name),window.pixelManipulator.makeConfirmColor(x+1,y-1,f,loop)(name)];
					return (near[0]==a[0]&&near[1]==a[1]&&near[2]==a[2]);
				});
			},
		},
		setPixel:{
			value:function(x,y,name,loop) {
				//console.log("setPixel",x,y,name,loop);
				x=Math.floor(x);//Fix any bad math done further up the line.
				y=Math.floor(y);//...
				var arry=window.pixelManipulator.elementTypeMap[name];
				loop=typeof loop!=="undefined"?loop:true;
				if (loop) {
					while (x<0) x=window.pixelManipulator.canvas.width+x;
					while (y<0) y=window.pixelManipulator.canvas.height+y;
					while (x>=window.pixelManipulator.canvas.width) x=x-window.pixelManipulator.canvas.width;
					while (y>=window.pixelManipulator.canvas.height) y=y-window.pixelManipulator.canvas.height;
				}else if (x<0||x>=window.pixelManipulator.canvas.width||y<0||x>=window.pixelManipulator.canvas.height) return;
				for (var i=0; i<arry.length; i++) window.pixelManipulator.data[(((window.pixelManipulator.canvas.width*y)+x)*4)+i]=arry[i];
			},
		},
		iterate:{
			value:function() {
				//console.log("iterate");
				var old=[];
				for (var i=0;i<window.pixelManipulator.data.length;i++) {
					old[i]=window.pixelManipulator.data[i]-0;
				}
				//throw old
				window.pixelManipulator.onIterate();
				var getOldPixel=window.pixelManipulator.createGetPixel(old);
				for (var x=0; x<window.pixelManipulator.canvas.width; x++) {
					for (var y=0; y<window.pixelManipulator.canvas.height; y++) {
						var confirmElement=window.pixelManipulator.makeConfirmColor(x,y,getOldPixel),//initiallises a confirmElement(),that returns a bool of if this pixel is the inputted element
							mooreNearbyCounter=window.pixelManipulator.makeMooreNearbyCounter(x,y,getOldPixel),
							wolframNearby=window.pixelManipulator.makeWolframNearby(x,y,getOldPixel),
							nearbyTotalG,
							rand,
							factor;
						if (confirmElement("No-loop Conway's Game Of Life")) {
							nearbyTotalG=mooreNearbyCounter("No-loop Conway's Game Of Life",false);
							if(nearbyTotalG<2||nearbyTotalG>=4) window.pixelManipulator.setPixel(x,y,"blank",false);//Any alive cell that is touching less than two alive neighbours dies. Any alive cell touching four or more alive neighbours dies.
						}else if (confirmElement("Conway's Game Of Life")) {
							nearbyTotalG=mooreNearbyCounter("Conway's Game Of Life");
							if(nearbyTotalG<2||nearbyTotalG>=4) window.pixelManipulator.setPixel(x,y,"blank");//Any alive cell that is touching less than two alive neighbours dies. Any alive cell touching four or more alive neighbours dies.
						}else if (confirmElement("Water")) {
							rand=Math.round(Math.random()*2)-1;factor=0;
							while ((!window.pixelManipulator.makeConfirmColor(x+rand,y+factor,getOldPixel,false)("blank"))&&factor<2) factor++;
							if (factor<=2&&(window.pixelManipulator.makeConfirmColor(x+rand,y+factor,window.pixelManipulator.getPixel,false)("blank"))){
								window.pixelManipulator.setPixel(x,y,"blank",false);
								window.pixelManipulator.setPixel(x+rand,y+factor,"Water",false);
							}
						}else if (confirmElement("Acid")) {
							rand=Math.round(Math.random()*2)-1;factor=0;
							while ((!window.pixelManipulator.makeConfirmColor(x+rand,y+factor,getOldPixel,false)("blank")||Math.random()<=0.3)&&factor<3) factor++;
							if (factor<=3){
								if (Math.random()>0.3) window.pixelManipulator.setPixel(x,y,"blank",false);
								window.pixelManipulator.setPixel(x+rand,y+factor,"Acid",false);
							}
						}else if (confirmElement("FadingElectricity")) {//fadingelectricity
							window.pixelManipulator.setPixel(x,y,"Conductor",false);
						}else if (confirmElement("Electricity")) {//electricity
							window.pixelManipulator.setPixel(x,y,"FadingElectricity",false);
						}else if (confirmElement("Conductor")) {//conductor
							var conductorNearbyTotal=mooreNearbyCounter("Electricity",false);
							if(conductorNearbyTotal===1||conductorNearbyTotal===2) window.pixelManipulator.setPixel(x,y,"Electricity");//copper stays as copper unless it has just one or two neighbours that are electron heads,in which case it becomes an electron head
						}else if (confirmElement("Highlife")){
							if(!(mooreNearbyCounter("Highlife",false)===2||mooreNearbyCounter("Highlife",false)===3)) window.pixelManipulator.setPixel(x,y,"blank",false);
						}else if (confirmElement("Blocks")) {
						}else if (confirmElement("blank")||confirmElement("Rule 110")||confirmElement("Rule 30")||confirmElement("Rule 90")||confirmElement("Rule 184")) {
							if (y==window.pixelManipulator.row) {
								if (wolframNearby("Rule 110",[1,1,0])||wolframNearby("Rule 110",[1,0,1])||wolframNearby("Rule 110",[0,1,1])||wolframNearby("Rule 110",[0,1,0])||wolframNearby("Rule 110",[0,0,1])) window.pixelManipulator.setPixel(x,y,"Rule 110",false);
								if (wolframNearby("Rule 30",[1,0,0])||wolframNearby("Rule 30",[0,1,1])||wolframNearby("Rule 30",[0,1,0])||wolframNearby("Rule 30",[0,0,1])) window.pixelManipulator.setPixel(x,y,"Rule 30",false);
								if (wolframNearby("Rule 90",[1,1,0])||wolframNearby("Rule 90",[1,0,0])||wolframNearby("Rule 90",[0,1,1])||wolframNearby("Rule 90",[0,0,1])) window.pixelManipulator.setPixel(x,y,"Rule 90",false);
								if (wolframNearby("Rule 184",[1,1,1])||wolframNearby("Rule 184",[1,0,1])||wolframNearby("Rule 184",[1,0,0])||wolframNearby("Rule 184",[0,1,1])) window.pixelManipulator.setPixel(x,y,"Rule 184",false);
							}
							if(mooreNearbyCounter("No-loop Conway's Game Of Life",false)===3) window.pixelManipulator.setPixel(x,y,"No-loop Conway's Game Of Life");//Any dead cell touching exactly three alive neighbours becomes alive.
							if(mooreNearbyCounter("Conway's Game Of Life")===3) window.pixelManipulator.setPixel(x,y,"Conway's Game Of Life");//Any dead cell touching exactly three alive neighbours becomes alive.
							if(mooreNearbyCounter("Highlife")===3||mooreNearbyCounter("Highlife")===6) window.pixelManipulator.setPixel(x,y,"Highlife");//a cell is born if it has 3 or 6 neighbors
						}else console.log("Nothing happened with", getOldPixel(x,y), "at (",x,",",y,")");
					}
				}
				window.pixelManipulator.row++;
				if (window.pixelManipulator.row>window.pixelManipulator.canvas.height) window.pixelManipulator.row=0;
				window.pixelManipulator.update();
				window.pixelManipulator.zoom({
					x:window.pixelManipulator.zoomX,
					y:window.pixelManipulator.zoomY,
				});
			},
		},
		updateCanvasData:{
			value:function() {
				//console.log("updateCanvasData");
				window.pixelManipulator.imageData=window.pixelManipulator.ctx.getImageData(0,0,window.pixelManipulator.canvas.width,window.pixelManipulator.canvas.height);
				window.pixelManipulator.data=window.pixelManipulator.imageData.data;
				window.pixelManipulator.ctx.imageSmoothingEnabled=false;
				window.pixelManipulator.ctx.mozImageSmoothingEnabled=false;
				window.pixelManipulator.ctx.webkitImageSmoothingEnabled=false;
				window.pixelManipulator.ctx.msImageSmoothingEnabled=false;
				window.pixelManipulator.zoomctx.imageSmoothingEnabled=false;
				window.pixelManipulator.zoomctx.mozImageSmoothingEnabled=false;
				window.pixelManipulator.zoomctx.webkitImageSmoothingEnabled=false;
				window.pixelManipulator.zoomctx.msImageSmoothingEnabled=false;
				window.pixelManipulator.getPixel=window.pixelManipulator.createGetPixel(window.pixelManipulator.data);
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
					})
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
				window.pixelManipulator.updateCanvasData();
				window.pixelManipulator.zoom({
					x:Math.floor(window.pixelManipulator.canvas.width/2)-(Math.floor(window.pixelManipulator.zoomelm.width/2)*window.pixelManipulator.zoomScaleFactor),
					y:Math.floor(window.pixelManipulator.zoomelm.height/2)-(Math.floor(window.pixelManipulator.zoomelm.height/2)*window.pixelManipulator.zoomScaleFactor),
				});
				return window.pixelManipulator.zoomelm;
			},
		},
	});
})();
