'use strict';

const tortuga = require('tortuga');
const util = require('./util');

/**
 * @param  {String} query
 *
 * @return {Promise}
 */
module.exports = ( query ) => {

	return new Promise(( resolve ) => {
		tortuga.search(query, ( torrents ) => {
			resolve(torrents);
		});
	})
		.then(( torrents ) => {
			return torrents.map(( torrent ) => {
				return {
					title: torrent.title,
					seeders: util.resolveNumber(torrent.seeders),
					leechers: util.resolveNumber(torrent.leechers),
					pubDate: util.resolveDate(torrent.date),
					magnetLink: torrent.magnet
				};
			});
		});

};
