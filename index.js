'use strict';

const _ = require('lodash');
const Show = require('./lib/show');
const Episode = require('./lib/episode');
const Schedule = require('./lib/schedule');
const Klass = require('kist-klass');

module.exports = Klass.extend({

	constructor: function ( shows, options ) {

		if ( typeof shows === 'undefined' ) {
			throw new Error('Expected a shows configuration.');
		}

		this.shows = shows.map(( show ) => { return new Show(show); });
		this.options = options || {};

	},

	/**
	 * @param  {Date} date
	 *
	 * @return {Promise}
	 */
	getEpisodesByDate: function ( date ) {

		if ( typeof date === 'undefined' ) {
			return Promise.reject('Expected a date.');
		}

		const schedule = new Schedule({
			shows: this.shows,
			date: date,
			country: this.options.country
		});

		return Promise.all([
			schedule.getNetworkChannel(),
			schedule.getWebChannel()
		])
			.then(( res ) => {
				return _.flatten(res);
			})
			.then(( episodes ) => {
				return episodes.map(( episode ) => {
					const show = _.find(this.shows, { tvmazeId: episode.show.id });
					if ( _.get(episode, 'show.name') ) {
						show.sync({
							title: episode.show.name
						});
					}
					return new Episode({
						show: show,
						season: episode.season,
						number: episode.number,
						title: episode.name,
						subtitleLanguage: this.options.subtitleLanguage,
						quality: this.options.quality,
						torrentService: Object.keys(_.omit(Episode.TORRENT_SERVICE_LIST, this.options.excludeTorrentService ? this.options.excludeTorrentService : []))
					});
				});
			});

	},

	/**
	 * @param  {Integer} id
	 *
	 * @return {Promise}
	 */
	getEpisodesByShowId: function ( id ) {

		if ( typeof id === 'undefined' || _.filter(this.shows, { tvmazeId: id }).length === 0 ) {
			return Promise.reject('No show with provided ID.');
		}

		const show = _.find(this.shows, { tvmazeId: id });

		return show
			.getEpisodes()
			.then(( episodes ) => {
				return episodes.map(( episode ) => {
					if ( _.get(episode, 'show.name') ) {
						show.sync({
							title: episode.show.name
						});
					}
					return new Episode({
						show: show,
						season: episode.season,
						number: episode.number,
						title: episode.name,
						subtitleLanguage: this.options.subtitleLanguage,
						quality: this.options.quality,
						torrentService: Object.keys(_.omit(Episode.TORRENT_SERVICE_LIST, this.options.excludeTorrentService ? this.options.excludeTorrentService : []))
					});
				});
			});

	}

});
