# PixelManipulator documentation

This is the official Documentation for `PixelManipulator v1.66.149`.
Hopefully, it will serve you well.

## What is PixelManipulator?

Nice question!

PixelManipulator is a JavaScript library, written by Nathan Fritzler that allows for people
to run cellular automata, such as "Conway's Game of Life," and "Rule 90."
I can also run pixel simulations entirely of your design, as
demonstrated by the simulation of WireWorld in 
[the demo](lazerbeak12345.github.io/pixelmanipulator/pixelmanipulator.html).

## Getting Started

Ok, you you've heard enough.
You want to get started.
Like, now.

### Downloading unminified PixelManipulator

We don't have a CDN service hosting us yet, so you'll have to download it.
But don't worry, it's super small!

First, navigate to
[PixelManipulator's GitHub repo](lazerbeak12345.github.io/pixelmanipulator)

When you are there, you can download `pixelmanipulator.js`.

Then, include this in your html:

    <script src="pixelmanipulator.js"></script>

### Downloading (or compiling) minified PixelManipulator

First, navigate to
[PixelManipulator's GitHub repo](lazerbeak12345.github.io/pixelmanipulator)

When you are there, you can download `pixelmanipulator.min.js`.

Then, include this in your html:

    <script src="pixelmanipulator.min.js"></script>

> WARNING! 
> This version of PixelManipulator is __NOT__ frequently updated.
> See below for how to get the latest minified version.

#### Compiling for the latest version

> You'll need a working Grunt session on your computer.

Pull the repo onto your computer, then navigate to its directory.
Run `grunt compile`.
Your newly created file is found at `pixelmanipulator.min.js`.

## Running your first simulation

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

### Adding the canvas element

Ok, so we got that, but now what?

We need to add in your canvas element just before the script tags:
`<canvas id="myCanvas"></canvas>>`.

What is this, you may ask?
It is the image-like html element that PixelManipulator will allow you to
display your latest tests with cellular automata on.

Note its id tags of "myCanvas" That will be important later.

### Telling PixelManipulator where to find our canvas

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

### Telling PixelManipulator what cellular automata to use

Before we add Conway's game of Life (aka "life"), let's review what it is.

#### What is Conway's game of Life?

Conway's game of life is a cellular automata with a few simple rules.
All of these rules use a distance formula where it counts the both the pixels
that are immidately touching the edges and the pixels that are immidately
touching the corners.
For example (givin that `O` is the cell, and `X` is one that is checked in the
moore distance fourmula): 

    XXX
    XOX
    XXX

On an empty cell, if there are exactly three(3) living cells around it, then it is 
born.
A cell will remain alive if there are exactly two(2) or three(3) living cells
nearby.
Elsewise, the cell either remains dead, or becomes dead.

#### Adding a basic life-type cellular automata

For life-type cellular automata (cellular automata that are like Conway's game
of Life, but have different rules), there is a specific syntax for how to
specify them: `B3/S23`. This syntax literally means "born on three(3), survive
on two(2) or three(3)."

To test this out, insert the following JavaScript:

    p.addElement("Conway's Game Of Life",{//add the element
        color:[0,255,0,255],//what rgba color it is
        pattern:"B3/S23",//born on 3, survives on 2 or 3
    });
    p.play({});//final initialisation, and play
    //fill 15% of the canvas with this element 
    p.randomlyFill(15,"Conway's Game Of Life");

### What your code should look like now

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
    				color:[0,255,0,255],
    				pattern:"B3/S23",//born on 3, survives on 2 or 3
    			});
    			p.play({});//final initialisation, and play
    			//fill 15% of the canvas with this element
    			p.randomlyFill(15,"Conway's Game Of Life");
    		</script>
    	</body>
    </html>

Wow, only 29 lines of code!

### Adding Pause/Play/etc. controls (and how they work)

Let's give the user some control, shall we?

#### 
