var _ = require('lodash');
var inquirer = require('inquirer');
var opn = require('opn');
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
					}
				];
			}
		}
	], function ( answers ) {
		choiceIndex = answers.show.index + 1;
		opn(answers.lookup);
		inquire(shows);
	});

}

module.exports = inquire;
