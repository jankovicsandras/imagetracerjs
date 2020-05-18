<!DOCTYPE html>
<html><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta charset="utf-8">
	<title>imagetracer.js test automation</title>
	<style> 
		.imgcontainer{
			background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQImWPQ1tb+r62t/d/f3/+/v7//fwYMARgDJoEhAACRARthAfQS8AAAAABJRU5ErkJggg==) repeat;
			border: solid 1px cyan;
		}
		table{ border: solid 1px gray; border-collapse:collapse; }
		td{ border: solid 1px gray; vertical-align:top; }
		th{ border: solid 1px gray; }
	</style>
	<script src="imagetracer_v1.2.6.js"></script>
	<script>
		var queue;
		var stats = [], tt, rt;
		var timeoutid = 0, timeoutwait = 500, drawmode = false, rowid = 1, repeatnum = 1, totaltime;
		
		function log(msg){ console.log(msg); }
		
		function startprocess(){
			
			if(!timeoutid){
				
				log('starting');
				
				var filenames = [];
				
				// Drawmode
				if(document.getElementById('cbox0').checked){ drawmode = true; }else{ drawmode = false; }
				
				// Selected images
				for(var i=1; i<17; i++){ if(document.getElementById('icb'+i).checked){ filenames.push("testimages/"+i+".png"); } }
				
				// Repeats
				repeatnum = 1;
				try{ repeatnum = parseInt(email = document.getElementById('repeatinput').value); }catch(e){log(e);}
				
				// Options
				var optionses = [], ks = Object.keys(ImageTracer.optionpresets);
				for(var i=0; i<ks.length; i++){
					if(document.getElementById('ocb'+i).checked){ optionses.push(ImageTracer.optionpresets[ks[i]]); }
				}
				/*if(document.getElementById('ocb1').checked){ optionses.push({}); }
				if(document.getElementById('ocb2').checked){ optionses.push({ blurradius:2, ltres:0.1, numberofcolors:64 }); }
				if(document.getElementById('ocb3').checked){ optionses.push({ strokewidth:4, blurradius:5, roundcoords:0, desc:false, scale:4, }); }
				*/
				if(document.getElementById('ocbx').checked){
					try{
						optionses.push( JSON.parse( document.getElementById('custom1input').value ) );
					}catch(e){ log(e); }
				}
				if(document.getElementById('ocby').checked){
					try{
						optionses.push( JSON.parse( document.getElementById('custom2input').value ) );
					}catch(e){ log(e); }
				}
				
				// Queue
				queue = [];
				for(var k=0; k<repeatnum; k++){
					for(var i=0; i<filenames.length; i++){
						for(var j=0; j<optionses.length; j++){
							queue.push([filenames[i],optionses[j]]);
						}
					}
				}
				
				// Processing
				totaltime = Date.now();
				processqueue();
			}
		}// End of startprocess()
		
		function processqueue(){
			
			var item = queue.shift();
			if(item){
			
				log('file '+item[0]);
				
				ImageTracer.loadImage(item[0],
						function(canvas){
							
							// Start tracing timer
							tt = Date.now();
							var tracedata = ImageTracer.imagedataToTracedata( ImageTracer.getImgdata(canvas), item[1] );
							// Stop tracing timer
							tt = Date.now() - tt;
							
							// Start rendering timer
							rt = Date.now();
							// Render
							var svgstr = ImageTracer.getsvgstring(tracedata, item[1]);
							// Stop rendering timer
							rt = Date.now() - rt;
							
							// Counting paths
							var pcont = 0;
							for(k in tracedata.layers) {
								if(!tracedata.layers.hasOwnProperty(k)){ continue; }
								pcont += tracedata.layers[k].length;
							}
							
							////////////////
							
							// Draw SVG
							if(drawmode){
								document.getElementById('svgcontainer').innerHTML = '';
								ImageTracer.appendSVGString(svgstr,'svgcontainer');
							
								// Draw diff
								// draw original
								var oc = document.getElementById('originalcanvas'); oc.innerHTML = '';
								oc.width = canvas.width;
								oc.height = canvas.height;
								var ctx = oc.getContext('2d');
								var oimgd = ImageTracer.getImgdata(canvas);
								ctx.putImageData(oimgd,0,0);
								
								// draw new
								backtopng(svgstr,
									function(imgd){
										
										// draw diff
										var dc = document.getElementById('diffcanvas'); dc.innerHTML = '';
										dc.width = imgd.width;
										dc.height = imgd.height;
										var dctx = dc.getContext('2d');
										var idx = 0, d = 0;
										var rgbadiff=0, pixeldiff=0, thisdiff=0;
										// Calculating RGBA diff
										var dimgd = dctx.createImageData(imgd.width,imgd.height);
										for(var j=0; j<imgd.height; j++){
											for(var i=0; i<imgd.width; i++){
												idx = (j*imgd.width + i) * 4;
												dimgd.data[idx  ] = Math.abs( oimgd.data[idx  ] - imgd.data[idx  ] );
												dimgd.data[idx+1] = Math.abs( oimgd.data[idx+1] - imgd.data[idx+1] );
												dimgd.data[idx+2] = Math.abs( oimgd.data[idx+2] - imgd.data[idx+2] );
												dimgd.data[idx+3] = Math.abs( oimgd.data[idx+3] - imgd.data[idx+3] );
												thisdiff = dimgd.data[idx  ] + dimgd.data[idx+1] + dimgd.data[idx+2] + dimgd.data[idx+3];
												if(thisdiff === 0 ){ dimgd.data[idx+3] = 0; }else{ dimgd.data[idx+3] = 255; pixeldiff++; }
												rgbadiff += thisdiff;
											}
										}
										dctx.putImageData( dimgd, 0, 0 );
										
										// Registerstats
										registerstats(
												item[0],
												tracedata.width,
												tracedata.height,
												(tracedata.width*tracedata.height),
												svgstr.length,
												tt,
												rt,
												pcont,
												rgbadiff / ( tracedata.width * tracedata.height * 4 ),
												Math.floor(pixeldiff*100 / ( tracedata.width * tracedata.height )),
												JSON.stringify(item[1])
										);
										
										// Next item
										timeoutid = setTimeout( processqueue, timeoutwait );
									}
								);
							}else{// No drawmode
								
								// Registerstats
								registerstats(
										item[0],
										tracedata.width,
										tracedata.height,
										(tracedata.width*tracedata.height),
										svgstr.length,
										tt,
										rt,
										pcont,
										'n/a',
										'n/a',
										JSON.stringify(item[1])
								);
							
								// Next item
								timeoutid = setTimeout( processqueue, timeoutwait );
								
							}// End of drawmode check
							
						}// End of loadImage() callback 
				);// End of loadImage()
				
			}else{// No more images to process
				
				stopprocessing();
				//document.getElementById('logdiv').innerHTML += JSON.stringify(stats);
				
			}// End of item check
			
		}// End of processqueue()
		
		function stopprocessing(){ 
			clearTimeout(timeoutid); timeoutid = 0; 
			totaltime = Date.now() - totaltime; 
			alert('Time elapsed: '+totaltime+' ms.'); 
		}
		
		function registerstats(filename,w,h,area,svglength,tracetime,rendertime,pathcnt,rgbadiff,pixeldiff,options){
			var tableref = document.getElementById('logtable');
			var newrow = tableref.insertRow(-1);
			newrow.innerHTML = 
				'<td>'+rowid+'</td>'+
				'<td>'+filename+'</td>'+
				'<td>'+w+'</td>'+
				'<td>'+h+'</td>'+
				'<td>'+area+'</td>'+
				'<td>'+svglength+'</td>'+
				'<td>'+tracetime+'</td>'+
				'<td>'+rendertime+'</td>'+
				'<td>'+pathcnt+'</td>'+
				'<td>'+rgbadiff+'</td>'+
				'<td>'+pixeldiff+'</td>'+
				'<td>'+options+'</td>';
			rowid++;
		}
		
		function backtopng(svgstr,callback){
			var nc = document.getElementById('newcanvas'); nc.innerHTML = '';
			var img = document.createElement('img');
			img.onload = function(){
				nc.width=img.width;
				nc.height=img.height;
				var ctx = nc.getContext('2d');
				ctx.drawImage( img, 0, 0 );
				callback(ImageTracer.getImgdata(nc));
			};
			img.setAttribute('src','data:image/svg+xml;base64,'+btoa(svgstr));
		}
		
		function onload_init(){
			
			var k = Object.keys(ImageTracer.optionpresets), s='';
			for(var i=0; i<k.length; i++){
				s += '<label><input type="checkbox" id="ocb'+i+'" value="1" '+(i<6?'checked="true"':'')+' ><b>'+k[i]+'</b> : '+JSON.stringify(ImageTracer.optionpresets[k[i]])+'</label><br/>';
			}
			document.getElementById('ocbcontainer').innerHTML = s;
		}
		
	</script>
	</head>
	<body style="background-color:rgb(32,32,32);color:rgb(255,255,255);font-family:monospace;" onload="onload_init()" >
	<noscript style="background-color:rgb(255,0,0);color:rgb(255,255,255);font-size: 250%;">Please enable JavaScript!</noscript>
	<form id="testcontroller">
	<h1>Test images</h1>
	<table id="itable">
	<tbody>
		<tr>
			<td><label><input type="checkbox" id="icb1" value="1" checked="true">1.png</label><br><img src="testimages/1.png"></td> 
			<td><label><input type="checkbox" id="icb2" value="1" checked="true" >2.png</label><br><img src="testimages/2.png"></td>
			<td><label><input type="checkbox" id="icb3" value="1" checked="true" >3.png</label><br><img src="testimages/3.png"></td>
			<td><label><input type="checkbox" id="icb4" value="1" checked="true" >4.png</label><br><img src="testimages/4.png"></td>
		</tr>
		<tr>
			<td><label><input type="checkbox" id="icb5" value="1" checked="true" >5.png</label><br><img src="testimages/5.png"></td> 
			<td><label><input type="checkbox" id="icb6" value="1" checked="true" >6.png</label><br><img src="testimages/6.png"></td>
			<td><label><input type="checkbox" id="icb7" value="1" checked="true" >7.png</label><br><img src="testimages/7.png"></td>
			<td><label><input type="checkbox" id="icb8" value="1" checked="true" >8.png</label><br><img src="testimages/8.png"></td>
		</tr>
		<tr>
			<td><label><input type="checkbox" id="icb9" value="1" checked="true" >9.png</label><br><img src="testimages/9.png"></td> 
			<td><label><input type="checkbox" id="icb10" value="1" checked="true" >10.png</label><br><img src="testimages/10.png"></td>
			<td><label><input type="checkbox" id="icb11" value="1" checked="true" >11.png</label><br><img src="testimages/11.png"></td>
			<td><label><input type="checkbox" id="icb12" value="1" checked="true" >12.png</label><br><img src="testimages/12.png"></td>
		</tr>
		<tr>
			<td><label><input type="checkbox" id="icb13" value="1" checked="true" >13.png</label><br><img src="testimages/13.png"></td> 
			<td><label><input type="checkbox" id="icb14" value="1" checked="true" >14.png</label><br><img src="testimages/14.png"></td>
			<td><label><input type="checkbox" id="icb15" value="1" checked="true" >15.png</label><br><img src="testimages/15.png"></td>
			<td><label><input type="checkbox" id="icb16" value="1" checked="true" >16.png</label><br><img src="testimages/16.png"></td>
		</tr>
	</tbody>
	</table>
	<h1>Settings</h1>
	<label><input type="checkbox" id="cbox0" value="1" checked="true">Draw SVG</label><br>
	<div id="ocbcontainer"></div>
	<label><input type="checkbox" id="ocbx" value="1" >Custom Options 1:</label><input type="text" id="custom1input" value="" style="width:40em" ><br>
	<label><input type="checkbox" id="ocby" value="1" >Custom Options 2:</label><input type="text" id="custom2input" value="" style="width:40em" ><br>
	Example Custom Options:<br>{"ltres":1,"qtres":1,"pathomit":8,"colorsampling":true,"numberofcolors":16,"mincolorratio":0.02,"colorquantcycles":3,"scale":1,"simplifytolerance":0,"roundcoords":1,"lcpr":0,"qcpr":0,"desc":true,"viewbox":false,"blurradius":0,"blurdelta":20}<br>	
	<label><input type="text" id="repeatinput" value="1">Repeats</label><br>
	<button id="startbutton" type="button" onclick="startprocess()" >START</button>
	<button id="stopbutton" type="button" onclick="stopprocessing()" >STOP</button>
	</form>
	
	<h1>Result (if Draw SVG is active)</h1>
	<table id="itable">
	<thead>
		<tr><th>Traced SVG</th><th>Original raster</th><th>SVG rendered as raster</th><th>Difference</th></tr>
	</thead>
	<tbody>
		<tr>
			<td><div id="svgcontainer" class="imgcontainer"></div></td> 
			<td><canvas id="originalcanvas" class="imgcontainer"></canvas></td>
			<td><canvas id="newcanvas" class="imgcontainer"></canvas></td>
			<td><canvas id="diffcanvas" class="imgcontainer"></canvas></td>
		</tr>
	</tbody>
	</table>
	
	<h1>Measurements</h1>
	<div id="logdiv">
	<table id="logtable">
	<thead>
		<tr>
			<th>RowID</th>
			<th>Filename</th>
			<th>width (pixels)</th>
			<th>height (pixels)</th>
			<th>area (pixels)</th>
			<th>SVG string length (bytes)</th>
			<th>Tracing time (ms)</th>
			<th>Rendering time (ms)</th>
			<th>Nr. of paths</th>
			<th>RGBA difference (cummulative RGBA difference / (area*4))</th>
			<th>Different pixels (%)</th>
			<th>Options</th>
		</tr>
	</thead>
	<tbody id="logtbody">
	</tbody>
	</table>
	
	</div>
</body></html>