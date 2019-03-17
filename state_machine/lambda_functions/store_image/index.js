const createImage = require("./create_image.js");
const updateImage = require("./update_image.js");
const AWS = require("aws-sdk");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that creates/updates the image in DynamoDB
 */
exports.handler = async event => {
	// Set up the execution context
	let ctx = {};
	ctx.tableName = tableName;
	ctx.doPut = async dynamoParams => {
		return docClient.put(dynamoParams).promise();
	};
	ctx.doUpdate = async dynamoParams => {
		return docClient.update(dynamoParams).promise();
	};

	// Do the lambda's work
	return await doLambda(event, ctx);
};

/**
 * Do the lambda's work
 *
 * @param {Object} event the Lambda event
 * @param {Object} ctx the environmental context needed to do the work
 */
async function doLambda(event, ctx) {
	const imagePath = event.objectID;
	const imageMetadata = event.extractedMetadata;

	if (!imageMetadata) {
		throw "Missing all image metadata";
	}
	if (!imageMetadata.format) {
		throw "Missing image format";
	}
	if (!imageMetadata.dimensions) {
		throw "Missing image dimensions";
	}

	// Create image in DynamoDB if it doesn't exist
	await createImage(ctx, imagePath, imageMetadata);

	// Update image in DynamoDB
	await updateImage(ctx, imagePath, imageMetadata);

	// Return success to StepFunctions
	// This value is not used; it's just for debugging
	return "SUCCESS";
}
exports.doLambda = doLambda;
