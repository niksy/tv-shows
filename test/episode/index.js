'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const Show = require('../../lib/show');

describe('Episode', function () {

	it('should throw if options are not provided', function () {

		const Fn = require('../../lib/episode');

		assert.throws(function () {
			new Fn();
		}, Error);

	});

	it('should return subtitles for episode', function () {

		const Fn = proxyquire('../../lib/episode', {
			'addic7ed-subtitles-api': () => {
				return Promise.resolve(require('./fixtures/subtitles.json'));
			}
		});

		const fn = new Fn({
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
			.then(( res ) => {
				assert.deepEqual(res, require('./fixtures/subtitles.transformed.json'));
			});

	});

	describe('Torrents for episode', function () {

		const torrentServiceMocks = {
			'./torrent-service/leetx': () => {
				return Promise.resolve(require('./fixtures/leetx.transformed.json'));
			},
			'./torrent-service/piratebay': () => {
				return Promise.resolve(require('./fixtures/piratebay.transformed.json'));
			},
			'./torrent-service/extratorrent': () => {
				return Promise.resolve(require('./fixtures/extratorrent.transformed.json'));
			},
			'./torrent-service/eztv': () => {
				return Promise.resolve(require('./fixtures/eztv.transformed.json'));
			},
			'./torrent-service/torrentapi': () => {
				return Promise.resolve(require('./fixtures/torrentapi.transformed.json'));
			}
		};

		it('should return torrents for episode', function () {

			const Fn = proxyquire('../../lib/episode', torrentServiceMocks);

			const fn = new Fn({
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
				.then(( res ) => {
					assert.deepEqual(res, require('./fixtures/filtered-torrent-list.json'));
				});

		});

		it('should return torrents for episode with excluded torrent service', function () {

			const Fn = proxyquire('../../lib/episode', torrentServiceMocks);

			const fn = new Fn({
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
				number: 4,
				torrentService: ['leetx', 'extratorrent', 'eztv', 'torrentapi']
			});

			return fn.getTorrents()
				.then(( res ) => {
					assert.deepEqual(res, require('./fixtures/filtered-excluded-service-torrent-list.json'));
				});

		});

	});

});
