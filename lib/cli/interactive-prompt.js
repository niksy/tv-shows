/* eslint-disable no-console */

var _ = require('lodash');
var inquirer = require('inquirer');
var opn = require('opn');
var downloadShow = require('./download-show');
var downloadSubtitle = require('./download-subtitle');
var table = require('./table');
var config = require('./config');
var choiceIndex = 0;

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

	inquirer.prompt([
		{
			type: 'list',
			name: 'show',
			message: 'What TV show do you want to watch?',
			'default': choiceIndex,
			choices: _.map(shows, function ( show, index ) {
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
			'default': 'downloadItems',
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
						value: 'downloadItems'
					},
					{
						name: 'Subtitle items',
						value: 'subtitleItems'
					}
				];
			}
		},
		{
			type: 'list',
			name: 'itemsLookup',
			pageSize: config.maxItems,
			when: function ( answers ) {
				return ['downloadItems', 'subtitleItems'].indexOf(answers.lookup) !== -1;
			},
			message: function ( answers ) {
				if ( answers.lookup === 'downloadItems' ) {
					return 'What release would you like to download?';
				} else if ( answers.lookup === 'subtitleItems' ) {
					return 'What subtitle would you like to download?';
				}
			},
			choices: function ( answers ) {
				var done = this.async();
				var show = answers.show.data;

				if ( answers.lookup === 'downloadItems' ) {

					downloadShow.fetchDownloadItems(show.title + ' 720p')
						.then(function ( items ) {
							done(table.createDownloadShowTable(items));
						})
						.catch(function ( err ) {
							console.log(err);
						});

				} else if ( answers.lookup === 'subtitleItems' ) {

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

		if ( answers.lookup === 'downloadItems' ) {

			downloadShow.downloadMagnetLink({ title: item.title, link: item.raw.torrentLink })
				.then(function () {
					inquire(shows);
				})
				.catch(function ( err ) {
					console.log(err);
				});

		} else {
			opn(answers.lookup);
			inquire(shows);
		}

	});

}

module.exports = inquire;
