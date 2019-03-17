/**
 * @param {String} s
 * @returns true if string is one of the empty values that DynamoDB can't save,
 * like is undefined, null or empty: any
 */
function isEmpty(s) {
	return s === undefined || s === null || s === "";
}
module.exports = isEmpty;
