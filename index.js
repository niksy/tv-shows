var _ = require('lodash');
var JSONStream = require('JSONStream');
var through = require('through2');
var multistream = require('multistream');
var request = require('request');
var formatDate = require('date-fns/format');
var parse = require('./lib/parse');
var humanizedDate = require('./lib/humanized-date');
var shows = require('./tv-shows.json');
var sources = require('./sources.json');

/**
 * @param  {Object[]} sources
 * @param  {Date[]} dates
 *
 * @return {Array}
 */
function getShows ( sources, dates ) {

	return _.chain(sources)
		.map(function ( source ) {
			if ( source.type === 'hrt' ) {
				return null;
			}
			return _.map(dates, function ( date ) {
				return request(_.template(source.url)({ date: formatDate(date, 'YYYY-MM-DD') }));
			});
		})
		.compact()
		.flatten()
		.value();

}

/**
 * @param  {Date[]} dates
 *
 * @return {Stream}
 */
module.exports = function ( dates ) {

	dates = _.compact([].concat(dates));

	if ( !dates.length ) {
		throw new Error('Date isn’t provided.');
	}

	return multistream(getShows(sources, dates))
		.pipe(JSONStream.parse('*'))
		.pipe(through.obj(function ( data, enc, end ) {
			var parsed = parse({
				id: data.show.id,
				title: data.show.name,
				episode: {
					season: data.season,
					number: data.number,
					title: data.name
				}
			}, shows);
			_.each(parsed, function ( item ) {
				if ( item ) {
					this.push(item);
				}
			}, this);
			end();
		}));

};
