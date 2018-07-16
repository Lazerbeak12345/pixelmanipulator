//pixelmanipulator.js
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
	var licence="pixelmanipulator Copyright (C) 2018  Nathan Fritzler\nThis program comes with ABSOLUTELY NO WARRANTY\nThis is free software, and you are welcome to redistribute it\nunder certain conditions, as according to the GNU GENERAL PUBLIC LICENSE.";
	function ret(v) {
		return (function() {
			return v;
		});
	}
	var canvas={},
		ctx,
		zoomelm={},
		zoomctx={};
	return Object.create({
		getPixel:function() {},
		loopint:0,
		imageData:{},
		data:[],
		mouseX:0,
		mouseY:0,
		row:0,
		elementTypeMap:{
			"Test Elm":[122,122,122,122],
		},
		mode:"paused",
	},{
		licence:{
			value:licence,
		},
		play:{
			value:function() {
				if (this.mode=="paused") {
					clearInterval(this.loopint);
					setCanvasSizes();
					for (var i=0; i < this.data.length; i+=4) {
						for (var ii=0; ii <=2; ii++) this.data[i+ii]=0;
						this.data[i+3]=255;
					}
					this.ctx.putImageData(this.imageData,0,0);
				}
				this.mode="playing";
				this.loopint=setInterval(this.loop,1);
			},
		},
		zoom:{
			value:function(event) {
				this.mouseX = event.layerX;
				this.mouseY = event.layerY;
				if (canvas.height<2||canvas.width<2) {
					canvas.height=400;
					canvas.width=400;
				}
				if (canvas.height<2||canvas.width<2) {
					canvas.height=400;
					canvas.width=400;
				}
				zoomctx.clearRect(0,0,zoomelm.width,zoomelm.height);
				zoomctx.drawImage(canvas,
								  (this.mouseX - 10),
								  (this.mouseY - 10),
								  (zoomelm.width/20),(zoomelm.height/20),
								  0,0,
								  zoomelm.width,zoomelm.height);
				zoomctx.strokeStyle="gray";
				zoomctx.beginPath();
				for (var i=1; i<(zoomelm.width/20); i++) {
					zoomctx.moveTo(i*20,0);
					zoomctx.lineTo(i*20,zoomelm.height);
				}
				for (i=1; i<(zoomelm.height/20); i++) {
					zoomctx.moveTo(0,i*20);
					zoomctx.lineTo(zoomelm.width,i*20);
				}
				zoomctx.stroke();
			}
		},
		createGetPixel:{
			value:function(d) {
				return (function (x,y,loop) {
				//               (#,#)
					loop=typeof loop!=="undefined"?loop:true;
					if (loop) {
						while (x<0) {
							x=canvas.width+x;
						}
						while (y<0) {
							y=canvas.height+y;
						}
						
						while (x>=canvas.width) {
							x=x-canvas.width;
						}
						while (y>=canvas.height) {
							y=y-canvas.height;
						}
					}else{
						if (x<0||x>=canvas.width||y<0||x>=canvas.height) return "Blocks";
					}
					
					return d.slice(((canvas.width*y)+x)*4,(((canvas.width*y)+x)*4)+4);
				});
			},
		},
		apply:{
			value:function() {
				ctx.putImageData(this.imageData,0,0);
			},
		},
		makeConfirmColor:{
			value:function(x,y,f,loop) {
				loop=typeof loop!=="undefined"?loop:true;
				var colors=f(x,y,loop);
				return function(name) {
					var arry=this.elementTypeMap[name];
					return colors[0]==(arry[0]||0)&&colors[1]==(arry[1]||0)&&colors[2]==(arry[2]||0)&&colors[3]==(arry[3]||255);
				};
			},
		},
		makeMooreNearbyCounter:{
			value:function(x,y,f) {
				return (function (name,loop) {
					return (this.makeConfirmColor(x-1,y-1,f,loop)(name))+
					(this.makeConfirmColor(x-1,y,f,loop)(name))+
					(this.makeConfirmColor(x-1,y+1,f,loop)(name))+
					(this.makeConfirmColor(x,y-1,f,loop)(name))+
					(this.makeConfirmColor(x,y+1,f,loop)(name))+
					(this.makeConfirmColor(x+1,y-1,f,loop)(name))+
					(this.makeConfirmColor(x+1,y,f,loop)(name))+
					(this.makeConfirmColor(x+1,y+1,f,loop)(name));
				});
			},
		},
		makeWolframNearby:{
			value:function(x,y,f) {
				return (function (name,a,loop) {
					loop=typeof loop!=="undefined"?loop:false;//one-dimentional detectors by default don't loop around edges
					var near=[this.makeConfirmColor(x-1,y-1,f,loop)(name),this.makeConfirmColor(x,y-1,f,loop)(name),this.makeConfirmColor(x+1,y-1,f,loop)(name)];
					return (near[0]==a[0]&&near[1]==a[1]&&near[2]==a[2]);
				});
			},
		},
		setPixel:{
			value:function(x,y,name,loop) {
				var arry=this.elementTypeMap[name];
				loop=typeof loop!=="undefined"?loop:true;
				if (loop) {
					while (x<0) x=this.canvas.width+x;
					while (y<0) y=this.canvas.height+y;
					while (x>=this.canvas.width) x=x-this.canvas.width;
					while (y>=this.canvas.height) y=y-this.canvas.height;
				}else if (x<0||x>=this.canvas.width||y<0||x>=this.canvas.height) return;
				for (var i=0; i<arry.length; i++) data[(((this.canvas.width*y)+x)*4)+i]=arry[i];
			},
		},
		loop:{
			value:function() {
				var old=[];
				for (var i=0;i<this.data.length;i++) {
					old[i]=this.data[i]-0;
				}
				//throw old
				var getOldPixel=this.createGetPixel(old);
				for (var x=0; x<this.canvas.width; x++) {
					for (var y=0; y<this.canvas.height; y++) {
						var confirmElement=this.makeConfirmColor(x,y,getOldPixel),//initiallises a confirmElement(),that returns a bool of if this pixel is the inputted element
							mooreNearbyCounter=this.makeMooreNearbyCounter(x,y,getOldPixel),
							wolframNearby=this.makeWolframNearby(x,y,getOldPixel),
							nearbyTotalG,
							rand,
							factor;
						if (confirmElement("No-loop Conway's Game Of Life")) {
							nearbyTotalG=mooreNearbyCounter("No-loop Conway's Game Of Life",false);
							if(nearbyTotalG<2||nearbyTotalG>=4) this.setPixel(x,y,"blank",false);//Any alive cell that is touching less than two alive neighbours dies. Any alive cell touching four or more alive neighbours dies.
						}else if (confirmElement("Conway's Game Of Life")) {
							nearbyTotalG=mooreNearbyCounter("Conway's Game Of Life");
							if(nearbyTotalG<2||nearbyTotalG>=4) this.setPixel(x,y,"blank");//Any alive cell that is touching less than two alive neighbours dies. Any alive cell touching four or more alive neighbours dies.
						}else if (confirmElement("Water")) {
							rand=Math.round(Math.random()*2)-1;factor=0;
							while ((!makeConfirmColor(x+rand,y+factor,getOldPixel,false)("blank"))&&factor<2) factor++;
							if (factor<=2&&(makeConfirmColor(x+rand,y+factor,getPixel,false)("blank"))){
								this.setPixel(x,y,"blank",false);
								this.setPixel(x+rand,y+factor,"Water",false);
							}
						}else if (confirmElement("Acid")) {
							rand=Math.round(Math.random()*2)-1;factor=0;
							while ((!makeConfirmColor(x+rand,y+factor,getOldPixel,false)("blank")||Math.random()<=0.3)&&factor<3) factor++;
							if (factor<=3){
								if (Math.random()>.3) setPixel(x,y,"blank",false);
								this.setPixel(x+rand,y+factor,"Acid",false);
							}
						}else if (confirmElement("FadingElectricity")) {//fadingelectricity
							this.setPixel(x,y,"Conductor",false);
						}else if (confirmElement("Electricity")) {//electricity
							this.setPixel(x,y,"FadingElectricity",false);
						}else if (confirmElement("Conductor")) {//conductor
							var conductorNearbyTotal=mooreNearbyCounter("Electricity",false);
							if(conductorNearbyTotal===1||conductorNearbyTotal===2) this.setPixel(x,y,"Electricity");//copper stays as copper unless it has just one or two neighbours that are electron heads,in which case it becomes an electron head
						}else if (confirmElement("Highlife")){
							if(!(mooreNearbyCounter("Highlife",false)===2||mooreNearbyCounter("Highlife",false)===3)) this.setPixel(x,y,"blank",false);
						}else if (confirmElement("Blocks")) {
						}else if (confirmElement("blank")||confirmElement("Rule 110")||confirmElement("Rule 30")||confirmElement("Rule 90")||confirmElement("Rule 184")) {
							if (y==this.row) {
								if (wolframNearby("Rule 110",[1,1,0])||wolframNearby("Rule 110",[1,0,1])||wolframNearby("Rule 110",[0,1,1])||wolframNearby("Rule 110",[0,1,0])||wolframNearby("Rule 110",[0,0,1])) this.setPixel(x,y,"Rule 110",false);
								if (wolframNearby("Rule 30",[1,0,0])||wolframNearby("Rule 30",[0,1,1])||wolframNearby("Rule 30",[0,1,0])||wolframNearby("Rule 30",[0,0,1])) this.setPixel(x,y,"Rule 30",false);
								if (wolframNearby("Rule 90",[1,1,0])||wolframNearby("Rule 90",[1,0,0])||wolframNearby("Rule 90",[0,1,1])||wolframNearby("Rule 90",[0,0,1])) this.setPixel(x,y,"Rule 90",false);
								if (wolframNearby("Rule 184",[1,1,1])||wolframNearby("Rule 184",[1,0,1])||wolframNearby("Rule 184",[1,0,0])||wolframNearby("Rule 184",[0,1,1])) this.setPixel(x,y,"Rule 184",false);
							}
							if(mooreNearbyCounter("No-loop Conway's Game Of Life",false)===3) this.setPixel(x,y,"No-loop Conway's Game Of Life");//Any dead cell touching exactly three alive neighbours becomes alive.
							if(mooreNearbyCounter("Conway's Game Of Life")===3) this.setPixel(x,y,"Conway's Game Of Life");//Any dead cell touching exactly three alive neighbours becomes alive.
							if(mooreNearbyCounter("Highlife")===3||mooreNearbyCounter("Highlife")===6) this.setPixel(x,y,"Highlife");//a cell is born if it has 3 or 6 neighbors
						}else console.log("Nothing happened with", getOldPixel(x,y));
					}
				}
				this.row++;
				if (this.row>this.canvas.height) this.row=0;
				this.apply();
				this.zoom({
					layerX:this.mouseX,
					layerY:this.mouseY,
				});
			},
		},
		updateCanvasData:{
			value:function() {
				this.imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
				this.data=this.imageData.data;
				ctx.imageSmoothingEnabled=false;
				ctx.mozImageSmoothingEnabled=false;
				ctx.webkitImageSmoothingEnabled=false;
				ctx.msImageSmoothingEnabled=false;
				zoomctx.imageSmoothingEnabled=false;
				zoomctx.mozImageSmoothingEnabled=false;
				zoomctx.webkitImageSmoothingEnabled=false;
				zoomctx.msImageSmoothingEnabled=false;
				this.getPixel=this.createGetPixel(this.data);
			},
		},
		canvas:{
			set:function(v) {
				canvas=v;
				ctx=canvas.getContext('2d');
				canvas.addEventListener('click',this.zoom);
			},
			get:function () {
				return canvas;
			},
		},
		zoomelm:{
			set:function(v) {
				zoomelm=v;
				zoomctx=zoomelm.getContext('2d');
				this.updateCanvasData();
				this.zoom({
					layerX:0,
					layerY:0,
				});
			},
			get:function () {
				return zoomelm;
			},
		},
	});
})();
