//pixelmanipulator.js
/*
	This is the actual file that is in charge of interacting with canvas elements and such.
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
var pixelManipulator=(function () {
	var p=function(o) {
		/*
		var o={
			canvas = document.getElementById('canvas'),
			zoomelm = document.getElementById('zoom'),
		}
		*/
		this.__Canvas__=o.canvas;
		this.__Ctx__ = this.__Canvas__.getContext('2d');
		this.__ZoomElm__=o.zoomelm;
		this.__ZoomCtx__ = this.__ZoomElm__.getContext('2d');
		this.__ImageData__ = this.__Ctx__.getImageData(0,0,this.__Canvas__.width,this.__Canvas__.height);
		this.__Data__ = this.__ImageData__.data;
		this.__MouseX__=0;
		this.__MouseY__=0;
		this.__Row__=0;
	};
	p.elementTypeMap={
		"Test Elm":[122,122,122,122],
	};
	p.elementInformation={
		"Test Elm":function(l) {
			//l.setPixel();
		}
	}
	return p;
})();
