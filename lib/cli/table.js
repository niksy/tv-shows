var _ = require('lodash');
var inquirer = require('inquirer');
var columnify = require('columnify');
var prettyDate = require('pretty-date');
var chalk = require('chalk');
var config = require('./config');

function createTable ( items, mainDataCb, columnList, columnsConfig, sortByOrder ) {

	if ( typeof sortByOrder === 'undefined' ) {
		sortByOrder = [[], []];
	}

	return _.chain(items)
		.slice(0, config.maxItems)
		.map(function ( item ) {
			return _.extend({}, mainDataCb(item), {
				raw: item
			});
		})
		.map(function ( item ) {
			return {
				name: item.title,
				value: item
			};
		})
		.thru(function ( arr ) {

			var values = _.pluck(arr, 'value');
			var displayValues = _.chain(values)
				.map(function ( item ) {
					return _.extend({}, item, {
						pubDate: new Date(item.pubDate).getTime()
					});
				})
				.sortByOrder(sortByOrder[0], sortByOrder[1])
				.map(function ( item ) {
					return _.extend({}, item, {
						pubDate: prettyDate.format(new Date(item.pubDate))
					});
				})
				.value();

			var columns = columnify(displayValues, {
				columns: columnList,
				showHeaders: true,
				columnSplitter: chalk.dim(' | '),
				truncate: true,
				maxLineWidth: 150,
				config: _.extend({}, {
					title: {
						maxWidth: 80
					},
					seeds: {
						align: 'right'
					}
				}, columnsConfig)
			}).split('\n');

			var sep = columns.shift();
			var finalValues = _.map(values, function ( item, index ) {
				return {
					name: columns[index],
					'short': item.title,
					value: item
				};
			});
			finalValues.unshift(new inquirer.Separator(sep));

			return finalValues;

		})
		.value();

}

module.exports = {

	/**
	 * @param  {Object[]} items
	 *
	 * @return {Object[]}
	 */
	createDownloadShowTable: function ( items ) {

		var filteredItems = _.chain(items)
			.where({
				verified: 1
			})
			.value();

		return createTable(
			filteredItems,
			function ( item ) {
				return {
					title: item.title,
					pubDate: item.pubDate,
					seeds: item.seeds
				};
			},
			['title', 'pubDate', 'seeds'],
			null,
			[['seeds'], ['desc']]
		);

	},

	/**
	 * @param  {Object[]} items
	 *
	 * @return {Object[]}
	 */
	createDownloadSubtitleTable: function ( items ) {

		var filteredItems = items;

		return createTable(
			filteredItems,
			function ( item ) {
				return {
					title: item.title,
					pubDate: item.raw.pubDate,
					downloads: item.raw.stats.downloads,
					description: item.raw.description,
					worksWith: item.raw.worksWith.join(', ')
				};
			},
			['title', 'pubDate', 'downloads', 'description', 'worksWith'],
			{
				worksWith: {
					headingTransform: function () {
						return 'Works with'.toUpperCase();
					}
				}
			},
			[['downloads'], ['desc']]
		);

	}

};