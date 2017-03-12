'use strict';

const extratorrentapi = require('extratorrentapi');
const util = require('./util');

/**
 * @param  {String} query
 *
 * @return {Promise}
 */
module.exports = ( query ) => {

	return extratorrentapi
		.search(query)
		.then(( torrents ) => {
			return torrents.map(( torrent ) => {
				return {
					title: torrent.title,
					seeders: util.resolveNumber(torrent.seeds),
					leechers: util.resolveNumber(torrent.leechs),
					pubDate: util.resolveDate(torrent.pubDate),
					magnetLink: torrent.magnetLink
				};
			});
		}, () => {
			return [];
		});

};
