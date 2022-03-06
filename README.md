# ![pixelmanipulator logo](media/pixelmanipulator_logo.svg) PixelManipulator

PixelManipulator is a JavaScript library that can run any cellular automata on
an html5 canvas, such as "Conway's Game of Life," and "Rule 90." Inspired by the
[The Powder Toy](https://powdertoy.co.uk/), but made as a JavaScript library for
web-browsers.

[repo]: https://github.com/lazerbeak12345/pixelmanipulator
[the demo]: https://lazerbeak12345.github.io/pixelmanipulator/pixelmanipulator.html

[![View the Demo](https://img.shields.io/badge/view-the_demo-green.svg)][the demo]

## About the demo

The demo includes a full-view pixel array, with configurable size, along with a
movable viewfinder - also with configurable size. Targeter lines - synced
between the viewfinder and the full-view pixel array - are also equipped so you
can line up your complicated large-scale builds. You can even disable the
targeter lines, the "focus box;" a box indicating the location of the
viewfinder, and the pixelCounter, a tool that lets you see how many of what
pixel are present. Don't forget that the pixel placer menu lets you not only
set a different element for alt, normal and control clicking, but lets you fill
the full-view pixel array with a specified random percent of that element with
only a button click. All this, and a newly added element customizer, allowing
one to edit the color, name and loop attributes of an element.

Pre-programmed cellular automata include:

- [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) (with a non-looped variant as well)
- [Brian's Brain](https://en.wikipedia.org/wiki/Brian%27s_Brain)
- [Seeds](https://en.wikipedia.org/wiki/Seeds_%28cellular_automaton%29)
- [Highlife](https://en.wikipedia.org/wiki/Highlife_%28cellular_automaton%29)
- [Wireworld](https://en.wikipedia.org/wiki/Wireworld)
- These Wolfram 2D rules
  - [Rule 30](https://en.wikipedia.org/wiki/Rule_30)
  - [Rule 90](https://en.wikipedia.org/wiki/Rule_90)
  - [Rule 110](https://en.wikipedia.org/wiki/Rule_110)
  - [Rule 184](https://en.wikipedia.org/wiki/Rule_184)
- These custom elements
  - Blocks (They do nothing but serve as a valuable obstacle)
  - Water (Flows like water)
  - Acid (Destroys everything it touches, including itself)

## Getting Started with the library

Download `pixelmanipulator.js` from [the repo][repo] and include this in your html:

```html
<!doctype html>
<html>
	<head>
		...
		<!-- Replace this with the proper location of the file. -->
		<script src="pixelmanipulator.js"></script>
		...
	</head>
	<body>
		...
		<!-- The canvas element to render to. -->
		<canvas id="myCanvas"></canvas>>
		...
		<!-- Near the end of the code to ensure pixelmanipulator.js loaded -->
		<script>
			var p = new pixelmanipulator.PixelManipulator();
			//Get the canvas element and tell PixelManipulator to use it
			p.canvasPrep({
				canvas:document.getElementById("myCanvas"),
			});
			// An example element to get you started.
			p.addElement("Conway's Game Of Life",{
				color:[0,255,0],//what rgb color it is
				pattern:"B3/S23",//born on 3, survives on 2 or 3
			});
			p.play({}); // Final initialization, and play
			// Randomly fill 15% of the canvas with this element.
			p.randomlyFill("Conway's Game Of Life",15);
		</script>
	</body>
</html>
```

Pixelmanipulator supports various browser-side module loaders.

## What is Conway's game of Life

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

### Adding a basic life-type cellular automata

For life-type cellular automata (cellular automata that are like Conway's game
of Life, but have different rules), there is a specific syntax for how to
specify them: `B3/S23`. This syntax literally means "born on three(3), survive
on two(2) or three(3)."

The example code above included `B2/S23` (AKA "Conway's game of Life") as an example. Feel free to try out other patterns, like

- Seeds `B2/S`
- Highlife `B36/S23`
- And more! (262144 combinations, `2^(9+9)`) 
