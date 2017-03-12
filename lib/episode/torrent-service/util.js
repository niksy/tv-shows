/**
 * @param  {Mixed} num
 *
 * @return {Number}
 */
module.exports.resolveNumber = ( num ) => {
	if ( num === '' || typeof num === 'undefined' || isNaN(num) ) {
		return 0;
	}
	return Number(num);
};

/**
 * @param  {Mixed} date
 *
 * @return {String}
 */
module.exports.resolveDate = ( date ) => {
	if ( date === '' || typeof date === 'undefined' ) {
		return new Date().toJSON();
	}
	return new Date(date).toJSON();
};
