const getLatestItemInAlbum = require("./get_latest_item_in_album.js");

/**
 * Retrieve the latest album in the gallery from DynamoDB.  Just retrieves
 * enough information to display a thumbnail: does not retrieve any child
 * photos or child albums.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB containing gallery items
 */
async function getLatestAlbum(docClient, tableName) {
	// get current year's album
	const albumPath = "/" + new Date().getUTCFullYear() + "/";
	return getLatestItemInAlbum(docClient, tableName, albumPath);
}

module.exports = getLatestAlbum;
