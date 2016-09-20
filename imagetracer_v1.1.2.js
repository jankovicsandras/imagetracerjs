/*
	imagetracer.js
	Simple raster image tracer and vectorizer written in JavaScript.
	by András Jankovics 2015, 2016
	andras@jankovics.net
*/

/*

The Unlicense / PUBLIC DOMAIN

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

For more information, please refer to http://unlicense.org/

*/

(function(){ 'use strict';

function ImageTracer(){
	var _this = this;

	this.versionnumber = '1.1.2',
	
	////////////////////////////////////////////////////////////
	//
	//  User friendly functions
	//
	////////////////////////////////////////////////////////////
	
	// Loading an image from a URL, tracing when loaded,
	// then executing callback with the scaled svg string as argument
	this.imageToSVG = function(url,callback,options){
		options = _this.checkoptions(options);
		// loading image, tracing and callback
		_this.loadImage(url,
			function(canvas){
				callback(
					_this.imagedataToSVG( _this.getImgdata(canvas),options )
				);
			}
		);
	},// End of imageToSVG()
	
	// Tracing imagedata, then returning the scaled svg string
	this.imagedataToSVG = function(imgd,options){
		options = _this.checkoptions(options);
		// tracing imagedata
		var td = _this.imagedataToTracedata(imgd,options);
		// returning SVG string
		return _this.getsvgstring(td, options);
	},// End of imagedataToSVG()
	
	// Loading an image from a URL, tracing when loaded,
	// then executing callback with tracedata as argument
	this.imageToTracedata = function(url,callback,options){
		options = _this.checkoptions(options);
		// loading image, tracing and callback
		_this.loadImage(url,
				function(canvas){
					callback(
						_this.imagedataToTracedata(_this.getImgdata(canvas),options)
					);
				}
		);
	},// End of imageToTracedata()
	
	// Tracing imagedata, then returning tracedata (layers with paths, palette, image size)
	this.imagedataToTracedata = function(imgd,options){
		options = _this.checkoptions(options);
		
		// 1. Color quantization 
		var ii = _this.colorquantization( imgd, options );
		
		// 2. Layer separation and edge detection
		var ls = _this.layering( ii );
		
		// Optional edge node visualization
		if(options.layercontainerid){ _this.drawLayers( ls, _this.specpalette, options.scale, options.layercontainerid ); }
		
		// 3. Batch pathscan
		var bps = _this.batchpathscan( ls, options.pathomit );
		
		// 4. Batch interpollation
		var bis = _this.batchinternodes( bps );
		// 5. Batch tracing
		return {
			'layers':_this.batchtracelayers( bis, options.ltres, options.qtres ),
			'palette':ii.palette,
			'width':imgd.width,
			'height':imgd.height
		};
		
	},// End of imagedataToTracedata()
	
	// creating options object, setting defaults for missing values
	this.checkoptions = function(options){
		
		options = options || {};
		// Defaults for optional parameters

		// Tracing
		if(!options.hasOwnProperty('ltres')){ options.ltres = 1; }
		if(!options.hasOwnProperty('qtres')){ options.qtres = 1; }
		if(!options.hasOwnProperty('pathomit')){ options.pathomit = 8; }

		// Color quantization
		if(!options.hasOwnProperty('colorsampling')){ options.colorsampling = true; }
		if(!options.hasOwnProperty('numberofcolors')){ options.numberofcolors = 16; }
		if(!options.hasOwnProperty('mincolorratio')){ options.mincolorratio = 0.02; }
		if(!options.hasOwnProperty('colorquantcycles')){ options.colorquantcycles = 3; }
		
		// options.pal is not defined here, the custom palette should be added externally: options.pal = [ { 'r':0, 'g':0, 'b':0, 'a':255 }, {...}, ... ];
		
		// SVG rendering
		if(!options.hasOwnProperty('scale')){ options.scale = 1; }
		if(!options.hasOwnProperty('simplifytolerance')){ options.simplifytolerance = 0; }
		if(!options.hasOwnProperty('roundcoords')){ options.roundcoords = 1; }
		if(!options.hasOwnProperty('lcpr')){ options.lcpr = 0; }
		if(!options.hasOwnProperty('qcpr')){ options.qcpr = 0; }
		if(!options.hasOwnProperty('desc')){ options.desc = true; }
		if(!options.hasOwnProperty('viewbox')){ options.viewbox = false; }

		// Blur
		if(!options.hasOwnProperty('blurradius')){ options.blurradius = 0; }
		if(!options.hasOwnProperty('blurdelta')){ options.blurdelta = 20; }
		
		// options.layercontainerid is not defined here, can be added externally: options.layercontainerid = 'mydiv'; ... <div id="mydiv"></div>
		
		return options;
		
	},// End of checkoptions()
	
	////////////////////////////////////////////////////////////
	//
	//  Vectorizing functions
	//
	////////////////////////////////////////////////////////////
	
	// 1. Color quantization
	// Using a form of k-means clustering repeatead options.colorquantcycles times. http://en.wikipedia.org/wiki/Color_quantization
	this.colorquantization = function(imgd, options ){
		var arr = [], idx=0, cd,cdl,ci,c1,c2,c3,c4, paletteacc = [], pixelnum = imgd.width*imgd.height, i, j, k, cnt, palette;
		
		// Filling arr (color index array) with -1
		for( j=0; j<imgd.height+2; j++ ){ arr[j]=[]; for(i=0; i<imgd.width+2 ; i++){ arr[j][i] = -1; } }
		
		// Use custom palette if pal is defined or generate custom length palette
		palette = options.pal ? options.pal : ( options.colorsampling ? _this.samplepalette(options.numberofcolors,imgd) : _this.generatepalette(options.numberofcolors) );
		
		// Selective Gaussian blur preprocessing
		if( options.blurradius > 0 ){ imgd = _this.blur( imgd, options.blurradius, options.blurdelta ); }
		
		// Repeat clustering step options.colorquantcycles times
		for( cnt=0; cnt < options.colorquantcycles; cnt++ ){
			
			// Average colors from the second iteration
			if(cnt>0){
				// averaging paletteacc for palette
				for( k=0; k < palette.length; k++ ){
					// averaging
					if(paletteacc[k].n>0){
						palette[k].r = Math.floor(paletteacc[k].r/paletteacc[k].n);
						palette[k].g = Math.floor(paletteacc[k].g/paletteacc[k].n);
						palette[k].b = Math.floor(paletteacc[k].b/paletteacc[k].n);
						palette[k].a = Math.floor(paletteacc[k].a/paletteacc[k].n);
					}
					
					// Randomizing a color, if there are too few pixels and there will be a new cycle
					if( ( paletteacc[k].n/pixelnum < options.mincolorratio ) && ( cnt < options.colorquantcycles-1 ) ){
						palette[k].r = Math.floor(Math.random()*255);
						palette[k].g = Math.floor(Math.random()*255);
						palette[k].b = Math.floor(Math.random()*255);
						palette[k].a = Math.floor(Math.random()*255);
					}
					
				}// End of palette loop
			}// End of Average colors from the second iteration
			
			// Reseting palette accumulator for averaging
			for( i=0; i < palette.length; i++ ){
				paletteacc[i]={};
				paletteacc[i].r=0;
				paletteacc[i].g=0;
				paletteacc[i].b=0;
				paletteacc[i].a=0;
				paletteacc[i].n=0;
			}
			
			// loop through all pixels
			for( j=0; j < imgd.height; j++ ){
				for( i=0; i < imgd.width; i++ ){
					
					// pixel index
					idx = (j*imgd.width+i)*4;
					
					// find closest color from palette by measuring (rectilinear) color distance between this pixel and all palette colors
					cdl = 256+256+256+256; ci=0;
					for(k=0;k<palette.length;k++){	
						
						// In my experience, https://en.wikipedia.org/wiki/Rectilinear_distance works better than https://en.wikipedia.org/wiki/Euclidean_distance
						c1 = Math.abs(palette[k].r-imgd.data[idx  ]);
						c2 = Math.abs(palette[k].g-imgd.data[idx+1]);
						c3 = Math.abs(palette[k].b-imgd.data[idx+2]);
						c4 = Math.abs(palette[k].a-imgd.data[idx+3]);
						cd = c1 + c2 + c3 + c4*4; // weighted alpha seems to help images with transparency 
						
						// Remember this color if this is the closest yet
						if(cd<cdl){ cdl = cd; ci = k; }
						
					}// End of palette loop
					
					// add to palettacc
					paletteacc[ci].r += imgd.data[idx  ];
					paletteacc[ci].g += imgd.data[idx+1];
					paletteacc[ci].b += imgd.data[idx+2];
					paletteacc[ci].a += imgd.data[idx+3];
					paletteacc[ci].n++;
					
					// update the indexed color array
					arr[j+1][i+1] = ci;
					
				}// End of i loop
			}// End of j loop
			
		}// End of Repeat clustering step options.colorquantcycles times
		
		return { 'array':arr, 'palette':palette };
	},// End of colorquantization()
	
	// Sampling a palette from imagedata 
	this.samplepalette = function(numberofcolors,imgd){
		var idx, palette=[];
		for(var i=0; i<numberofcolors; i++){
			idx = Math.floor( Math.random() * imgd.data.length / 4 ) * 4;
			palette[i] = {};
			palette[i].r = imgd.data[idx  ];
			palette[i].g = imgd.data[idx+1];
			palette[i].b = imgd.data[idx+2];
			palette[i].a = imgd.data[idx+3];
		}
		return palette;
	},// End of samplepalette()
	
	// Generating a palette with numberofcolors
	this.generatepalette = function(numberofcolors){
		var palette = [], rcnt, gcnt, bcnt;
		if(numberofcolors<8){
			
			// Grayscale
			var graystep = Math.floor(255/(numberofcolors-1));
			for(var ccnt=0;ccnt<numberofcolors;ccnt++){
				palette.push({'r':ccnt*graystep,'g':ccnt*graystep,'b':ccnt*graystep,'a':255});
			}
			
		}else{
			
			// RGB color cube
			var colorqnum = Math.floor(Math.pow(numberofcolors, 1/3)), // Number of points on each edge on the RGB color cube
			colorstep = Math.floor(255/(colorqnum-1)), // distance between points
			rndnum = numberofcolors - colorqnum*colorqnum*colorqnum; // number of random colors
			
			for(rcnt=0; rcnt<colorqnum; rcnt++){
				for(gcnt=0; gcnt<colorqnum; gcnt++){
					for(bcnt=0; bcnt<colorqnum; bcnt++){
						var newr = rcnt*colorstep, newg = gcnt*colorstep, newb = bcnt*colorstep,
						newcolor = {'r':newr,'g':newg,'b':newb,'a':255};
						palette.push(newcolor);
					}// End of blue loop
				}// End of green loop
			}// End of red loop
			
			// Rest is random
			for(rcnt=0; rcnt<rndnum; rcnt++){
				palette.push({'r':Math.floor(Math.random()*255),'g':Math.floor(Math.random()*255),'b':Math.floor(Math.random()*255),'a':Math.floor(Math.random()*255)});
			}

		}// End of numberofcolors check
		
		return palette;
	},// End of generatepalette()
		
	// 2. Layer separation and edge detection
	// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
	// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
	// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
	//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
	this.layering = function(ii){
		// Creating layers for each indexed color in arr
		var layers = [], val=0, ah = ii.array.length, aw = ii.array[0].length, n1,n2,n3,n4,n5,n6,n7,n8, i, j, k;
		
		// Create new layer if there's no one with this indexed color
		for(k=0; k<ii.palette.length; k++){
			layers[k] = [];
			for(j=0; j<ah; j++){
				layers[k][j] = [];
				for(i=0; i<aw; i++){
					layers[k][j][i]=0;
				}
			}
		}
		
		// Looping through all pixels and calculating edge node type
		for(j=1; j<ah-1; j++){
			for(i=1; i<aw-1; i++){
				
				// This pixel's indexed color
				val = ii.array[j][i];
				
				// Are neighbor pixel colors the same?
				n1 = ii.array[j-1][i-1]===val ? 1 : 0;
				n2 = ii.array[j-1][i  ]===val ? 1 : 0;
				n3 = ii.array[j-1][i+1]===val ? 1 : 0;
				n4 = ii.array[j  ][i-1]===val ? 1 : 0;
				n5 = ii.array[j  ][i+1]===val ? 1 : 0;
				n6 = ii.array[j+1][i-1]===val ? 1 : 0;
				n7 = ii.array[j+1][i  ]===val ? 1 : 0;
				n8 = ii.array[j+1][i+1]===val ? 1 : 0;
				
				// this pixel's type and looking back on previous pixels
				layers[val][j+1][i+1] = 1 + n5 * 2 + n8 * 4 + n7 * 8 ;
				if(!n4){ layers[val][j+1][i  ] = 0 + 2 + n7 * 4 + n6 * 8 ; }
				if(!n2){ layers[val][j  ][i+1] = 0 + n3*2 + n5 * 4 + 8 ; }
				if(!n1){ layers[val][j  ][i  ] = 0 + n2*2 + 4 + n4 * 8 ; }
				
			}// End of i loop
		}// End of j loop
			
		return layers;
	},// End of layering()
	
	// Lookup tables for pathscan
	this.pathscan_dir_lookup = [0,0,3,0, 1,0,3,0, 0,3,3,1, 0,3,0,0], 
	this.pathscan_holepath_lookup = [false,false,false,false, false,false,false,true, false,false,false,true, false,true,true,false ],
	// pathscan_combined_lookup[ arr[py][px] ][ dir ] = [nextarrpypx, nextdir, deltapx, deltapy];
	this.pathscan_combined_lookup = [
		[[-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1]],// arr[py][px]===0 is invalid
		[[ 0, 1, 0,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 2,-1, 0]],
		[[-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 1, 0,-1], [ 0, 0, 1, 0]],
		[[ 0, 0, 1, 0], [-1,-1,-1,-1], [ 0, 2,-1, 0], [-1,-1,-1,-1]],
		
		[[-1,-1,-1,-1], [ 0, 0, 1, 0], [ 0, 3, 0, 1], [-1,-1,-1,-1]],
		[[13, 3, 0, 1], [13, 2,-1, 0], [ 7, 1, 0,-1], [ 7, 0, 1, 0]],
		[[-1,-1,-1,-1], [ 0, 1, 0,-1], [-1,-1,-1,-1], [ 0, 3, 0, 1]],
		[[ 0, 3, 0, 1], [ 0, 2,-1, 0], [-1,-1,-1,-1], [-1,-1,-1,-1]],
		
		[[ 0, 3, 0, 1], [ 0, 2,-1, 0], [-1,-1,-1,-1], [-1,-1,-1,-1]],
		[[-1,-1,-1,-1], [ 0, 1, 0,-1], [-1,-1,-1,-1], [ 0, 3, 0, 1]],
		[[11, 1, 0,-1], [14, 0, 1, 0], [14, 3, 0, 1], [11, 2,-1, 0]],
		[[-1,-1,-1,-1], [ 0, 0, 1, 0], [ 0, 3, 0, 1], [-1,-1,-1,-1]],
		
		[[ 0, 0, 1, 0], [-1,-1,-1,-1], [ 0, 2,-1, 0], [-1,-1,-1,-1]],
		[[-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 1, 0,-1], [ 0, 0, 1, 0]],
		[[ 0, 1, 0,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 2,-1, 0]],
		[[-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1]]// arr[py][px]===15 is invalid
	],

	// 3. Walking through an edge node array, discarding edge node types 0 and 15 and creating paths from the rest.
	// Walk directions (dir): 0 > ; 1 ^ ; 2 < ; 3 v  
	this.pathscan = function(arr, pathomit){
		pathomit=pathomit||8;
		var paths=[],pacnt=0,pcnt=0,px=0,py=0,w=arr[0].length,h=arr.length,
		dir=0,pathfinished=true,holepath=false,lookuprow;
		
		for(var j=0;j<h;j++){
			for(var i=0;i<w;i++){
				if((arr[j][i]!==0)&&(arr[j][i]!==15)){
					
					// Init
					px = i; py = j;
					paths[pacnt] = [];
					pathfinished = false;
					pcnt=0;
					
					// fill paths will be drawn, but hole paths are also required to remove unnecessary edge nodes
					dir = _this.pathscan_dir_lookup[ arr[py][px] ]; holepath = _this.pathscan_holepath_lookup[ arr[py][px] ];

					// Path points loop
					while(!pathfinished){
						
						// New path point
						paths[pacnt][pcnt] = {};
						paths[pacnt][pcnt].x = px-1;
						paths[pacnt][pcnt].y = py-1;
						paths[pacnt][pcnt].t = arr[py][px];
						
						// Next: look up the replacement, direction and coordinate changes = clear this cell, turn if required, walk forward
						lookuprow = _this.pathscan_combined_lookup[ arr[py][px] ][ dir ];
						arr[py][px] = lookuprow[0]; dir = lookuprow[1]; px += lookuprow[2]; py += lookuprow[3];

						// Close path
						if( (px-1 === paths[pacnt][0].x ) && ( py-1 === paths[pacnt][0].y ) ){ 
							pathfinished = true;
							// Discarding 'hole' type paths and paths shorter than pathomit
							if( holepath || (paths[pacnt].length < pathomit) ){
								paths.pop();
							}else{
								pacnt++;
							}
						}
						
						pcnt++;
						
					}// End of Path points loop
					
				}// End of Follow path
				
			}// End of i loop
		}// End of j loop
		
		return paths;
	},// End of pathscan()

	// 3. Batch pathscan
	this.batchpathscan = function(layers,pathomit){
		var bpaths = [];
		for(var k in layers){
			if(!layers.hasOwnProperty(k)){ continue; }
			bpaths[k] = _this.pathscan(layers[k],pathomit);
		}
		return bpaths;
	},
	
	// 4. interpollating between path points for nodes with 8 directions ( East, SouthEast, S, SW, W, NW, N, NE )
	this.internodes = function(paths){
		var ins = [], palen=0,nextidx=0,nextidx2=0, nx=0, ny=0, pacnt, pcnt;
		// paths loop
		for(pacnt=0; pacnt<paths.length; pacnt++){
			ins[pacnt]=[];
			palen = paths[pacnt].length;
			// pathpoints loop
			for(pcnt=0; pcnt<palen; pcnt++){
			
				// interpolate between two path points
				nextidx = (pcnt+1)%palen; nextidx2 = (pcnt+2)%palen;
				ins[pacnt][pcnt]={};
				ins[pacnt][pcnt].x = (paths[pacnt][pcnt].x+paths[pacnt][nextidx].x) /2;
				ins[pacnt][pcnt].y = (paths[pacnt][pcnt].y+paths[pacnt][nextidx].y) /2;
				nx = (paths[pacnt][nextidx].x+paths[pacnt][nextidx2].x) /2;
				ny = (paths[pacnt][nextidx].y+paths[pacnt][nextidx2].y) /2;
				
				// line segment direction to the next point
				if(ins[pacnt][pcnt].x < nx){ 
					if     (ins[pacnt][pcnt].y < ny){ ins[pacnt][pcnt].linesegment = 1; }// SouthEast
					else if(ins[pacnt][pcnt].y > ny){ ins[pacnt][pcnt].linesegment = 7; }// NE
					else                            { ins[pacnt][pcnt].linesegment = 0; }// E
				}else if(ins[pacnt][pcnt].x > nx){
					if     (ins[pacnt][pcnt].y < ny){ ins[pacnt][pcnt].linesegment = 3; }// SW
					else if(ins[pacnt][pcnt].y > ny){ ins[pacnt][pcnt].linesegment = 5; }// NW
					else                            { ins[pacnt][pcnt].linesegment = 4; }// W
				}else{
					if     (ins[pacnt][pcnt].y < ny){ ins[pacnt][pcnt].linesegment = 2; }// S
					else if(ins[pacnt][pcnt].y > ny){ ins[pacnt][pcnt].linesegment = 6; }// N
					else                            { ins[pacnt][pcnt].linesegment = 8; }// center, this should not happen
				}
				
			}// End of pathpoints loop 
						
		}// End of paths loop
		
		return ins;
	},// End of internodes()
	
	// 4. Batch interpollation
	this.batchinternodes = function(bpaths){
		var binternodes = [];
		for (var k in bpaths) {
			if(!bpaths.hasOwnProperty(k)){ continue; }
			binternodes[k] = _this.internodes(bpaths[k]);
		}
		return binternodes;
	},
	
	// 5. tracepath() : recursively trying to fit straight and quadratic spline segments on the 8 direction internode path
	
	// 5.1. Find sequences of points with only 2 segment types
	// 5.2. Fit a straight line on the sequence
	// 5.3. If the straight line fails (an error>ltreshold), find the point with the biggest error
	// 5.4. Fit a quadratic spline through errorpoint (project this to get controlpoint), then measure errors on every point in the sequence
	// 5.5. If the spline fails (an error>qtreshold), find the point with the biggest error, set splitpoint = (fitting point + errorpoint)/2
	// 5.6. Split sequence and recursively apply 5.2. - 5.7. to startpoint-splitpoint and splitpoint-endpoint sequences
	// 5.7. TODO? If splitpoint-endpoint is a spline, try to add new points from the next sequence
	
	this.tracepath = function(path,ltreshold,qtreshold){
		var pcnt=0,segtype1,segtype2,seqend,smp=[];
		while(pcnt<path.length){
			// 5.1. Find sequences of points with only 2 segment types
			segtype1 = path[pcnt].linesegment; segtype2 = -1; seqend=pcnt+1;
			while(
				((path[seqend].linesegment===segtype1) || (path[seqend].linesegment===segtype2) || (segtype2===-1)) 
				&& (seqend<path.length-1)
				){
					if((path[seqend].linesegment!==segtype1) && (segtype2===-1)){ segtype2 = path[seqend].linesegment; }
					seqend++;
			}
			if(seqend===path.length-1){ seqend = 0; }

			// 5.2. - 5.6. Split sequence and recursively apply 5.2. - 5.6. to startpoint-splitpoint and splitpoint-endpoint sequences
			smp = smp.concat(_this.fitseq(path,ltreshold,qtreshold,pcnt,seqend));
			// 5.7. TODO? If splitpoint-endpoint is a spline, try to add new points from the next sequence
			
			// forward pcnt;
			if(seqend>0){ pcnt = seqend; }else{ pcnt = path.length; }
			
		}// End of pcnt loop
		
		return smp;
	},// End of tracepath()
		
	// 5.2. - 5.6. recursively fitting a straight or quadratic line segment on this sequence of path nodes, 
	// called from tracepath()
	this.fitseq = function(path,ltreshold,qtreshold,seqstart,seqend){
		// return if invalid seqend
		if((seqend>path.length)||(seqend<0)){return [];}
		// variables
		var errorpoint=seqstart, errorval=0, curvepass=true, px, py, dist2;
		var tl = (seqend-seqstart); if(tl<0){ tl += path.length; }
		var vx = (path[seqend].x-path[seqstart].x) / tl,
			vy = (path[seqend].y-path[seqstart].y) / tl;
		
		// 5.2. Fit a straight line on the sequence
		var pcnt = (seqstart+1)%path.length, pl;
		while(pcnt != seqend){
			pl = pcnt-seqstart; if(pl<0){ pl += path.length; }
			px = path[seqstart].x + vx * pl; py = path[seqstart].y + vy * pl;
			dist2 = (path[pcnt].x-px)*(path[pcnt].x-px) + (path[pcnt].y-py)*(path[pcnt].y-py);
			if(dist2>ltreshold){curvepass=false;}
			if(dist2>errorval){ errorpoint=pcnt; errorval=dist2; }
			pcnt = (pcnt+1)%path.length;
		}
		// return straight line if fits
		if(curvepass){ return [{'type':'L', 'x1':path[seqstart].x,'y1':path[seqstart].y, 'x2':path[seqend].x,'y2':path[seqend].y}]; }
		
		// 5.3. If the straight line fails (an error>ltreshold), find the point with the biggest error
		var fitpoint = errorpoint; curvepass = true; errorval = 0;
		
		// 5.4. Fit a quadratic spline through this point, measure errors on every point in the sequence
		// helpers and projecting to get control point
		var t=(fitpoint-seqstart)/tl, t1=(1-t)*(1-t), t2=2*(1-t)*t, t3=t*t;
		var cpx = (t1*path[seqstart].x + t3*path[seqend].x - path[fitpoint].x)/-t2 ,
			cpy = (t1*path[seqstart].y + t3*path[seqend].y - path[fitpoint].y)/-t2 ;
		
		// Check every point
		pcnt = seqstart+1;
		while(pcnt != seqend){
			t=(pcnt-seqstart)/tl; t1=(1-t)*(1-t); t2=2*(1-t)*t; t3=t*t;
			px = t1 * path[seqstart].x + t2 * cpx + t3 * path[seqend].x; 
			py = t1 * path[seqstart].y + t2 * cpy + t3 * path[seqend].y;
			
			dist2 = (path[pcnt].x-px)*(path[pcnt].x-px) + (path[pcnt].y-py)*(path[pcnt].y-py);
			
			if(dist2>qtreshold){curvepass=false;}
			if(dist2>errorval){ errorpoint=pcnt; errorval=dist2; }
			pcnt = (pcnt+1)%path.length;
		}
		// return spline if fits
		if(curvepass){ return [{'type':'Q', 'x1':path[seqstart].x,'y1':path[seqstart].y, 'x2':cpx,'y2':cpy, 'x3':path[seqend].x,'y3':path[seqend].y}]; }
		// 5.5. If the spline fails (an error>qtreshold), find the point with the biggest error
		// set splitpoint = (fitting point + errorpoint)/2
		var splitpoint = Math.floor((fitpoint + errorpoint)/2);
		
		// 5.6. Split sequence and recursively apply 5.2. - 5.6. to startpoint-splitpoint and splitpoint-endpoint sequences
		var sm = _this.fitseq(path,ltreshold,qtreshold,seqstart,splitpoint);
		sm = sm.concat(_this.fitseq(path,ltreshold,qtreshold,splitpoint,seqend));
		return sm;
		
	},// End of fitseq()
	
	// 5. Batch tracing paths
	this.batchtracepaths = function(internodepaths,ltres,qtres){
		var btracedpaths = []; 
		for(var k in internodepaths){
			if(!internodepaths.hasOwnProperty(k)){ continue; }
			btracedpaths.push( _this.tracepath(internodepaths[k],ltres,qtres) ); 
		}
		return btracedpaths;
	},
	
	// 5. Batch tracing layers
	this.batchtracelayers = function(binternodes,ltres,qtres){
		var btbis = [];
		for(var k in binternodes){
			if(!binternodes.hasOwnProperty(k)){ continue; }
			btbis[k] = _this.batchtracepaths(binternodes[k],ltres,qtres);
		}
		return btbis;
	},
	
	////////////////////////////////////////////////////////////
	//
	//  SVG Drawing functions
	//
	////////////////////////////////////////////////////////////
	
	// Rounding to given decimals https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript
	this.roundtodec = function(val,places){ return +val.toFixed(places); },
	
	// Getting SVG path element string from a traced path
	this.svgpathstring = function(desc,segments,colorstr,options){
		
		var str='', pcnt;
		
			if( options.roundcoords === -1 ){
				str = '<path '+desc+colorstr+'d="';
				str += 'M '+ segments[0].x1 * options.scale +' '+ segments[0].y1 * options.scale +' ';
				for(pcnt=0; pcnt<segments.length; pcnt++){
					str += segments[pcnt].type +' '+ segments[pcnt].x2 * options.scale +' '+ segments[pcnt].y2 * options.scale +' ';
					if(segments[pcnt].hasOwnProperty('x3')){
						str += segments[pcnt].x3 * options.scale +' '+ segments[pcnt].y3 * options.scale +' ';
					}
				}
				str += 'Z" />';
			}else{
				str = '<path '+desc+colorstr+'d="';
				str += 'M '+ _this.roundtodec( segments[0].x1 * options.scale, options.roundcoords ) +' '+ _this.roundtodec( segments[0].y1 * options.scale, options.roundcoords ) +' ';
				for(pcnt=0; pcnt<segments.length; pcnt++){
					str += segments[pcnt].type +' '+ _this.roundtodec( segments[pcnt].x2 * options.scale, options.roundcoords ) +' '+ _this.roundtodec( segments[pcnt].y2 * options.scale, options.roundcoords ) +' ';
					if(segments[pcnt].hasOwnProperty('x3')){
						str += _this.roundtodec( segments[pcnt].x3 * options.scale, options.roundcoords ) +' '+ _this.roundtodec( segments[pcnt].y3 * options.scale, options.roundcoords ) +' ';
					}
				}
				str += 'Z" />';
			}
			
			// Rendering control points
			for(pcnt=0; pcnt<segments.length; pcnt++){
				if( segments[pcnt].hasOwnProperty('x3') && options.qcpr ){ 
					str += '<circle cx="'+ segments[pcnt].x2 * options.scale +'" cy="'+ segments[pcnt].y2 * options.scale +'" r="'+ options.qcpr +'" fill="cyan" stroke-width="'+ options.qcpr * 0.2 +'" stroke="black" />';
					str += '<circle cx="'+ segments[pcnt].x3 * options.scale +'" cy="'+ segments[pcnt].y3 * options.scale +'" r="'+ options.qcpr +'" fill="white" stroke-width="'+ options.qcpr * 0.2 +'" stroke="black" />';
					str += '<line x1="'+ segments[pcnt].x1 * options.scale +'" y1="'+ segments[pcnt].y1 * options.scale +'" x2="'+ segments[pcnt].x2 * options.scale +'" y2="'+ segments[pcnt].y2 * options.scale +'" stroke-width="'+ options.qcpr * 0.2 +'" stroke="cyan" />';
					str += '<line x1="'+ segments[pcnt].x2 * options.scale +'" y1="'+ segments[pcnt].y2 * options.scale +'" x2="'+ segments[pcnt].x3 * options.scale +'" y2="'+ segments[pcnt].y3 * options.scale +'" stroke-width="'+ options.qcpr * 0.2 +'" stroke="cyan" />';
				}
				if( (!segments[pcnt].hasOwnProperty('x3')) && options.lcpr){
					str += '<circle cx="'+ segments[pcnt].x2 * options.scale +'" cy="'+ segments[pcnt].y2 * options.scale +'" r="'+ options.lcpr +'" fill="white" stroke-width="'+ options.lcpr * 0.2 +'" stroke="black" />';
				}
			}
			
		return str;
		
	},// End of svgpathstring()
	
	// Converting tracedata to an SVG string, paths are drawn according to a Z-index 
	// the optional lcpr and qcpr are linear and quadratic control point radiuses 
	this.getsvgstring = function(tracedata,options){
		
		options = _this.checkoptions(options);
		
		var w = tracedata.width * options.scale, h = tracedata.height * options.scale;
		var k, pcnt, thisdesc, viewboxorviewport = options.viewbox ? 'viewBox="0 0 '+w+' '+h+'" ' : 'width="'+w+'" height="'+h+'" ';
		
		// SVG start
		var svgstr = '<svg '+viewboxorviewport+'version="1.1" xmlns="http://www.w3.org/2000/svg" '; 
		if(options.desc){ svgstr+= 'desc="Created with imagetracer.js version '+_this.versionnumber+'" '; }
		svgstr += '>';
		
		// creating Z-index
		var zindex = [], label;
		// Layer loop
		for(k in tracedata.layers) {
			if(!tracedata.layers.hasOwnProperty(k)){ continue; }
			// Path loop
			for(pcnt=0; pcnt < tracedata.layers[k].length; pcnt++){
				// Label (Z-index key) is the startpoint of the path, linearized
				label = tracedata.layers[k][pcnt][0].y1*w+tracedata.layers[k][pcnt][0].x1;
				zindex[label] = {'l':''+k,'p':''+pcnt};
			}// End of path loop
		}// End of layer loop
		
		// Sorting Z-index
		var zindexkeys = Object.keys(zindex), l, p;
		zindexkeys.sort(_this.compareNumbers);
		
		// Drawing, Z-index loop
		for(k=0; k<zindexkeys.length; k++){
			
			l = zindex[zindexkeys[k]].l; p = zindex[zindexkeys[k]].p;
			if(options.desc){ thisdesc = 'desc="l '+l+' p '+p+'" '; }else{ thisdesc = ''; }
			
			// Adding SVG <path> string, desc contains layer and path number
			svgstr += _this.svgpathstring(
					thisdesc,
					tracedata.layers[l][p],
					_this.tosvgcolorstr(tracedata.palette[l]),
					options);
					
		}// End of Z-index loop
		
		// SVG End
		svgstr+='</svg>';
		
		return svgstr;
		
	},// End of getsvgstring()
	
	// Comparator for numeric Array.sort
	this.compareNumbers = function(a,b){ return a - b; },
	
	// Convert color object to rgba string
	this.torgbastr = function(c){ return 'rgba('+c.r+','+c.g+','+c.b+','+c.a+')'; },
	
	// Convert color object to SVG color string
	this.tosvgcolorstr = function(c){ 
		return 'fill="rgb('+c.r+','+c.g+','+c.b+')" stroke="rgb('+c.r+','+c.g+','+c.b+')" stroke-width="1" opacity="'+c.a/255.0+'" ';
	},
	
	// Helper function: Appending an <svg> element to a container from an svgstring
	this.appendSVGString = function(svgstr,parentid){
		var div;
		if(parentid){
			div = document.getElementById(parentid);
			if(!div){
				div = document.createElement('div');
				div.id = parentid;
				document.body.appendChild(div);
			}
		}else{
			div = document.createElement('div');
			document.body.appendChild(div);
		}
		div.innerHTML += svgstr;
	},
	
	////////////////////////////////////////////////////////////
	//
	//  Canvas functions
	//
	////////////////////////////////////////////////////////////
	
	// Gaussian kernels for blur
	this.gks = [ [0.27901,0.44198,0.27901], [0.135336,0.228569,0.272192,0.228569,0.135336], [0.086776,0.136394,0.178908,0.195843,0.178908,0.136394,0.086776],
	             [0.063327,0.093095,0.122589,0.144599,0.152781,0.144599,0.122589,0.093095,0.063327], [0.049692,0.069304,0.089767,0.107988,0.120651,0.125194,0.120651,0.107988,0.089767,0.069304,0.049692] ],
	
	// Selective Gaussian blur for preprocessing
	this.blur = function(imgd,radius,delta){
		var i,j,k,d,idx,racc,gacc,bacc,aacc,wacc;
		
		// new ImageData
		var canvas = document.createElement('canvas');
		canvas.width = imgd.width;
		canvas.height = imgd.height;
		var context = canvas.getContext('2d');
		var imgd2 = context.createImageData(imgd);
		
		// radius and delta limits, this kernel
		radius = Math.floor(radius); if(radius<1){ return imgd; } if(radius>5){ radius = 5; } delta = Math.abs( delta ); if(delta>1024){ delta = 1024; }
		var thisgk = _this.gks[radius-1];
		
		// loop through all pixels, horizontal blur
		for( j=0; j < imgd.height; j++ ){
			for( i=0; i < imgd.width; i++ ){

				racc = 0; gacc = 0; bacc = 0; aacc = 0; wacc = 0;
				// gauss kernel loop
				for( k = -radius; k < radius+1; k++){
					// add weighted color values
					if( (i+k > 0) && (i+k < imgd.width) ){
						idx = (j*imgd.width+i+k)*4;
						racc += imgd.data[idx  ] * thisgk[k+radius];
						gacc += imgd.data[idx+1] * thisgk[k+radius];
						bacc += imgd.data[idx+2] * thisgk[k+radius];
						aacc += imgd.data[idx+3] * thisgk[k+radius];
						wacc += thisgk[k+radius];
					}
				}
				// The new pixel
				idx = (j*imgd.width+i)*4;
				imgd2.data[idx  ] = Math.floor(racc / wacc);
				imgd2.data[idx+1] = Math.floor(gacc / wacc);
				imgd2.data[idx+2] = Math.floor(bacc / wacc);
				imgd2.data[idx+3] = Math.floor(aacc / wacc);
				
			}// End of width loop 
		}// End of horizontal blur
		
		// copying the half blurred imgd2
		var himgd = new Uint8ClampedArray(imgd2.data);
		
		// loop through all pixels, vertical blur
		for( j=0; j < imgd.height; j++ ){
			for( i=0; i < imgd.width; i++ ){

				racc = 0; gacc = 0; bacc = 0; aacc = 0; wacc = 0;
				// gauss kernel loop
				for( k = -radius; k < radius+1; k++){
					// add weighted color values
					if( (j+k > 0) && (j+k < imgd.height) ){
						idx = ((j+k)*imgd.width+i)*4;
						racc += himgd[idx  ] * thisgk[k+radius];
						gacc += himgd[idx+1] * thisgk[k+radius];
						bacc += himgd[idx+2] * thisgk[k+radius];
						aacc += himgd[idx+3] * thisgk[k+radius];
						wacc += thisgk[k+radius];
					}
				}
				// The new pixel
				idx = (j*imgd.width+i)*4;
				imgd2.data[idx  ] = Math.floor(racc / wacc);
				imgd2.data[idx+1] = Math.floor(gacc / wacc);
				imgd2.data[idx+2] = Math.floor(bacc / wacc);
				imgd2.data[idx+3] = Math.floor(aacc / wacc);
				
			}// End of width loop
		}// End of vertical blur
		
		// Selective blur: loop through all pixels
		for( j=0; j < imgd.height; j++ ){
			for( i=0; i < imgd.width; i++ ){
				
				idx = (j*imgd.width+i)*4;
				// d is the difference between the blurred and the original pixel
				d = Math.abs(imgd2.data[idx  ] - imgd.data[idx  ]) + Math.abs(imgd2.data[idx+1] - imgd.data[idx+1]) +
					Math.abs(imgd2.data[idx+2] - imgd.data[idx+2]) + Math.abs(imgd2.data[idx+3] - imgd.data[idx+3]);
				// selective blur: if d>delta, put the original pixel back
				if(d>delta){
					imgd2.data[idx  ] = imgd.data[idx  ];
					imgd2.data[idx+1] = imgd.data[idx+1];
					imgd2.data[idx+2] = imgd.data[idx+2];
					imgd2.data[idx+3] = imgd.data[idx+3];
				}
			}
		}// End of Selective blur
		
		return imgd2;
		
	},// End of blur()
	
	// Helper function: loading an image from a URL, then executing callback with canvas as argument
	this.loadImage = function(url,callback){
		var img = new Image();
		img.src = url;
		img.onload = function(){
			var canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			var context = canvas.getContext('2d');
			context.drawImage(img,0,0);
			callback(canvas);
		};
	},
	
	// Helper function: getting ImageData from a canvas
	this.getImgdata = function(canvas){
		var context = canvas.getContext('2d');
		return context.getImageData(0,0,canvas.width,canvas.height);
	},
	
	// Special palette to use with drawlayers()
	this.specpalette = [ 
		{r:0,g:0,b:0,a:255}, {r:128,g:128,b:128,a:255}, {r:0,g:0,b:128,a:255}, {r:64,g:64,b:128,a:255},
		{r:192,g:192,b:192,a:255}, {r:255,g:255,b:255,a:255}, {r:128,g:128,b:192,a:255}, {r:0,g:0,b:192,a:255},
		{r:128,g:0,b:0,a:255}, {r:128,g:64,b:64,a:255}, {r:128,g:0,b:128,a:255}, {r:168,g:168,b:168,a:255},
		{r:192,g:128,b:128,a:255}, {r:192,g:0,b:0,a:255}, {r:255,g:255,b:255,a:255}, {r:0,g:128,b:0,a:255} 
	],
	
	// Helper function: Drawing all edge node layers into a container
	this.drawLayers = function(layers,palette,scale,parentid){
		scale = scale||1;
		var w,h,i,j,k;
		
		// Preparing container
		var div;
		if(parentid){
			div = document.getElementById(parentid);
			if(!div){
				div = document.createElement('div');
				div.id = parentid;
				document.body.appendChild(div);
			}
		}else{
			div = document.createElement('div');
			document.body.appendChild(div);
		}
		
		// Layers loop
		for (k in layers) {
			if(!layers.hasOwnProperty(k)){ continue; }
			
			// width, height
			w=layers[k][0].length; h=layers[k].length;
			
			// Creating new canvas for every layer 
			var canvas = document.createElement('canvas'); canvas.width=w*scale; canvas.height=h*scale; 
			var context = canvas.getContext('2d');
			
			// Drawing
			for(j=0; j<h; j++){
				for(i=0; i<w; i++){
					context.fillStyle = _this.torgbastr(palette[ layers[k][j][i]%palette.length ]);
					context.fillRect(i*scale,j*scale,scale,scale); 
				}
			}
			
			// Appending canvas to container
			div.appendChild(canvas);
		}// End of Layers loop
	}// End of drawlayers
	
	;// End of function list
	
}// End of ImageTracer object

// export as AMD module / Node module / browser or worker variable // TODO: new ?
if (typeof define === 'function' && define.amd) define(function() { return new ImageTracer(); });
else if (typeof module !== 'undefined') module.exports = new ImageTracer();
else if (typeof self !== 'undefined') self.ImageTracer = new ImageTracer();
else window.ImageTracer = new ImageTracer();

})();