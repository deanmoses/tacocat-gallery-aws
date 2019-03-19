const chooseImageThumbnail = require("./choose_album_thumbnail.js");
const AWS = require("aws-sdk");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that chooses a new thumbnail for one or more albums in DynamoDB.
 *
 * This is designed to be called by the image processing Step Function after S3
 * deletes an image that was the thumbnail for one or more albums.  For each
 * album it was the thumbnail for, it finds a new image to be its thumbnail.
 */
exports.handler = async event => {
	//
	// Set up the execution context
	//
	const ctx = {};
	ctx.tableName = tableName;
	ctx.queryChildImage = async dynamoParams => {
		return docClient.query(dynamoParams).promise();
	};
	ctx.doTransaction = async dynamoParams => {
		return docClient.transactWrite(dynamoParams).promise();
	};

	//
	// Do the lambda's work
	//
	return await chooseImageThumbnail(event, ctx);
};
