const getLatestItemInAlbum = require("./get_latest_item_in_album.js");

/**
 * Retrieve the latest album in the gallery from DynamoDB.  Just retrieves
 * enough information to display a thumbnail: does not retrieve any child
 * photos or child albums.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB containing gallery items
 * @return object of format {album: {}, children: {}} or undefined if there's no album yet this year
 */
async function getLatestAlbum(docClient, tableName) {
	// get current year's album
	const albumPath = "/" + new Date().getUTCFullYear() + "/";
	const album = await getLatestItemInAlbum(docClient, tableName, albumPath);
	if (!album) return;
	else {
		const ret = {
			album: await getLatestItemInAlbum(docClient, tableName, albumPath)
		};
		return ret;
	}
}

module.exports = getLatestAlbum;
