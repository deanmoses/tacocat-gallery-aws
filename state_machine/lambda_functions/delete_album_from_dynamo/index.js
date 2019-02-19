const AWS = require("aws-sdk");
const deleteAlbumFromDynamo = require("./delete_album_from_dynamo.js");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that deletes an album from DynamoDB
 */
exports.handler = async event => {
	// The s3 srcKey may have spaces or unicode non-ASCII characters
	const srcKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));

	// albumPath will be something like albumName/subalbumName
	var albumPath = srcKey; // The s3 srcKey is something like albums/albumName/subalbumName/
	albumPath = albumPath.substring(albumPath.indexOf("/") + 1); // strip "albums/"
	albumPath = albumPath.substring(0, albumPath.lastIndexOf("/")); // strip last "/"

	return await deleteAlbumFromDynamo(docClient, tableName, albumPath);
};
