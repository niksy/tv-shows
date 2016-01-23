var _ = require('lodash');
var subtractDays = require('date-fns/sub_days');
var subtractWeeks = require('date-fns/sub_weeks');

var constructs = [
	{
		re: /^(\d{1,}) days? ago$/,
		transform: function ( num ) {
			return subtractDays(new Date(), Number(num));
		}
	},
	{
		re: /^last (\d{1,}) days$/,
		transform: function ( num ) {
			return _.chain(_.range(0, Number(num)))
				.map(function ( item ) {
					return subtractDays(subtractDays(new Date(), 1), item);
				})
				.value();
		}
	},
	{
		re: /^last week$/,
		transform: function () {
			return subtractWeeks(new Date(), 1);
		}
	},
	{
		re: /^yesterday$/,
		transform: function () {
			return subtractDays(new Date(), 1);
		}
	}
];

module.exports = function ( query ) {

	var cleanQuery = query.trim();
	var matchedConstruct = _.find(constructs, function ( construct ) {
		return construct.re.test(cleanQuery);
	});
	var matches;

	if ( matchedConstruct ) {
		matches = matchedConstruct.re.exec(cleanQuery);
		return matchedConstruct.transform.apply(null, matches.slice(1));
	}
	return new Date();

};
