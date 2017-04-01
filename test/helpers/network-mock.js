'use strict';

const path = require('path');
const nock = require('nock');
let tvmaze;

module.exports = {
	setup: () => {

		tvmaze = nock('http://api.tvmaze.com');

		tvmaze
			.get('/schedule')
			.query({
				country: 'US',
				date: '2013-02-01'
			})
			.times(2)
			.replyWithFile(200, path.join(__dirname, 'fixtures/us-network-shows.json'));

		tvmaze
			.get('/schedule')
			.query({
				country: 'GB',
				date: '2013-02-01'
			})
			.times(2)
			.replyWithFile(200, path.join(__dirname, 'fixtures/uk-network-shows.json'));

		tvmaze
			.get('/schedule')
			.query({
				country: 'US',
				date: '2016-01-01'
			})
			.times(2)
			.replyWithFile(200, path.join(__dirname, 'fixtures/us-network-shows.json'));

		tvmaze
			.get('/schedule')
			.query({
				country: 'GB',
				date: '2016-01-01'
			})
			.times(2)
			.replyWithFile(200, path.join(__dirname, 'fixtures/uk-network-shows.json'));

		tvmaze
			.get('/shows/175')
			.query({
				embed: 'episodes'
			})
			.times(6)
			.replyWithFile(200, path.join(__dirname, 'fixtures/show.json'));

	},
	destroy: () => {
		tvmaze.done();
		nock.cleanAll();
	}
};
