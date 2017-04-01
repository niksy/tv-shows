'use strict';

const assert = require('assert');
const _ = require('lodash');
const networkMock = require('./helpers/network-mock');
const Fn = require('../');
const Episode = require('../lib/episode');

before(function () {
	networkMock.setup();
});

after(function () {
	networkMock.destroy();
});

describe('Manager', function () {

	it('should throw if shows configuration is not provided', function () {

		assert.throws(function () {
			new Fn();
		}, Error);

	});

	it('should reject if date is not present', function () {

		const fn = new Fn([]);

		return fn.getEpisodesByDate()
			.catch(( err ) => {
				assert.equal(err, 'Expected a date.');
			});

	});

	it('should reject if show ID is not in list of desired shows', function () {

		const fn = new Fn([
			{
				title: 'Game of Thrones',
				tvmazeId: 82,
				addic7edId: 1245,
				searchQuery: [
					'game of thrones',
					'of thrones'
				]
			}
		]);

		return fn.getEpisodesByShowId(999)
			.catch(( err ) => {
				assert.equal(err, 'No show with provided ID.');
			});

	});

	describe('By date', function () {

		const data = [
			{
				title: 'House of Cards',
				webChannel: true,
				tvmazeId: 175,
				addic7edId: 3103,
				searchQuery: [
					'house of cards'
				]
			},
			{
				title: 'Game of Thrones',
				tvmazeId: 82,
				addic7edId: 1245,
				searchQuery: [
					'game of thrones',
					'of thrones'
				]
			},
			{
				title: 'Fear the Walking Dead',
				tvmazeId: 1824,
				addic7edId: 5105,
				searchQuery: [
					'fear the walking dead'
				]
			},
			{
				title: 'Shameless',
				tvmazeId: 150,
				addic7edId: 1277,
				searchQuery: [
					'shameless',
					'shameless us'
				]
			},
			{
				title: 'The Flash',
				tvmazeId: 13,
				addic7edId: 4616,
				searchQuery: [
					'the flash',
					'the flash 2014'
				]
			},
			{
				title: 'Marvel\'s Agents of S.H.I.E.L.D.',
				tvmazeId: 31,
				addic7edId: 4010,
				searchQuery: [
					'marvels agents of',
					'agents of'
				]
			},
			{
				title: 'Sherlock',
				tvmazeId: 335,
				addic7edId: 1001,
				searchQuery: [
					'sherlock'
				]
			}
		];

		it('should return list of show episodes based on date', function () {

			const fn = new Fn(data);

			return fn.getEpisodesByDate(new Date(2013, 1, 1))
				.then(( actual ) => {
					const expected = require('./fixtures/transformed-response-get-episodes-by-date.json').map(( episode ) => {
						return new Episode({
							show: _.find(fn.shows, { tvmazeId: episode.show.id }),
							season: episode.season,
							number: episode.number,
							title: episode.name
						});
					});
					assert.deepEqual(actual, expected);
				});

		});

		it('should return list of show episodes based on date with excluded torrent service', function () {

			const fn = new Fn(data, {
				excludeTorrentService: ['piratebay']
			});

			return fn.getEpisodesByDate(new Date(2013, 1, 1))
				.then(( actual ) => {
					const expected = require('./fixtures/transformed-response-get-episodes-by-date.json').map(( episode ) => {
						return new Episode({
							show: _.find(fn.shows, { tvmazeId: episode.show.id }),
							season: episode.season,
							number: episode.number,
							title: episode.name,
							torrentService: ['leetx', 'extratorrent', 'eztv', 'torrentapi']
						});
					});
					assert.deepEqual(actual, expected);
				});

		});

	});

	describe('By show ID', function () {

		const data = [
			{
				title: 'House of Cards',
				webChannel: true,
				tvmazeId: 175,
				addic7edId: 3103,
				searchQuery: [
					'house of cards'
				]
			}
		];

		it('should return list of episodes based on show ID', function () {

			const fn = new Fn(data);

			return fn.getEpisodesByShowId(175)
				.then(( actual ) => {
					const expected = require('./show/fixtures/data.json').map(( episode ) => {
						return new Episode({
							show: _.find(fn.shows, { tvmazeId: episode.show.id }),
							season: episode.season,
							number: episode.number,
							title: episode.name
						});
					});
					assert.deepEqual(actual, expected);
				});

		});

		it('should return list of episodes based on show ID with excluded torrent service', function () {

			const fn = new Fn(data, {
				excludeTorrentService: ['piratebay']
			});

			return fn.getEpisodesByShowId(175)
				.then(( actual ) => {
					const expected = require('./show/fixtures/data.json').map(( episode ) => {
						return new Episode({
							show: _.find(fn.shows, { tvmazeId: episode.show.id }),
							season: episode.season,
							number: episode.number,
							title: episode.name,
							torrentService: ['leetx', 'extratorrent', 'eztv', 'torrentapi']
						});
					});
					assert.deepEqual(actual, expected);
				});

		});

	});

});
