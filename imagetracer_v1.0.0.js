/*
	imagetracer.js
	Simple raster image tracer and vectorizer written in JavaScript.  
	by András Jankovics 2015
	jankovicsandras@gmail.com
	
	Tips:
	 - ltres,qtres : lower linear (ltres) and quadratic spline (qtres) error tresholds result 
	   more details at the cost of longer paths (more segments). Usually 0.5 or 1 is good for both. When tracing
	   round shapes, lower ltres, e.g. ltres=0.2 qtres=1 will result more curves, thus maybe better quality. Similarly,
	   ltres=1 qtres=0 is better for polygonal shapes. Values greater than 2 will usually result inaccurate paths.
	 - pathomit : the length of the shortest path is 4, four corners around one pixel. The default pathomit=8 filters out
	   isolated one and two pixels for noise reduction. This can be deactivated by setting pathomit=0.
	 - pal,numberofcolors : custom palette in the format pal=[ {'r':0,'g':0,'b':0,'a':255}, ... ]; or automatic palette 
	   with the given length. Many colors will result many layers, so longer processing time and more paths, but better 
	   quality. When using few colors, more colorquantcycles can improve quality.
	 - mincolorratio : minimum ratio of pixels, below this the color will be randomized. mincolorratio=0.02 for a 10*10 image
	   means that if a color has less than 10*10 * 0.02 = 2 pixels, it will be randomized.
	 - colorquantcycles : color quantization will be repeated this many times. When using many colors, this can be a lower value.
	 - scale : optionally, the SVG output can be scaled, scale=2 means the SVG will have double height and width
	
	
	Process overview
	----------------
	
	// 1. Color quantization
	// Input: imgd is canvas.context.imagedata
	// pal = [{'r':0,'g':0,'b':0,'a':255}, ... ]; is an optional custom palette, can be null, 
	// default 16 color palette will be used when both pal and numberofcolors is null.
	// numberofcolors is an optional integer to generate a custom length palette, can be null.
	// minratio is an optional float, when a color is used less than this ratio, 
	// it will be randomly regenerated, default 0.02 .
	// cycles is an optional integer to repeat the k-means clustering step, default is 3 .
	
	var cq = colorquantization(imgd,pal,numberofcolors,minratio,cycles);
	
	// Result: cq = {'array': array_with_color_indexes, 'palette':palette, 'background': color_number_of_first_pixel };
	
	// ----------------------
	
	// 2. Layer separation and edge detection
	// Input: cq.array (array[x][y] is this pixel's color) 
	
	var ls = layering(cq.array);
	
	// Result: ls[color][x][y] is one of the 16 tiles (or edge node types)
	
	// Edge node types ( ▓:light or 1; ░:dark or 0 )
	// ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
	// ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
	// 0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
	
	// ----------------------
	
	// 3. Batch pathscan
	// Input: ls (layers), optionally pathomit: paths shorter than this will be discarded, used for noise reduction
	
	var bps = batchpathscan(ls,pathomit); // -> calling pathscan() on every layer, which "walks" on the edge nodes to create paths
	// Walk directions (dir): 0 > ; 1 ^ ; 2 < ; 3 v  
	
	
	// pathscan() Result: paths[path][point] = {'x': x_coordinate, 'y': y_coordinate, 't': edge_node_type };
	// batchpathscan() Result : bps[layer][path][point] = {'x': x_coordinate, 'y': y_coordinate, 't': edge_node_type };
	
	// ----------------------
	
	// 4. Batch interpollation
	// Input: bps is batchpathscan() Result
	
	var bis = batchinternodes(bps); // -> calling internodes() on every layer, which interpollates coordinates between path points
	
	// internodes() Result: ins[path][point]={'x': x_coordinate, 'y': y_coordinate, linesegment: one_of_the_8_directions_E_SE_S_SW_W_NW_N_NE }
	// batchinternodes() Result: bis[layer][path][point]={}
	
	// ----------------------
	
	// 5. Batch tracing
	// Input: bis is batchinternodes() Result
	
	var tracedata = batchtracelayers(bis,ltres,qtres);// -> calling batchtracepaths() on every layer 
	//  -> calling tracepath() on every path -> calling fitseq() on every node sequence
	
	// tracepath() Result: 
	//	tracedpath = {
	//		'segments':[
	//			{'type':'Q', 'x1': ,'y1': , 'x2': ,'y2': , 'x3': ,'y3': }, 
	//			{'type':'L', 'x1': ,'y1': , 'x2': ,'y2': },
	//			...
	//		],
	//		'type': original_path.type
	//	}
	// batchtracepaths() Result: btps = [ tracedpath1, tracedpath2, ... ] is an array of every traced path on this layer 
	// batchtracelayers() Result: tracedata = [ btps1, btps2, ... ] is an array of every traced path on every layer
	
	// ----------------------
	
	// 6. Get SVG string
	// Input: tracedata is the object returned from 5. Batch tracing
	var svgstring = getsvgstring( 
				imgd.width*options.scale, imgd.height*options.scale, 
				td.layers, td.palette, td.background, 
				options.scale, options.lcpr, options.qcpr);
	//  -> calling svgpathstring() on every path on every layer
	
	// ----------------------
	
*/

