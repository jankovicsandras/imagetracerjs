# imagetracerjs
![alt Bitmap to Svg](docimages/s1.png)

Simple raster image tracer and vectorizer written in JavaScript.

by András Jankovics

### 1.2.2

 - FIXED: missing hole in path because of incorrect bounding box (Issue #11)
 - Posterized3 option preset
 - Changed svgpathstring() arguments to simplify getsvgstring()

### 1.2.1

 - FIXED: Gaussian blur preprocessing is now independent of DOM and canvas, thus working directly with Node.js (Issue #9)

### 1.2.0

This is a major update, changing some internal logic and option default values. The API is compatible, so it should work out of the box.

 - FIXED: transparent holes are now possible. ( Issue #7 and #8 )
 - Deterministic output by default: ```options.colorsampling = 2``` ; ```options.mincolorratio = 0``` are deterministic and the defaults now.
 - Right angle enhancing: ```options.rightangleenhance``` ( default : true )
 - Option presets (see below)
 - Custom strokewidth with ```options.strokewidth``` ( default : 1 )
 - Line filter with ```options.linefilter``` ( default : false )
 - Simplified ```getsvgstring()```; ```options.desc = false``` by default; splitpoint = fitpoint in fitseq(); small bugfixes and optimizations

Version history and README for the old 1.1.2 version is [here.](README_v1.1.2.md)

### Option presets

Are you confused by the many parameters and their meaning in the options object? Just use a preset like this:
```javascript
// This uses the 'Posterized2' option preset and appends the SVG to an element with id="svgcontainer"
ImageTracer.imageToSVG(
	'panda.png', // Input filename
	function(svgstr){ ImageTracer.appendSVGString( svgstr, 'svgcontainer' ); }, // callback function to append the SVG to the svgcontainer div
	'Posterized2' // Option preset
);
```

![Option presets gallery](docimages/option_presets_small.png)

These strings can be passed instead of the options object: 'Default', 'Posterized1', 'Posterized2', 'Posterized3', 'Curvy', 'Sharp', 'Detailed', 'Smoothed', 'Grayscale', 'Fixedpalette', 'Randomsampling1', 'Randomsampling2', 'Artistic1', 'Artistic2', 'Artistic3', 'Artistic4' .

Check out [imagetracer_options_gallery.html](https://github.com/jankovicsandras/imagetracerjs/blob/master/imagetracer_options_gallery.html) or a [bigger image](docimages/option_presets.png).

### Using in the browser
Include the script:
```javascript
<script src="imagetracer_v1.2.2.js"></script>
```
Then
```javascript
// Loading smiley.png, tracing and calling alert callback on the SVG string result 
ImageTracer.imageToSVG( 'smiley.png', alert );
```
More examples:
```javascript

// Almost the same with options, and the ImageTracer.appendSVGString callback will append the SVG
ImageTracer.imageToSVG( 'smiley.png', ImageTracer.appendSVGString, { ltres:0.1, qtres:1, scale:10, strokewidth:5 } );


// This uses the 'Posterized2' option preset and appends the SVG to an element with id="svgcontainer"
ImageTracer.imageToSVG(
	'panda.png',
	function(svgstr){ ImageTracer.appendSVGString( svgstr, 'svgcontainer' ); },
	'Posterized2'
);


// The helper function loadImage() loads an image to a canvas, then executing callback:
// appending the canvas to a div here.
ImageTracer.loadImage(
	'panda.png',
	function(canvas){ (document.getElementById('canvascontainer')).appendChild(canvas); }
);


// ImageData can be traced to an SVG string synchronously.
ImageTracer.loadImage(
	'smiley.png',
	function(canvas){
	
		// Getting ImageData from canvas with the helper function getImgdata().
	 	var imgd = ImageTracer.getImgdata( canvas );
	 	
	 	// Synchronous tracing to SVG string
	 	var svgstr = ImageTracer.imagedataToSVG( imgd, { scale:5 } );
	 
	 	// Appending SVG
	 	ImageTracer.appendSVGString( svgstr, 'svgcontainer' );
	 	
	}
);


// This will load an image, trace it when loaded, and execute callback on the tracedata:
// stringifying and alerting it here.
ImageTracer.imageToTracedata(
	'smiley.png',
	function(tracedata){ alert( JSON.stringify( tracedata ) ); },
	{ ltres:0.1, qtres:1, scale:10 }
);


// imagedataToTracedata() is very similar to the previous functions. This returns tracedata synchronously.
ImageTracer.loadImage(
		'smiley.png',
		function(canvas){ 
		
			// Getting ImageData from canvas with the helper function getImgdata().
			var imgd = ImageTracer.getImgdata(canvas);
			
			// Synchronous tracing to tracedata
			var tracedata = ImageTracer.imagedataToTracedata( imgd, { ltres:1, qtres:0.01, scale:10 } );
			
			alert( JSON.stringify( tracedata ) );
		}
);
```

### Using with Node.js
See nodetest folder. Example:
```javascript
"use strict";

var fs = require('fs');

var ImageTracer = require( __dirname + '/../imagetracer_v1.2.2' );

// This example uses https://github.com/arian/pngjs 
// , but other libraries can be used to load an image file to an ImageData object.
var PNGReader = require( __dirname + '/PNGReader' );

fs.readFile(
		
	__dirname + '/../testimages/1.png', // Input file path
	
	function( err, bytes ){
		if(err){ throw err; }
	
		var reader = new PNGReader(bytes);
	
		reader.parse( function( err, png ){
			if(err){ throw err; }
			
			// creating an ImageData object
			var myImageData = { width:png.width, height:png.height, data:png.pixels };
			
			// tracing to SVG string
			var options = { ltres:0.1 }; // optional
			var svgstring = ImageTracer.imagedataToSVG( myImageData, options );
			
			// writing to file
			fs.writeFile(
				__dirname + '/test.svg', // Output file path
				svgstring,
				function(err){ if(err){ throw err; } console.log( __dirname + '/test.svg was saved!' ); }
			);
			
		});// End of reader.parse()
		
	}// End of readFile callback()
	
);// End of fs.readFile()
```

### Deterministic output
ImageTracer version >= 1.2.0 is deterministic by default, but randomization can be turned back on.

This is relevant to versions < 1.2.0 : [options for deterministic tracing](https://github.com/jankovicsandras/imagetracerjs/blob/master/deterministic.md)

### Main Functions
|Function name|Arguments|Returns|Run type|
|-------------|---------|-------|--------|
|```imageToSVG```|```image_url /*string*/ , callback /*function*/ , options /*optional object*/```|Nothing, ```callback(svgstring)``` will be executed|Asynchronous|
|```imagedataToSVG```|```imagedata /*object*/ , options /*optional object*/```|```svgstring /*string*/```|Synchronous|
|```imageToTracedata```|```image_url /*string*/ , callback /*function*/ , options /*optional object*/```|Nothing, ```callback(tracedata)``` will be executed|Asynchronous|
|```imagedataToTracedata```|```imagedata /*object*/ , options /*optional object*/```|```tracedata /*object*/```|Synchronous|

```imagedata``` is standard [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) here, ```canvas``` is [canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas) .

#### Helper Functions
|Function name|Arguments|Returns|Run type|
|-------------|---------|-------|--------|
|```appendSVGString```|```svgstring /*string*/, parentid /*string*/```|Nothing, an SVG will be appended to the container div with id=parentid.|Synchronous|
|```loadImage```|```url /*string*/, callback /*function*/```|Nothing, loading an image from a URL, then executing ```callback(canvas)```|Asynchronous|
|```getImgdata```|```canvas /*object*/```|```imagedata /*object*/```|Synchronous|

```imagedata``` is standard [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) here, ```canvas``` is [canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas) .
There are more functions for advanced users, read the source if you are interested. :)
	
### Options
|Option name|Default value|Meaning|
|-----------|-------------|-------|
|```ltres```|```1```|Error treshold for straight lines.|
|```qtres```|```1```|Error treshold for quadratic splines.|
|```pathomit```|```8```|Edge node paths shorter than this will be discarded for noise reduction.|
|```rightangleenhance```|```true```|Enhance right angle corners.|
|```pal```|No default value|Custom palette, an array of color objects: ```[ {r:0,g:0,b:0,a:255}, ... ]```|
|```colorsampling```|```2```|0: disabled, generating a palette; 1: random sampling; 2: deterministic sampling|
|```numberofcolors```|```16```|Number of colors to use on palette if pal object is not defined.|
|```mincolorratio```|```0```|Color quantization will randomize a color if fewer pixels than (total pixels*mincolorratio) has it.|
|```colorquantcycles```|```3```|Color quantization will be repeated this many times.|
|```blurradius```|```0```|Set this to 1..5 for selective Gaussian blur preprocessing.|
|```blurdelta```|```20```|RGBA delta treshold for selective Gaussian blur preprocessing.|
|```strokewidth```|```1```|[SVG stroke-width](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width)|
|```linefilter```|```false```|Enable or disable line filter for noise reduction.|
|```scale```|```1```|Every coordinate will be multiplied with this, to scale the SVG.|
|```roundcoords```|```1```|rounding coordinates to a given decimal place. 1 means rounded to 1 decimal place like 7.3 ; 3 means rounded to 3 places, like 7.356|
|```viewbox```|```false```|Enable or disable SVG viewBox.|
|```desc```|```false```|Enable or disable SVG descriptions.|
|```lcpr```|```0```|Straight line control point radius, if this is greater than zero, small circles will be drawn in the SVG. Do not use this for big/complex images.|
|```qcpr```|```0```|Quadratic spline control point radius, if this is greater than zero, small circles and lines will be drawn in the SVG. Do not use this for big/complex images.|
|```layercontainerid```|No default value|Edge node layers can be visualized if a container div's id is defined.|

The almost complete options object:	
```javascript
var options = {ltres:1, qtres:1, pathomit:8, rightangleenhance:true, colorsampling:2, numberofcolors:16, mincolorratio:0, colorquantcycles:3, blurradius:0, blurdelta:20, strokewidth:1, linefilter:false, scale:1, roundcoords:1, lcpr:0, qcpr:0, desc:false, viewbox:false };
```
Adding custom palette. This will override numberofcolors.
```javascript
options.pal = [{r:0,g:0,b:0,a:255}, {r:0,g:0,b:255,a:255}, {r:255,g:255,b:0,a:255}];
```

### Legacy 1.1.2 version

The 1.1.2 version can be used like this: *ImageTracer112*.imageToSVG()

Include the script:
```javascript
<script src="imagetracer_v1.1.2.js"></script>
```
Then
```javascript
// Loading smiley.png, tracing and calling alert callback on the SVG string result 
ImageTracer112.imageToSVG( 'smiley.png', alert );
```

### Process overview
See [Process overview and Ideas for improvement](https://github.com/jankovicsandras/imagetracerjs/blob/master/process_overview.md)

### License
#### The Unlicense / PUBLIC DOMAIN

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to [http://unlicense.org](http://unlicense.org)
