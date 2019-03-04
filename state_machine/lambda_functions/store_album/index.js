const AWS = require("aws-sdk");
const createAlbum = require("./create_album.js");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that creates the album in DynamoDB.
 */
exports.handler = async event => {
	const albumPath = event.objectID;
	return createAlbum(docClient, tableName, albumPath);
};
