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
	function pix(require,exports,module) {//done like this for better support for things like require.js and Dojo
		/*function ret(v) {
			return (function() {
				return v;
			});
		}*/
		if (typeof g.window=="undefined") console.warn("This enviroment has not been tested, and is officially not supported.\nGood luck.");
		function PixelManipulator(){
			this.loopint=0;
			this.zoomX=0;
			this.zoomY=0;
			this._width=1;//Must be at least one pixel for startup to work
			this._height=1;
			this.row=0;
			this.elementTypeMap={
				"blank":{
					color:[0,0,0,255],
					number:0,//Index in this.elementNumList
					hitbox:[],
					name:"blank",
				},
			};
			this.elementNumList=["blank"];
			this.nameAliases={};
			this.mode="paused";
			this.zoomScaleFactor=20;
			this.zoomctxStrokeStyle="gray";
			Object.defineProperty(this,"defaultElm",{
				get:function(){
					return this.elementNumList[this.defaultId];
				},
				set:function(value){
					this.defaultId=this.elementTypeMap[value].number;
				}
			});
			this.defaultId=0;
			this.onIterate=function() {};//both of these need to be defined so the absence of either is suitiable.
			this.onAfterIterate=function() {};
			this.neighborhoods={
				// Area is f(x)=2x-1
				wolfram:function(radius,yval,include_self){
					if(typeof radius==="undefined")
						radius=1;
					if(typeof yval==="undefined")
						yval=1;
					var output=[{x:0,y:yval}];
					if(typeof include_self==="undefined"||include_self){
						output.push({x:0,y:yval});
					}
					for(var i=radius;i>0;i--){
						output.push({x:-1*i,y:yval});
						output.push({x:i,y:yval});
					}
					return output;
				},
				// Area is f(x)=(2r+1)^2
				moore:function(radius,include_self){
					if(typeof radius==="undefined")
						radius=1;
					if(typeof include_self==="undefined")
						include_self=false;
					var output=[];
					// Note: no need to calculate the Chebyshev distance. All pixels in this
					// range are "magically" within.
					for(var x=-1*radius;x<=radius;x++)
						for(var y=-1*radius;y<=radius;y++)
							if(include_self||!(x===0&&y===0))
								output.push({x:x,y:y});
					return output;
					// And to think that this used to be hard... Perhaps they had a different
					// goal? Or just weren't using higher-order algorithims?
				},
				// Area is f(x)=r^2+(r+1)^2
				vonNeumann:function(radius,include_self){
					if(typeof radius==="undefined")
						radius=1;
					if(typeof include_self==="undefined")
						include_self=false;
					var output=[];
					// A Von Neumann neighborhood of a given distance always fits inside of a
					// Moore neighborhood of the same. (This is a bit brute-force)
					for(var x=-1*radius;x<=radius;x++)
						for(var y=-1*radius;y<=radius;y++)
							if(
								(include_self||!(x===0&&y===0))&&
								(Math.abs(x)+Math.abs(y)<=radius) // Taxicab distance
							)
								output.push({x:x,y:y});
					return output;
				},
				// Area is not quite that of a circle. TODO
				euclidean:function(radius,include_self){
					if(typeof radius==="undefined")
						radius=1;
					if(typeof include_self==="undefined")
						include_self=false;
					var output=[];
					// A circle of a given diameter always fits inside of a square of the same
					// side-length. (This is a bit brute-force)
					for(var x=-1*radius;x<=radius;x++)
						for(var y=-1*radius;y<=radius;y++)
							if(
								(include_self||!(x===0&&y===0))&&
								(Math.sqrt(Math.pow(x,2)+Math.pow(y,2))<=radius) // Euclidean distance
							)
								output.push({x:x,y:y});
					return output;
				}
				//TODO https://www.npmjs.com/package/compute-minkowski-distance ?
				//TODO Non-Euclidean distance algorithim?
			};
			this.onElementModified=function(){};
		}// end constructor
		PixelManipulator.prototype.get_width=function(){
			return this._width;
		};
		PixelManipulator.prototype.set_width=function(value){
			this.canvas.width=value;
			this._width=value-0;
		};
		PixelManipulator.prototype.get_height=function(){
			return this._height;
		};
		PixelManipulator.prototype.set_height=function(value){
			this.canvas.height=value;
			this._height=value-0;
		};
		PixelManipulator.prototype.randomlyFill=function(pr ,value) {//fills the screen with value, at an optional given percent
			//               ({}?,""   )
			if (arguments.length===1) {
				value=pr;
				pr=undefined;
			}
			pr=pr||15;
			var w=this.get_width(),
				h=this.get_height();
			for (var xPos=0; xPos<w; xPos++) {
				for (var yPos=0; yPos<h; yPos++) { //iterate through x and y
					if (Math.random()*100<pr)
						this.setPixel(xPos,yPos,value);
				}
			}
		};
		var __templates={//an object containing the different templates that are currently in the system
			__LIFE__:{//Things like Conway's Game of Life
				_convertNumListToBf:function(nl){
					//                      ("")->#
					// While I used to use string with each digit in it, I found that since
					// there are 0-8, I could use a 9bit field (remember: off by one)
					var out=0;
					for(var i=0;i<nl.length;i++){
						var item=nl[i];
						out|=1<<item;
					}
					return out;
				},
				__index__:function(p,elm,data) {
					//            ("" ,{}  )
					if(data.pattern.search(/B\d{0,9}\/S\d{0,9}/gi)<=-1)return[];
					var numbers=data.pattern.split(/\/?[a-z]/gi);//"B",born,die
					data.loop=typeof data.loop!=="undefined"?data.loop:true;
					if(typeof data.hitbox!=="undefined")
						data.hitbox=this.neighborhoods.moore();
					console.log("Life Pattern found: ",data.name,data);
					return [
						this.__LIVE__(
							p,
							this._convertNumListToBf(numbers[2]),
							data.loop,
							elm
						),
						this.__DEAD__(
							p,
							this._convertNumListToBf(numbers[1]),
							data.loop,
							elm
						)
					];
				},
				__LIVE__:function(p,bfdie,loop,elm) {
					return (function llive(rel) {
						if((bfdie&1<<rel.mooreNearbyCounter(rel.x,rel.y,elm,loop))==0)
							p.setPixel(rel.x,rel.y,p.defaultElm);// if any match (of how many moore are nearby) is found, it dies
					});
				},
				__DEAD__:function(p,bflive,loop,elm) {
					return (function ldead(rel) {
						if((bflive&1<<rel.mooreNearbyCounter(rel.x,rel.y,elm,loop))>0)
							p.setPixel(rel.x,rel.y,elm);// if any match (of how many moore are nearby) is found, it lives
					});
				},
			},
			__WOLFRAM__:{
				__index__:function(p,elm,data) {
					if(data.pattern.search(/Rule \d*/gi)<=-1)return[];
					var binStates=data.pattern.split(/Rule /gi)[1]-0;
					data.loop=typeof data.loop!=="undefined"?data.loop:false;
					if(typeof data.hitbox==="undefined")
						data.hitbox=p.neighborhoods.wolfram();
					console.log("Wolfram pattern found: ",data.name,data);
					return [
						this.__LIVE__(p,elm,binStates,data.loop),
						this.__DEAD__(p,elm,binStates,data.loop)
					];
				},
				__LIVE__:function(p,elm,binStates,loop) {
					return (function wdead(rel) {
						if(rel.y===0)return;
						for (var binDex=0; binDex<8; binDex++) {//for every possible state
							if((binStates&1<<binDex)===0){//if the state is "off". Use a bit mask and shift it
								if(rel.wolframNearbyCounter(rel.x,rel.y,elm,binDex,loop)) {//if there is a wolfram match (wolfram code goes from 111 to 000)
									p.setPixel(rel.x,rel.y,p.defaultId,loop);
									return;//No more logic needed, it is done.
								}
							}
						}
					});
				},
				__DEAD__:function(p,elm,binStates,loop) {
					return (function wdead(rel) {
						for (var binDex=0; binDex<8; binDex++) {//for every possible state
							if((binStates&1<<binDex)>0){//if the state is "on". Use a bit mask and shift it
								if(rel.wolframNearbyCounter(rel.x,rel.y,elm,binDex,loop)) {//if there is a wolfram match (wolfram code goes from 111 to 000)
									p.setPixel(rel.x,rel.y,elm,loop);
									return;//No more logic needed, it is done.
								}
							}
						}
					});
				},
			},
		};
		PixelManipulator.prototype.addMultipleElements=function(map) {//adds multiple elements
			//                      ({} )
			for (var elm in map) {
				this.addElement(elm,map[elm]);
			}
		};
		PixelManipulator.prototype.addElement=function(elm,data) {//adds a single element
			//             ("" ,{}  )
			if (arguments.length<2) {
				data=elm;
				elm=undefined;
			}
			if (typeof elm==="undefined") elm=data.name;//name of the element
			if (typeof elm==="undefined") throw new Error("Name is required for element");
			if (typeof data.name==="undefined") data.name=elm;
			if (typeof data.color==="undefined") data.color=[255,255,255,255];//color of the element
			data.number=this.elementNumList.length;
			this.elementNumList.push(elm);
			// Must be this value exactly for modifyElement to work
			this.elementTypeMap[elm]={number:data.number,color:data.color};
			this.modifyElement(data.number,data);
		};
		PixelManipulator.prototype.modifyElement=function(id,data) {
			//                (# ,{}  )
			var name=this.elementNumList[id],
				oldData=this.elementTypeMap[name];
			delete this.elementTypeMap[name]; // Needs to be gone for color check
			if(typeof data.name!=="undefined"&&data.name!==oldData.name){
				this.aliasElements(oldData,data);
				this.elementNumList[id]=data.name;
			}
			if(typeof data.color!=="undefined"){
				while (data.color.length<4)
					data.color.push(255);
				if(typeof this.colorToId(data.color)!=="undefined")
					throw new Error("The color "+data.color+" is already in use!");
			}
			if(typeof data.loop!=="undefined"&&typeof data.pattern==="undefined")
				data.pattern=oldData.pattern;
			for(var di in data)
				if(data.hasOwnProperty(di))
					oldData[di]=data[di];
			if(typeof data.pattern==="string"){
				var hb=oldData.hitbox,
					lc=oldData.liveCell,
					dc=oldData.deadCell;
				// Even if it's undefined. If it's undefined the template will fill it.
				oldData.hitbox=data.hitbox;
				oldData.liveCell=data.liveCell;
				oldData.deadCell=data.deadCell;
				for (var tempNam in __templates) {
					var out=__templates[tempNam].__index__(this,id,oldData);
					if (out.length===0) continue;//if the output was [], then go on.
					// Checking if `data` has the cell update functions because we _want_ to
					// override the ones in `oldData`
					if (typeof data.liveCell==="undefined"&&typeof out[0]==="function")
						oldData.liveCell=out[0];
					if (typeof data.deadCell==="undefined"&&typeof out[1]==="function")
						oldData.deadCell=out[1];
				}
				// In case nothing matches the pattern
				if(typeof oldData.hitbox==="undefined"&&typeof hb!=="undefined")
					oldData.hitbox=hb;
				// These functions come in pairs. If either are defined, don't use the old
				// ones.
				if(
					typeof oldData.liveCell==="undefined"&&
					typeof oldData.deadCell==="undefined"
				)
					if(typeof lc!=="undefined")
						oldData.liveCell=lc;
					if(typeof dc!=="undefined")
						oldData.deadCell=dc;
			}
			if(typeof oldData.hitbox==="undefined")
				oldData.hitbox=this.neighborhoods.moore();
			this.elementTypeMap[oldData.name]=oldData;
			this.onElementModified(id);
		};
		PixelManipulator.prototype.aliasElements=function(oldData,newData){
			if(typeof this.elementTypeMap[newData.name]!=="undefined")
				throw new Error("The name "+newData.name+" is already in use!");
			delete this.nameAliases[newData.name];
			this.nameAliases[oldData.name]=newData.name;
		};
		PixelManipulator.prototype.getElementByName=function(name){
			var unaliased=name;
			while(typeof unaliased!=="undefined"){
				name=unaliased;
				unaliased=this.nameAliases[name];
			}
			return this.elementTypeMap[name];
		};
		PixelManipulator.prototype.__WhatIs=function(getPixelId) {//Generator for whatIs
			//           (()        )
			var p=this;
			return (function whatIsGeneric(x,y,loop ) {//return the name of an element in a given location
				//          (#,#,true?)
				return p.elementNumList[getPixelId(x,y,loop)];
			});
		};
		PixelManipulator.prototype.play=function(canvasSizes) {//Start iterations on all of the elements on the canvas
			//       ({}?        )
			//console.log("play");
			if (this.mode==="playing") this.reset(canvasSizes);
			this.mode="playing";
			var p=this;
			this.loopint=g.requestAnimationFrame(function(){
				p.iterate();
			});
		};
		PixelManipulator.prototype.reset=function(canvasSizes) {//reset (and resize) the canvas(es)
			//        ({}?        )
			//console.log("reset");
			//clearInterval(this.loopint);
			if(typeof canvasSizes==="undefined")
				canvasSizes={};
			this.pause();
			var w=this.get_width(),
				h=this.get_height();
			this.set_width(canvasSizes.canvasW||w);
			this.set_height(canvasSizes.canvasH||h);
			if (typeof this.zoomelm!=="undefined") {
				this.zoomelm.width=(canvasSizes.zoomW||this.zoomelm.width/this.zoomScaleFactor)*this.zoomScaleFactor;
				this.zoomelm.height=(canvasSizes.zoomH||this.zoomelm.height/this.zoomScaleFactor)*this.zoomScaleFactor;
			}
			this.updateData();
			for (var x=0; x<w; x++) {
				for (var y=0; y<h; y++) {
					this.setPixel(x,y,this.defaultElm);
				}
			}
			this.update();
			this.ctx.putImageData(this.imageData,0,0);
		};
		PixelManipulator.prototype.pause=function() {//pause canvas iterations
			this.mode="paused";
			g.cancelAnimationFrame(this.loopint);
		};
		PixelManipulator.prototype.zoom=function(e  ) {//This tells pixelmanipulator where to focus the center of the zoomElm
			//       ({}?)
			//console.log("zoom",e);
			if (typeof this.zoomelm.height==="undefined") return;
			if (typeof e=="undefined") e={};
			if (typeof e.x=="undefined") e.x=this.zoomX;
			if (typeof e.y=="undefined") e.x=this.zoomY;
			if (e.x>=0&&e.y>=0) {
				this.zoomX=e.x;
				this.zoomY=e.y;
			}
			if (this.get_height()<2) this.set_height(400);//it would be pointless to have a canvas this small
			if (this.get_width()<2) this.set_width(400);
			this.zoomctx.clearRect(0,0,this.zoomelm.width,this.zoomelm.height);//clear the screen
			this.zoomctx.drawImage(this.canvas,//draw the selected section of the canvas onto the zoom canvas
							(this.zoomX - Math.floor(this.zoomScaleFactor/2)),
							(this.zoomY - Math.floor(this.zoomScaleFactor/2)),
							Math.floor(this.zoomelm.width/this.zoomScaleFactor),Math.floor(this.zoomelm.height/this.zoomScaleFactor),
							0,0,
							this.zoomelm.width,this.zoomelm.height);
			this.zoomctx.beginPath();//draw the grid
			for (var i=1; i<(this.zoomelm.width/this.zoomScaleFactor); i++) {
				this.zoomctx.moveTo(i*this.zoomScaleFactor,0);
				this.zoomctx.lineTo(i*this.zoomScaleFactor,this.zoomelm.height);
			}
			for (i=1; i<(this.zoomelm.height/this.zoomScaleFactor); i++) {
				this.zoomctx.moveTo(0,i*this.zoomScaleFactor);
				this.zoomctx.lineTo(this.zoomelm.width,i*this.zoomScaleFactor);
			}
			this.zoomctx.stroke();
		};
		PixelManipulator.prototype.colorToId=function(colors ){
			//            ([#,#,#])->#
			for(var i=0;i<this.elementNumList.length;i++){
				if(this.compareColors(colors,this.idToColor(i))){
					return i;
				}
			}
		};
		PixelManipulator.prototype.idToColor=function(id){
			//            (# )->false?[#,#,#,#]
			return (this.getElementByName(this.elementNumList[id])||{color:false}).color;
		};
		PixelManipulator.prototype.__GetPixelId=function(d ) {//Generates getPixelId and getOldPixelId instances
			//               ([])
			//console.log("GetPixelId");
			var p=this;
			return (function getPixelIdGeneric(x,y,loop ) {//get the rgba value of the element at given position, handeling for looping(defaults to true)
				//           (#,#,true?)
				var w=p.get_width(),
					h=p.get_height();
				loop=typeof loop!=="undefined"?loop:true;
				if (loop) {
					x%=w;
					if(x<0)x+=w;
					y%=h;
					if(y<0)y+=h;
				}else if (x<0||x>=w||y<0||x>=h) return "Blocks";
				return d[(w*y)+x];
			});
		};
		PixelManipulator.prototype.__GetPixel=function(getPixelId) {//Generates getPixel and getOldPixel instances
			//             ((#,#,bool))
			var p=this;
			return (function getPixelGeneric(x,y,loop ) {//get the rgba value of the element at given position, handeling for looping(defaults to true)
				//           (#,#,true?)
				return p.idToColor(getPixelId(x,y,loop));
			});
		};
		PixelManipulator.prototype.update=function() {//applies changes made by setPixel to the graphical canvas(es)
			//console.log("update");
			this.ctx.putImageData(this.imageData,0,0);
			if (typeof this.zoomelm!=="undefined") this.zoom();
		};
		PixelManipulator.prototype.compareColors=function(a        ,b        ){
			//                ([#,#,#,#],[#,#,#,#])->bool
			return (a[0]||0)==(b[0]||0)&&(a[1]||0)==(b[1]||0)&&(a[2]||0)==(b[2]||0)&&(a[3]||255)==(b[3]||255);
		};
		PixelManipulator.prototype.__ConfirmElm=function(getPixelId){//Generates confirmElm and confirmOldElm instances, based of of the respective instances made by __GetPixel
			//               (()        )
			//console.log("ConfirmElm",f);
			//loop=typeof loop!=="undefined"?loop:true;
			var p=this;
			return function confirmElmGeneric(x,y,id     ,loop ) {//returns a boolean as to weather the inputted element name matches the selected location
				//                           (#,#,"":#:[],true?)
				//console.log("confirmElm",x,y,name,loop);
				switch(typeof id){
					case"string":id=p.getElementByName(id).number;break;
					case"object":id=p.colorToId(id);
				}
				return getPixelId(x,y,loop)===id;
			};
		};
		PixelManipulator.prototype.__MooreNearbyCounter=function(f ) {//Generate mooreNearbyCounter
			//                       (())
			//console.log("MooreNearbyCounter");
			//var specialConfirm=this.__ConfirmElm(f);
			return (function mooreNearbyCounter(x,y,name,loop ) {//Count how many cells of this name match in a moore radius
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
		};
		PixelManipulator.prototype.__WolframNearbyCounter=function(f ) {//Generate wolframNearbyCounter
			//                         (())
			//console.log("WolframNearbygetOldPixel");
			return (function wolframNearbyCounter(x,y,name,binDex,loop ) {//determine if the three cells above a given cell match an inputted element query
				//                               (#,#,""  ,#     ,true?)
				//console.log("wolframNearby");
				if(typeof binDex==="string"){
					//Old format was a string of ones and zeros, three long. Use bitshifts to make it better.
					binDex=(binDex[0]==="1")<<2|(binDex[1]==="1")<<1|(binDex[2]==="1")<<0;
				}
				loop=typeof loop!=="undefined"?loop:false;//one-dimentional detectors by default don't loop around edges
				// the three spots above (nw,n,ne)
				return f(x-1,y-1,name,loop)===(binDex&1<<2)>0&&
					f(x,y-1,name,loop)===(binDex&1<<1)>0&&
					f(x+1,y-1,name,loop)===(binDex&1<<0)>0;
			});
		};
		PixelManipulator.prototype.renderPixel=function(x,y,id){
			var color=this.idToColor(id),
				w=this.get_width(),
				//arry.length is always going to be 4. Checking wastes time.
				pixelOffset=((w*y)+x)*4;
			for(var i=0;i<4;++i)
				this.imageData.data[pixelOffset+i]=color[i];
		};
		PixelManipulator.prototype.setPixel=function(x,y,arry ,loop ) {//places given pixel at the x and y position, handling for loop (default loop is true)
			//           (#,#,[]:"",true?)
			//console.log("rawSetPixel",x,y,name,loop);
			x=Math.floor(x).toString()-0;//Fix any bad math done further up the line. Also remove bad math later
			y=Math.floor(y).toString()-0;//...
			loop=typeof loop!=="undefined"?loop:true;
			var id;
			if (typeof arry==="string") {
				if(typeof this.getElementByName(arry)==="undefined")
					throw new Error("Color name "+arry+" invalid!");
				id=this.getElementByName(arry).number;
			}else if(typeof arry==="number")
				id=arry;
			else if(typeof arry==="object"){
				id=this.colorToId(arry);
				//allows for arrays that are too small
				while(arry.length<4)
					arry.push(255);
			}else throw new Error("Color type "+(typeof arry)+" is invalid!");
			var w=this.get_width(),
				h=this.get_height();
			if (loop) {
				x%=w;
				if(x<0)x+=w;
				y%=h;
				if(y<0)y+=h;
			}else if (x<0||x>=w||y<0||y>=h) return; //if it can't loop, and it's outside of the boundaries, exit
			this.renderPixel(x,y,id);
			this.currentElements[(w*y)+x]=id;
		};
		PixelManipulator.prototype.iterate=function() {//single frame of animation. Media functions pass this into setInterval
			//console.log("iterate");
			this.onIterate();
			this.oldElements.set(this.currentElements);
			var getOldPixelId=this.__GetPixelId(this.oldElements),
				confirmOldElm=this.__ConfirmElm(getOldPixelId),
				w=this.get_width(),
				h=this.get_height(),
				rel={
					x:0,
					y:0,
					getOldPixelId:getOldPixelId,
					confirmOldElm:confirmOldElm,
					getOldPixel:this.__GetPixel(getOldPixelId),
					whatIsOld:this.__WhatIs(getOldPixelId),
					mooreNearbyCounter:this.__MooreNearbyCounter(confirmOldElm),
					wolframNearbyCounter:this.__WolframNearbyCounter(confirmOldElm),
				},
				typedUpdatedDead=new Array(this.elementNumList.length);
			this.pixelCounts={};
			for(var x=0;x<w;x++){
				for(var y=0;y<h;y++){ //iterate through x and y
					var currentPixId=rel.getOldPixelId(x,y);
					if(currentPixId===this.defaultId)continue;
					var currentPix=this.elementNumList[currentPixId],
						elm=this.getElementByName(currentPix);
					if(typeof elm.liveCell==="function") {
						rel.y=y;
						rel.x=x;
						rel.oldId=currentPixId;
						elm.liveCell(rel);
					}
					if(typeof this.pixelCounts[currentPix]==="undefined") {
						this.pixelCounts[currentPix]=1;
					}else this.pixelCounts[currentPix]++;
					if (typeof elm.deadCell==="function") {
						if(!typedUpdatedDead[currentPixId])
							typedUpdatedDead[currentPixId]=new Uint8Array(Math.ceil((w*h)/8));
						for(var hi=0;hi<elm.hitbox.length;hi++){
							var pixel=elm.hitbox[hi];
							rel.x=(x+pixel.x)%w;
							if(rel.x<0)rel.x+=w;
							rel.y=(y+pixel.y)%h;
							if(rel.y<0)rel.y+=h;
							var index=Math.floor((w*rel.y+rel.x)/8),
								oldValue=typedUpdatedDead[currentPixId][index],
								bitMask=1<<(rel.x%8);
							if((oldValue&bitMask)>0)
								continue;
							// I timed it, and confirmOldElm is slower than all the math above.
							if(!rel.confirmOldElm(rel.x,rel.y,this.defaultElm))
								continue;
							rel.oldId=this.defaultElm;
							elm.deadCell(rel);
							typedUpdatedDead[currentPixId][index]=oldValue|bitMask;
						}
					}
				}
			}
			this.update();
			this.onAfterIterate();
			if (this.mode==="playing"){
				var p=this;
				this.loopint=g.requestAnimationFrame(function(){
					p.iterate();
				});
			}
		};
		PixelManipulator.prototype.updateData=function() {//defines the starting values of the library and is run on `p.reset();`
			//console.log("updateData");
			var w=this.get_width(),
				h=this.get_height();
			this.imageData=this.ctx.getImageData(0,0,w,h);
			this.currentElements=new Uint32Array(w*h);
			this.oldElements=new Uint32Array(w*h);
			this.ctx.imageSmoothingEnabled=false;
			this.ctx.mozImageSmoothingEnabled=false;
			this.ctx.webkitImageSmoothingEnabled=false;
			this.ctx.msImageSmoothingEnabled=false;
			if (typeof this.zoomelm!="undefined") {
				this.zoomctx.imageSmoothingEnabled=false;
				this.zoomctx.mozImageSmoothingEnabled=false;
				this.zoomctx.webkitImageSmoothingEnabled=false;
				this.zoomctx.msImageSmoothingEnabled=false;
				this.zoomctx.strokeStyle=this.zoomctxStrokeStyle;
			}
			this.getPixelId=this.__GetPixelId(this.currentElements);
			this.getPixel=this.__GetPixel(this.getPixelId);
			this.confirmElm=this.__ConfirmElm(this.getPixelId);
			this.whatIs=this.__WhatIs(this.getPixelId);
		};
		PixelManipulator.prototype.canvasPrep=function(e ) {//Tells PixelManipulator what canvas(es) to use.
			//             ({})
			//Use e.canvas for the normal canvas, and e.zoom for the zoomed-in canvas. (at least e.canvas is required)
			this.canvas=e.canvas;
			this.ctx=this.canvas.getContext('2d');
			if (typeof e.zoom!=="undefined") {
				this.zoomelm=e.zoom;
				this.zoomctx=this.zoomelm.getContext('2d');
			}
			this.updateData();
			if (typeof e.zoom!=="undefined") {
				this.zoom({//zoom at the center
					x:Math.floor(this.zoomelm.width/2)-(Math.floor(this.zoomelm.width/2)*this.zoomScaleFactor),
					y:Math.floor(this.zoomelm.height/2)-(Math.floor(this.zoomelm.height/2)*this.zoomScaleFactor),
				});
			}
		};
		var exprt={
			PixelManipulator:PixelManipulator,
			version:"4.5.2"
		};
		exprt.licence="PixelManipulator v"+exprt.version+" Copyright (C) 2018-2021 "+
			"Nathan Fritzler\nThis program comes with ABSOLUTELY NO WARRANTY\nThis is "+
			"free software, and you are welcome to redistribute it\nunder certain "+
			"conditions, as according to the GNU GENERAL PUBLIC LICENSE version 3 or "+
			"later.";
		PixelManipulator.version=exprt.version;
		PixelManipulator.licence=exprt.licence;
		if(typeof g.window=="undefined")
			console.log(exprt.licence);
		if (typeof module!=="undefined") module.exports=exprt;
		else return exprt;
	}
	if (typeof g.require=="undefined"&&typeof g.module=="undefined") {
		var exprt=pix();
		g.PixelManipulator=exprt.PixelManipulator;
	}else if (typeof g.define!="undefined"&&typeof g.module=="undefined") {
		g.define(["require","exports","module"],pix);
	}else {
		pix(require,exports,module);
	}
})(this);
