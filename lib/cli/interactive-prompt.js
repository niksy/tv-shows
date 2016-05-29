/* eslint-disable no-console */

var _ = require('lodash');
var inquirer = require('inquirer');
var opn = require('opn');
var downloadShow = require('./download-show');
var downloadSubtitle = require('./download-subtitle');
var table = require('./table');
var config = require('./config');
var choiceIndex = 0;

var DOWNLOAD_ITEMS = 'downloadItems';
var SUBTITLE_ITEMS = 'subtitleItems';

/**
 * @param  {Object} show
 * @param  {Boolean} showEpisodeName
 *
 * @return {String}
 */
function prettyTitle ( show, showEpisodeName ) {
	return _.template('<%= title %> <%= season %>x<%= episodeNumber %><% if (episodeName) { %> - <%= episodeName %><% } %>')({
		title: show.title,
		season: show.episode.season,
		episodeNumber: show.episode.number,
		episodeName: showEpisodeName && show.episode.title
	});
}

/**
 * @param  {Object[]} shows
 */
function inquire ( shows ) {

	var sortedShows = _.sortByOrder(shows, ['title'], ['asc']);

	inquirer.prompt([
		{
			type: 'list',
			name: 'show',
			message: 'What TV show do you want to watch?',
			'default': choiceIndex,
			choices: _.map(sortedShows, function ( show, index ) {
				return {
					name: prettyTitle(show, true),
					value: {
						data: show,
						index: index
					}
				};
			})
		},
		{
			type: 'list',
			name: 'lookup',
			message: function ( answers ) {
				return 'What do you want to look up for "' + prettyTitle(answers.show.data) + '"?';
			},
			'default': DOWNLOAD_ITEMS,
			choices: function ( answers ) {
				var urls = answers.show.data.urls;
				return [
					{
						name: 'Download link',
						value: urls.download
					},
					{
						name: 'Subtitles',
						value: urls.subtitles
					},
					{
						name: 'Episode guide',
						value: urls.epguides
					},
					new inquirer.Separator(),
					{
						name: 'Download items',
						value: DOWNLOAD_ITEMS
					},
					{
						name: 'Subtitle items',
						value: SUBTITLE_ITEMS
					}
				];
			}
		},
		{
			type: 'list',
			name: 'itemsLookup',
			pageSize: config.maxItems,
			when: function ( answers ) {
				return [DOWNLOAD_ITEMS, SUBTITLE_ITEMS].indexOf(answers.lookup) !== -1;
			},
			message: function ( answers ) {
				if ( answers.lookup === DOWNLOAD_ITEMS ) {
					return 'What release would you like to download?';
				} else if ( answers.lookup === SUBTITLE_ITEMS ) {
					return 'What subtitle would you like to download?';
				}
			},
			choices: function ( answers ) {
				var done = this.async();
				var show = answers.show.data;

				if ( answers.lookup === DOWNLOAD_ITEMS ) {

					downloadShow.fetchDownloadItems(show.title + ' 720p')
						.then(function ( items ) {
							done(table.createDownloadShowTable(items));
						})
						.catch(function ( err ) {
							console.log(err);
						});

				} else if ( answers.lookup === SUBTITLE_ITEMS ) {

					downloadSubtitle.fetchSubtitleItems({
						title: show.title,
						season: show.episode.season,
						episode: show.episode.number
					})
						.then(function ( items ) {
							done(table.createDownloadSubtitleTable(items));
						})
						.catch(function ( err ) {
							console.log(err);
						});

				}

			}
		}
	], function ( answers ) {

		var item = answers.itemsLookup;
		choiceIndex = answers.show.index + 1;

		if ( answers.lookup === DOWNLOAD_ITEMS ) {

			downloadShow.downloadMagnetLink({
				title: item.title,
				link: item.raw.torrentLink
			})
				.then(function () {
					inquire(sortedShows);
				})
				.catch(function () {
					inquire(sortedShows);
				});

		} else if ( answers.lookup === SUBTITLE_ITEMS ) {

			downloadSubtitle.downloadSubtitle({
				title: item.title,
				fileTitle: item.raw.fileTitle,
				raw: item.raw.raw
			})
				.then(function () {
					inquire(sortedShows);
				})
				.catch(function () {
					inquire(sortedShows);
				});

		} else {
			opn(answers.lookup);
			inquire(sortedShows);
		}

	});

}

module.exports = inquire;
