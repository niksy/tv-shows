var _ = require('lodash');
var inquirer = require('inquirer');
var columnify = require('columnify');
var prettyDate = require('pretty-date');
var truncateMiddle = require('truncate-middle');
var chalk = require('chalk');
var config = require('./config');

function createTable ( items, mainDataCb, columnList, columnsConfig ) {

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
				config: _.extend({}, columnsConfig)
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

		var filteredItems = _.sortByOrder(_.where(items, { verified: 1 }), ['seeds'], ['desc']);

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
			{
				title: {
					maxWidth: 80
				},
				seeds: {
					align: 'right'
				}
			}
		);

	},

	/**
	 * @param  {Object[]} items
	 *
	 * @return {Object[]}
	 */
	createDownloadSubtitleTable: function ( items ) {

		var filteredItems = _.sortByOrder(items, function ( item ) {
			return item.raw.stats.downloads;
		}, ['desc']);

		return createTable(
			filteredItems,
			function ( item ) {
				return {
					title: item.title,
					pubDate: item.raw.pubDate,
					downloads: item.raw.stats.downloads,
					description: item.raw.description
				};
			},
			['title', 'pubDate', 'downloads', 'description'],
			{
				title: {
					maxWidth: 80,
					headingTransform: function () {
						return 'Distribution'.toUpperCase();
					}
				},
				downloads: {
					align: 'right'
				},
				description: {
					dataTransform: function ( data ) {
						return truncateMiddle(data, 60, 25, '…');
					}
				}
			}
		);

	}

};
