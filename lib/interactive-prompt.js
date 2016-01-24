var _ = require('lodash');
var inquirer = require('inquirer');
var opn = require('opn');
var kickass = require('kickass-torrent');
var magnetLink = require('magnet-link');
var columnify = require('columnify');
var prettyDate = require('pretty-date');
var spinner = require('./spinner');
var choiceIndex = 0;

function fetchDownloadItems ( query ) {
	return new Promise(function ( resolve, reject ) {
		kickass({
			q: query,
			field: 'seeders',
			order: 'desc',
			page: 1,
			url: 'https://kat.cr'
		}, function ( err, data ) {
			if ( err ) {
				return reject(err);
			}
			resolve(data);
		});
	});
}

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

				if ( answers.lookup === 'downloadItems' ) {

					spinner.start();
					fetchDownloadItems(answers.show.data.title + ' 720p')
						.then(function ( data ) {
							spinner.stop();

							var items = _.chain(data.list)
								.where({
									verified: 1
								})
								.map(function ( item ) {
									return {
										title: item.title,
										pubDate: item.pubDate,
										seeds: item.seeds,
										torrentLink: item.torrentLink
									};
								})
								.map(function ( item ) {
									return {
										name: item.title,
										value: item
									};
								})
								.thru(function ( arr ) {

									var values = _.pluck(arr, 'value');
									var displayValues = _.map(values, function ( item ) {
										return _.extend({}, item, {
											pubDate: prettyDate.format(new Date(item.pubDate))
										});
									});
									var columns = columnify(displayValues, {
										columns: ['title', 'pubDate', 'seeds'],
										showHeaders: false,
										columnSplitter: ' | ',
										truncate: true,
										maxLineWidth: 150,
										config: {
											title: {
												maxWidth: 80
											}
										}
									}).split('\n');

									return _.map(values, function ( item, index ) {
										return {
											name: columns[index],
											short: item.title,
											value: item
										};
									});

								})
								.value();

							done(items);

						})
						.catch(function ( err ) {
							spinner.stop();
							console.log(err);
						});

				} else if ( answers.lookup === 'subtitleItems' ) {

				}

			}
		}
	], function ( answers ) {
		choiceIndex = answers.show.index + 1;

		if ( answers.lookup === 'downloadItems' ) {
			spinner.start();
			magnetLink(answers.itemsLookup.torrentLink, function ( err, link ) {
				spinner.stop();
				if ( err ) {
					return console.log(err);
				}
				opn(link);
				inquire(shows);
			});
		} else if ( answers.lookup === 'subtitleItems' ) {
		} else {
			opn(answers.lookup);
			inquire(shows);
		}

	});

}

module.exports = inquire;
