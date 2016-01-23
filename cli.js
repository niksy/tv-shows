#!/usr/bin/env node

var JSONStream = require('JSONStream');
var format = require('format-json-stream');
var meow = require('meow');
var elegantSpinner = require('elegant-spinner');
var logUpdate = require('log-update');
var humanizedDate = require('./lib/humanized-date');
var interactivePrompt = require('./lib/interactive-prompt');
var shows = require('./');
var fetchedShows = [];
var stream, cli;

var spinner = {
	frame: elegantSpinner(),
	start: function () {
		this._spin = setInterval(function () {
			logUpdate(this.frame());
		}.bind(this), 50);
	},
	stop: function () {
		clearInterval(spinner._spin);
	}
};


process.stdin.on('keypress', function ( ch, key ) {
	if ( key && key.name === 'escape' ) {
		process.exit();
	}
});

cli = meow([
	'Usage',
	'  $ tv-shows',
	'',
	'Options',
	'  -o, --output-json  Output results as JSON',
	'  -d, --date [human date]  Display TV shows for given date(s)',
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
		logUpdate.clear();
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
			interactivePrompt(fetchedShows);
		});

}
