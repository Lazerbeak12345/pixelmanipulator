/*  This is a cellular automata JavaScript library called PixelManipulator. For information about how to use this script, see https://github.com/Lazerbeak12345/pixelmanipulator
    Copyright (C) 2018-2021  Nathan Fritzler

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
// Concerning the function commments, # is number, [] means array, {} means object, () means function, true means boolean and, "" means string. ? means optional, seperated with : means that it could be one or the other
(function(g) {
	'use strict';
	var pxversion="2.1.0";
	function pix(require,exports,module) {//done like this for better support for things like require.js and Dojo
		/*function ret(v) {
			return (function() {
				return v;
			});
		}*/
		if (typeof g.window=="undefined") console.warn("This enviroment has not been tested, and is officially not supported.\nGood luck.");
		var innerP={
			get version() {
				return pxversion;//strangly enough, this actually upped the frame rate. Not entirely pointles?
			},
			get licence() {
				return "PixelManipulator v"+this.version+" Copyright (C) 2018-2021 Nathan Fritzler\nThis program comes with ABSOLUTELY NO WARRANTY\nThis is free software, and you are welcome to redistribute it\nunder certain conditions, as according to the GNU GENERAL PUBLIC LICENSE version 3 or later.";
			},
			loopint:0,
			//imageData:{},
			zoomX:0,
			zoomY:0,
			get_width:function(){
				return innerP.canvas.width
			},
			set_width:function(value){
				innerP.canvas.width=value
			},
			get_height:function(){
				return innerP.canvas.height
			},
			set_height:function(value){
				innerP.canvas.height=value
			},
			row:0,
			//__oldDraw:false,
			elementTypeMap:{
				"blank":{
					color:[0,0,0,255],
				},
			},
			mode:"paused",
			zoomScaleFactor:20,
			zoomctxStrokeStyle:"gray",
			defaultElm:'blank',
			onIterate:function() {},//both of these need to be defined so the absence of either is suitiable.
			onAfterIterate:function() {},
			//pixelCounts:{},
			presentElements:[],
			__templates:{//an object containing the different templates that are currently in the system
				__LIFE__:{//Things like Conway's Game of Life
					__index__:function(elm,data) {
						//            ("" ,{}  )
						if (data.pattern.search(/B\d{0,9}\/S\d{0,9}/gi)<=-1) return [];
						var numbers=data.pattern.split(/\/?[a-z]/gi);//"B",born,die
						data.loop=typeof data.loop!=="undefined"?data.loop:true;
						console.log("Life Pattern found: ",elm,data);
						return [innerP.__templates.__LIFE__.__LIVE__(numbers[2],data.loop,elm),
							innerP.__templates.__LIFE__.__DEAD__(numbers[1],data.loop,elm)];
					},
					__LIVE__:function(numtodie,loop,elm) {
						return (function(rel) {
							if(numtodie.search(rel.mooreNearbyCounter(rel.x,rel.y,elm,loop))<=-1) innerP.setPixel(rel.x,rel.y,innerP.defaultElm);// if any match (of how many moore are nearby) is found, it dies
						});
					},
					__DEAD__:function(numtolive,loop,elm) {
						return (function(rel) {
							if(numtolive.search(rel.mooreNearbyCounter(rel.x,rel.y,elm,loop))>-1) innerP.setPixel(rel.x,rel.y,elm);// if any match (of how many moore are nearby) is found, it lives
						});
					},
				},
				__WOLFRAM__:{
					__index__:function(elm,data) {
						if (data.pattern.search(/Rule \d*/gi)<=-1) return [];
						var binStates=(data.pattern.split(/Rule /gi)[1]-0).toString(2).padStart(8,"0");
						data.loop=typeof data.loop!=="undefined"?data.loop:false;
						console.log("Wolfram pattern found: ",elm,data);
						return [undefined,innerP.__templates.__WOLFRAM__.__DEAD__(elm,binStates,data.loop)];
					},
					__DEAD__:function(elm,binStates,loop) {//In order not to erase the spawner pixels (which are the pixels, usually in the top row that make the pattern appear), erasing on live shouldn't be done.
						return (function(rel) {
							if (rel.y!==innerP.row) return;//if it is not in the active row, exit before anything happens
							for (var binDex=0; binDex<8; binDex++) {//for every possible state
								if(binStates[binDex]=="1"){//if the state is "on"
									if(rel.wolframNearbyCounter(rel.x,rel.y,elm,(7-binDex).toString(2).padStart(3,"0"),loop)) {//if there is a wolfram match (wolfram code goes from 111 to 000)
										innerP.setPixel(rel.x,rel.y,elm,loop);
										return;//No more logic needed, it is done.
									}
								}
							}
						});
					},
				},
			},
			randomlyFill:function(pr ,value) {//fills the screen with value, at an optional given percent
				//               ({}?,""   )
				if (arguments.length===1) {
					value=pr;
					pr=undefined;
				}
				pr=pr||15;
				var w=innerP.get_width(),
					h=innerP.get_height();
				for (var xPos=0; xPos<w; xPos++) {
					for (var yPos=0; yPos<h; yPos++) { //iterate through x and y
						if (Math.random()*100<pr) innerP.setPixel(xPos,yPos,value);
					}
				}
			},
			addMultipleElements:function(map) {//adds multiple elements
				//                      ({} )
				for (var elm in map) {
					innerP.addElement(elm,map[elm]);
				}
			},
			addElement:function(elm,data) {//adds a single element
				//             ("" ,{}  )
				if (arguments.length<2) {
					data=elm;
					elm=undefined;
				}
				if (typeof elm==="undefined") elm=data.name;//name of the element
				if (typeof data.color==="undefined") data.color=[255,255,255,255];//color of the element
				while (data.color.length<4) data.color.push(255);
				if (typeof data.pattern==="string") {
					for (var tempNam in innerP.__templates) {
						var out=innerP.__templates[tempNam].__index__(elm,data);
						if (out.length===0) continue;//if the output was [], then go on.
						if (typeof data.liveCell==="undefined"&&typeof out[0]==="function") data.liveCell=out[0];
						if (typeof data.deadCell==="undefined"&&typeof out[1]==="function") data.deadCell=out[1];
					}
				}
				innerP.elementTypeMap[elm]=data;//for each element
			},
			__WhatIs:function(f ) {//Generator for whatIs
				//           (())
				return (function(x,y,loop ) {//return the name of an element in a given location
					//          (#,#,true?)
					for (var i=0;i<innerP.presentElements.length;i++) {
						if (f(x,y,innerP.presentElements[i],loop)) return innerP.presentElements[i];
					}
				});
			},
			play:function(canvasSizes) {//Start iterations on all of the elements on the canvas
				//       ({}?        )
				//console.log("play");
				if (innerP.mode==="playing") innerP.reset(canvasSizes);
				innerP.mode="playing";
				innerP.loopint=setInterval(innerP.iterate,1);
			},
			reset:function(canvasSizes) {//reset (and resize) the canvas(es)
				//        ({}?        )
				//console.log("reset");
				//clearInterval(innerP.loopint);
				innerP.pause();
				var w=innerP.get_width(),
					h=innerP.get_height();
				innerP.set_width(canvasSizes.canvasW||w)
				innerP.set_height(canvasSizes.canvasH||h)
				if (typeof innerP.zoomelm!=="undefined") {
					innerP.zoomelm.width=(canvasSizes.zoomW||innerP.zoomelm.width/innerP.zoomScaleFactor)*innerP.zoomScaleFactor;
					innerP.zoomelm.height=(canvasSizes.zoomH||innerP.zoomelm.height/innerP.zoomScaleFactor)*innerP.zoomScaleFactor;
				}
				innerP.updateData();
				for (var x=0; x<w; x++) {
					for (var y=0; y<h; y++) {
						innerP.setPixel(x,y,innerP.defaultElm);
					}
				}
				innerP.update();
				innerP.ctx.putImageData(innerP.imageData,0,0);
				innerP.row=0;
			},
			pause:function() {//pause canvas iterations
				innerP.mode="paused";
				clearInterval(innerP.loopint);
			},
			zoom:function(e  ) {//This tells pixelmanipulator where to focus the center of the zoomElm
				//       ({}?)
				//console.log("zoom",e);
				if (typeof innerP.zoomelm.height==="undefined") return;
				if (typeof e=="undefined") e={};
				if (typeof e.x=="undefined") e.x=innerP.zoomX;
				if (typeof e.y=="undefined") e.x=innerP.zoomY;
				if (e.x>=0&&e.y>=0) {
					innerP.zoomX=e.x;
					innerP.zoomY=e.y;
				}
				if (innerP.get_height()<2) innerP.set_height(400);//it would be pointless to have a canvas this small
				if (innerP.get_width()<2) innerP.set_width(400);
				innerP.zoomctx.clearRect(0,0,innerP.zoomelm.width,innerP.zoomelm.height);//clear the screen
				innerP.zoomctx.drawImage(innerP.canvas,//draw the selected section of the canvas onto the zoom canvas
								(innerP.zoomX - Math.floor(innerP.zoomScaleFactor/2)),
								(innerP.zoomY - Math.floor(innerP.zoomScaleFactor/2)),
								Math.floor(innerP.zoomelm.width/innerP.zoomScaleFactor),Math.floor(innerP.zoomelm.height/innerP.zoomScaleFactor),
								0,0,
								innerP.zoomelm.width,innerP.zoomelm.height);
				innerP.zoomctx.beginPath();//draw the grid
				for (var i=1; i<(innerP.zoomelm.width/innerP.zoomScaleFactor); i++) {
					innerP.zoomctx.moveTo(i*innerP.zoomScaleFactor,0);
					innerP.zoomctx.lineTo(i*innerP.zoomScaleFactor,innerP.zoomelm.height);
				}
				for (i=1; i<(innerP.zoomelm.height/innerP.zoomScaleFactor); i++) {
					innerP.zoomctx.moveTo(0,i*innerP.zoomScaleFactor);
					innerP.zoomctx.lineTo(innerP.zoomelm.width,i*innerP.zoomScaleFactor);
				}
				innerP.zoomctx.stroke();
			},
			__GetPixel:function(d ) {//Generates getPixel and getOldPixel instances
				//             ({})
				//console.log("GetPixel");
				return (function (x,y,loop ) {//get the rgba value of the element at given position, handeling for looping(defaults to true)
					//           (#,#,true?)
					//console.log("get(old?)Pixel");
					var w=innerP.get_width(),
						h=innerP.get_height();
					loop=typeof loop!=="undefined"?loop:true;
					if (loop) {
						while (x<0) x+=w;
						while (y<0) y+=h;
						while (x>=w) x-=w;
						while (y>=h) y-=h;
					}else if (x<0||x>=w||y<0||x>=h) return "Blocks";
					return d.slice(((w*y)+x)*4,(((w*y)+x)*4)+4);
				});
			},
			update:function() {//applies changes made by setPixel to the graphical canvas(es)
				//console.log("update");
				innerP.ctx.putImageData(innerP.imageData,0,0);
				if (typeof innerP.zoomelm!=="undefined") innerP.zoom();
			},
			__ConfirmElm:function(f ) {//Generates confirmElm and confirmOldElm instances, based of of the respective instances made by __GetPixel
				//               (())
				//console.log("ConfirmElm",f);
				//loop=typeof loop!=="undefined"?loop:true;
				return function(x,y,name,loop ) {//returns a boolean as to weather the inputted element name matches the selected location
					//         (#,#,""  ,true?)
					//console.log("confirmElm",x,y,name,loop);
					var colors=f(x,y,loop), arry=innerP.elementTypeMap[name].color;
					return colors[0]==(arry[0]||0)&&colors[1]==(arry[1]||0)&&colors[2]==(arry[2]||0)&&colors[3]==(arry[3]||255);
				};
			},
			__MooreNearbyCounter:function(f ) {//Generate mooreNearbyCounter
				//                       (())
				//console.log("MooreNearbyCounter");
				//var specialConfirm=innerP.__ConfirmElm(f);
				return (function (x,y,name,loop ) {//Count how many cells of this name match in a moore radius
					//           (#,#,""  ,true?)
					//console.log("mooreNearbyCounter");
					return (f(x-1,y-1,name,loop))+//nw
					(f(x-1,y,name,loop))+         //w
					(f(x-1,y+1,name,loop))+       //sw
					(f(x,y-1,name,loop))+         //n
					(f(x,y+1,name,loop))+         //s
					(f(x+1,y-1,name,loop))+       //ne
					(f(x+1,y,name,loop))+         //e
					(f(x+1,y+1,name,loop));       //se
				});
			},
			__WolframNearbyCounter:function(f ) {//Generate wolframNearbyCounter
				//                         (())
				//console.log("WolframNearbygetOldPixel");
				return (function (x,y,name,a ,loop ) {//determine if the three cells above a given cell match an inputted element query
					//           (#,#,""  ,[],true?)
					//console.log("wolframNearby");
					loop=typeof loop!=="undefined"?loop:false;//one-dimentional detectors by default don't loop around edges
					var near=[f(x-1,y-1,name,loop),//the three spots above (nw,n,ne)
							f(x,y-1,name,loop),
							f(x+1,y-1,name,loop)];
					return (near[0]==a[0]&&near[1]==a[1]&&near[2]==a[2]);
				});
			},
			setPixel:function(x,y,arry ,loop ) {//places given pixel at the x and y position, handling for loop (default loop is true)
				//           (#,#,[]:"",true?)
				//console.log("rawSetPixel",x,y,name,loop);
				x=Math.floor(x).toString()-0;//Fix any bad math done further up the line. Also remove bad math later
				y=Math.floor(y).toString()-0;//...
				loop=typeof loop!=="undefined"?loop:true;
				if (typeof arry==="string") {
					if (!innerP.presentElements.includes(arry)) innerP.presentElements.push(arry);
					if(typeof innerP.elementTypeMap[arry]==="undefined")
						throw new Error("Color name "+arry+" invalid!")
					arry=innerP.elementTypeMap[arry].color;
				}
				while (arry.length<4) arry.push(255);//allows for arrays that are too small
				//if (innerP.__oldDraw) {
				var w=innerP.get_width(),
					h=innerP.get_height();
					if (loop) {
						while (x<0) x=w+x;
						while (y<0) y=h+y;
						while (x>=w) x=x-w;
						while (y>=h) y=y-h;
					}else if (x<0||x>=w||y<0||y>=h) return; //if it can't loop, and it's outside of the boundaries, exit
					for (var i=0; i<4; i++) innerP.imageData.data[(((w*y)+x)*4)+i]=arry[i];//arry.length is alwase going to be 4. Checking wastes time.
				/*
				}else{
					var nth="#";
					for (var i=0;i<4;i++) {
						var ch1=0;
						while (arry[i]>=16) {
							ch1++;
							arry[i]-=16;
						}
						switch (ch1) {
							case 0:
							case 1:
							case 2:
							case 3:
							case 4:
							case 5:
							case 6:
							case 7:
							case 8:
							case 9:
								nth+=ch1;
								break;
							case 10:
								nth+="A";
								break;
							case 11:
								nth+="B";
								break;
							case 12:
								nth+="C";
								break;
							case 13:
								nth+="D";
								break;
							case 14:
								nth+="E";
								break;
							case 15:
								nth+="F";
								break;
							default:
								throw "Number too high!";
						}
						switch (arry[i]) {
							case 0:
							case 1:
							case 2:
							case 3:
							case 4:
							case 5:
							case 6:
							case 7:
							case 8:
							case 9:
								nth+=arry[i];
								break;
							case 10:
								nth+="A";
								break;
							case 11:
								nth+="B";
								break;
							case 12:
								nth+="C";
								break;
							case 13:
								nth+="D";
								break;
							case 14:
								nth+="E";
								break;
							case 15:
								nth+="F";
								break;
							default:
								throw "Number too high!";
						}
					}
					innerP.ctx.fillStyle=nth;
					//throw innerP.ctx;
					innerP.ctx.fillRect(x,y,1,1);
					innerP.ctx.fill();
				}//*/
			},
			iterate:function() {//single frame of animation. Media functions pass this into setInterval
				//console.log("iterate");
				innerP.onIterate();
				var old=[];
				for (var i=0;i<innerP.imageData.data.length;i++) {
					old[i]=innerP.imageData.data[i]-0;
				}
				var getOldPixel=innerP.__GetPixel(old);
				var iterateThroughPresentElementsOnBlank=function(elm) {
					if (typeof innerP.elementTypeMap[elm].deadCell==="function") {
						//console.log(xPos,yPos,"Thing");
						innerP.elementTypeMap[elm].deadCell(rel);//execute function-based externals (dead)
					}
				};
				innerP.pixelCounts={};
				var w=innerP.get_width(),
					h=innerP.get_height();
				for (var xPos=0; xPos<w; xPos++) {
					for (var yPos=0; yPos<h; yPos++) { //iterate through x and y
						var confirmOldElm=innerP.__ConfirmElm(getOldPixel),//initiallises a confirmElement(),that returns a bool of if this pixel is the inputted element
							rel={
								x:xPos,
								y:yPos,
								getOldPixel:getOldPixel,
								confirmOldElm:confirmOldElm,
								mooreNearbyCounter:innerP.__MooreNearbyCounter(confirmOldElm),
								wolframNearbyCounter:innerP.__WolframNearbyCounter(confirmOldElm),
							};
						if (innerP.confirmElm(xPos,yPos,"blank")) {
							//for (var elm in innerP.elementTypeMap) {
							innerP.presentElements.forEach(iterateThroughPresentElementsOnBlank);
							//}
						}else{
							var currentPix=innerP.whatIs(xPos,yPos);
							if (typeof innerP.elementTypeMap[currentPix].liveCell==="function") {
								innerP.elementTypeMap[currentPix].liveCell(rel);//execute function-based externals (live)
							}
							if (typeof innerP.pixelCounts[currentPix]==="undefined") {
								innerP.pixelCounts[currentPix]=1;
							}else innerP.pixelCounts[currentPix]++;
						}
					}
				}
				innerP.row++;
				if (innerP.row>h) innerP.row=0;
				innerP.update();
				innerP.onAfterIterate();
			},
			updateData:function() {//defines the starting values of the library and is run on `p.reset();`
				//console.log("updateData");
				innerP.imageData=innerP.ctx.getImageData(0,0,innerP.get_width(),innerP.get_height());
				innerP.ctx.imageSmoothingEnabled=false;
				innerP.ctx.mozImageSmoothingEnabled=false;
				innerP.ctx.webkitImageSmoothingEnabled=false;
				innerP.ctx.msImageSmoothingEnabled=false;
				if (typeof innerP.zoomelm!="undefined") {
					innerP.zoomctx.imageSmoothingEnabled=false;
					innerP.zoomctx.mozImageSmoothingEnabled=false;
					innerP.zoomctx.webkitImageSmoothingEnabled=false;
					innerP.zoomctx.msImageSmoothingEnabled=false;
					innerP.zoomctx.strokeStyle=innerP.zoomctxStrokeStyle;
				}
				innerP.getPixel=innerP.__GetPixel(innerP.imageData.data);
				innerP.confirmElm=innerP.__ConfirmElm(innerP.getPixel);
				innerP.whatIs=innerP.__WhatIs(innerP.confirmElm);
			},
			canvasPrep:function(e ) {//Tells PixelManipulator what canvas(es) to use.
				//             ({})
				//Use e.canvas for the normal canvas, and e.zoom for the zoomed-in canvas. (at least e.canvas is required)
				innerP.canvas=e.canvas;
				innerP.ctx=innerP.canvas.getContext('2d');
				if (typeof e.zoom!=="undefined") {
					innerP.zoomelm=e.zoom;
					innerP.zoomctx=innerP.zoomelm.getContext('2d');
				}
				innerP.updateData();
				if (typeof e.zoom!=="undefined") {
					innerP.zoom({//zoom at the center
						x:Math.floor(innerP.get_width()/2)-(Math.floor(innerP.zoomelm.width/2)*innerP.zoomScaleFactor),
						y:Math.floor(innerP.zoomelm.height/2)-(Math.floor(innerP.zoomelm.height/2)*innerP.zoomScaleFactor),
					});
				}
			},
		};
		console.log(innerP.licence);
		if (typeof module!=="undefined") module.exports=innerP;
		else return innerP;
	}
	if (typeof g.require=="undefined"&&typeof g.module=="undefined") {
		g.p=g.pixelManipulator=pix();
	}else if (typeof g.define!="undefined"&&typeof g.module=="undefined") {
		g.define(["require","exports","module"],pix);
	}else {
		pix(require,exports,module);
	}
})(this);
