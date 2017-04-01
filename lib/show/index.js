'use strict';

const _ = require('lodash');
const got = require('got');
const Klass = require('kist-klass');

module.exports = Klass.extend({

	constructor: function ( opts ) {

		if ( typeof opts === 'undefined' ) {
			throw new Error('Expected a show configuration.');
		}

		this.title = opts.title;
		this.webChannel = opts.webChannel || false;
		this.tvmazeId = opts.tvmazeId;
		this.addic7edId = opts.addic7edId;
		this.searchQuery = opts.searchQuery || [this.title.toLowerCase()];
		this.advancedSearchQuery = opts.advancedSearchQuery || [];

	},

	/**
	 * @param {Object} opts
	 */
	sync: function ( opts ) {
		Object.keys(opts || {})
			.forEach(( key ) => {
				this[key] = opts[key];
			});
	},

	/**
	 * @return {Promise}
	 */
	getEpisodes: function () {

		return got(`http://api.tvmaze.com/shows/${this.tvmazeId}?embed=episodes`, { json: true })
			.then(( res ) => {

				const data = res.body;
				const rest = _.omit(data, '_embedded');
				const episodes = _.get(data, '_embedded.episodes');

				return _.map(episodes, ( episode ) => {
					return _.extend({}, episode, {
						show: rest
					});
				});

			});

	}

});
