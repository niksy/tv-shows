var pify = require('pify');
var kickass = require('kickass-torrent');
var magnetLink = require('magnet-link');

module.exports = {

	fetchDownloadItems: function ( query ) {
		return pify(kickass)({
			q: query,
			field: 'seeders',
			order: 'desc',
			page: 1,
			url: 'https://kat.cr'
		});
	},

	downloadMagnetLink: function ( showInfo ) {
		return pify(magnetLink)(showInfo.link);
	}

};
