#!/usr/bin/env node

var JSONStream = require('JSONStream');
var format = require('format-json-stream');
var meow = require('meow');
var spinner = require('ora')();
var humanizedDate = require('./lib/humanized-date');
var interactivePrompt = require('./lib/cli/interactive-prompt');
var shows = require('./');
var fetchedShows = [];
var stream, cli;

cli = meow([
	'Usage',
	'  $ tv-shows',
	'',
	'Options',
	'  -o, --output-json  Output results as JSON',
	'  -d, --date [human date]  Display TV shows for given date(s)'
].join('\n'), {
	alias: {
		o: 'output-json',
		d: 'date',
		v: 'version',
		h: 'help'
	}
});

stream = shows(humanizedDate(cli.flags.date || 'yesterday'));

spinner.start();
stream
	.on('end', function () {
		spinner.stop();
	});

if ( cli.flags.outputJson ) {

	stream
		.pipe(JSONStream.stringify())
		.pipe(format())
		.pipe(process.stdout);

} else {

	stream
		.on('data', function ( data ) {
			fetchedShows.push(data);
		})
		.on('end', function () {
			if ( !fetchedShows.length ) {
				console.log('No shows available.');
				return;
			}
			interactivePrompt(fetchedShows);
		});

}
