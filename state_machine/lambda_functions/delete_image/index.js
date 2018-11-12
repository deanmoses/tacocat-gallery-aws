const AWS = require("aws-sdk");
const deleteImage = require("./delete_image.js");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that deletes an image from DynamoDB
 */
exports.handler = async event => {
	// The s3 srcKey may have spaces or unicode non-ASCII characters
	const srcKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));

	// The s3 srcKey starts with "albums/".  Remove that.
	const imagePath = srcKey.substring(srcKey.indexOf("/") + 1);

	return await deleteImage(docClient, tableName, imagePath);
};
