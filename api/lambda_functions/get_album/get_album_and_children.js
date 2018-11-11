const getAlbum = require("./get_album.js");
const getChildAlbums = require("./get_child_albums.js");
const getChildImages = require("./get_child_images.js");

/**
 * Retrieve an album and its child albums from DynamoDB.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} albumTableName name of the Album table in DynamoDB
 * @param {*} albumId ID of the album to get
 */
async function getAlbumAndChildren(
	docClient,
	albumTableName,
	imageTableName,
	albumId
) {
	if (albumId.lastIndexOf("/", 0) !== 0) albumId = "/" + albumId; // make sure albumId starts with a "/"

	const album = await getAlbum(docClient, albumTableName, albumId);
	if (!album) return null;
	const childAlbums = await getChildAlbums(docClient, albumTableName, albumId);
	const childImages = await getChildImages(docClient, imageTableName, albumId);

	return {
		album: album,
		childAlbums: childAlbums,
		childImages: childImages
	};
}

module.exports = getAlbumAndChildren;
