#!/usr/bin/env node

var JSONStream = require('JSONStream');
var format = require('format-json-stream');
var shows = require('./');

shows()
	.pipe(JSONStream.stringify())
	.pipe(format())
	.pipe(process.stdout);
