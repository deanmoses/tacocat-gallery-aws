const getParentAndNameFromPath = require("./getParentAndNameFromPath.js");

/**
 * For the given path, return the parent path
 *
 * For example:
 *  - /2001/12-31/image.jpg returns  /2001/12-31/
 *  - /2001/12-31 returns /2001/
 *  - /2001 returns /
 *  - / returns  ''
 *
 * @param {String} path a path of the format /2001/12-31/image.jpg, or a subset thereof
 * @returns {String} parent path
 */
function getParentFromPath(path) {
	return getParentAndNameFromPath(path).parent;
}

module.exports = getParentFromPath;
