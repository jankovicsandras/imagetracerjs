"use strict";

var fs = require('fs');

var ImageTracer = require( __dirname + '/../imagetracer_v1.2.5' );

// This example uses https://github.com/arian/pngjs 
// , but other libraries can be used to load an image file to an ImageData object.
import  PNGReader from 'png.js' 
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
type PNG = PNGReader['png']
const options = require('minimist')(process.argv.slice(2))
import { sync as glob } from 'glob'
import { Options } from './options';
import { basename, join } from 'path';
import { promisify } from 'util';
import { serial } from './util';

// function main(options: Options) {
// import { serial } from 'misc-utils-of-mine-generic'
// import { basename, join } from 'path'
// import { png2svg } from '../png2svg'

export async function imageTracer(options: Options) {
  // try {

    preconditions(options)
    // options.debug && console.log(`CLI Options: ${JSON.stringify({ ...options, input: null })}`)

    const input = (typeof options.input === 'string' ? glob(options.input).filter(existsSync) : [])
      .map(f => ({
        name: f,
        content: readFileSync(f)
      }))

      if(!input.length){
        fail(`No input files found for ${input}. Aborting. `)
      }

    if (options.output && !existsSync(options.output)) {
      mkdirSync(options.output, { recursive: true })
    }

    await serial(input.map(input => async () => {
      try {
        // options.debug && console.log('Rendering ' + input.name)
        
        // tracing to SVG string
        // var svgstring = ImageTracer.imagedataToSVG( {...png, data: png.pixels}, options );
        // 
        // writeFileSync()
        
        // // writing to file
        // fs.writeFile(
          // 	__dirname + '/' + outfilename, // Output file path
          // 	svgstring,
          // 	function(err){ if(err){ console.log(err); throw err; } console.log( __dirname + '/'+outfilename+' was saved!' ); }
          // );
          const png = await  readPng(input.content )
            // creating an ImageData object
        // var myImageData = { width:png.width, height:png.height, data:png.pixels };
        const outputContent =  ImageTracer.imagedataToSVG( {...png, data: png.pixels}, options )
        // ImageTracer.imagedataToSVG( {...png, data: png.pixels}, options )
        // const result = ({ name: , content: })
        if (options.output) {
          // const outputName =
          const outputFilePath = join(options.output, basename( input.name + '.' + (options.format || 'png')))
          // o.debug && console.log('Writing ' + file)
          writeFileSync(outputFilePath, outputContent )
        }
        else {
          process.stdout.write(outputContent)
        }
      } catch (error) {
        console.error('ERROR while rendering file ' + input.name)
        console.error(error)
      }
    }))

// fs.readFileSync(
		
// 	__dirname + '/' + infilename, // Input file path
	
// 	function( err, bytes ){
// 		if(err){ console.log(err); throw err; }
	
// 		var reader = new PNGReader(bytes);
	
// 		reader.parse( function( err, png ){
// 			if(err){ console.log(err); throw err; }
			
// 			// creating an ImageData object
// 			var myImageData = { width:png.width, height:png.height, data:png.pixels };
			
// 			// tracing to SVG string
// 			var svgstring = ImageTracer.imagedataToSVG( myImageData, options );
			
// 			// writing to file
// 			fs.writeFile(
// 				__dirname + '/' + outfilename, // Output file path
// 				svgstring,
// 				function(err){ if(err){ console.log(err); throw err; } console.log( __dirname + '/'+outfilename+' was saved!' ); }
// 			);
			
// 		});// End of reader.parse()
		
// 	}// End of readFile callback()
	
// );// End of fs.readFile()

}
//


function readPng ( content:Buffer): Promise<PNG>{
  return new Promise((resolve, reject)=>{
    return new PNGReader(content).parse((error, png)=>{
      if(error){
        reject(error)
      }else {
        resolve(png)
      }
    })
  })
    // reader.parse( function( err, png )
}
// CLI arguments to options

