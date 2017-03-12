'use strict';

const assert = require('assert');
const Fn = require('../../lib/show');

describe('Show', function () {

	it('should throw if options are not provided', function () {

		assert.throws(function () {
			new Fn();
		}, Error);

	});

	it('should return network show episodes', function () {

		const fn = new Fn({
			title: 'House of Cards',
			webChannel: true,
			tvmazeId: 175,
			addic7edId: 3103,
			searchQuery: [
				'house of cards'
			]
		});

		return fn.getEpisodes()
			.then(( res ) => {
				assert.equal(res.length, 3);
				assert.deepEqual(res, require('./fixtures/data.json'));
			});

	});

	it('should set custom show title', function () {

		const fn = new Fn({
			title: 'House of Cards',
			webChannel: true,
			tvmazeId: 175,
			addic7edId: 3103,
			searchQuery: [
				'house of cards'
			]
		});

		fn.setTitle('Cards of House');
		assert.equal(fn.title, 'Cards of House');

	});

});
