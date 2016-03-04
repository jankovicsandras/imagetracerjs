"use strict";

var fs = require("fs");

var ImageTracer = require(__dirname +'/../imagetracer_v1.1.0');

// This example uses https://github.com/arian/pngjs 
// , but other libraries can be used to load an image file to an ImageData object.
var PNGReader = require(__dirname +'/PNGReader');

var file = __dirname + "/../testimages/1.png";

fs.readFile(file, function(err, bytes){
	if (err) throw err;

	var reader = new PNGReader(bytes);

	reader.parse(function(err, png){
		if (err) throw err;
		
		// creating an ImageData object
		var myImageData = { 'width':png.width, 'height':png.height, 'data':png.pixels };
		
		// tracing
		var options = { 'ltres':0.1 }; // optional
		var svgstring = ImageTracer.imagedataToSVG( myImageData, options );
		
		// writing to file
		fs.writeFile(__dirname+"/test.svg", svgstring, function(err) {
			if (err) throw err;
			console.log(__dirname+"/test.svg was saved!");
		});
		
	});// End of reader.parse()

});// End of fs.readFile()
