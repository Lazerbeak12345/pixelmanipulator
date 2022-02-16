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
	var pxversion="4.5.1";
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
					number:0,//Index in innerP.elementNumList
					hitbox:[],
					name:"blank",
				},
			},
			elementNumList:["blank"],
			nameAliases:{},
			mode:"paused",
			zoomScaleFactor:20,
			zoomctxStrokeStyle:"gray",
			get defaultElm(){
				return this.elementNumList[this.defaultId]
			},
			set defaultElm(value){
				this.defaultId=this.elementTypeMap[value].number
			},
			defaultId:0,
			onIterate:function() {},//both of these need to be defined so the absence of either is suitiable.
			onAfterIterate:function() {},
			//pixelCounts:{},
			neighborhoods:{
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
			},
			__templates:{//an object containing the different templates that are currently in the system
				__LIFE__:{//Things like Conway's Game of Life
					_convertNumListToBf:function(nl){
						//                      ("")->#
						// While I used to use string with each digit in it, I found that since
						// there are 0-8, I could use a 9bit field (remember: off by one)
						var out=0
						for(var i=0;i<nl.length;i++){
							var item=nl[i];
							out|=1<<item
						}
						return out
					},
					__index__:function(elm,data) {
						//            ("" ,{}  )
						if(data.pattern.search(/B\d{0,9}\/S\d{0,9}/gi)<=-1)return[];
						var numbers=data.pattern.split(/\/?[a-z]/gi);//"B",born,die
						data.loop=typeof data.loop!=="undefined"?data.loop:true;
						if(typeof data.hitbox!=="undefined")
							data.hitbox=innerP.neighborhoods.moore();
						console.log("Life Pattern found: ",data.name,data);
						return [
							innerP.__templates.__LIFE__.__LIVE__(
								innerP.__templates.__LIFE__._convertNumListToBf(numbers[2]),
								data.loop,
								elm
							),
							innerP.__templates.__LIFE__.__DEAD__(
								innerP.__templates.__LIFE__._convertNumListToBf(numbers[1]),
								data.loop,
								elm
							)
						];
					},
					__LIVE__:function(bfdie,loop,elm) {
						return (function llive(rel) {
							if((bfdie&1<<rel.mooreNearbyCounter(rel.x,rel.y,elm,loop))==0)
								innerP.setPixel(rel.x,rel.y,innerP.defaultElm);// if any match (of how many moore are nearby) is found, it dies
						});
					},
					__DEAD__:function(bflive,loop,elm) {
						return (function ldead(rel) {
							if((bflive&1<<rel.mooreNearbyCounter(rel.x,rel.y,elm,loop))>0)
								innerP.setPixel(rel.x,rel.y,elm);// if any match (of how many moore are nearby) is found, it lives
						});
					},
				},
				__WOLFRAM__:{
					__index__:function(elm,data) {
						if(data.pattern.search(/Rule \d*/gi)<=-1)return[];
						var binStates=data.pattern.split(/Rule /gi)[1]-0;
						data.loop=typeof data.loop!=="undefined"?data.loop:false;
						if(typeof data.hitbox==="undefined")
							data.hitbox=innerP.neighborhoods.wolfram();
						console.log("Wolfram pattern found: ",data.name,data);
						return [
							innerP.__templates.__WOLFRAM__.__LIVE__(elm,binStates,data.loop),
							innerP.__templates.__WOLFRAM__.__DEAD__(elm,binStates,data.loop)
						];
					},
					__LIVE__:function(elm,binStates,loop) {
						return (function wdead(rel) {
							if(rel.y===0)return;
							for (var binDex=0; binDex<8; binDex++) {//for every possible state
								if((binStates&1<<binDex)===0){//if the state is "off". Use a bit mask and shift it
									if(rel.wolframNearbyCounter(rel.x,rel.y,elm,binDex,loop)) {//if there is a wolfram match (wolfram code goes from 111 to 000)
										innerP.setPixel(rel.x,rel.y,innerP.defaultId,loop);
										return;//No more logic needed, it is done.
									}
								}
							}
						});
					},
					__DEAD__:function(elm,binStates,loop) {//In order not to erase the spawner pixels (which are the pixels, usually in the top row that make the pattern appear), erasing on live shouldn't be done.
						return (function wdead(rel) {
							for (var binDex=0; binDex<8; binDex++) {//for every possible state
								if((binStates&1<<binDex)>0){//if the state is "on". Use a bit mask and shift it
									if(rel.wolframNearbyCounter(rel.x,rel.y,elm,binDex,loop)) {//if there is a wolfram match (wolfram code goes from 111 to 000)
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
				if (typeof elm==="undefined") throw new Error("Name is required for element");
				if (typeof data.name==="undefined") data.name=elm;
				if (typeof data.color==="undefined") data.color=[255,255,255,255];//color of the element
				data.number=innerP.elementNumList.length
				innerP.elementNumList.push(elm)
				// Must be this value exactly for modifyElement to work
				innerP.elementTypeMap[elm]={number:data.number,color:data.color};
				innerP.modifyElement(data.number,data);
			},
			onElementModified:function(){},
			modifyElement:function(id,data) {
				//                (# ,{}  )
				var name=innerP.elementNumList[id],
					oldData=innerP.elementTypeMap[name];
				delete innerP.elementTypeMap[name]; // Needs to be gone for color check
				if(typeof data.name!=="undefined"&&data.name!==oldData.name){
					innerP.aliasElements(oldData,data);
					innerP.elementNumList[id]=data.name;
				}
				if(typeof data.color!=="undefined"){
					while (data.color.length<4)
						data.color.push(255);
					if(typeof innerP.colorToId(data.color)!=="undefined")
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
					for (var tempNam in innerP.__templates) {
						var out=innerP.__templates[tempNam].__index__(id,oldData);
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
					oldData.hitbox=innerP.neighborhoods.moore();
				innerP.elementTypeMap[oldData.name]=oldData;
				innerP.onElementModified(id);
			},
			aliasElements:function(oldData,newData){
				if(typeof innerP.elementTypeMap[newData.name]!=="undefined")
					throw new Error("The name "+newData.name+" is already in use!");
				delete innerP.nameAliases[newData.name];
				innerP.nameAliases[oldData.name]=newData.name;
			},
			getElementByName:function(name){
				var unaliased=name;
				while(typeof unaliased!=="undefined"){
					name=unaliased;
					unaliased=innerP.nameAliases[name];
				}
				return innerP.elementTypeMap[name];
			},
			__WhatIs:function(getPixelId) {//Generator for whatIs
				//           (()        )
				return (function whatIsGeneric(x,y,loop ) {//return the name of an element in a given location
					//          (#,#,true?)
					return innerP.elementNumList[getPixelId(x,y,loop)]
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
				if(typeof canvasSizes==="undefined")
					canvasSizes={};
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
			colorToId:function(colors ){
				//            ([#,#,#])->#
				for(var i=0;i<innerP.elementNumList.length;i++){
					if(innerP.compareColors(colors,innerP.idToColor(i))){
						return i
					}
				}
			},
			idToColor:function(id){
				//            (# )->false?[#,#,#,#]
				return (innerP.getElementByName(innerP.elementNumList[id])||{color:false}).color;
			},
			__GetPixelId:function(d ) {//Generates getPixelId and getOldPixelId instances
				//               ([])
				//console.log("GetPixelId");
				return (function getPixelIdGeneric(x,y,loop ) {//get the rgba value of the element at given position, handeling for looping(defaults to true)
					//           (#,#,true?)
					var w=innerP.get_width(),
						h=innerP.get_height();
					loop=typeof loop!=="undefined"?loop:true;
					if (loop) {
						x%=w;
						if(x<0)x+=w;
						y%=h;
						if(y<0)y+=h;
					}else if (x<0||x>=w||y<0||x>=h) return "Blocks";
					return d[(w*y)+x]
				});
			},
			__GetPixel:function(getPixelId) {//Generates getPixel and getOldPixel instances
				//             ((#,#,bool))
				return (function getPixelGeneric(x,y,loop ) {//get the rgba value of the element at given position, handeling for looping(defaults to true)
					//           (#,#,true?)
					return innerP.idToColor(getPixelId(x,y,loop))
				});
			},
			update:function() {//applies changes made by setPixel to the graphical canvas(es)
				//console.log("update");
				innerP.ctx.putImageData(innerP.imageData,0,0);
				if (typeof innerP.zoomelm!=="undefined") innerP.zoom();
			},
			compareColors:function(a        ,b        ){
				//                ([#,#,#,#],[#,#,#,#])->bool
				return (a[0]||0)==(b[0]||0)&&(a[1]||0)==(b[1]||0)&&(a[2]||0)==(b[2]||0)&&(a[3]||255)==(b[3]||255);
			},
			__ConfirmElm:function(getPixelId){//Generates confirmElm and confirmOldElm instances, based of of the respective instances made by __GetPixel
				//               (()        )
				//console.log("ConfirmElm",f);
				//loop=typeof loop!=="undefined"?loop:true;
				return function confirmElmGeneric(x,y,id     ,loop ) {//returns a boolean as to weather the inputted element name matches the selected location
					//                           (#,#,"":#:[],true?)
					//console.log("confirmElm",x,y,name,loop);
					switch(typeof id){
						case"string":id=innerP.getElementByName(id).number;break;
						case"object":id=innerP.colorToId(id)
					}
					return getPixelId(x,y,loop)===id
				};
			},
			__MooreNearbyCounter:function(f ) {//Generate mooreNearbyCounter
				//                       (())
				//console.log("MooreNearbyCounter");
				//var specialConfirm=innerP.__ConfirmElm(f);
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
			},
			__WolframNearbyCounter:function(f ) {//Generate wolframNearbyCounter
				//                         (())
				//console.log("WolframNearbygetOldPixel");
				return (function wolframNearbyCounter(x,y,name,binDex,loop ) {//determine if the three cells above a given cell match an inputted element query
					//                               (#,#,""  ,#     ,true?)
					//console.log("wolframNearby");
					if(typeof binDex==="string"){
						//Old format was a string of ones and zeros, three long. Use bitshifts to make it better.
						binDex=(binDex[0]==="1")<<2|(binDex[1]==="1")<<1|(binDex[2]==="1")<<0
					}
					loop=typeof loop!=="undefined"?loop:false;//one-dimentional detectors by default don't loop around edges
					// the three spots above (nw,n,ne)
					return f(x-1,y-1,name,loop)===(binDex&1<<2)>0&&
						f(x,y-1,name,loop)===(binDex&1<<1)>0&&
						f(x+1,y-1,name,loop)===(binDex&1<<0)>0;
				});
			},
			renderPixel:function(x,y,id){
				var color=innerP.idToColor(id),
					w=innerP.get_width(),
					//arry.length is always going to be 4. Checking wastes time.
					pixelOffset=((w*y)+x)*4;
				for(var i=0;i<4;++i)
					innerP.imageData.data[pixelOffset+i]=color[i];
			},
			setPixel:function(x,y,arry ,loop ) {//places given pixel at the x and y position, handling for loop (default loop is true)
				//           (#,#,[]:"",true?)
				//console.log("rawSetPixel",x,y,name,loop);
				x=Math.floor(x).toString()-0;//Fix any bad math done further up the line. Also remove bad math later
				y=Math.floor(y).toString()-0;//...
				loop=typeof loop!=="undefined"?loop:true;
				var id;
				if (typeof arry==="string") {
					if(typeof innerP.getElementByName(arry)==="undefined")
						throw new Error("Color name "+arry+" invalid!")
					id=innerP.getElementByName(arry).number;
				}else if(typeof arry==="number")
					id=arry
				else if(typeof arry==="object"){
					id=innerP.colorToId(arry);
					//allows for arrays that are too small
					while(arry.length<4)
						arry.push(255);
				}else throw new Error("Color type "+(typeof arry)+" is invalid!");
				var w=innerP.get_width(),
					h=innerP.get_height();
				if (loop) {
					x%=w;
					if(x<0)x+=w;
					y%=h;
					if(y<0)y+=h;
				}else if (x<0||x>=w||y<0||y>=h) return; //if it can't loop, and it's outside of the boundaries, exit
				innerP.renderPixel(x,y,id);
				innerP.currentElements[(w*y)+x]=id
			},
			iterate:function() {//single frame of animation. Media functions pass this into setInterval
				//console.log("iterate");
				innerP.onIterate();
				innerP.oldElements.set(innerP.currentElements)
				var getOldPixelId=innerP.__GetPixelId(innerP.oldElements),
					confirmOldElm=innerP.__ConfirmElm(getOldPixelId),
					w=innerP.get_width(),
					h=innerP.get_height(),
					rel={
						x:0,
						y:0,
						getOldPixelId:getOldPixelId,
						confirmOldElm:confirmOldElm,
						getOldPixel:innerP.__GetPixel(getOldPixelId),
						whatIsOld:innerP.__WhatIs(getOldPixelId),
						mooreNearbyCounter:innerP.__MooreNearbyCounter(confirmOldElm),
						wolframNearbyCounter:innerP.__WolframNearbyCounter(confirmOldElm),
					},
					typedUpdatedDead=new Array(innerP.elementNumList.length);
				innerP.pixelCounts={};
				for(var x=0;x<w;x++){
					for(var y=0;y<h;y++){ //iterate through x and y
						var currentPixId=rel.getOldPixelId(x,y);
						if(currentPixId===innerP.defaultId)continue;
						var currentPix=innerP.elementNumList[currentPixId],
							elm=innerP.getElementByName(currentPix);
						if(typeof elm.liveCell==="function") {
							rel.y=y;
							rel.x=x;
							rel.oldId=currentPixId;
							elm.liveCell(rel);
						}
						if(typeof innerP.pixelCounts[currentPix]==="undefined") {
							innerP.pixelCounts[currentPix]=1;
						}else innerP.pixelCounts[currentPix]++;
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
								if(!rel.confirmOldElm(rel.x,rel.y,innerP.defaultElm))
									continue;
								rel.oldId=innerP.defaultElm;
								elm.deadCell(rel);
								typedUpdatedDead[currentPixId][index]=oldValue|bitMask;
							}
						}
					}
				}
				innerP.update();
				innerP.onAfterIterate();
			},
			updateData:function() {//defines the starting values of the library and is run on `p.reset();`
				//console.log("updateData");
				var w=innerP.get_width(),
					h=innerP.get_height();
				innerP.imageData=innerP.ctx.getImageData(0,0,w,h);
				innerP.currentElements=new Uint32Array(w*h);
				innerP.oldElements=new Uint32Array(w*h);
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
				innerP.getPixelId=innerP.__GetPixelId(innerP.currentElements);
				innerP.getPixel=innerP.__GetPixel(innerP.getPixelId);
				innerP.confirmElm=innerP.__ConfirmElm(innerP.getPixelId);
				innerP.whatIs=innerP.__WhatIs(innerP.getPixelId);
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
						x:Math.floor(innerP.zoomelm.width/2)-(Math.floor(innerP.zoomelm.width/2)*innerP.zoomScaleFactor),
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
