var _ = require('lodash');
var request = require('request');
var formatDate = require('date-fns/format');

var sources = [
	'http://api.tvmaze.com/schedule?country=US&date=<%= date %>',
	'http://api.tvmaze.com/schedule?country=GB&date=<%= date %>'
];

/**
 * @param  {Date[]} dates
 *
 * @return {Stream[]}
 */
module.exports = function ( dates ) {

	return _.chain(sources)
		.map(function ( source ) {
			return _.map(dates, function ( date ) {
				return request(_.template(source)({ date: formatDate(date, 'YYYY-MM-DD') }));
			});
		})
		.compact()
		.flatten()
		.value();

};
