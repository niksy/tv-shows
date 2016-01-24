var elegantSpinner = require('elegant-spinner');
var logUpdate = require('log-update');
var frame = elegantSpinner();
var _spin;

module.exports = {
	start: function () {
		_spin = setInterval(function () {
			logUpdate(frame());
		}, 50);
	},
	stop: function () {
		clearInterval(_spin);
		logUpdate.clear();
	}
};
