var _ = require('lodash');
var leetxapi = require('leetxapi');

module.exports = {

	fetchDownloadItems: function ( query ) {
		return leetxapi.search(query)
			.then(function ( torrents ) {
				return Promise.all(torrents.map(function ( torrent ) {
					return leetxapi.info(torrent);
				}));
			})
			.then(function ( torrents ) {
				return torrents.map(function ( torrent ) {
					return _.extend({}, _.pick(torrent, ['title', 'pubDate', 'seeds']), {
						verified: 1,
						torrentLink: torrent.magnetLink
					});
				});
			})
			.then(function ( torrents ) {
				return {
					list: torrents
				};
			})
			.catch(function ( err ) {
				throw err;
			});
	},

	downloadMagnetLink: function ( showInfo ) {
		return Promise.resolve(showInfo.link);
	}

};
