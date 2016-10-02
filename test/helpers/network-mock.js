var path = require('path');
var nock = require('nock');
var tvmaze;

module.exports = {
	setup: function () {

		tvmaze = nock('http://api.tvmaze.com');

		tvmaze
			.get('/schedule')
			.query({
				country: 'US',
				date: '2013-02-01'
			})
			.replyWithFile(200, path.join(__dirname, 'fixtures/us-network-shows.json'));

		tvmaze
			.get('/schedule')
			.query({
				country: 'GB',
				date: '2013-02-01'
			})
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
			.times(4)
			.replyWithFile(200, path.join(__dirname, 'fixtures/show.json'));

	},
	destroy: function () {
		tvmaze.done();
		nock.cleanAll();
	}
};
