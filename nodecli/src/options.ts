
export interface Options {
  /**
    * Path or glob file pattern to .png files, relative to current dir.
    */
  input: string | Buffer

  /**
   * Folder for output files. If it doesn't exists it will be created. If none, output files will be written in current folder.
   */
  output?: string

  /**
   *  Print usage information, then exit.
   */
  help?: boolean

  /**
   *  Prints debug messages. 
   */
  debug?: boolean

  /**
   * output file format. Currently only svg is supported
   */
  format?: 'svg'

  /**
   * Error threshold for straight lines. Default value: 1. 
   */
  ltres?: number
  
  /**
   * Error threshold for quadratic splines. Default value: 1.
   */
  qtres?: number

  /**
   * 	Edge node paths shorter than this will be discarded for noise reduction. Default value: 8.
   */
  pathomit?: number

  /**
   * Enhance right angle corners. Default value: 1.
   */
  rightangleenhance?: boolean

  /**
   * 0: disabled, generating a palette; 1: random sampling; 2: deterministic sampling. Default value: 2.
   */
  colorsampling?: 0 | 1 | 2 //TODO: enum

  /**
   * 	Number of colors to use on palette if pal object is not defined. Default value: 16.
   */
  numberofcolors?: number

  /**
 * 	Color quantization will randomize a color if fewer pixels than (total pixels*mincolorratio) has it. Default value: 0.
 */
  mincolorratio?: number

  /**
 *  Color quantization will be repeated this many times. Default value: 3.
 */
  colorquantcycles?: number

  /**
   * 0: sequential ; 1: parallel
   */
  layering?: 0 | 1//TODO: enum

  // SVG rendering
  // Option name	Default value	Meaning
  // strokewidth	1	SVG stroke-width
  // linefilter	false	Enable or disable line filter for noise reduction.
  // scale	1	Every coordinate will be multiplied with this, to scale the SVG.
  // roundcoords	1	rounding coordinates to a given decimal place. 1 means rounded to 1 decimal place like 7.3 ; 3 means rounded to 3 places, like 7.356
  // viewbox	false	Enable or disable SVG viewBox.
  // desc	false	Enable or disable SVG descriptions.
  // Blur preprocessing
  // Option name	Default value	Meaning
  // blurradius	0	Set this to 1..5 for selective Gaussian blur preprocessing.
  // blurdelta	20	RGBA delta treshold for selective Gaussian blur preprocessing.
  // Debug
  // Option name	Default value	Meaning
  // layercontainerid	No default value	Edge node layers can be visualized if a container div's id is defined.
  // lcpr	0	Straight line control point radius, if this is greater than zero, small circles will be drawn in the SVG. Do not use this for big/complex images.
  // qcpr	0	Quadratic spline control point radius, if this is greater than zero, small circles and lines will be drawn in the SVG. Do not use this for big/complex images.
  // Initial palette
  // Option name	Default value	Meaning
  // pal	No default value	Custom palette, an array of color objects: [ {r:0,g:0,b:0,a:255}, ... ]



}
