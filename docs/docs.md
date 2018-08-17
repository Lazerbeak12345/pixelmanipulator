# PixelManipulator documentation

PixelManipulator is a super powerfull library for cellular automation on html5 canvas elements, inspired by the [The Powder Toy](https://powdertoy.co.uk/), but made as a JavaScript library for web-browsers.

This is the documentation for that program, and how to use it in your own website, if you so desired.

## Things you need, and how to access the library

This library should work out of the box, in most reasonable web browsers, and doesn't need jQuery, or anything like it to run.
For more specific information about what web browsers I am talking about, view the README.md file at the root of this repo.

So now I know that it doesn't need jQuery, mootools, or Angular, can I use them anyway?

Of course! This library intends to prevent such problems by storing itself in two global varubles: `window.p` and `window.pixelManipulator` or just `p` and `pixelManipulator`.
You may have also noticed that the Generic name "`p`" isn't `$` or any other "reserved" varuble names.

But what if I need to use a library that uses the global alias `p` for something? Don't worry, you can still use `pixelManipulator`, or make your own alias with this code:

		var newAlias=window.pixelManipulator;

> Unfortunately, I haven't found time to re-organise the entire library to work with dependancy systems like Require.js.

## The `p.canvasPrep` function

Before PixelManipulator can start working, it needs to know what canvases it is going to work with.
It also needs to do a few things once it has access to the canvases, like get the raw pixel data for the normal canvas, then save it as `p.imageData.data`.

The solution for this need can be solved with the `p.canvasPrep` function, as such:

		p.canvasPrep({
			canvas:document.getElementById('canvas'),//This is the canvas with a 1:1 ratio per pixel.
			zoom:document.getElementById('zoom'),//This is the canvas that is a zoomed-in version of the other canvas
		});

> Fun fact: the `p.canvasPrep` function is really just an alias to `p.setCanvas` and `p.zoomElm`.

## The `p.addElement` and `p.addMultipleElements` functions

These functions allows for elements to be added.
It is by far one of the most complicated things that a user of this library will have to know how to do.

### `p.addElement`

This function takes in two arguments, the second optional. `p.addElement(elmName,data);`

#### `elmName`

The optional second argument to `p.addElement`, "`elmName`" is a string that specifies what the name for the element should be.
If this is ommitted, than `data.name` must be defined instead.
However, if both are present, than `elmName` will override `data.name`

#### `data`

The manditory first argument to `p.addElement`.
Let's run through each varuble.

	{
		name:"Your Element's name.",//optional. If the second argument to `p.addElement` is ommited, then this value will be used as the name of the element
		color:[42,42,42,255],//reccommended. RGBA color for what your element should be. (Note that alfa, unlike usual is a range from 0-255). If it is ommitted, or not long enough, then default values of 255 will be used.
		liveCell:function(rel) {//optional. Called when on a living instance of this element. When this function is present, it overides functionality defined by `pattern`
			/*
			the values of rel are the following:
			rel={
				x,//the x position (from a zero indexed top right) that this pixel is
				y,//the y position
				getOldPixel,//same syntax as `p.getPixel` but instead of getting the current pixels, it gets the pixels as they were _before_ any of them were modified 
				confirmOldElm,//same idea as `getOldPixel`, but with `p.confimElm` instead
				mooreNearbyCounter,//counts how many of an element are in the immidiate vicinity (including diagnals) can be used as such `rel.mooreNearbyCounter("elmName",booleanOfWeatherOrNotToLoopAroundTheEdgesOfTheScreen);
				wolframNearby,//returns true if the three pixels above this one matches an imputted value (it can either be a string or an array of 1's & 0's, for example "010" means that the queried element is not above to the left or right, but is directly above) here's how it's used: `rel.wolframNearby("elmName","011",booleanOfWeatherOrNotToLoopAroundTheEdgesOfTheScreen);`
			}
			*/
		},
		deadCell:function(rel) {},//optional. same idea as liveCell, only differance is that the cell at (x,y) is the default element, not the current element
		pattern:"Rule 90"//optional. this string can be in Born/Survive syntax or wolfram Rule # syntax. Some valid examples are "B3/S23" (conway's game of life: born with 3 of this elm nearby, survive with 2 or 3 of this elm nearby) "B36/S23" (HighLife, born 3 or 6, survives 2 or 3) "Rule 30" (transalate 30 into binary, then you get 00011110. that means that the wolfram pattern 111 isn't alive, 110 isn't alive, 101 isn't alive 100 is alive, 011 is alive 010 is alive 001 is alive and 000 is dead [decreasing binary.] For more info view "Rule 30" on Wikipedia)
	}

### `p.addMultipleElements`

`p.addMultipleElements` is a function where it has one argument: `elements`.
It is used in the following syntax:

	p.addMultipleElements({
    	"nameOfYourElement":{},//this object follows the syntax of `data` above
        "anotherElement":{},
    });

## `p.setPixel`

`p.setPixel` is a function that changes the pixel at the given co-ordinates to the inputted element.
It's syntax is like this `p.setPixel(10,3,"blank");`, where the first two arguments are the co-ordinates for where to set the pixel, and the last argument is the name of the element that you want to place.

### About `p.rawSetPixel`

`p.setPixel` takes the name of the element by default, but It really just calls `p.rawSetPixel`.
`p.rawSetPixel` takes the same arguments as setPixel does, excuding the last argument, which must be an array of four numbers, each ranging from 0-255, representing rgba.

>Fun Fact! The required input of the last argument for `p.rawSetPixel` is identical to the format of `p.getPixel`
>
>This feature allows for code like this:
>
>	p.addElement("My duplicating element",{
>		liveCell:function(rel) {
>			var whatsAbove=rel.getOldPixel(rel.x,rel.y-1);//get the (old) pixel that is above this one. (the old pixel is not effected by other pixel's changes to the enviroment)
>			p.rawSetPixel(rel.x,rel.y+1,whatsAbove);//then set the one below this one to be the one above
>		},
>	});

## `p.confirmElm`


