#!/usr/bin/env node

var _ = require('lodash');
var JSONStream = require('JSONStream');
var format = require('format-json-stream');
var meow = require('meow');
var spinner = require('ora')();
var humanizedDate = require('./lib/humanized-date');
var interactivePrompt = require('./lib/cli/interactive-prompt');
var getShows = require('./');
var shows = require('./tv-shows.json');
var stream, cli;

/**
 * @param  {Stream} waitedStream
 */
function waitForStream ( waitedStream ) {
	spinner.start();
	waitedStream
		.on('end', function () {
			spinner.stop();
		});
}

/**
 * @param  {Stream} episodesStream
 *
 * @return {Promise}
 */
function getEpisodesFromStream ( episodesStream ) {

	var fetchedEpisodes = [];
	return new Promise(function ( resolve ) {

		episodesStream
			.on('data', function ( data ) {
				fetchedEpisodes.push(data);
			})
			.on('end', function () {
				if ( !fetchedEpisodes.length ) {
					console.log('No TV show episodes available.');
					return;
				}
				resolve(fetchedEpisodes);
			});

	});

}

cli = meow([
	'Usage',
	'  $ tv-shows [options]',
	'',
	'Options',
	'  -o, --output-json  Output results as JSON',
	'  -d, --date [human date]  Display TV shows for given date(s)',
	'  -s, --choose-show  Choose TV show regardless of date'
].join('\n'), {
	alias: {
		o: 'output-json',
		d: 'date',
		s: 'choose-show',
		v: 'version',
		h: 'help'
	}
});

if ( cli.flags.chooseShow ) {

	interactivePrompt.chooseShowFromList(_.sortByOrder(shows, ['title'], ['asc']))
		.then(function ( answers ) {
			stream = getShows.byId(answers.showId);
			waitForStream(stream);
			return getEpisodesFromStream(stream)
				.then(function ( episodes ) {
					return _.sortByOrder(_.sortByOrder(episodes, function ( item ) {
						return item.episode.number;
					}, ['desc']), function ( item ) {
						return item.episode.season;
					}, ['desc']);
				})
				.then(function ( episodes ) {
					interactivePrompt.chooseEpisodeForShow(episodes);
					return episodes;
				});
		})
		.catch(function ( err ) {
			console.log(err);
		});

} else {

	stream = getShows.byDate(humanizedDate(cli.flags.date || 'yesterday'));
	waitForStream(stream);

	if ( cli.flags.outputJson ) {

		stream
			.pipe(JSONStream.stringify())
			.pipe(format())
			.pipe(process.stdout);

	} else {

		getEpisodesFromStream(stream)
			.then(function ( episodes ) {
				return _.sortByOrder(episodes, ['title'], ['asc']);
			})
			.then(function ( episodes ) {
				interactivePrompt.chooseEpisodeForShow(episodes);
				return episodes;
			})
			.catch(function ( err ) {
				console.log(err);
			});

	}

}
