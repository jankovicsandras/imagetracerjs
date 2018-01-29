Run like this:

>node nodecli ../panda.png -outfilename outpanda.svg numberofcolors 4 -pathomit 16 ltres 0.1

Expected result:

.../outpanda.svg was saved!


Please note:
 - You can use option names with or without -    e.g.  ltres 0.1  or  -ltres 0.1
 - Any option can be defined in any order or left out to get the defaults
 - option values are cast to required types e.g. with parseFloat, but no error checking here
 - options.pal and option presets are not supported right now


PNG.js and PNGReader.js are saved on 2016-03-04 from

https://github.com/arian/pngjs

They have MIT license: https://github.com/arian/pngjs/blob/master/LICENSE.md
