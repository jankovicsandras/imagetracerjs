# image-tracer

## Install

```sg
npm install image-tracer
```

## Usage

```sh
image-tracer --input "foo/imgs/**/*.png" --output bar/imgs-svg
```

## Options

 * `--input: string | Buffer`: Path or glob file pattern to .png files, relative to current dir.
 * `--output?: string`: Folder for output files. If it doesn't exists it will be created. If none, output files will be written
in current folder.
 * `--help?: boolean`:  Print usage information, then exit.
 * `--debug?: boolean`:  Prints debug messages. 
 * `--format?: 'svg'`: output file format. Currently only svg is supported
 * `--ltres?: number`: Error threshold for straight lines. Default value: 1. 
 * `--qtres?: number`: Error threshold for quadratic splines. Default value: 1.
 * `--pathomit?: number`: \tEdge node paths shorter than this will be discarded for noise reduction. Default value: 8.
 * `--rightangleenhance?: boolean`: Enhance right angle corners. Default value: 1.
 * `--colorsampling?: 0 | 1 | 2`: 0: disabled, generating a palette; 1: randomsampling; 2: deterministic sampling. Default value: 2.
 * `--numberofcolors?: number`: \tNumber of colors to use on palette if pal object is not defined. Default value: 16.
 * `--mincolorratio?: number`: \tColor quantization will randomize a color if fewer pixels than (total pixels *mincolorratio) has it.
\tDefault value: 0.
 * `--colorquantcycles?: number`:  Color quantization will be repeated this many times. Default value: 3.
 * `--layering?: 0 | 1`: 0: sequential ; 1: parallel
 * `--strokewidth?: number`:  SVG stroke-width. Default value: 1.
 * `--linefilter?: boolean`:  Enable or disable line filter for noise reduction. Default value: false.
 * `--scale?: number`:  Every coordinate will be multiplied with this, to scale the SVG. Default value: 1.
 * `--roundcoords?: number`:  rounding coordinates to a given decimal place. 1 means rounded to 1 decimal place like 7.3 ; 3 means
rounded to 3places, like 7.356. Default value: 1.
 * `--viewbox?: boolean`:  Enable or disable SVG viewbox. Default value: false.
 * `--desc?: boolean`:  Enable or disable SVG descriptions. Default value: false.
 * `--blurradius?: number`:  \tSet this to 1..5 for selective Gaussian blur preprocessing. Default value: 0.
 * `--blurdelta?: number`:  \tRGBA delta treshold for selective Gaussian blur preprocessing. Default value: 20.

## JavaScript API

Builds several .dot files, one for each rule in given grammar.json file: 

```ts
import {traceImage} from 'image-tracer'

traceImage({
  input:  "foo/imgs/**/*.png",
  output: 'bar/imgs-svg'
})
```

## TODO

- [ ] src/options.ts
- [ ] options in readme
- [ ] tests
- return results for js api