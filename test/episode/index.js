var assert = require('assert');
var rewire = require('rewire');
var Show = require('../../lib/show');

describe('Episode', function () {

	it('should throw if options are not provided', function () {

		var Fn = require('../../lib/episode');

		assert.throws(function () {
			new Fn();
		}, Error);

	});

	it('should return torrents for episode', function () {

		var Fn = rewire('../../lib/episode');
		var fn;

		Fn.__set__('leetx', function () {
			return Promise.resolve(require('./fixtures/leetx.transformed.json'));
		});
		Fn.__set__('piratebay', function () {
			return Promise.resolve(require('./fixtures/piratebay.transformed.json'));
		});
		Fn.__set__('extratorrent', function () {
			return Promise.resolve(require('./fixtures/extratorrent.transformed.json'));
		});
		Fn.__set__('eztv', function () {
			return Promise.resolve(require('./fixtures/eztv.transformed.json'));
		});
		Fn.__set__('torrentapi', function () {
			return Promise.resolve(require('./fixtures/torrentapi.transformed.json'));
		});

		fn = new Fn({
			show: new Show({
				title: 'Game of Thrones',
				tvmazeId: 82,
				addic7edId: 1245,
				searchQuery: [
					'game of thrones',
					'of thrones'
				]
			}),
			season: 6,
			number: 4
		});

		return fn.getTorrents()
			.then(function ( res ) {
				assert.deepEqual(res, require('./fixtures/filtered-list.json'));
			});

	});

	it('should return subtitles for episode', function () {

		var Fn = rewire('../../lib/episode');
		var fn;

		Fn.__set__('subtitles', function () {
			return Promise.resolve(require('./fixtures/subtitles.json'));
		});

		fn = new Fn({
			show: new Show({
				title: 'Game of Thrones',
				tvmazeId: 82,
				addic7edId: 1245,
				searchQuery: [
					'game of thrones',
					'of thrones'
				]
			}),
			season: 6,
			number: 4
		});

		return fn.getSubtitles()
			.then(function ( res ) {
				assert.deepEqual(res, require('./fixtures/subtitles.transformed.json'));
			});

	});

});
