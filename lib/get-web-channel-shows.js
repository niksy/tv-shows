/* global Promise */

var _ = require('lodash');
var request = require('request');
var pify = require('pify');
var rp = pify(request, {multiArgs: true});
var from2 = require('from2');
var formatDate = require('date-fns/format');
var shows = require('../tv-shows.json');

var sources = [
	'http://api.tvmaze.com/shows/<%= tvMazeId %>?embed=episodes'
];

/**
 * @param  {Date[]} dates
 *
 * @return {Stream[]}
 */
module.exports = function ( dates ) {

	var formattedDates = _.map(dates, function ( date ) {
		return formatDate(date, 'YYYY-MM-DD');
	});
	var requests = _.chain(shows)
		.filter(function ( show ) {
			return show.webChannelShow;
		})
		.map(function ( show ) {
			return rp(_.template(sources[0])({ tvMazeId: show.tvMazeId }));
		})
		.compact()
		.flatten()
		.value();

	return from2.obj(function ( size, end ) {

		Promise.all(requests)
			.then(function ( responses ) {
				return _.map(responses, function ( response ) {
					var data = JSON.parse(response[1]);
					var rest = _.omit(data, '_embedded');
					var episodes = _.get(data, '_embedded.episodes');
					return _.map(episodes, function ( episode ) {
						episode.show = rest;
						return episode;
					});
				});
			})
			.then(function ( episodes ) {
				return _.chain(episodes)
					.flatten()
					.filter(function ( episode ) {
						return formattedDates.indexOf(episode.airdate) !== -1;
					})
					.value();
			})
			.then(function ( episodes ) {
				end(null, new Buffer(JSON.stringify(episodes), 'utf-8'));
			})
			.catch(function ( err ) {
				end(err);
			});

	});

};
