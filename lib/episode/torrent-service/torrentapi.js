'use strict';

const torrentapi = require('torrentapi-wrapper');
const util = require('./util');

/**
 * @param  {String} query
 *
 * @return {Promise}
 */
module.exports = ( query ) => {

	return torrentapi.search({
		query: query,
		limit: 10
	})
		.then(( torrents ) => {
			return torrents.map(( torrent ) => {
				return {
					title: torrent.title,
					seeders: util.resolveNumber(torrent.seeders),
					leechers: util.resolveNumber(torrent.leechers),
					pubDate: util.resolveDate(torrent.pubdate),
					magnetLink: torrent.download
				};
			});
		}, () => {
			return [];
		});

};
