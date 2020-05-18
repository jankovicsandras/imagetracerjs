<!DOCTYPE html>
<html><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta charset="utf-8">
	<script src="imagetracer_v1.2.6.js"></script>
	<script>

		function onload_init(){
			
			// Loading smiley.png, tracing and calling alert callback on the SVG string result
			ImageTracer.imageToSVG( 'smiley.png', alert );


			// Almost the same with options, and the ImageTracer.appendSVGString callback will append the SVG
			ImageTracer.imageToSVG( 'smiley.png', ImageTracer.appendSVGString, { ltres:0.1, qtres:1, scale:10, strokewidth:5 } );


			// This uses the 'Posterized2' option preset and appends the SVG to an element with id="svgcontainer"
			ImageTracer.imageToSVG(
				'panda.png',
				function(svgstr){ ImageTracer.appendSVGString( svgstr, 'svgcontainer' ); },
				'Posterized2'
			);


			// The helper function loadImage() loads an image to a canvas, then executing callback: appending the canvas to a div here.
			ImageTracer.loadImage(
				'panda.png',
				function(canvas){ (document.getElementById('canvascontainer')).appendChild(canvas); }
			);


			// ImageData can be traced to an SVG string synchronously.
			ImageTracer.loadImage(
				'smiley.png',
				function(canvas){
				
					// Getting ImageData from canvas with the helper function getImgdata().
				 	var imgd = ImageTracer.getImgdata( canvas );
				 	
				 	// Synchronous tracing to SVG string
				 	var svgstr = ImageTracer.imagedataToSVG( imgd, { scale:5 } );
				 
				 	// Appending SVG
				 	ImageTracer.appendSVGString( svgstr, 'svgcontainer' );
				 	
				}
			);


			// This will load an image, trace it when loaded, and execute callback on the tracedata: stringifying and alerting it here.
			ImageTracer.imageToTracedata(
				'smiley.png',
				function(tracedata){ alert( JSON.stringify( tracedata ) ); },
				{ ltres:0.1, qtres:1, scale:10 }
			);


			// imagedataToTracedata() is very similar to the previous functions. This returns tracedata synchronously.
			ImageTracer.loadImage(
					'smiley.png',
					function(canvas){ 
					
						// Getting ImageData from canvas with the helper function getImgdata().
						var imgd = ImageTracer.getImgdata(canvas);
						
						// Synchronous tracing to tracedata
						var tracedata = ImageTracer.imagedataToTracedata( imgd, { scale:10 } );
						
						alert( JSON.stringify( tracedata ) );
					}
			);

		}// End of onload_init()
		
	</script>
	</head>
	<body style="background-color:rgb(32,32,32);color:rgb(255,255,255);font-family:monospace;" onload="onload_init()" >
		<noscript style="background-color:rgb(255,0,0);color:rgb(255,255,255);font-size: 250%;">Please enable JavaScript!</noscript>
		<div id="svgcontainer"></div>
		<div id="canvascontainer"></div>
	</body></html>