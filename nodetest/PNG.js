"use strict";

var PNG = function(){

	// initialize all members to keep the same hidden class
	this.width = 0;
	this.height = 0;
	this.bitDepth = 0;
	this.colorType = 0;
	this.compressionMethod = 0;
	this.filterMethod = 0;
	this.interlaceMethod = 0;

	this.colors = 0;
	this.alpha = false;
	this.pixelBits = 0;

	this.palette = null;
	this.pixels = null;

};

PNG.prototype.getWidth = function(){
	return this.width;
};

PNG.prototype.setWidth = function(width){
	this.width = width;
};

PNG.prototype.getHeight = function(){
	return this.height;
};

PNG.prototype.setHeight = function(height){
	this.height = height;
};

PNG.prototype.getBitDepth = function(){
	return this.bitDepth;
};

PNG.prototype.setBitDepth = function(bitDepth){
	if ([2, 4, 8, 16].indexOf(bitDepth) === -1){
		throw new Error("invalid bith depth " + bitDepth);
	}
	this.bitDepth = bitDepth;
};

PNG.prototype.getColorType = function(){
	return this.colorType;
};

PNG.prototype.setColorType = function(colorType){

	//   Color    Allowed    Interpretation
	//   Type    Bit Depths
	//
	//   0       1,2,4,8,16  Each pixel is a grayscale sample.
	//
	//   2       8,16        Each pixel is an R,G,B triple.
	//
	//   3       1,2,4,8     Each pixel is a palette index;
	//                       a PLTE chunk must appear.
	//
	//   4       8,16        Each pixel is a grayscale sample,
	//                       followed by an alpha sample.
	//
	//   6       8,16        Each pixel is an R,G,B triple,
	//                       followed by an alpha sample.

	var colors = 0, alpha = false;

	switch (colorType){
		case 0: colors = 1; break;
		case 2: colors = 3; break;
		case 3: colors = 1; break;
		case 4: colors = 2; alpha = true; break;
		case 6: colors = 4; alpha = true; break;
		default: throw new Error("invalid color type");
	}

	this.colors = colors;
	this.alpha = alpha;
	this.colorType = colorType;
};

PNG.prototype.getCompressionMethod = function(){
	return this.compressionMethod;
};

PNG.prototype.setCompressionMethod = function(compressionMethod){
	if (compressionMethod !== 0){
		throw new Error("invalid compression method " + compressionMethod);
	}
	this.compressionMethod = compressionMethod;
};

PNG.prototype.getFilterMethod = function(){
	return this.filterMethod;
};

PNG.prototype.setFilterMethod = function(filterMethod){
	if (filterMethod !== 0){
		throw new Error("invalid filter method " + filterMethod);
	}
	this.filterMethod = filterMethod;
};

PNG.prototype.getInterlaceMethod = function(){
	return this.interlaceMethod;
};

PNG.prototype.setInterlaceMethod = function(interlaceMethod){
	if (interlaceMethod !== 0 && interlaceMethod !== 1){
		throw new Error("invalid interlace method " + interlaceMethod);
	}
	this.interlaceMethod = interlaceMethod;
};

PNG.prototype.setPalette = function(palette){
	if (palette.length % 3 !== 0){
		throw new Error("incorrect PLTE chunk length");
	}
	if (palette.length > (Math.pow(2, this.bitDepth) * 3)){
		throw new Error("palette has more colors than 2^bitdepth");
	}
	this.palette = palette;
};

PNG.prototype.getPalette = function(){
	return this.palette;
};

/**
 * get the pixel color on a certain location in a normalized way
 * result is an array: [red, green, blue, alpha]
 */
PNG.prototype.getPixel = function(x, y){
	if (!this.pixels) throw new Error("pixel data is empty");
	if (x >= this.width || y >= this.height){
		throw new Error("x,y position out of bound");
	}
	var i = this.colors * this.bitDepth / 8 * (y * this.width + x);
	var pixels = this.pixels;

	switch (this.colorType){
		case 0: return [pixels[i], pixels[i], pixels[i], 255];
		case 2: return [pixels[i], pixels[i + 1], pixels[i + 2], 255];
		case 3: return [
			this.palette[pixels[i] * 3 + 0],
			this.palette[pixels[i] * 3 + 1],
			this.palette[pixels[i] * 3 + 2],
			255];
		case 4: return [pixels[i], pixels[i], pixels[i], pixels[i + 1]];
		case 6: return [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
	}
};

module.exports = PNG;
