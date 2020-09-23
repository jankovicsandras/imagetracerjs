## Version history

### 1.2.6
 - FIXED: hole shape parent search (Issues #31 #39)
 - FIXED: Handle (absolute) paths in CLI correctly Issue #42

### 1.2.5
 - RGBA ImageData check in colorquantization(), solving Issue #24 and #18

### 1.2.4
 - ```options.layering``` : default 0 = sequential, new method ; 1 = parallel, old method. (Enhancement Issue #17)
 - case insensitive option preset names
 - README.md reorganizing

### 1.2.3

 - Node.js Command line interface (Enhancement Issue #13)
 - FIXED: Pathomit problem thanks to EusthEnoptEron (Issue #14)
 - options.corsenabled for [CORS Image loading](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image) thanks to neel-radica (Issue #12)

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

Version history and README for the old 1.1.2 version is [here.](https://github.com/jankovicsandras/imagetracerjs/blob/master/README_v1.1.2.md)

### 1.1.2

- minor bugfixes
- lookup based ```pathscan()```

### 1.1.1

- Bugfix: CSS3 RGBA output in SVG was technically incorrect (however supported by major browsers), so this is changed. [More info](https://stackoverflow.com/questions/6042550/svg-fill-color-transparency-alpha)

### 1.1.0

- it works with Node.js (external library required to load image into an ImageData object)
- export as AMD module / Node module / browser or worker variable
- new syntax: ```ImageTracer112.imageToTracedata()```, no need to initialize
- fixed ```options``` with hasOwnProperty: 0 values are not replaced with defaults, fixed polygons with coordinates x=0 or y=0
- transparency support: alpha is not discarded now, it is given more weight in color quantization
- new ```options.roundcoords``` : rounding coordinates to a given decimal place. This can reduce SVG length significantly (>20%) with minor loss of precision.
- new ```options.desc``` : setting this to false will turn off path descriptions, reducing SVG length.
- new ```options.viewbox``` : setting this to true will use viewBox instead of exact width and height
- new ```options.colorsampling``` : color quantization will sample the colors now by default, can be turned off.
- new ```options.blurradius``` : setting this to 1..5 will preprocess the image with a selective Gaussian blur with ```options.blurdelta``` treshold. This can filter noise and improve quality.
- ```imagedataToTracedata()``` returns image width and height in tracedata
- ```getsvgstring()``` needs now only ```tracedata``` and ```options``` as parameters
- ```colorquantization()``` needs now only ```imgd``` and ```options``` as parameters
- background field is removed from the results of color quantization 
- ESLint passed
- test automation and simple statistics in imagetracer_test_automation.html

### 1.0.0 - 1.0.4

- first published version + bugfixes