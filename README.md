# ![pixelmanipulator logo](pixelmanipulator_logo.svg) PixelManipulator [![version 1.67.151](https://img.shields.io/badge/version-1.67.151_(beta--proposed)-blue.svg)](https://lazerbeak12345.github.io/pixelmanipulator) [![Travis](https://travis-ci.org/Lazerbeak12345/pixelmanipulator.svg?branch=master)](https://travis-ci.org/Lazerbeak12345/pixelmanipulator)

A super powerfull library for cellular automation on html5 canvas elements, inspired by the [The Powder Toy](https://powdertoy.co.uk/), but made as a JavaScript library for web-browsers.

[![View the Demo](https://img.shields.io/badge/view-the_demo-green.svg)](https://lazerbeak12345.github.io/pixelmanipulator/pixelmanipulator.html)
Scroll down for docs.

## Browser Support

Version                | Chrome              | Chromium           | Edge                | IE                  | Firefox      | Safari
-----------------------|---------------------|--------------------|---------------------|---------------------|--------------|-----------------------------
Current release        | yes (69.0.3497.100) | yes (68.0.3440.75) | poor (42.17134.1.0) | no (11.165.17134.0) | yes (61.0.1) | yes (11.1.2 (11605.3.8.1))
Last known supported   | yes (68.0.3440.75)  | yes (67.0.3396.99) | poor (42.17134.1.0) | unknown             | yes (61.0.1) | yes (11.1.2 (11605.3.8.1))
Oldest known supported | yes (68.0.3440.75)  | yes (67.0.3396.99) | poor (42.17134.1.0) | unknown             | yes (61.0.1) | yes (11.1.2 (11605.3.8.1))

> Identifier | yes                                                                              | poor                                                        | no                                                                                                                                                                                                            | unknown                                                                                          | N/A
> -----------|----------------------------------------------------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------
> Meaning    | Works very well, with little sign of lagging, when the main canvas is 100x100px. | Works, but is very slow, when the main canvas is 100x100px. | Displays a lack of functionallity not displayed in browsers marked as "yes", for example, IE cannot handle arrays that are 1000 itms long, and thus cannot modify the `canvas.data` attribute properly. | This browser in this senario has not been tested yet, and thus there is no information about it. | Due to the contents of nearby boxes, this senario is irrelevent, unimportant, or Not Applicable.

> I can't test Browser support as well as I want to, so feel free to update this table! (this includes adding other browsers)
> If it works on a version outside of the range that is listed, please send a pull request with that updated information.

## PixelManipulator documentation

This is the official Documentation for `PixelManipulator v1.66.149`.
Hopefully, it will serve you well.

### What is PixelManipulator

PixelManipulator is a JavaScript library, written by Nathan Fritzler that allows for people
to run cellular automata, such as "Conway's Game of Life," and "Rule 90."
I can also run pixel simulations entirely of your design, as
demonstrated by the simulation of WireWorld in
[the demo](https://lazerbeak12345.github.io/pixelmanipulator/pixelmanipulator.html).

### Getting Started

Ok, you you've heard enough.
You want to get started.
Like, now.

#### Downloading unminified PixelManipulator

We don't have a CDN service hosting us yet, so you'll have to download it.
But don't worry, it's super small!

First, navigate to
[PixelManipulator's GitHub repo](https://lazerbeak12345.github.io/pixelmanipulator)

When you are there, you can download `pixelmanipulator.js`.

Then, include this in your html:

    <script src="pixelmanipulator.js"></script>

#### Downloading (or compiling) minified PixelManipulator

First, navigate to
[PixelManipulator's GitHub repo](https://lazerbeak12345.github.io/pixelmanipulator)

When you are there, you can download `pixelmanipulator.min.js`.

Then, include this in your html:

    <script src="pixelmanipulator.min.js"></script>

> WARNING!
> This version of PixelManipulator is __NOT__ frequently updated.
> See below for how to get the latest minified version.

##### Compiling for the latest version

> You'll need a working Grunt session on your computer.

Pull the repo onto your computer, then navigate to its directory.
Run `grunt compile`.
Your newly created file is found at `pixelmanipulator.min.js`.

### Running your first simulation

Wow!
That was easy!

But before we get too far ahead of ourselves, lets review how your document
should look thus far:

    <!doctype html>
    <html>
        <head>
            <title>My first PixelManipulator Instance</title>
            <meta charset="utf-8">
            <!--Replace the below line with where you are getting
    		pixelmanipualator-->
            <script src="pixelmanipulator.js"></script>
        </head>
        <body>
            <script>
                //This is where we will be putting our JavaScript code
            </script>
        </body>
    </html>

#### Adding the canvas element

Ok, so we got that, but now what?

We need to add in your canvas element just before the script tags:
`<canvas id="myCanvas"></canvas>>`.

What is this, you may ask?
It is the image-like html element that PixelManipulator will allow you to
display your latest tests with cellular automata on.

Note its id tags of "myCanvas" That will be important later.

#### Telling PixelManipulator where to find our canvas

Right now, PixelManipulator has no idea what canvas it has to work with, so we
need to tell it just that.
To do this, insert the following line of JavaScript code into the labeled
location:

    //Get the canvas element
    var canvas=document.getElementById("myCanvas");
    //Tell PixelManipulator to use it
    p.canvasPrep({
        canvas:canvas,
    });

#### Telling PixelManipulator what cellular automata to use

Before we add Conway's game of Life (aka "Life"), let's review what it is.

##### What is Conway's game of Life

Conway's game of life is a cellular automata with a few simple rules.
All of these rules use a distance formula where it counts the both the pixels
that are immidately touching the edges and the pixels that are immidately
touching the corners.
For example (givin that `O` is the cell, and `X` is one that is checked in the
moore distance fourmula):

    XXX
    XOX
    XXX

On an empty cell, if there are exactly three(3) living cells around it, then it
is born.
A cell will remain alive if there are exactly two(2) or three(3) living cells
nearby.
Elsewise, the cell either remains dead, or becomes dead.

##### Adding a basic life-type cellular automata

For life-type cellular automata (cellular automata that are like Conway's game
of Life, but have different rules), there is a specific syntax for how to
specify them: `B3/S23`. This syntax literally means "born on three(3), survive
on two(2) or three(3)."

To test this out, insert the following JavaScript:

    p.addElement("Conway's Game Of Life",{//add the element
        color:[0,255,0],//what rgb color it is
        pattern:"B3/S23",//born on 3, survives on 2 or 3
    });
    p.play({});//final initialisation, and play
    //fill 15% of the canvas with this element
    p.randomlyFill(15,"Conway's Game Of Life");

#### What your code should look like now

    <!doctype html>
    <html>
        <head>
            <title>My first PixelManipulator Instance</title>
            <meta charset="utf-8">
            <!--Replace the below line with where you are getting
    		pixelmanipualator-->
            <script src="pixelmanipulator.js"></script>
        </head>
        <body>
            <canvas id="myCanvas"></canvas>
            <script>
                //This is where we will be putting our JavaScript code
                //Get the canvas element
                var canvas=document.getElementById("myCanvas");
                //Tell PixelManipulator to use it
                p.canvasPrep({
                    canvas:canvas,
                });
                p.addElement("Conway's Game Of Life",{
                    color:[0,255,0],
                    pattern:"B3/S23",//born on 3, survives on 2 or 3
                });
                p.play({});//final initialisation, and play
                //fill 15% of the canvas with this element
                p.randomlyFill(15,"Conway's Game Of Life");
            </script>
        </body>
    </html>

Wow, only 29 lines of code!

> From here on, this will be less of a tutorial and more of documenatation.

### Media Controls

Let's give the user some control, shall we?

#### Pause

`p.pause();` is a useful function to know if you want your users to be able to pause the canvas.

To pause, simply run without any arguments;

#### Play

Plays the canvas.

`p.play();` is basically the same idea as `p.pause();`, however when any arguments are passed in, they are forworded to `p.reset();`. If no arguments are passed in, `p.reset();` is not called.

#### Reset

`p.reset();` resets/initializes the canvas.

It only accepts one argument, an object with the following syntax (each individual value is optional)

    {
        canvasW:100,//width of the canvas
        canvasH:100,//height of the canvas
        zoomW:10,//width of the zoom canvas (size in zoomed pixels)
        zoomH:10,//height of the zoom canvas (size in zoomed pixels)
    }

#### Iterate

`p.iterate();` is the function that the media commands (pause, play etc) pass into the setIterval function. Calling this will, thus, trigger a single frame of animation.

### Cellular Automata

A Cellular Automata is a program where different states of cells have different behavor based on different surroundings. In PixelManipulator, the only cell type supported is square cells on a grid, however there are other programs that may have support for such things as hexagon cells or other things like that.

There are actually two functions in PixelManipulator that allow for the creation of Cellular automata.
`p.addElement` and `p.addMultipleElements`.

#### addElement

As explained before, the syntax for `p.addElement` is usually something like this:

    p.addElement("Conway's Game Of Life",{
        color:[0,255,0],
        pattern:"B3/S23",
    });

However, it is possible to do this with the same result:

    p.addElement({
        name:"Conway's Game Of Life",
        color:[0,255,0],
        pattern:"B3/S23",
    });

All of the properties that this object can accept are these:

    {
        name:"Name",//The name of the element. Gets overrulled by the first argument to addElement
        color:[255,255,255,255],//the rgba color of the element. If there is less than 4 values in this array, the end of the array is padded with the number 255. (if missing entirely, the color is white) NOTE THAT NO TWO ELEMENTS MAY HAVE EXACTLY THE SAME COLOR
        pattern:"B3/S23",//See more about the pattern value in "About The Pre-built classes"  This is an optional value
        liveCell:function() {},//See more about liveCell and deadCell in "Custom Cellular Automata". Both of these are optional, but when present, overrules what pattern may have applied to it
        deadCell:function() {},
    }

#### addMultipleElements

`p.addMultipleElements` makes your code more readable and passes in the input value you give it to `p.addElement`. Its' syntax is as follows (and is most usefull with more than five elements):

    p.addMultipleElements({
        "Conway's Game of Life":{
            color:[0,255,0],
            pattern:"B3/S23",
        }
        "Highlife":{
            color:[0,255,128,255],
            pattern:"B36/S23"//born on 3 or 6, survives on 2 or 3
        },
    });

#### About The Pre-built classes

As shown in Getting Started, there are "Lifelike" automata. But there are also "Wolfram" automata.

##### Lifelike

As shown above, one can initialize an instance of Conway's Game of Life by doing the following:

    p.addElement("Conway's Game Of Life",{
        color:[0,255,0,255],
        pattern:"B3/S23",
    });

This uses the moore distance formula (see above) to calculate the quantity of nearby cells of this same type. The non-case sensative pattern you see above can be read as "A cell is born (or switches from an off state to an on state) if there are exactly three nearby neibors of this same cell type, and it will survive (or continue to stay as an on state) if there are exactly two or exactly three cells of this same type nearby." Note that by cell type I mean other instances of "Conway's Game Of Life."

This can accept any number of numbers for either input, as long as they are whole numbers from zero(0) to eight(8), due to the fact that that is the physical limit.

> Note that the presence of the number 9 will fail silently, and act as if that didget is not present.

##### Wolfram

Wolfram definitions are rather interesting. Here's an example of one:

    p.addElement("Rule 30",{
        color:[255,0,255,255],
        pattern:"Rule 30",
    });

The pattern must start with the word (not case sensitive) "Rule" followed by a space. It then must be followed by a number from 0 to 255.

This number will be transalated into a binary string. In the case of the example above, "`00011110`."

Wolfram Rules don't use the Moore area formula, they use the Wolfram area formula.

    XXX
     O

This remarkably different formula relies that per each frame, only one line changes at a time. Each cell, as shown above, depends on the 1(same cell present) or 0(same cell not present) state of the cells directly, and to either side above this cell.

We then iterate through each didget of the above number, while counting up from `000` in binary. (For example, `000` and `0`, `001` and `0`, `010` and `0`, `011` and `1`, etc).

If the three-didget binary number correctly matches the state of the cells above this one, then the state of this cell becomes the value of the corrosponding didget in the long binary string. (for example, if it matches in a `000` pattern than it remains dead., but if it matches in a `011` pattern, then the cell becomes alive.)

### Custom Cellular Automata

Now for the hard, yet interesting, stuff.

#### liveCell, deadCell

`liveCell` and `deadCell` are properties of an element that is passed into the addElement function.

Each frame of animation pixelmanipulator iterates through each and every pixel on screen.
When it comes to either the default pixel (usually `"blank"`) or this pixel, it calls the respective live or dead cell function.

> If you want to do something once each frame, instead of once per pixel, see "other usefull things"

When defining a custom element, it is needed to decide upon which, if not both, of these two functions will be needed.
Will your automata be doing something when it detects that the current cell is blank, or when it detects that the current cell is a specific element type?
For the former, use `deadCell`, and for the latter, use `liveCell`.

Lastly, there is a single callback to these two functions, and it has the following attributes: `x`,`y`,`getOldPixel`,`confirmOldElm`,`mooreNearbyCounter` and,`wolframNearby`.

#### setPixel, getPixel, getOldPixel, confirmElm, whatIs, mooreNearbyCounter, wolframNearby

`setPixel` and `getPixel` is the basis around what PixelManipulator works.
All of the other functions in the name of this header are all based upon adding functionallity to these two functions.

##### Looping

Looping is the behavior where if a corordinate is out of bounds, it is corrected.

For example, if you place a pixel 100px left of the screen, and looping is on, the x-position, assuming that the width of the screen is <= 100, will be 100

##### setPixel

`setPixel`, as can be inferred by it's name, sets a pixel in a given location.
The syntax is like this:

    p.setPixel(10,5,"blank");//basic usage, place blank elm at 10,5
    p.setPixel(2000,2000,"otherElementName",true);//boolean at end signifies "no-loop" mode to be `true`. Defaults to `false`.
    p.setPixel(20,30,[255,0,0,255]);//Pass in an rgb(a) color. If four values are not passed in, the missing end values will be assumed to be 255. Using this feature will cause problems if there is not an element defined of the exact color that is passed in. Furthermore, if this is the first instance of this element, this element will _not_ be added to the list of present elements, and pixelmanipulator _will_ crash once it happens upon the pixel, as it is not in it's list of elements that it expected to see.

##### __GetPixel

This is a constructor function where you pass in the image data that you want to generate a pixel-getter for. You shouldn't need to interact with this yourself, as the library auto-generates two of these, one for the current frame of animation `getPixel`, and one for the last frame of animation `getOldPixel`.

###### getPixel

Return the rgba value of the cell at the given corordinates. `p.getPixel(x,y,loop)`

> This is the cell that isn't visible to the user yet, see the next one for the one they can see right now.

###### getOldPixel

Return the rgba value of the cell at the given corordinates, as it was in the frame that the player can currently see. `rel.getPixel(x,y,loop)`

__IMPORTANT__: `getOldPixel` can only be accesed via the callback to `liveCell` and `deadCell`

##### __ConfirmElm

Constructor function that makes `confirmElm` and `confirmOldElm`.
A pixel getter is passed into this constructor (such as `getOldPixel`)

###### confirmElm

`confirmElm` returns a boolean stating wether the cell at the x and y position is the passed-in element name. `p.confirmElm(x,y,"Name of element to query")`
One can also append a boolean at the end to indicate the loop state (default true)

> This function is the result of `p.__ConfirmElm(p.getPixel)`

###### confirmOldElm

`confirmOldElm` returns a boolean stating wether the cell at the x and y position is the passed-in element name. `rel.confirmOldElm(x,y,"Name of element to query")`
One can also append a boolean at the end to indicate the loop state (default true)

__IMPORTANT__: `confirmOldElm` can only be accesed via the callback to `liveCell` and `deadCell`

> This function is the result of `p.__ConfirmElm(p.getOldPixel)`

##### __WhatIs

Generator for `whatIs`.

> __Warning!__ all instances of `p.__WhatIs` are _very_ slow, and should be avoided, if possible. For example, instead of comparing to the output of `whatIs`, compare using `confirmElm` instead.

###### whatIs

Returns name of element at passed-in location. `p.whatIs(6,5);`
Append a boolean as the third argument, and it will set the loop state. (default true)

> __Warning!__ all instances of `p.__WhatIs` are _very_ slow, and should be avoided, if possible. For example, instead of comparing to the output of `whatIs`, compare using `confirmElm` instead.

##### __MooreNearbyCounter

Generator for `mooreNearbyCounter`. Takes in the an instance of `__ConfirmElm`.

###### mooreNearbyCounter

`mooreNearbyCounter` is a function that returns the number of matching cells around a cell, including corners. `rel.mooreNearbyCounter(2,2,"Conway's Game Of Life")`
Append a boolean as the third argument, and it will set the loop state. (default true)

__IMPORTANT__: `mooreNearbyCounter` can only be accesed via the callback to `liveCell` and `deadCell`

##### __WolframNearbyCounter

Generator for wolframNearbyCounter. Takes in instance of `__ConfirmElm`.

###### wolframNearbyCounter

Determines if a string such as `"101"` describes the state of the cells above a given cell. `rel.wolfranNearbyCounter(4,7,"Rule 90","011")`
Append a boolean as the fifth argument, and it will set the loop state. (default false)

__IMPORTANT__: `wolframNearbyCounter` can only be accesed via the callback to `liveCell` and `deadCell`

> You may have noticed that the default loop state is by default false. This is because most one-dimentional cellular automata don't loop around edges.

#### Making your own pre-built class

### Preparation Functions

### Other Usefull things
