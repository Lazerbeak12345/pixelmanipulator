# ![pixelmanipulator logo](pixelmanipulator_logo.svg) PixelManipulator [![version 1.66.150](https://img.shields.io/badge/version-1.66.150_(beta--proposed)-blue.svg)](https://lazerbeak12345.github.io/pixelmanipulator) [![Travis](https://travis-ci.org/Lazerbeak12345/pixelmanipulator.svg?branch=master)](https://travis-ci.org/Lazerbeak12345/pixelmanipulator)

A super powerful library for cellular automation on html5 canvas elements, inspired by the [The Powder Toy](https://powdertoy.co.uk/), but made as a JavaScript library for web-browsers.

[![View the Demo](https://img.shields.io/badge/view-the_demo-green.svg)](https://lazerbeak12345.github.io/pixelmanipulator/pixelmanipulator.html)!
[docs](docs)

## Browser Support

Version                | Chrome              | Chromium           | Edge                | IE                  | Firefox      | Safari                      
-----------------------|---------------------|--------------------|---------------------|---------------------|--------------|-----------------------------
Current release        | yes (69.0.3497.100) | yes (68.0.3440.75) | poor (42.17134.1.0) | no (11.165.17134.0) | yes (61.0.1) | yes (11.1.2 (11605.3.8.1)) 
Last known supported   | yes (68.0.3440.75)  | yes (67.0.3396.99) | poor (42.17134.1.0) | unknown             | yes (61.0.1) | yes (11.1.2 (11605.3.8.1))  
Oldest known supported | yes (68.0.3440.75)  | yes (67.0.3396.99) | poor (42.17134.1.0) | unknown             | yes (61.0.1) | yes (11.1.2 (11605.3.8.1))  

> Identifier | yes                                                                              | poor                                                        | no                                                                                                                                                                                                            | unknown                                                                                          | N/A                                                                                              
> -----------|----------------------------------------------------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------
> Meaning    | Works very well, with little sign of lagging, when the main canvas is 100x100px. | Works, but is very slow, when the main canvas is 100x100px. | Displays a lack of functionallity not displayed in browsers marked as "yes", for example, IE cannot handle arrays that are 1000 characters long, and thus cannot modify the `canvas.data` attribute properly. | This browser in this senario has not been tested yet, and thus there is no information about it. | Due to the contents of nearby boxes, this senario is irrelevent, unimportant, or Not Applicable. 

> I can't test Browser support as well as I want to, so feel free to update this table! (this includes adding other browsers)
> If it works on a version outside of the range that is listed, please send a pull request with that updated information.
