/* global Promise */

var _ = require('lodash');
var request = require('request');
var pify = require('pify');
var rp = pify(request, { multiArgs: true });
var sfp = require('stream-from-promise');

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
 * @param  {Integer} id
 * @param  {Function} filterEpisodes
 *
 * @return {Stream}
 */
module.exports = function ( id, filterEpisodes ) {

	var promise = rp(_.template(sources[0])({ tvMazeId: id }))
		.then(function ( response ) {
			return transformResponse(response);
		})
		.then(function ( episodes ) {
			var flattenEpisodes = _.flatten(episodes);
			return typeof filterEpisodes === 'function' ? filterEpisodes(flattenEpisodes) : flattenEpisodes;
		})
		.then(function ( episodes ) {
			return new Buffer(JSON.stringify(episodes));
		});

	return sfp(promise);

};
