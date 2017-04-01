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

const TORRENT_SERVICE_LIST = {
	leetx: leetx,
	piratebay: piratebay,
	extratorrent: extratorrent,
	eztv: eztv,
	torrentapi: torrentapi
};

/**
 * @param  {Object[]} items
 * @param  {Function} filterItemCb
 * @param  {Function} orderItemsCb
 *
 * @return {Object[]}
 */
function sortReleases ( items, filterItemCb, orderItemsCb ) {

	// Filter PROPER releases
	const properRelease = _.filter(items, ( item ) => {
		return /proper/i.test(filterItemCb(item));
	});

	// Filter REPACK releases
	const repackRelease = _.filter(items, ( item ) => {
		return /repack/i.test(filterItemCb(item));
	});

	// Filter all other releases
	const standardRelease = _.difference(items, [].concat(properRelease, repackRelease));

	// Order PROPER, REPACK and other releases descendingly by number of seeds and merge arrays
	return _.flatten([properRelease, repackRelease, standardRelease].map(( list ) => {
		return orderItemsCb(list);
	}));

}

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
		this.torrentService = _.values(opts.torrentService ? _.pick(TORRENT_SERVICE_LIST, opts.torrentService) : TORRENT_SERVICE_LIST);

	},

	/**
	 * @return {Promise}
	 */
	getTorrents: function () {

		return Promise.all(_.flatten(this.torrentService.map(( service ) => {
			return _.flatten(
				[].concat(
					this.show.searchQuery.map(( q ) => {
						return this.quality.map(( quality ) => {
							return service(`${q} S${_.padStart(this.season, 2, 0)}E${_.padStart(this.number, 2, 0)} ${quality}`.trim());
						});
					}),
					this.show.advancedSearchQuery.map(( q ) => {
						return this.quality.map(( quality ) => {
							return service(_.template(`${q} ${quality}`.trim(), { interpolate: /{{([\s\S]+?)}}/g })({
								season: this.season,
								episode: this.number
							}));
						});
					})
				)
			);
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

				return sortReleases(
					torrents,
					( torrent ) => {
						return torrent.title;
					},
					( list ) => {
						return _.orderBy(list, ['seeders'], ['desc']);
					}
				);

			});

	},

	/**
	 * @return {Promise}
	 */
	getSubtitles: function () {

		return subtitles(this.show.addic7edId, this.season, this.number, { language: this.subtitleLanguage })
			.then(( subs ) => {

				return sortReleases(
					subs,
					( sub ) => {
						return sub.version;
					},
					( list ) => {
						return _.orderBy(list, ['stats.downloads'], ['desc']);
					}
				);

			});

	}

});

module.exports.TORRENT_SERVICE_LIST = TORRENT_SERVICE_LIST;
