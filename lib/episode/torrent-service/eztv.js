'use strict';

const eztv = require('eztv.ag');
const util = require('./util');

/**
 * @param  {String} query
 *
 * @return {Promise}
 */
module.exports = ( query ) => {

	return eztv
		.search(query)
		.then(( torrents ) => {
			if ( torrents.length > 10 ) {
				return [];
			}
			return torrents.map(( torrent ) => {
				return {
					title: torrent.title,
					seeders: 0,
					leechers: 0,
					pubDate: util.resolveDate(torrent.date),
					magnetLink: torrent.magnet
				};
			});
		}, () => {
			return [];
		});

};
