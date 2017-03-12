'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const timekeeper = require('timekeeper');
const hasha = require('hasha');

before(function () {
	timekeeper.freeze(new Date('2016-05-16T01:00:00.000Z'));
});

after(function () {
	timekeeper.reset();
});

describe('Torrent service: 1337x.to', function () {

	it('should return torrents based on search query', function () {

		const fn = proxyquire('../../lib/episode/torrent-service/leetx', {
			leetxapi: {
				search: () => {
					return Promise.resolve(require('./fixtures/leetx.json'));
				},
				info: ( torrent ) => {
					return Object.assign({}, torrent, {
						magnetLink: `magnet:?xt=urn:btih:${hasha(torrent.title, { algorithm: 'md5' })}`
					});
				}
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(( res ) => {
				assert.deepEqual(res, require('./fixtures/leetx.transformed.json'));
			});

	});

	it('should return empty array on rejection', function () {

		const fn = proxyquire('../../lib/episode/torrent-service/leetx', {
			leetxapi: {
				search: () => {
					return Promise.reject();
				}
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(( res ) => {
				assert.equal(res.length, 0);
			});

	});

});

describe('Torrent service: Pirate Bay', function () {

	it('should return torrents based on search query', function () {

		const fn = proxyquire('../../lib/episode/torrent-service/piratebay', {
			tortuga: {
				search: ( query, cb ) => {
					cb(require('./fixtures/piratebay.json'));
				}
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(( res ) => {
				assert.deepEqual(res, require('./fixtures/piratebay.transformed.json'));
			});

	});

});

describe('Torrent service: Extratorrents', function () {

	it('should return torrents based on search query', function () {

		const fn = proxyquire('../../lib/episode/torrent-service/extratorrent', {
			extratorrentapi: {
				search: () => {
					return Promise.resolve(require('./fixtures/extratorrent.json'));
				}
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(( res ) => {
				assert.deepEqual(res, require('./fixtures/extratorrent.transformed.json'));
			});

	});

	it('should return empty array on rejection', function () {

		const fn = proxyquire('../../lib/episode/torrent-service/extratorrent', {
			extratorrentapi: {
				search: () => {
					return Promise.reject();
				}
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(( res ) => {
				assert.equal(res.length, 0);
			});

	});

});

describe('Torrent service: EZTV.ag', function () {

	it('should return torrents based on search query', function () {

		const fn = proxyquire('../../lib/episode/torrent-service/eztv', {
			'eztv.ag': {
				search: () => {
					return Promise.resolve(require('./fixtures/eztv.json'));
				}
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(( res ) => {
				assert.deepEqual(res, require('./fixtures/eztv.transformed.json'));
			});

	});

	it('should return empty array if there are more than 10 results', function () {

		const fn = proxyquire('../../lib/episode/torrent-service/eztv', {
			'eztv.ag': {
				search: () => {
					const list = require('./fixtures/eztv.json');
					return Promise.resolve([].concat(list, list, list, list, list, list));
				}
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(( res ) => {
				assert.equal(res.length, 0);
			});

	});

	it('should return empty array on rejection', function () {

		const fn = proxyquire('../../lib/episode/torrent-service/eztv', {
			'eztv.ag': {
				search: () => {
					return Promise.reject();
				}
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(( res ) => {
				assert.equal(res.length, 0);
			});

	});

});

describe('Torrent service: Torrentapi', function () {

	it('should return torrents based on search query', function () {

		const fn = proxyquire('../../lib/episode/torrent-service/torrentapi', {
			'torrentapi-wrapper': {
				search: () => {
					return Promise.resolve(require('./fixtures/torrentapi.json'));
				}
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(( res ) => {
				assert.deepEqual(res, require('./fixtures/torrentapi.transformed.json'));
			});

	});

	it('should return empty array on rejection', function () {

		const fn = proxyquire('../../lib/episode/torrent-service/torrentapi', {
			'torrentapi-wrapper': {
				search: () => {
					return Promise.reject();
				}
			}
		});

		return fn('game of thrones s06e04 720p')
			.then(( res ) => {
				assert.equal(res.length, 0);
			});

	});

});
