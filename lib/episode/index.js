'use strict';

const _ = require('lodash');
const Klass = require('kist-klass');
const magnet = require('magnet-uri');
const subtitles = require('addic7ed-subtitles-api');
const leetx = require('./torrent-service/leetx');
const piratebay = require('./torrent-service/piratebay');
const extratorrent = require('./torrent-service/extratorrent');
const eztv = require('./torrent-service/eztv');
const torrentapi = require('./torrent-service/torrentapi');

module.exports = Klass.extend({

	constructor: function ( opts ) {

		if ( typeof opts === 'undefined' ) {
			throw new Error('Expected an episode configuration.');
		}

		this.show = opts.show;
		this.season = opts.season || 0;
		this.number = opts.number || 0;
		this.title = opts.title;
		this.subtitleLanguage = opts.subtitleLanguage || 1;
		this.quality = opts.quality || ['720p'];

	},

	/**
	 * @return {Promise}
	 */
	getTorrents: function () {

		return Promise.all(_.flatten([leetx, piratebay, extratorrent, eztv, torrentapi].map(( service ) => {
			return _.flatten(this.show.searchQuery.map(( q ) => {
				return this.quality.map(( quality ) => {
					return service(`${q} S${_.padStart(this.season, 2, 0)}E${_.padStart(this.number, 2, 0)} ${quality}`.trim());
				});
			}));
		})))
			.then(( res ) => {
				return _.flatten(res);
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

			})
			.then(( torrents ) => {

				// Filter PROPER releases
				const proper = _.filter(torrents, ( torrent ) => {
					return /proper/i.test(torrent.title);
				});
				// Filter all other releases
				const standard = _.difference(torrents, proper);

				// Order PROPER and other releases descendingly by number of seeds and merge arrays
				return _.flatten([proper, standard].map(( list ) => {
					return _.orderBy(list, ['seeders'], ['desc']);
				}));

			});

	},

	/**
	 * @return {Promise}
	 */
	getSubtitles: function () {

		return subtitles(this.show.addic7edId, this.season, this.number, { language: this.subtitleLanguage })
			.then(( subs ) => {
				return _.orderBy(subs, ['stats.downloads'], ['desc']);
			});

	}

});
