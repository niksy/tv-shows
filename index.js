var _ = require('lodash');
var JSONStream = require('JSONStream');
var through = require('through2');
var multistream = require('multistream');
var parse = require('./lib/parse');
var shows = require('./tv-shows.json');
var getShow = require('./lib/get-show');
var getWebChannelShows = require('./lib/get-web-channel-shows');
var getNetworkShows = require('./lib/get-network-shows');

function parseStream ( stream ) {

	return stream
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

}

module.exports = {

	/**
	 * @param  {String} showId
	 *
	 * @return {Stream}
	 */
	byId: function ( showId ) {
		return parseStream(getShow(showId));
	},

	/**
	 * @param  {Date[]} dates
	 *
	 * @return {Stream}
	 */
	byDate: function ( dates ) {

		var compactDates = _.compact([].concat(dates));

		if ( !compactDates.length ) {
			throw new Error('Date isn’t provided.');
		}

		return parseStream(multistream([].concat(
			getNetworkShows(compactDates),
			getWebChannelShows(compactDates)
		)));

	}

};