// var infilename = process.argv[2], outfilename = infilename+'.svg', options = {}, thisargname = '';
// if(process.argv.length>3){
	
// 	for(var i=3; i<process.argv.length; i+=2 ){
		
// 		thisargname = process.argv[i].toLowerCase();
		
// 		// Output file name
// 		if(thisargname === 'outfilename' || thisargname === '-outfilename'){ outfilename = process.argv[i+1]; }
		
// 		// Tracing
// 		if(thisargname === 'corsenabled' || thisargname === '-corsenabled'){ options.corsenabled = (process.argv[i+1].toLowerCase() === 'true'); }
// 		if(thisargname === 'ltres' || thisargname === '-ltres'){ options.ltres = parseFloat(process.argv[i+1]); }
// 		if(thisargname === 'qtres' || thisargname === '-qtres'){ options.qtres = parseFloat(process.argv[i+1]); }
// 		if(thisargname === 'pathomit' || thisargname === '-pathomit'){ options.pathomit = parseInt(process.argv[i+1]); }
// 		if(thisargname === 'rightangleenhance' || thisargname === '-rightangleenhance'){ options.rightangleenhance = (process.argv[i+1].toLowerCase() === 'true'); }

// 		// Color quantization
// 		if(thisargname === 'colorsampling' || thisargname === '-colorsampling'){ options.colorsampling = parseInt(process.argv[i+1]); }
// 		if(thisargname === 'numberofcolors' || thisargname === '-numberofcolors'){ options.numberofcolors = parseInt(process.argv[i+1]); }
// 		if(thisargname === 'mincolorratio' || thisargname === '-mincolorratio'){ options.mincolorratio = parseFloat(process.argv[i+1]); }
// 		if(thisargname === 'colorquantcycles' || thisargname === '-colorquantcycles'){ options.colorquantcycles = parseInt(process.argv[i+1]); }

// 		// Layering method
// 		if(thisargname === 'layering' || thisargname === '-layering'){ options.layering = process.argv[i+1]; }
		
// 		// SVG rendering
// 		if(thisargname === 'strokewidth' || thisargname === '-strokewidth'){ options.strokewidth = parseFloat(process.argv[i+1]); }
// 		if(thisargname === 'linefilter' || thisargname === '-linefilter'){ options.linefilter = (process.argv[i+1].toLowerCase() === 'true'); }
// 		if(thisargname === 'scale' || thisargname === '-scale'){ options.scale = parseFloat(process.argv[i+1]); }
// 		if(thisargname === 'roundcoords' || thisargname === '-roundcoords'){ options.roundcoords = parseInt(process.argv[i+1]); }
// 		if(thisargname === 'viewbox' || thisargname === '-viewbox'){ options.viewbox = (process.argv[i+1].toLowerCase() === 'true'); }
// 		if(thisargname === 'desc' || thisargname === '-desc'){ options.desc = (process.argv[i+1].toLowerCase() === 'true'); }
// 		if(thisargname === 'lcpr' || thisargname === '-lcpr'){ options.lcpr = parseFloat(process.argv[i+1]); }
// 		if(thisargname === 'qcpr' || thisargname === '-qcpr'){ options.qcpr = parseFloat(process.argv[i+1]); }

// 		// Blur
// 		if(thisargname === 'blurradius' || thisargname === '-blurradius'){ options.blurradius = parseInt(process.argv[i+1]); }
//     if(thisargname === 'blurdelta' || thisargname === '-blurdelta'){ options.blurdelta = parseInt(process.argv[i+1]); }		
    
//     if()
		
// 	}// End of argv loop
	
// }// End of command line argument list length check


function preconditions(options: Options) {
  if (!options.input) {
    
  }
  if (options.help) {
    printHelp()
    process.exit(0)
  }
}


function fail(msg: string) {
  console.error(msg)
  process.exit(1)
}

function printHelp() {
  console.log(`
Usage: 

univac --language python3 --input src/main.py --output main.py.ast

Options:
  `)
}

