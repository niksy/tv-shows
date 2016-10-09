var _ = require('lodash');
var extratorrentapi = require('extratorrentapi');
var magnet = require('magnet-uri');
var util = require('./util');

/**
 * @param  {String} query
 *
 * @return {Promise}
 */
module.exports = function ( query ) {

	return extratorrentapi
		.search(query)
		.then(( torrents ) => {
			return torrents.map(( torrent ) => {
				return {
					title: torrent.title,
					seeders: util.resolveNumber(torrent.seeds),
					leechers: util.resolveNumber(torrent.leechs),
					pubDate: util.resolveDate(torrent.date),
					magnetLink: magnet.encode(_.merge({ xt: `urn:btih:${torrent.hash}` }, magnet.decode(torrent.magnetLink)))
				};
			});
		}, () => {
			return [];
		});

};
