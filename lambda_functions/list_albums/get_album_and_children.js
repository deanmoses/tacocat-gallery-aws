const getAlbum = require("./get_album.js");
const getChildAlbums = require("./get_child_albums.js");
const getImagesInAlbum = require("./get_images_in_album.js");

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
	const album = await getAlbum(docClient, albumTableName, albumId);
	const childAlbums = await getChildAlbums(docClient, albumTableName, albumId);
	const childImages = await getImagesInAlbum(
		docClient,
		imageTableName,
		albumId
	);

	return {
		album: album,
		childAlbums: childAlbums,
		childImages: childImages
	};
}

module.exports = getAlbumAndChildren;
