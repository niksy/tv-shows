'use strict';

const leetx = require('leetxapi');
const util = require('./util');

/**
 * @param  {String} query
 *
 * @return {Promise}
 */
module.exports = ( query ) => {

	return leetx.search(query)
		.then(( torrents ) => {
			return Promise.all(torrents.map(( torrent ) => {
				return leetx.info(torrent);
			}));
		})
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
		})
		.catch(() => {
			return [];
		});

};
