var _ = require('lodash');

function getUrl ( type, data ) {
	var url = '';
	switch ( type ) {
		case 'download':
			url = _.template('https://kat.cr/usearch?q=<%= part %>')({
				part: encodeURIComponent([data.alias.download, '720p'].join(' '))
			});
			break;
		case 'subtitles':
			url = _.template('http://www.addic7ed.com/serie/<%= part %>/<%= season %>/<%= episode %>/1')({
				part: encodeURIComponent(data.alias.subtitles),
				season: data.episode.season,
				episode: data.episode.number
			});
			break;
		case 'epguides':
			url = _.template('http://epguides.com/<%= part %>/#latest')({
				part: encodeURIComponent(data.alias.epguides)
			});
			break;
	}
	return url;
}

/**
 * @param  {Object} data
 * @param  {Object[]} shows
 *
 * @return {Object[]}
 */
module.exports = function ( data, shows ) {

	var items = _.filter(shows, function ( show ) {
		return data.id === show.tvMazeId;
	});

	return _.map(items, function ( item ) {
		if ( item ) {
			item = _.merge({}, item, _.pick(data, 'title', 'episode'));
			return _.omit(_.merge({}, item, {
				urls: {
					download: getUrl('download', item),
					subtitles: getUrl('subtitles', item),
					epguides: getUrl('epguides', item)
				}
			}), 'alias', 'tvMazeId', 'webChannelShow');
		}
		return null;
	});

};
