var _ = require('lodash');
var JSONStream = require('JSONStream');
var through = require('through2');
var multistream = require('multistream');
var request = require('request');
var moment = require('moment');
var parse = require('./lib/parse');
var shows = require('./tv-shows.json');
var sources = require('./sources.json');

/**
 * @param  {Object[]} sources
 *
 * @return {Array}
 */
function getShowsFromSources ( sources ) {
	var yesterday = moment().add(-1, 'days').format('YYYY-MM-DD');
	var arr = [];
	_.each(sources, function ( source ) {
		if ( source.type !== 'hrt' ) {
			arr.push(request(source.url.replace('{{ YYYY-MM-DD }}', yesterday)));
		}
	});
	return arr;
}

module.exports = function () {

	return multistream(getShowsFromSources(sources))
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
