const storeImage = require("./store_image.js");
const AWS = require("aws-sdk");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that creates/updates the image in DynamoDB
 */
exports.handler = async event => {
	//
	// Set up the execution context
	//
	let ctx = {};
	ctx.tableName = tableName;
	ctx.doUpdate = async dynamoParams => {
		return docClient.update(dynamoParams).promise();
	};
	ctx.doTransaction = async dynamoParams => {
		return docClient.transactWrite(dynamoParams).promise();
	};

	//
	// Do the lambda's work
	//
	return await storeImage(event, ctx);
};
