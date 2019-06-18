import { traceImage } from './nodecli';

const options = require('minimist')(process.argv.slice(2));
traceImage(options)