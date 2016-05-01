/* global Promise */

var _ = require('lodash');
var request = require('request');
var pify = require('pify');
var rp = pify(request, { multiArgs: true });
var from2 = require('from2');
var formatDate = require('date-fns/format');
var shows = require('../tv-shows.json');

var sources = [
	'http://api.tvmaze.com/shows/<%= tvMazeId %>?embed=episodes'
];

/**
 * @param  {Mixed[]} response
 *
 * @return {Object[]}
 */
function transformResponse ( response ) {
	var data = JSON.parse(response[1]);
	var rest = _.omit(data, '_embedded');
	var episodes = _.get(data, '_embedded.episodes');
	return _.map(episodes, function ( episode ) {
		return _.extend({}, episode, {
			show: rest
		});
	});
}

/**
 * @param  {Date[]} dates
 *
 * @return {Stream[]}
 */
module.exports = function ( dates ) {

	var stream = from2.obj();
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

	Promise.all(requests)
		.then(function ( responses ) {
			return _.map(responses, transformResponse);
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
			stream.push(new Buffer(JSON.stringify(episodes), 'utf-8'));
			stream.push(null);
		})
		.catch(function ( err ) {
			stream.destroy(err);
		});

	return stream;

};
