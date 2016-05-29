var pify = require('pify');
var kickass = require('kickass-torrent');
var magnetLink = require('magnet-link');
var opn = require('opn');
var spinner = require('ora')();

module.exports = {

	/**
	 * @param  {String} query
	 *
	 * @return {Promise}
	 */
	fetchDownloadItems: function ( query ) {

		spinner.start();

		return pify(kickass)({
			q: query,
			field: 'seeders',
			order: 'desc',
			page: 1,
			url: 'https://kat.cr'
		})
			.then(function ( data ) {
				spinner.stop();
				return data.list;
			})
			.catch(function ( err ) {
				spinner.stop();
				throw err;
			});

	},

	/**
	 * @param  {Object} showInfo
	 *
	 * @return {Promise}
	 */
	downloadMagnetLink: function ( showInfo ) {

		spinner.start();

		return pify(magnetLink)(showInfo.link)
			.then(function ( resolvedLink ) {
				spinner.stop();
				// We don’t explictly parse link since it’s in Magnet format
				opn(resolvedLink + (typeof showInfo.title !== 'undefined' ? '&dn=' + encodeURIComponent(showInfo.title + 'hdtv') : ''));
				return resolvedLink;
			})
			.catch(function ( err ) {
				spinner.stop();
				throw err;
			});

	}

};
