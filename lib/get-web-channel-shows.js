/* global Promise */

var _ = require('lodash');
var formatDate = require('date-fns/format');
var shows = require('../tv-shows.json');
var getShow = require('./get-show');

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
			return show.tvMazeId;
		})
		.compact()
		.flatten()
		.value();

	return requests.map(function ( showId ) {
		return getShow(showId, function ( episodes ) {
			return episodes.filter(function ( episode ) {
				return formattedDates.indexOf(episode.airdate) !== -1;
			});
		});
	});

};
