var leetx = require('./service/1337x');
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

		return leetx.fetchDownloadItems(query)
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

		return leetx.downloadMagnetLink(showInfo)
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
