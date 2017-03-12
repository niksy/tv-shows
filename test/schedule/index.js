'use strict';

const assert = require('assert');
const Fn = require('../../lib/schedule');
const Show = require('../../lib/show');

describe('Schedule', function () {

	it('should throw if options are not provided', function () {

		assert.throws(function () {
			new Fn();
		}, Error);

	});

	it('should return no network show episodes if there aren’t any for requested date', function () {

		const fn = new Fn({
			shows: [],
			date: new Date(2016, 0, 1)
		});

		return fn.getNetworkChannel()
			.then(( res ) => {
				assert.equal(res.length, 0);
			});

	});

	it('should return network show episodes if there are any for requested date', function () {

		const fn = new Fn({
			shows: [
				new Show({
					title: 'Game of Thrones',
					tvmazeId: 82,
					addic7edId: 1245,
					searchQuery: [
						'game of thrones',
						'of thrones'
					]
				})
			],
			date: new Date(2016, 0, 1)
		});

		return fn.getNetworkChannel()
			.then(( res ) => {
				assert.equal(res.length, 1);
			});

	});

	it('should return no web channel show episodes if there aren’t any for requested date', function () {

		const fn = new Fn({
			shows: [],
			date: new Date(2016, 0, 1)
		});

		return fn.getWebChannel()
			.then(( res ) => {
				assert.equal(res.length, 0);
			});

	});

	it('should return web channel show episodes if there are any for requested date', function () {

		const fn = new Fn({
			shows: [
				new Show({
					title: 'House of Cards',
					webChannel: true,
					tvmazeId: 175,
					addic7edId: 3103,
					searchQuery: [
						'house of cards'
					]
				})
			],
			date: new Date(2013, 1, 1)
		});

		return fn.getWebChannel()
			.then(( res ) => {
				assert.equal(res.length, 3);
				assert.deepEqual(res, require('./fixtures/web-channel-show.json'));
			});

	});

});
