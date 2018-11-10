const AWS = require("aws-sdk");
const getChildAlbums = require("./get_child_albums.js");

const tableName = process.env.ALBUM_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that gets an album's child albums in DynamoDB
 */
exports.handler = async event => {
	return await getChildAlbums(docClient, tableName, event.albumPath);
};
