## TLDR; options for deterministic tracing:

custom palette, `colorquantcycles`:1

custom palette, `mincolorratio`:0

`colorsampling`:0 (false), `mincolorratio`:0, `numberofcolors`<8

`colorsampling`:0 (false), `mincolorratio`:0, `numberofcolors`:n^3 eg. 8, 27...

`colorsampling`:0 (false), `colorquantcycles`:1, `numberofcolors`<8

`colorsampling`:0 (false), `colorquantcycles`:1, `numberofcolors`:n^3 eg. 8, 27...

---

## The long story: ☺

Only color quantization uses randomization, all the other processing steps are deterministic.

There are two "sources of random" which make the `colorquantization()` non-deterministic by default, but these can be turned off. `colorquantization()` is based on [K-means clustering](https://en.wikipedia.org/wiki/K-means_clustering) , the initial palette contains the initial means. It makes often sense to use randomization creating the initial palette (see below). Some clusters may have very few members, so they should be "recycled": the new cluster center (palette color) is generated randomly. These non-deterministic defaults can be changed:

### 1. There are 3 ways to create the initial palette before color clustering, listed by priority:
- use a custom palette (deterministic) IF it's defined ELSE
- sample the input image randomly (non-deterministic) IF `colorsampling` is 1 (true, the default) ELSE 
- generate a palette
  - grayscale (deterministic) IF `numberofcolors`<8 ELSE
  - RGB cubic grid (deterministic) "from the cubic part of" `numberofcolors` AND
  - random colors (non-deterministic) "from the rest of" `numberofcolors`

So to create a deterministic initial palette: 
- use custom palette OR 
- set `colorsampling`:0 (false) AND 
  - use less than 8 colors eg. `numberofcolors`:7 OR
  - set `numberofcolors` to a cubic number eg. 8, 27, 64, 125...

### 2. Clusters which have very few members, can be "recycled" to improve clustering: 
the new cluster center (palette color) is generated randomly. This depends on `mincolorratio` : if the ratio of pixels that belong to this color (cluster) is less than `mincolorratio` , then this color will be randomized. The default 0.02 means that if fewer than 2% of all pixels are similar to this color, then this is probably a "bad" color and will be "recycled".

IF the clustering is not repeated ( `colorquantcycles`:1 ) OR no color will be recycled ( `mincolorratio`:0 ) THEN this will be deterministic.

These design choices were made so that the color quantization would be:
- flexible : the user can use a custom palette or tweak many parameters
- heuristic: sometimes it's bad but sometimes it's good, instead of being deterministic and mediocre. It's recommended to run tracing multiple times and keep the best result.
- simple to implement.

