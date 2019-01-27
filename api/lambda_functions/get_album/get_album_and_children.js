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

	const album = await getAlbum(docClient, tableName, path);
	if (!album) return null; // TODO: throw exception
	const children = await getChildren(docClient, tableName, path);
	const nextAlbum = await getNextItem(docClient, tableName, path);
	const prevAlbum = await getPrevItem(docClient, tableName, path);

	return {
		album: album,
		children: children,
		next: nextAlbum,
		prev: prevAlbum
	};
}

module.exports = getAlbumAndChildren;
