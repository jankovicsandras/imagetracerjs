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

TODO

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