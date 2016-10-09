var _ = require('lodash');
var Show = require('./lib/show');
var Episode = require('./lib/episode');
var Schedule = require('./lib/schedule');
var Klass = require('kist-klass');

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

		var schedule;

		if ( typeof date === 'undefined' ) {
			return Promise.reject('Expected a date.');
		}

		schedule = new Schedule({
			shows: this.shows,
			date: date
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
					var show = _.find(this.shows, { tvmazeId: episode.show.id });
					if ( _.get(episode, 'show.name') ) {
						show.setTitle(episode.show.name);
					}
					return new Episode({
						show: show,
						season: episode.season,
						number: episode.number,
						title: episode.name,
						subtitleLanguage: this.options.subtitleLanguage
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

		var show;

		if ( typeof id === 'undefined' || _.filter(this.shows, { tvmazeId: id }).length === 0 ) {
			return Promise.reject('No show with provided ID.');
		}

		show = _.find(this.shows, { tvmazeId: id });

		return show
			.getEpisodes()
			.then(( episodes ) => {
				return episodes.map(( episode ) => {
					if ( _.get(episode, 'show.name') ) {
						show.setTitle(episode.show.name);
					}
					return new Episode({
						show: show,
						season: episode.season,
						number: episode.number,
						title: episode.name,
						subtitleLanguage: this.options.subtitleLanguage
					});
				});
			});

	}

});
