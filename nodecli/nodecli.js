"use strict";

var fs = require('fs');

var ImageTracer = require( __dirname + '/../imagetracer_v1.2.6' );

// This example uses https://github.com/arian/pngjs 
// , but other libraries can be used to load an image file to an ImageData object.
var PNGReader = require( __dirname + '/PNGReader' );

// CLI arguments to options
var infilename = process.argv[2], outfilename = infilename+'.svg', options = {}, thisargname = '';
if(process.argv.length>3){
	
	for(var i=3; i<process.argv.length; i+=2 ){
		
		thisargname = process.argv[i].toLowerCase();
		
		// Output file name
		if(thisargname === 'outfilename' || thisargname === '-outfilename'){ outfilename = process.argv[i+1]; }
		
		// Tracing
		if(thisargname === 'corsenabled' || thisargname === '-corsenabled'){ options.corsenabled = (process.argv[i+1].toLowerCase() === 'true'); }
		if(thisargname === 'ltres' || thisargname === '-ltres'){ options.ltres = parseFloat(process.argv[i+1]); }
		if(thisargname === 'qtres' || thisargname === '-qtres'){ options.qtres = parseFloat(process.argv[i+1]); }
		if(thisargname === 'pathomit' || thisargname === '-pathomit'){ options.pathomit = parseInt(process.argv[i+1]); }
		if(thisargname === 'rightangleenhance' || thisargname === '-rightangleenhance'){ options.rightangleenhance = (process.argv[i+1].toLowerCase() === 'true'); }

		// Color quantization
		if(thisargname === 'colorsampling' || thisargname === '-colorsampling'){ options.colorsampling = parseInt(process.argv[i+1]); }
		if(thisargname === 'numberofcolors' || thisargname === '-numberofcolors'){ options.numberofcolors = parseInt(process.argv[i+1]); }
		if(thisargname === 'mincolorratio' || thisargname === '-mincolorratio'){ options.mincolorratio = parseFloat(process.argv[i+1]); }
		if(thisargname === 'colorquantcycles' || thisargname === '-colorquantcycles'){ options.colorquantcycles = parseInt(process.argv[i+1]); }

		// Layering method
		if(thisargname === 'layering' || thisargname === '-layering'){ options.layering = process.argv[i+1]; }
		
		// SVG rendering
		if(thisargname === 'strokewidth' || thisargname === '-strokewidth'){ options.strokewidth = parseFloat(process.argv[i+1]); }
		if(thisargname === 'linefilter' || thisargname === '-linefilter'){ options.linefilter = (process.argv[i+1].toLowerCase() === 'true'); }
		if(thisargname === 'scale' || thisargname === '-scale'){ options.scale = parseFloat(process.argv[i+1]); }
		if(thisargname === 'roundcoords' || thisargname === '-roundcoords'){ options.roundcoords = parseInt(process.argv[i+1]); }
		if(thisargname === 'viewbox' || thisargname === '-viewbox'){ options.viewbox = (process.argv[i+1].toLowerCase() === 'true'); }
		if(thisargname === 'desc' || thisargname === '-desc'){ options.desc = (process.argv[i+1].toLowerCase() === 'true'); }
		if(thisargname === 'lcpr' || thisargname === '-lcpr'){ options.lcpr = parseFloat(process.argv[i+1]); }
		if(thisargname === 'qcpr' || thisargname === '-qcpr'){ options.qcpr = parseFloat(process.argv[i+1]); }

		// Blur
		if(thisargname === 'blurradius' || thisargname === '-blurradius'){ options.blurradius = parseInt(process.argv[i+1]); }
		if(thisargname === 'blurdelta' || thisargname === '-blurdelta'){ options.blurdelta = parseInt(process.argv[i+1]); }		
		
	}// End of argv loop
	
}// End of command line argument list length check

fs.readFile(
		
	infilename, // Input file path
	
	function( err, bytes ){
		if(err){ console.log(err); throw err; }
	
		var reader = new PNGReader(bytes);
	
		reader.parse( function( err, png ){
			if(err){ console.log(err); throw err; }
			
			// creating an ImageData object
			var myImageData = { width:png.width, height:png.height, data:png.pixels };
			
			// tracing to SVG string
			var svgstring = ImageTracer.imagedataToSVG( myImageData, options );
			
			// writing to file
			fs.writeFile(
				outfilename, // Output file path
				svgstring,
				function(err){ if(err){ console.log(err); throw err; } console.log( outfilename+' was saved!' ); }
			);
			
		});// End of reader.parse()
		
	}// End of readFile callback()
	
);// End of fs.readFile()