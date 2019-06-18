
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { sync as glob } from 'glob'
import { Options } from './options';
import { basename, join } from 'path';
import { serial, readPng } from './util';
var ImageTracer = require( '../../..');

export async function traceImage(options: Options) {
  preconditions(options)
  options.debug && console.log(`CLI Options: ${JSON.stringify({ ...options, input: null })}`)

  const input = (typeof options.input === 'string' ? glob(options.input).filter(existsSync) : [])
    .map(f => ({
      name: f,
      content: readFileSync(f)
    }))

  if (!input.length) {
    fail(`No input files found for ${input}. Aborting. `)
  }

  if (options.output && !existsSync(options.output)) {
    mkdirSync(options.output, { recursive: true })
  }

  await serial(input.map(input => async () => {
    try {
      options.debug && console.log('Rendering ' + input.name)
      const png = await readPng(input.content)
      const outputContent = ImageTracer.imagedataToSVG({ ...png, data: png.pixels }, options)
      if (options.output) {
        const outputFilePath = join(options.output, basename(input.name + '.' + (options.format || 'svg')))
        writeFileSync(outputFilePath, outputContent)
      }
      else {
        process.stdout.write(outputContent)
      }
    } catch (error) {
      console.error('ERROR while rendering file ' + input.name)
      console.error(error)
    }
  }))
}

function preconditions(options: Options) {
  if (!options.input) {
    fail('--input argument is mandatory but not given. Aborting.')
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

image-tracer --input "foo/imgs/**/*.png" --output bar/imgs-svg

Options:

* --input: string | Buffer: Path or glob file pattern to .png files, relative to current dir.
* --output: string: Folder for output files. If it doesn't exists it will be created. If none, output files will be written in current folder.
* --help: boolean:  Print usage information, then exit.
* --debug: boolean:  Prints debug messages. 
* --format: 'svg': output file format. Currently only svg is supported
* --ltres: number: Error threshold for straight lines. Default value: 1. 
* --qtres: number: Error threshold for quadratic splines. Default value: 1.
* --pathomit: number: Edge node paths shorter than this will be discarded for noise reduction. Default value: 8.
* --rightangleenhance: boolean: Enhance right angle corners. Default value: 1.
* --colorsampling: 0 | 1 | 2: 0: disabled, generating a palette; 1: randomsampling; 2: deterministic sampling. Default value: 2.
* --numberofcolors: number: Number of colors to use on palette if pal object is not defined. Default value: 16.
* --mincolorratio: number: Color quantization will randomize a color if fewer pixels than (total pixels*mincolorratio) has it. Default value: 0.
* --colorquantcycles: number:  Color quantization will be repeated this many times. Default value: 3.
* --layering: 0 | 1: 0: sequential ; 1: parallel
* --strokewidth: number: SVG stroke-width. Default value: 1.
* --linefilter: boolean: Enable or disable line filter for noise reduction. Default value: false.
* --scale: number: Every coordinate will be multiplied with this, to scale the SVG. Default value: 1.
* --roundcoords: number: rounding coordinates to a given decimal place. 1 means rounded to 1 decimal place like 7.3 ; 3 means rounded to 3 places, like 7.356. Default value: 1.
* --viewbox: boolean: Enable or disable SVG viewbox. Default value: false.
* --desc: boolean: Enable or disable SVG descriptions. Default value: false.
* --blurradius: number: Set this to 1..5 for selective Gaussian blur preprocessing. Default value: 0.
* --blurdelta: number: RGBA delta treshold for selective Gaussian blur preprocessing. Default value: 20.
  `)
}



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

