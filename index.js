var _ = require('lodash');
var JSONStream = require('JSONStream');
var through = require('through2');
var multistream = require('multistream');
var parse = require('./lib/parse');
var shows = require('./tv-shows.json');
var getWebChannelShows = require('./lib/get-web-channel-shows');
var getNetworkShows = require('./lib/get-network-shows');

/**
 * @param  {Date[]} dates
 *
 * @return {Stream}
 */
module.exports = function ( dates ) {

	var compactDates = _.compact([].concat(dates));

	if ( !compactDates.length ) {
		throw new Error('Date isn’t provided.');
	}

	return multistream([].concat(
			getNetworkShows(compactDates),
			getWebChannelShows(compactDates)
		))
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
