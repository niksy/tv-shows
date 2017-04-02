# tv-shows

[![Build Status][ci-img]][ci]

Personal TV shows manager.

## Install

```sh
npm install @niksy/tv-shows --save
```

## Usage

```js
const Manager = require('@niksy/tv-shows');
const manager = new Manager([
	{
		title: 'Game of Thrones',
		tvmazeId: 82,
		addic7edId: 1245,
		searchQuery: [
			'game of thrones',
			'of thrones'
		]
	},
	// ...
]);

manager.getEpisodesByDate(new Date());
manager.getEpisodesByShowId(82);
/* [
	{
		show: {
			title: 'Game of Thrones',
			webChannel: false,
			tvmazeId: 82,
			addic7edId: 1245,
			searchQuery: [
				'game of thrones',
				'of thrones'
			]
		},
		season: 6
		number: 4,
		title: 'Book of the Stranger'
	},
	// ...
] */
```

## API

### Manager(shows, [options])

Type: `Function`

#### shows

Type: `Object[]`

List of shows. See [show configuration](#show-configuration) for how to structure individual shows list item.

#### options

Type: `Object`

##### subtitleLanguage

Type: `Integer|String`  
Default: `1` (English)

Subtitles language. See [addic7ed-subtitles-api description](https://github.com/niksy/addic7ed-subtitles-api#language).

##### quality

Type: `String[]`  
Default: `['720p']`

Video/audio quality. Used in torrent search queries.

##### country

Type: `String[]`  
Defulat: `['US', 'GB']`

Countries for which schedule will be looked for.

##### excludeTorrentService

Type: `String[]`  
Default: `[]`

List of torrent services to exclude from checking. Useful when some service is down.

Available values are:

* `leetx`
* `piratebay`
* `extratorrent`
* `eztv`
* `torrentapi`

### manager.getEpisodesByDate(date)

Returns: `Promise`

Gets TV shows [episodes](#episode-api) schedule by given date.

#### date

Type: `Date`

Schedule date.

### manager.getEpisodesByShowId(id)

Returns: `Promise`

Gets TV shows [episodes](#episode-api) by given [TVmaze][tvmaze] show ID.

#### id

Type: `Number`

[TVmaze][tvmaze] show ID.

## Episode API

Every episode is instance of `Episode` class with methods for getting list of torrents and subtitles.

### episode.getTorrents()

Returns: `Promise`

Gets list of torrents for episode. Consumes APIs for several torrent trackers and sensibly sorts them:

* PROPER and REPACK releases are at the top
* Torrents with larger number of seeds are at the top
* Duplicate torrents (based on Magnet hash) are removed

### episode.getSubtitles()

Returns: `Promise`

Gets list of subtitles from [Addic7ed.com][addic7ed] for episode. Sorts list where:

* PROPER and REPACK releases are at the top
* Entries with larger number of downloads are at the top

## Show configuration

Every show is JSON object with following properties:

| Property | Type | Description |
| --- | --- | --- |
| `title` | `String` | Show title. |
| `webChannel` | `Boolean` | Is the show web channel show (e.g. Netflix production) or standard network show. |
| `tvmazeId` | `Number` | [TVmaze][tvmaze] show ID. |
| `addic7edId` | `Number` | [Addic7ed.com][addic7ed] show ID. |
| `searchQuery` | `String[]` | List of search queries used to search torrent trackers. |
| `advancedSearchQuery` | `String[]` | List of advanced search queries used to search torrent trackers. `{{ value }}` placeholders get replaced with `season` and `episode` values.  |

### Example

```json
[
	{
		"title": "Game of Thrones",
		"webChannel": false,
		"tvmazeId": 123,
		"addic7edId": 456,
		"searchQuery": [
			"game of thrones",
			"of thrones"
		],
		"advancedSearchQuery": [
			"game of thrones {{ season }} {{ episode }}"
		]
	}
]
```

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[ci]: https://travis-ci.org/niksy/tv-shows
[ci-img]: https://travis-ci.org/niksy/tv-shows.svg?branch=master
[addic7ed]: http://www.addic7ed.com/
[tvmaze]: http://www.tvmaze.com/
