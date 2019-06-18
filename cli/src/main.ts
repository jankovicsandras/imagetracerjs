import { traceImage } from './cli';

const options = require('minimist')(process.argv.slice(2));
traceImage(options)