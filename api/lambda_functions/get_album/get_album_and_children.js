const getAlbum = require("./get_album.js");
const getChildren = require("./get_children.js");
const getNextItem = require("./get_next_item.js");
const getPrevItem = require("./get_prev_item.js");

/**
 * Retrieve an album and its children (images and subalbums) from DynamoDB.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName name of the Album table in DynamoDB
 * @param {*} path path of the album to get, like /2001/12-31/
 */
async function getAlbumAndChildren(docClient, tableName, path) {
	if (path.lastIndexOf("/", 0) !== 0) path = "/" + path; // make sure albumId starts with a "/"

	let response = {};

	if (path === "/") {
		response.album = {
			title: "Dean, Lucie, Felix and Milo Moses"
		};
	} else {
		response.album = await getAlbum(docClient, tableName, path);
		if (!response.album) return null; // TODO: throw exception
		response.nextAlbum = await getNextItem(docClient, tableName, path);
		response.prevAlbum = await getPrevItem(docClient, tableName, path);
	}
	response.children = await getChildren(docClient, tableName, path);

	return response;
}

module.exports = getAlbumAndChildren;
