'use strict';

const _ = require('lodash');
const got = require('got');
const formatDate = require('date-fns/format');
const Klass = require('kist-klass');

module.exports = Klass.extend({

	constructor: function ( opts ) {

		if ( typeof opts === 'undefined' ) {
			throw new Error('Expected a schedule configuration.');
		}

		this.shows = opts.shows;
		this.date = opts.date;
		this.country = opts.country || ['US', 'GB'];

	},

	/**
	 * @return {Promise}
	 */
	getNetworkChannel: function () {

		const ids = this.shows.map(( show ) => {
			return show.tvmazeId;
		});

		return Promise.all(this.country.map(( country ) => {
			return got(`http://api.tvmaze.com/schedule?country=${country}&date=${formatDate(this.date, 'YYYY-MM-DD')}`, { json: true });
		}))
			.then(( ress ) => {
				return _.flatten(ress.map(( res ) => {
					return res.body;
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

		const shows = this.shows
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
				const formattedDate = formatDate(this.date, 'YYYY-MM-DD');
				return episodes.filter(( episode ) => {
					return episode.airdate === formattedDate;
				});
			});

	}

});
