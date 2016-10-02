var eztv = require('eztv.ag');
var util = require('./util');

/**
 * @param  {String} query
 *
 * @return {Promise}
 */
module.exports = function ( query ) {

	return eztv
		.search(query)
		.then(( torrents ) => {
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