/*

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

For more information, please refer to <http://unlicense.org/>

*/


function ImageTracer(){
	var _this = this;

	////////////////////////////////////////////////////////////
	//
	//  User friendly functions
	//
	////////////////////////////////////////////////////////////
	
	// Loading an image from a URL, tracing when loaded,
	// then executing callback with the scaled svg string as argument
	this.imageToSVG=function(url,callback,options){
		options = options || {}; _this.checkoptions(options);
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
	this.imagedataToSVG=function(imgd,options){
		options = options || {}; _this.checkoptions(options);
		// tracing imagedata
		var td = _this.imagedataToTracedata(imgd,options);
		// returning SVG string
		return _this.getsvgstring( 
				imgd.width*options.scale, imgd.height*options.scale, 
				td.layers, td.palette, td.background, 
				options.scale, options.lcpr, options.qcpr);
	
	},// End of imagedataToSVG()
	
	// Loading an image from a URL, tracing when loaded,
	// then executing callback with tracedata as argument
	this.imageToTracedata=function(url,callback,options){
		options = options || {}; _this.checkoptions(options);
		// loading image, tracing and callback
		_this.loadImage(url,
				function(canvas){
					callback(
						_this.imagedataToTracedata(_this.getImgdata(canvas),options)
					);
				}
		);	
	},// End of imageToTracedata()
	
	// Tracing imagedata, then returning tracedata 
	// (layers with paths, palette, background color number)
	this.imagedataToTracedata=function(imgd,options){
		options = options || {}; _this.checkoptions(options);
		
		// 1. Color quantization 
		var cq = _this.colorquantization(imgd,options.pal,options.numberofcolors,options.mincolorratio,options.colorquantcycles);
		
		// 2. Layer separation and edge detection
		var ls = _this.layering(cq.array);
		
		// Optional visualization
		if(options.layercontainerid){
			_this.drawLayers(ls,_this.generatepalette(16),4,options.layercontainerid);
		}
		
		// 3. Batch pathscan
		var bps = _this.batchpathscan(ls,options.pathomit);
		
		// 4. Batch interpollation
		var bis = _this.batchinternodes(bps);
		
		// 5. Batch tracing
		return {
			'layers':_this.batchtracelayers(bis,options.ltres,options.qtres),
			'palette':cq.palette,
			'background':cq.background
		};
		
	},// End of imagedataToTracedata()
	
	// creating options object, setting defaults for missing values
	this.checkoptions=function(options){
		options = options || {};
		// Defaults for optional parameters
		// Tracing
		options.ltres = options.ltres || 1;
		options.qtres = options.qtres || 1;
		options.pathomit = options.pathomit || 8;
		// Color quantization
		options.numberofcolors = options.numberofcolors || 16;
		options.mincolorratio = options.mincolorratio || 0.02;
		options.colorquantcycles = options.colorquantcycles || 3;
		// options.pal is not defined here
		// SVG rendering
		options.scale = options.scale || 1;
		options.lcpr = options.lcpr || 0;
		options.qcpr = options.qcpr || 0;
		// options.layercontainerid is not defined here
		
	},// End of checkoptions()
	
	////////////////////////////////////////////////////////////
	//
	//  Vectorizing functions
	//
	////////////////////////////////////////////////////////////
	
	// 1. Color quantization
	// Using a form of k-means clustering repeatead 'cycles' times. http://en.wikipedia.org/wiki/Color_quantization
	this.colorquantization=function(imgd,pal,numberofcolors,minratio,cycles){
		var arr = [], idx=0, cd,cdl,ci,c1,c2,c3, paletteacc = [];
		cycles=cycles||3; minratio=minratio||0.2; numberofcolors=numberofcolors||16;
		
		// Use custom palette if pal is defined or generate custom length palette
		var palette = pal || _this.generatepalette(numberofcolors);
		
		// Repeat clustering step 'cycles' times
		for(var cnt=0;cnt<cycles;cnt++){
			
			// Reseting palette accumulator for averaging
			for(var i=0;i<palette.length;i++){paletteacc[i]={};paletteacc[i].r=0;paletteacc[i].g=0;paletteacc[i].b=0;paletteacc[i].n=0;}
			
			// loop through all pixels
			for(var j=0;j<imgd.height;j++){
				arr[j]=[];
				for(var i=0;i<imgd.width;i++){
					
					idx = (j*imgd.width+i)*4;
					// find closest color from palette
					cdl = 256+256+256; ci=0;
					for(var k=0;k<palette.length;k++){	
						// In my experience, https://en.wikipedia.org/wiki/Rectilinear_distance works better than https://en.wikipedia.org/wiki/Euclidean_distance
						c1 = Math.abs(palette[k].r-imgd.data[idx]);
						c2 = Math.abs(palette[k].g-imgd.data[idx+1]);
						c3 = Math.abs(palette[k].b-imgd.data[idx+2]);
						cd = c1+c2+c3;
						if(cd<cdl){
							cdl = cd; ci = k;
						}
					}// End of palette loop
					
					// add to palettacc
					paletteacc[ci].r += imgd.data[idx];
					paletteacc[ci].g += imgd.data[idx+1];
					paletteacc[ci].b += imgd.data[idx+2];
					paletteacc[ci].n++;
					
					arr[j][i] = ci; 
				}// End of i loop
			}// End of j loop
			
			// averaging paletteacc for palette
			var ratio;
			for(var k=0;k<palette.length;k++){
				// averaging
				if(paletteacc[k].n>0){
					palette[k].r = Math.floor(paletteacc[k].r/paletteacc[k].n);
					palette[k].g = Math.floor(paletteacc[k].g/paletteacc[k].n);
					palette[k].b = Math.floor(paletteacc[k].b/paletteacc[k].n);
				}
				ratio = paletteacc[k].n/(imgd.width*imgd.height);
				//console.log('color '+k+' '+torgbstr(palette[k]) +' pixels '+paletteacc[k].n+' pixel ratio '+ratio);
				
				// Randomizing a color, if there are too few pixels and there will be a new cycle
				if((ratio<minratio)&&(cnt<cycles-1)){
					palette[k].r = Math.floor(Math.random()*255);
					palette[k].g = Math.floor(Math.random()*255);
					palette[k].b = Math.floor(Math.random()*255);
				}
				
			}// End of palette loop
			
		}// End of Repeat clustering step 'cycles' times
		
		return {'array':arr,'palette':palette,'background':arr[0][0]};
	},// End of colorquantization()
	
	// Generating a palette with numberofcolors
	this.generatepalette=function(numberofcolors){
		var palette = [];
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
			for(var rcnt=0;rcnt<colorqnum;rcnt++){
				for(var gcnt=0;gcnt<colorqnum;gcnt++){
					for(var bcnt=0;bcnt<colorqnum;bcnt++){
						var newr = rcnt*colorstep, newg = gcnt*colorstep, newb = bcnt*colorstep,
						newcolor = {'r':newr,'g':newg,'b':newb,'a':255};
						palette.push(newcolor);
					}// End of blue loop
				}// End of green loop
			}// End of red loop
			
			// Rest is random
			for(var rcnt=0;rcnt<rndnum;rcnt++){
				palette.push({'r':Math.floor(Math.random()*255),'g':Math.floor(Math.random()*255),'b':Math.floor(Math.random()*255),'a':255});
			}

		}// End of numberofcolors check
		
		return palette;
	},// End of generatepalette()
	
	// 2. Layer separation and edge detection
	// Edge node types ( ▓:light or 1; ░:dark or 0 )
	// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
	// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
	//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
	//
	this.layering=function(arr){
		// Creating layers for each indexed color in arr
		var layers = {}, val=0, ah = arr.length, aw = arr[0].length, n1,n2,n3,n4,n5,n6,n7,n8;
		for(var j=0;j<ah;j++){
			for(var i=0;i<aw;i++){
				
				// This pixel's indexed color
				val = arr[j][i];
				// Create new layer if there's no one with this indexed color
				if(!layers.hasOwnProperty(val)){
					layers[val] = [];
					for(var lj=0;lj<=arr.length;lj++){
						layers[val][lj] = [];
						for(var li=0;li<=arr[0].length;li++){
							layers[val][lj][li]=0;
						}
					}
				}
				// Node types
				
				// Are neighbor pixel colors the same?
				if((j>0)&&(i>0)){ n1 = arr[j-1][i-1]===val?1:0; }else{ n1 =0; }
				if(j>0){ n2 = arr[j-1][i]===val?1:0; }else{ n2 =0; }
				if((j>0)&&(i<aw-1)){ n3 = arr[j-1][i+1]===val?1:0; }else{ n3 =0; }
				if(i>0){ n4 = arr[j][i-1]===val?1:0; }else{ n4 = 0; }
				if(i<aw-1){ n5 = arr[j][i+1]===val?1:0; }else{ n5 = 0; }
				if((j<ah-1)&&(i>0)){ n6 = arr[j+1][i-1]===val?1:0; }else{ n6 = 0; }
				if(j<ah-1){ n7 = arr[j+1][i]===val?1:0; }else{ n7 = 0; }
				if((j<ah-1)&&(i<aw-1)){ n8 = arr[j+1][i+1]===val?1:0; }else{ n8 = 0; }
				
				// this pixel's type and looking back on previous pixels
				layers[val][j+1][i+1] = 1 + n5 * 2 + n8 * 4 + n7 * 8 ;
				if(!n4){ layers[val][j+1][i] = 0 + 2 + n7 * 4 + n6 * 8 ; }
				if(!n2){ layers[val][j][i+1 ] = 0 + n3*2 + n5 * 4 + 8 ; }
				if(!n1){ layers[val][j][i] = 0 + n2*2 + 4 + n4 * 8 ; }
				
			}// End of i loop
		}// End of j loop
			
		return layers;
	},// End of layering()
	
	
	// 3. Walking through an edge node array, discarding edge node types 0 and 15 and creating paths from the rest.
	// Walk directions (dir): 0 > ; 1 ^ ; 2 < ; 3 v  
	// Edge node types ( ▓:light or 1; ░:dark or 0 )
	// ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
	// ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
	// 0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
	//
	this.pathscan=function(arr,pathomit){
		pathomit=pathomit||8;
		var paths=[], pacnt=0,pcnt=0,px=0,py=0,w=arr[0].length,h=arr.length,dir=0,pathfinished=true,stepcnt=0,maxsteps=w*h*2;
		
		for(var j=0;j<h;j++){
			for(var i=0;i<w;i++){
				if((arr[j][i]===0)||(arr[j][i]===15)){// Discard
					stepcnt++;
				}else{// Follow path
					
					// Init
					px = i; py = j;
					paths[pacnt] = [];
					pathfinished = false;
					pcnt=0;
					// fill paths will be drawn, but hole paths are also required to remove unnecessary edge nodes
					if(arr[py][px]===1){dir = 0;}
					if(arr[py][px]===2){dir = 3;}
					if(arr[py][px]===3){dir = 0;}
					if(arr[py][px]===4){dir = 1; paths[pacnt].type = 'fill';}
					if(arr[py][px]===5){dir = 0;}
					if(arr[py][px]===6){dir = 3;}
					if(arr[py][px]===7){dir = 0; paths[pacnt].type = 'hole';}
					if(arr[py][px]===8){dir = 0;}
					if(arr[py][px]===9){dir = 3;}
					if(arr[py][px]===10){dir = 3;}
					if(arr[py][px]===11){dir = 1;paths[pacnt].type = 'hole';}
					if(arr[py][px]===12){dir = 0;}
					if(arr[py][px]===13){dir = 3;paths[pacnt].type = 'hole';}
					if(arr[py][px]===14){dir = 0;paths[pacnt].type = 'hole';}
					// Path points loop
					while(!pathfinished){
						
						// New path point
						paths[pacnt][pcnt] = {};
						paths[pacnt][pcnt].x = px;
						paths[pacnt][pcnt].y = py;
						paths[pacnt][pcnt].t = arr[py][px];					
						
						// Node types
						if(arr[py][px]===1){
							arr[py][px] = 0;
							if(dir===0){
								py--;dir=1; 
							}else if(dir===3){
								px--;dir=2; 
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}

						else if(arr[py][px]===2){
							arr[py][px] = 0;
							if(dir===3){
								px++;dir=0; 
							}else if(dir===2){
								py--;dir=1; 
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}
						
						else if(arr[py][px]===3){
							arr[py][px] = 0;
							if(dir===0){
								px++;
							}else if(dir===2){
								px--;
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}

						else if(arr[py][px]===4){
							arr[py][px] = 0;
							if(dir===1){
								px++;dir=0; 
							}else if(dir===2){
								py++;dir=3; 
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}

						else if(arr[py][px]===5){
							if(dir===0){
								arr[py][px] = 13;py++;dir=3; 
							}else if(dir===1){
								arr[py][px] = 13;px--;dir=2; 
							}else if(dir===2){
								arr[py][px] = 7;py--;dir=1; 
							}else if(dir===3){
								arr[py][px] = 7;px++;dir=0; 
							}
						}

						else if(arr[py][px]===6){
							arr[py][px] = 0;
							if(dir===1){
								py--;
							}else if(dir===3){
								py++;
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}
						
						else if(arr[py][px]===7){
							arr[py][px] = 0;
							if(dir===0){
								py++;dir=3; 
							}else if(dir===1){
								px--;dir=2; 
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}

						else if(arr[py][px]===8){
							arr[py][px] = 0;
							if(dir===0){
								py++;dir=3; 
							}else if(dir===1){
								px--;dir=2; 
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}

						else if(arr[py][px]===9){
							arr[py][px] = 0;
							if(dir===1){
								py--;
							}else if(dir===3){
								py++;
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}

						else if(arr[py][px]===10){
							if(dir===0){
								arr[py][px] = 11;py--;dir=1; 
							}else if(dir===1){
								arr[py][px] = 14;px++;dir=0; 
							}else if(dir===2){
								arr[py][px] = 14;py++;dir=3; 
							}else if(dir===3){
								arr[py][px] = 11;px--;dir=2; 
							}
						}
						
						else if(arr[py][px]===11){
							arr[py][px] = 0;
							if(dir===1){
								px++;dir=0; 
							}else if(dir===2){
								py++;dir=3; 
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}

						else if(arr[py][px]===12){
							arr[py][px] = 0;
							if(dir===0){
								px++;
							}else if(dir===2){
								px--;
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}

						else if(arr[py][px]===13){
							arr[py][px] = 0;
							if(dir===2){
								py--;dir=1; 
							}else if(dir===3){
								px++;dir=0; 
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}

						else if(arr[py][px]===14){
							arr[py][px] = 0;
							if(dir===0){
								py--;dir=1; 
							}else if(dir===3){
								px--;dir=2; 
							}else{console.log('Invalid dir '+dir+' on px '+px+' py '+py);pathfinished=true;paths.pop();pacnt--;}
						}
												
						// Close path
						if((px===paths[pacnt][0].x)&&(py===paths[pacnt][0].y)){ 
							pathfinished = true;
							// Discarding 'hole' type paths
							if(paths[pacnt].type==='hole'){
								paths.pop();pacnt--;
							}
							// Discarding if path is shorter than pathomit
							if(paths[pacnt].length<pathomit){
								paths.pop();pacnt--;
							}
						}
						
						// Error: path going out of image
						if((px<0)||(px>=w)||(py<0)||(py>=h)){
							pathfinished = true;
							console.log('path '+pacnt+' error w '+w+' h '+h+' px '+px+' py '+py);
							paths.pop();pacnt--;
						}
						
						// Error: stepcnt>maxsteps
						if(stepcnt>maxsteps){
							pathfinished = true;
							console.log('path '+pacnt+' error stepcnt '+stepcnt+' maxsteps '+maxsteps+' px '+px+' py '+py);
							paths.pop();pacnt--;
						}
						
						stepcnt++;
						pcnt++;
						
					}// End of Path points loop
					pacnt++;
					
				}// End of Follow path
				
			}// End of i loop
		}// End of j loop
		
		return paths;
	},// End of pathscan()

	// 3. Batch pathscan
	this.batchpathscan=function(layers,pathomit){
		pathomit=pathomit||8;
		var bpaths = [];
		for (k in layers) {
			if(!layers.hasOwnProperty(k)){ continue; }
			bpaths[k] = _this.pathscan(layers[k],pathomit);
		}
		return bpaths;
	},
	
	// 4. interpollating between path points for nodes with 8 directions ( East, SouthEast, S, SW, W, NW, N, NE )
	this.internodes=function(paths){
		var ins = [], palen=0,nextidx=0;
		// paths loop
		for(var pacnt=0;pacnt<paths.length;pacnt++){
			ins[pacnt]=[];
			ins[pacnt].type = paths[pacnt].type;
			palen = paths[pacnt].length;
			// pathpoints loop
			for(var pcnt=0;pcnt<palen;pcnt++){
			
				// interpolate between two path points
				nextidx = (pcnt+1)%palen;
				ins[pacnt][pcnt]={};
				ins[pacnt][pcnt].x = (paths[pacnt][pcnt].x+paths[pacnt][nextidx].x) /2;
				ins[pacnt][pcnt].y = (paths[pacnt][pcnt].y+paths[pacnt][nextidx].y) /2;
				
				// line segment direction to the next point
				if(paths[pacnt][pcnt].x<paths[pacnt][nextidx].x){ 
					if(paths[pacnt][pcnt].y<paths[pacnt][nextidx].y){ ins[pacnt][pcnt].linesegment = 1; // SouthEast
					}else if(paths[pacnt][pcnt].y>paths[pacnt][nextidx].y){ ins[pacnt][pcnt].linesegment = 7; // NE
					}else{ ins[pacnt][pcnt].linesegment = 0; } // E
				}else if(paths[pacnt][pcnt].x>paths[pacnt][nextidx].x){
					if(paths[pacnt][pcnt].y<paths[pacnt][nextidx].y){ ins[pacnt][pcnt].linesegment = 3; // SW
					}else if(paths[pacnt][pcnt].y>paths[pacnt][nextidx].y){ ins[pacnt][pcnt].linesegment = 5; // NW
					}else{ ins[pacnt][pcnt].linesegment = 4; } // N
				}else{
					if(paths[pacnt][pcnt].y<paths[pacnt][nextidx].y){ ins[pacnt][pcnt].linesegment = 2; // S
					}else if(paths[pacnt][pcnt].y>paths[pacnt][nextidx].y){ ins[pacnt][pcnt].linesegment = 6; // N
					}else{ ins[pacnt][pcnt].linesegment = 8; }// center, this should not happen
				}
				
			}// End of pathpoints loop 
						
		}// End of paths loop
		
		return ins;
	},// End of internodes()
	
	// 4. Batch interpollation
	this.batchinternodes=function(bpaths){
		var binternodes = [];
		for (k in bpaths) {
			if(!bpaths.hasOwnProperty(k)){ continue; }
			binternodes[k] = _this.internodes(bpaths[k]);
		}
		return binternodes;
	},
	
	// 5. tracepath() : recursively trying to fit straight and quadratic spline segments on the 8 direction internode path
	
	// 1. Apply only 1 smoothing to original path, so there will be 8 segment types: East, SouthEast, S, SW, W, NW, N, NE, between the new points
	// 2. Find sequences of points with only 2 segment types
	// 3. Fit a straight line on the sequence
	// 4. If the straight line fails (an error>ltreshold), find the point with the biggest error
	// 5. Fit a quadratic spline through errorpoint (project this to get controlpoint), then measure errors on every point in the sequence
	// 6. If the spline fails (an error>qtreshold), find the point with the biggest error
	// 7. Set splitpoint = (fitting point + errorpoint)/2
	// 8. Split sequence and recursively apply 3. - 7. to startpoint-splitpoint and splitpoint-endpoint sequences
	// 9. TODO? If splitpoint-endpoint is a spline, try to add new points from the next sequence
	this.tracepath=function(path,ltreshold,qtreshold){
		if(path.length<3){return {'segments':[],'type':'transparent'};}
		var pcnt=0,segtype1,segtype2,seqend,smp=[];
		while(pcnt<path.length){
			// 2. Find sequences of points with only 2 segment types
			segtype1 = path[pcnt].linesegment; segtype2 = -1; seqend=pcnt+1;
			while(((path[seqend].linesegment===segtype1)||(path[seqend].linesegment===segtype2)||(segtype2===-1))&&(seqend<path.length-1)){
				if((path[seqend].linesegment!==segtype1)&&(segtype2===-1)){segtype2 = path[seqend].linesegment;}
				seqend++;
			}
			// 3. - 8. Split sequence and recursively apply 3. - 7. to startpoint-splitpoint and splitpoint-endpoint sequences
			smp = smp.concat(_this.fitseq(path,ltreshold,qtreshold,pcnt,seqend));
			// 9. If splitpoint-endpoint is a spline, try to add new points from the next sequence
			// TODO?
			
			// forward pcnt;
			pcnt = seqend;
			
			// check if there are enough remaining points
			if(pcnt>path.length-3){
				if(pcnt===path.length-2){
					smp.push({'type':'Q', 'x1':path[pcnt].x,'y1':path[pcnt].y, 'x2':path[path.length-1].x,'y2':path[path.length-1].y, 'x3':path[0].x,'y3':path[0].y});
					pcnt = path.length;
				}else{
					smp.push({'type':'L', 'x1':path[pcnt].x,'y1':path[pcnt].y, 'x2':path[0].x,'y2':path[0].y});
					pcnt = path.length;
				}
			}
			
		}// End of pcnt loop
		
		return {'segments':smp,'type':path.type};
		
	},// End of tracepath()
		
	// 5. recursively fitting a straight or quadratic line segment on this sequence of path nodes, called from tracepath()
	this.fitseq=function(path,ltreshold,qtreshold,seqstart,seqend){
		// return if 0 length
		if(seqstart>=seqend){return [];}
		
		var errorpoint=seqstart, errorval=0, curvepass=true, px, py, dist2;
		var vx = (path[seqend].x-path[seqstart].x) / (seqend-seqstart), vy = (path[seqend].y-path[seqstart].y) / (seqend-seqstart);
		
		// 3. Fit a straight line on the sequence
		for(var pcnt=seqstart+1;pcnt<seqend;pcnt++){
			px = path[seqstart].x + vx * (pcnt-seqstart); py = path[seqstart].y + vy * (pcnt-seqstart);
			dist2 = (path[pcnt].x-px)*(path[pcnt].x-px) + (path[pcnt].y-py)*(path[pcnt].y-py);
			if(dist2>ltreshold){curvepass=false;}
			if(dist2>errorval){ errorpoint=pcnt; errorval=dist2; }
			pcnt++;
		}
		// return straight line if fits
		if(curvepass){return [{'type':'L', 'x1':path[seqstart].x,'y1':path[seqstart].y, 'x2':path[seqend].x,'y2':path[seqend].y}]; }
		
		// 4. If the straight line fails (an error>ltreshold), find the point with the biggest error
		var fitpoint = errorpoint; curvepass = true; errorval = 0;
		
		// 5. Fit a quadratic spline through this point, measure errors on every point in the sequence
		// helpers and projecting to get control point
		var t=(fitpoint-seqstart)/(seqend-seqstart), t1=(1-t)*(1-t), t2=2*(1-t)*t, t3=t*t;
		var cpx = (t1*path[seqstart].x + t3*path[seqend].x - path[fitpoint].x)/-t2 ,
			cpy = (t1*path[seqstart].y + t3*path[seqend].y - path[fitpoint].y)/-t2 ;	
		// Check every point
		for(var pcnt=seqstart+2;pcnt<seqend-1;pcnt++){
			
			t=(pcnt-seqstart)/(seqend-seqstart); t1=(1-t)*(1-t); t2=2*(1-t)*t; t3=t*t;
			px = t1*path[seqstart].x+t2*cpx+t3*path[seqend].x; py = t1*path[seqstart].y+t2*cpy+t3*path[seqend].y;
			
			dist2 = (path[pcnt].x-px)*(path[pcnt].x-px) + (path[pcnt].y-py)*(path[pcnt].y-py);
			
			if(dist2>qtreshold){curvepass=false;}
			if(dist2>errorval){ errorpoint=pcnt; errorval=dist2; }
			pcnt++;
		}
		// return spline if fits
		if(curvepass){return [{'type':'Q', 'x1':path[seqstart].x,'y1':path[seqstart].y, 'x2':cpx,'y2':cpy, 'x3':path[seqend].x,'y3':path[seqend].y}]; }
		
		// 6. If the spline fails (an error>qtreshold), find the point with the biggest error
		// 7. Set splitpoint = (fitting point + errorpoint)/2
		var splitpoint = Math.floor((fitpoint + errorpoint)/2);
		
		// 8. Split sequence and recursively apply 3. - 7. to startpoint-splitpoint and splitpoint-endpoint sequences
		var sm = _this.fitseq(path,ltreshold,qtreshold,seqstart,splitpoint);
		sm = sm.concat(_this.fitseq(path,ltreshold,qtreshold,splitpoint,seqend));
		return sm;
		
	},// End of fitseq()
	
	// 5. Batch tracing paths
	this.batchtracepaths=function(internodepaths,ltres,qtres){
		var btracedpaths = []; 
		for(var pacnt=0;pacnt<internodepaths.length;pacnt++){ 
			btracedpaths.push( _this.tracepath(internodepaths[pacnt],ltres,qtres) ); 
		}
		return btracedpaths;
	},
	
	// 5. Batch tracing layers
	this.batchtracelayers=function(binternodes,ltres,qtres){
		var btbis = [];
		for (k in binternodes) {
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
	
	// Getting SVG path element string from a traced path
	this.svgpathstring=function(desc,segments,fillcolor,sc,lcpr,qcpr){
		// Path
		var str = '<path fill="'+fillcolor+'" stroke="'+fillcolor+'" stroke-width="1" desc="'+desc+'" d="';
		str += 'M'+segments[0].x1*sc+' '+segments[0].y1*sc+' ';
		for(var pcnt=0;pcnt<segments.length;pcnt++){
			str += segments[pcnt].type+' '+segments[pcnt].x2*sc+' '+segments[pcnt].y2*sc+' ';
			if(segments[pcnt].x3){
				str += segments[pcnt].x3*sc+' '+segments[pcnt].y3*sc+' ';
			}
		}
		str += 'Z " />';
		
		// Rendering control points
		if(lcpr&&qcpr){
			for(var pcnt=0;pcnt<segments.length;pcnt++){
				if(segments[pcnt].x3){ 
					str += '<circle cx="'+segments[pcnt].x2*sc+'" cy="'+segments[pcnt].y2*sc+'" r="'+qcpr+'" fill="cyan" stroke-width="'+qcpr*0.2+'" stroke="black" />';
					str += '<circle cx="'+segments[pcnt].x3*sc+'" cy="'+segments[pcnt].y3*sc+'" r="'+qcpr+'" fill="white" stroke-width="'+qcpr*0.2+'" stroke="black" />';
					str += '<line x1="'+segments[pcnt].x1*sc+'" y1="'+segments[pcnt].y1*sc+'" x2="'+segments[pcnt].x2*sc+'" y2="'+segments[pcnt].y2*sc+'" stroke-width="'+qcpr*0.2+'" stroke="cyan" />';
					str += '<line x1="'+segments[pcnt].x2*sc+'" y1="'+segments[pcnt].y2*sc+'" x2="'+segments[pcnt].x3*sc+'" y2="'+segments[pcnt].y3*sc+'" stroke-width="'+qcpr*0.2+'" stroke="cyan" />';
				}else{
					str += '<circle cx="'+segments[pcnt].x2*sc+'" cy="'+segments[pcnt].y2*sc+'" r="'+lcpr+'" fill="white" stroke-width="'+lcpr*0.2+'" stroke="black" />';
				}
			}
		}else if(lcpr){
			for(var pcnt=0;pcnt<segments.length;pcnt++){
				if(!segments[pcnt].x3){ 
					str += '<circle cx="'+segments[pcnt].x2*sc+'" cy="'+segments[pcnt].y2*sc+'" r="'+lcpr+'" fill="white" stroke-width="'+lcpr*0.2+'" stroke="black" />';
				}
			}
		}else if(qcpr){
			for(var pcnt=0;pcnt<segments.length;pcnt++){
				if(segments[pcnt].x3){ 
					str += '<circle cx="'+segments[pcnt].x2*sc+'" cy="'+segments[pcnt].y2*sc+'" r="'+qcpr+'" fill="cyan" stroke-width="'+qcpr*0.2+'" stroke="black" />';
					str += '<circle cx="'+segments[pcnt].x3*sc+'" cy="'+segments[pcnt].y3*sc+'" r="'+qcpr+'" fill="white" stroke-width="'+qcpr*0.2+'" stroke="black" />';
					str += '<line x1="'+segments[pcnt].x1*sc+'" y1="'+segments[pcnt].y1*sc+'" x2="'+segments[pcnt].x2*sc+'" y2="'+segments[pcnt].y2*sc+'" stroke-width="'+qcpr*0.2+'" stroke="cyan" />';
					str += '<line x1="'+segments[pcnt].x2*sc+'" y1="'+segments[pcnt].y2*sc+'" x2="'+segments[pcnt].x3*sc+'" y2="'+segments[pcnt].y3*sc+'" stroke-width="'+qcpr*0.2+'" stroke="cyan" />';
				}
			}
		}// End of quadratic control points
		
		return str;
	},// End of svgpathstring()
	
	// Converting tracedata to an SVG string, paths are drawn according to a Z-index 
	// the optional lcpr and qcpr are linear and quadratic control point radiuses 
	this.getsvgstring=function(w,h,tracedata,palette,background,scale,lcpr,qcpr){
		scale=scale||1; lcpr=lcpr||0; qcpr=qcpr||0;
		// SVG start
		var svgstr = '<svg width="'+w+'px" height="'+h+'px" version="1.1" xmlns="http://www.w3.org/2000/svg" desc="Created with imagetracer.js" >';

		// Background
		svgstr += '<rect x="0" y="0" width="100%" height="100%" fill="'+_this.torgbstr(palette[background])+'" />';
		
		// creating Z-index
		var zindex = {}, label;
		// Layer loop
		for (k in tracedata) {
			if(!tracedata.hasOwnProperty(k)){ continue; }
			
			// Path loop
			for(var pcnt=0;pcnt<tracedata[k].length;pcnt++){
			
				// Label (Z-index key) is the startpoint of the path, linearized
				label = tracedata[k][pcnt].segments[0].y1*w+tracedata[k][pcnt].segments[0].x1;
				// Creating new list if required
				if(!zindex[label]){ zindex[label] = []; }
				// Adding layer and path number to list 
				var l = ''+k, p = ''+pcnt;
				zindex[label].push({'l':l,'p':p});
				
			}// End of path loop
			
		}// End of layer loop
		
		// Sorting Z-index
		var zindexkeys = Object.keys(zindex), l, p;
		zindexkeys.sort(_this.compareNumbers);
		// Drawing
		// Z-index loop
		for(var k=0;k<zindexkeys.length;k++){
			// Paths loop
			for(var j=0;j<zindex[zindexkeys[k]].length;j++){
				l = zindex[zindexkeys[k]][j].l; p = zindex[zindexkeys[k]][j].p;
				// Adding SVG <path> string, desc contains layer and path number
				svgstr += _this.svgpathstring('l '+l+' p '+p,tracedata[l][p].segments,_this.torgbstr(palette[l]),scale,lcpr,qcpr);
			}// End of paths loop
			
		}// End of Z-index loop
		
		// SVG End
		svgstr+='</svg>';
		
		return svgstr;
		
	},// End of getsvgstring()
	
	// Comparator for numeric Array.sort
	this.compareNumbers=function(a,b){ return a - b; },
	
	// Convert color object to rgb string
	this.torgbstr=function(c){return 'rgb('+c.r+','+c.g+','+c.b+')'},
	
	// Helper function: Appending an <svg> element to a container from an svgstring
	this.appendSVGString=function(svgstr,parentid){
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
	
	// Helper function: loading an image from a URL, then executing callback with canvas as argument
	this.loadImage=function(url,callback){
		var img = new Image();
		img.src = url;
		img.onload = function(){
			var canvas = document.createElement('canvas');
			canvas.width=img.width;
			canvas.height=img.height;
			var context = canvas.getContext('2d');
			context.drawImage(img,0,0);
			callback(canvas);
		}
	},
	
	// Helper function: getting ImageData from a canvas
	this.getImgdata=function(canvas){
		var context = canvas.getContext('2d');
		return context.getImageData(0,0,canvas.width,canvas.height);
	},
	
	// Helper function: Drawing all edge node layers into a container
	this.drawLayers=function(layers,palette,scale,parentid){
		scale = scale||1;
		var w,h,idx;
		
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
			w=layers[k][0].length; h=layers[k].length; idx=0;
			
			// Creating new canvas for every layer 
			var canvas = document.createElement('canvas'); canvas.width=w*scale; canvas.height=h*scale; 
			var context = canvas.getContext('2d');
			
			// Drawing
			for(var j=0;j<h;j++){
				for(var i=0;i<w;i++){
					context.fillStyle = _this.torgbstr(palette[ layers[k][j][i]%palette.length ]);
					context.fillRect(i*scale,j*scale,scale,scale); 
				}
			}
			
			// Appending canvas to container
			div.appendChild(canvas);
		}// End of Layers loop
	}// End of drawlayers
	
	return this;
}// End of ImageTracer object  