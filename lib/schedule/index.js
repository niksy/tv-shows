var _ = require('lodash');
var pify = require('pify');
var tvmaze = require('tvmaze-node');
var formatDate = require('date-fns/format');
var Klass = require('kist-klass');

module.exports = Klass.extend({

	constructor: function ( opts ) {

		if ( typeof opts === 'undefined' ) {
			throw new Error('Expected a schedule configuration.');
		}

		this.shows = opts.shows;
		this.date = opts.date;
		this.schedules = opts.schedules || ['US', 'GB'];

	},

	/**
	 * @return {Promise}
	 */
	getNetworkChannel: function () {

		var ids = this.shows.map(( show ) => {
			return show.tvmazeId;
		});

		return Promise.all(this.schedules.map(( schedule ) => {
			return pify(tvmaze.schedule)(schedule, formatDate(this.date, 'YYYY-MM-DD'));
		}))
			.then(( res ) => {
				return _.flatten(res.map(( r ) => {
					return JSON.parse(r);
				}));
			})
			.then(( episodes ) => {
				return episodes.filter(( episode ) => {
					return ids.indexOf(episode.show.id) !== -1;
				});
			});

	},

	/**
	 * @return {Promise}
	 */
	getWebChannel: function () {

		var shows = this.shows
			.filter(( show ) => {
				return show.webChannel === true;
			})
			.map(( show ) => {
				return show.getEpisodes();
			});

		return Promise.all(shows)
			.then(( res ) => {
				return _.flatten(res);
			})
			.then(( episodes ) => {
				var formattedDate = formatDate(this.date, 'YYYY-MM-DD');
				return episodes.filter(( episode ) => {
					return episode.airdate === formattedDate;
				});
			});

	}

});
