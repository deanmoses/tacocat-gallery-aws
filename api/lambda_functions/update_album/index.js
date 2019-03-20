const AWS = require("aws-sdk");
const updateAlbum = require("./update_album.js");
const itemExists = require("./item_exists.js");
const { handleHttpExceptions } = require("http-response-utils");
const { respondHttp } = require("http-response-utils");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that updates an album's attributes (like title and description) in DynamoDB
 */
exports.handler = async event => {
	// event.path is passed in from the API Gateway and contains the full path
	// of the HTTP request, which starts with "/albums/..."
	const path = event.path.replace("/album", "");

	// event.body is passed in from the API Gateway and contains the body of
	// the HTTP request
	if (!event.body) {
		return respondHttp({ errorMessage: "HTTP body cannot be empty" }, 400);
	}
	const attributesToUpdate = JSON.parse(event.body);

	try {
		// Set up execution context
		// This is everything that updateAlbum() needs in order to execute
		// This is done to make updateAlbum() unit testable
		let ctx = {};
		ctx.tableName = tableName;
		ctx.itemExists = async itemPath => {
			return await itemExists(docClient, tableName, itemPath);
		};
		ctx.doUpdate = async dynamoParams => {
			return docClient.update(dynamoParams).promise();
		};

		// Update the album
		await updateAlbum(ctx, path, attributesToUpdate);

		// Return success
		return respondHttp({ message: "Updated" });
	} catch (e) {
		return handleHttpExceptions(e);
	}
};
