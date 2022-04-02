# ![pixelmanipulator logo](media/pixelmanipulator_logo.svg) PixelManipulator [![View the Demo][vtdsvg]][the demo] [![js-standard-style][standard svg]](http://standardjs.com) [![View the Docs][vtdosvg]][the docs]

PixelManipulator is a JavaScript library that can run any cellular automata on
an html5 canvas, such as "Conway's Game of Life," and "Rule 90." Inspired by the
[The Powder Toy](https://powdertoy.co.uk/), but made as a JavaScript library for
web-browsers.

[repo]: https://github.com/lazerbeak12345/pixelmanipulator
[the demo]: https://lazerbeak12345.github.io/pixelmanipulator/pixelmanipulator.html
[vtdsvg]: https://img.shields.io/badge/view-the_demo-green.svg
[the docs]: https://lazerbeak12345.github.io/pixelmanipulator/modules.html
[vtdosvg]: https://img.shields.io/badge/view-the_docs-informational.svg
[standard svg]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

## About the demo [![View the Demo][vtdsvg]][the demo]

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

### Old-school

Start with this html:

```html
<!doctype html>
<html>
	<head>
		<!-- If you'd like you can replace this with a different URL for the library -->
		<script src="https://unpkg.com/pixelmanipulator@^5.0.0"></script>
	</head>
	<body>
		<!-- The canvas element to render to -->
		<canvas id="myCanvas"></canvas>
		<!-- Near the end of the code to ensure pixelmanipulator loaded -->
		<script>
			// Get the canvas element
			var canvas = canvas:document.getElementById("myCanvas")

			// Create a renderer that renders on that canvas
			var renderer = new pixelmanipulator.Ctx2dRenderer(canvas)

			// Create a PixelManipulator, setting the size to 400 by 400
			var p = new pixelmanipulator.PixelManipulator(renderer, 400, 400)

			// An example element to get you started.
			var gol = p.addElement("Conway's Game Of Life", {
				// born on 3, survives on 2 or 3
				...pixelmanipulator.rules.lifelike(p, 'B3/S23'),

				// the rgb color
				renderAs: [0, 255, 0]
			})

			// If your browser doesn't support spread syntax (that's the `...`), then this works too!
			var rule = p.addElement("Rule 90", {
				renderAs: [147, 112, 219, 255]
			})
			p.modifyElement(rule, pixelmanipulator.rules.wolfram(p, 'Rule 90'))

			// Randomly fill 15% of the canvas with this element.
			p.randomlyFill(gol, 15)

			// ... and play. Watch it go!
			p.play()
		</script>
	</body>
</html>
```

Pixelmanipulator supports various browser-side module loaders, such as

- CommonJS (CJS)
- Asynchronus Module Definition (AMD)
- And also supports a fallback to the namespaced global variable
  `pixelmanipulator`

For documentation, [![View the Docs][vtdosvg]][the docs]

See the next section for how to make use of PixelManipulator as an NPM package
instead of using a CDN

### NPM Package

In your project run one of these:

- For yarn, `yarn add pixelmanipulator`
- For npm, `npm i pixelmanipulator`

If you are using esmodules, you now can import it like this:

```ts
import { PixelManipulator, rules, Ctx2dRenderer } from 'pixelmanipulator'
```

Furthermore, if you don't want to render to an HTML5 Canvas, you might find
[the `String-Renderer`][string-renderer] to be usefull to you.

[string-renderer]: https://lazerbeak12345.github.io/pixelmanipulator/classes/renderers.StringRenderer.html

For documentation, [![View the Docs][vtdosvg]][the docs]

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
