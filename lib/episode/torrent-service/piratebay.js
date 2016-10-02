var tortuga = require('tortuga');
var util = require('./util');

/**
 * @param  {String} query
 *
 * @return {Promise}
 */
module.exports = function ( query ) {

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
