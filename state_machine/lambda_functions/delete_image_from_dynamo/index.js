const AWS = require("aws-sdk");
const deleteImageFromDynamo = require("./delete_image_from_dynamo.js");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE; // Name of Dynamo DB table in which albums and images are stored

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that deletes an image from DynamoDB
 */
exports.handler = async event => {
	if (!event) throw "Undefined event";
	if (!event.objectID) throw "Undefined event.objectID";

	// Remove the image's entry from DynamoDB
	await deleteImageFromDynamo(
		docClient,
		tableName,
		event.objectID // image path
	);
	return "SUCCESS";
};
