var _ = require('lodash');
var Klass = require('kist-klass');
var magnet = require('magnet-uri');
var subtitles = require('addic7ed-subtitles-api');
var leetx = require('./torrent-service/leetx');
var piratebay = require('./torrent-service/piratebay');
var extratorrent = require('./torrent-service/extratorrent');
var eztv = require('./torrent-service/eztv');
var torrentapi = require('./torrent-service/torrentapi');

module.exports = Klass.extend({

	constructor: function ( opts ) {

		if ( typeof opts === 'undefined' ) {
			throw new Error('Expected an episode configuration.');
		}

		this.show = opts.show;
		this.season = opts.season || 0;
		this.number = opts.number || 0;
		this.title = opts.title;

	},

	/**
	 * @return {Promise}
	 */
	getTorrents: function () {

		return Promise.all(_.flatten([leetx, piratebay, extratorrent, eztv, torrentapi].map(( service ) => {
			return _.flatten(this.show.searchQuery.map(( q ) => {
				return [
					service(`${q} S${_.padStart(this.season, 2, 0)}E${_.padStart(this.number, 2, 0)} 720p`)
				];
			}));
		})))
			.then(( res ) => {
				return _.flatten(res);
			})
			.then(( torrents ) => {

				// Filter PROPER releases
				var proper = _.filter(torrents, ( torrent ) => {
					return /proper/i.test(torrent.title);
				});
				// Filter all other releases
				var standard = _.difference(torrents, proper);

				// Order PROPER and other releases descendingly by number of seeds and merge arrays
				return _.flatten([proper, standard].map(( list ) => {
					return _.orderBy(list, ['seeders'], ['desc']);
				}));

			})
			.then(( torrents ) => {

				// Filter unique entries based on Magnet URI hash
				return _.uniqBy(torrents.map(( torrent ) => {
					return _.assign({}, torrent, {
						magnetHash: magnet(torrent.magnetLink).infoHash
					});
				}), 'magnetHash').map(( torrent ) => {
					return _.omit(torrent, ['magnetHash']);
				});

			});

	},

	/**
	 * @return {Promise}
	 */
	getSubtitles: function () {

		return subtitles(this.show.addic7edId, this.season, this.number)
			.then(( subs ) => {
				return _.orderBy(subs, ['stats.downloads'], ['desc']);
			});

	}

});
