var assert = require('assert');
var rewire = require('rewire');
var timekeeper = require('timekeeper');
var hasha = require('hasha');

before(function () {
	timekeeper.freeze(new Date('2016-05-16T01:00:00.000Z'));
});

after(function () {
	timekeeper.reset();
});

describe('Torrent service: 1337x.to', function () {

	var fn = rewire('../../lib/episode/torrent-service/leetx');

	it('should return torrents based on search query', function () {

		fn.__set__('leetx', {
			search: function () {
				return Promise.resolve(require('./fixtures/leetx.json'));
			},
			info: function ( torrent ) {
				return Object.assign({}, torrent, {
					magnetLink: `magnet:?xt=urn:btih:${hasha(torrent.title, { algorithm: 'md5' })}`
				});
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(function ( res ) {
				assert.deepEqual(res, require('./fixtures/leetx.transformed.json'));
			});

	});

	it('should return empty array on rejection', function () {

		fn.__set__('leetx', {
			search: function () {
				return Promise.reject();
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(function ( res ) {
				assert.equal(res.length, 0);
			});

	});

});

describe('Torrent service: Pirate Bay', function () {

	it('should return torrents based on search query', function () {

		var fn = rewire('../../lib/episode/torrent-service/piratebay');

		fn.__set__('tortuga', {
			search: function ( query, cb ) {
				cb(require('./fixtures/piratebay.json'));
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(function ( res ) {
				assert.deepEqual(res, require('./fixtures/piratebay.transformed.json'));
			});

	});

});

describe('Torrent service: Extratorrents', function () {

	var fn = rewire('../../lib/episode/torrent-service/extratorrent');

	it('should return torrents based on search query', function () {

		fn.__set__('extratorrentapi', {
			search: function () {
				return Promise.resolve(require('./fixtures/extratorrent.json'));
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(function ( res ) {
				assert.deepEqual(res, require('./fixtures/extratorrent.transformed.json'));
			});

	});

	it('should return empty array on rejection', function () {

		fn.__set__('extratorrentapi', {
			search: function () {
				return Promise.reject();
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(function ( res ) {
				assert.equal(res.length, 0);
			});

	});

});

describe('Torrent service: EZTV.ag', function () {

	var fn = rewire('../../lib/episode/torrent-service/eztv');

	it('should return torrents based on search query', function () {

		fn.__set__('eztv', {
			search: function () {
				return Promise.resolve(require('./fixtures/eztv.json'));
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(function ( res ) {
				assert.deepEqual(res, require('./fixtures/eztv.transformed.json'));
			});

	});

	it('should return empty array on rejection', function () {

		fn.__set__('eztv', {
			search: function () {
				return Promise.reject();
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(function ( res ) {
				assert.equal(res.length, 0);
			});

	});

});

describe('Torrent service: Torrentapi', function () {

	var fn = rewire('../../lib/episode/torrent-service/torrentapi');

	it('should return torrents based on search query', function () {

		fn.__set__('torrentapi', {
			search: function () {
				return Promise.resolve(require('./fixtures/torrentapi.json'));
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(function ( res ) {
				assert.deepEqual(res, require('./fixtures/torrentapi.transformed.json'));
			});

	});

	it('should return empty array on rejection', function () {

		fn.__set__('torrentapi', {
			search: function () {
				return Promise.reject();
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(function ( res ) {
				assert.equal(res.length, 0);
			});

	});

});
