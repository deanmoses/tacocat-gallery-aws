const AWS = require("aws-sdk");
const updateAlbum = require("./update_album.js");
const itemExists = require("./item_exists.js");
const NotFoundException = require("./NotFoundException.js");
const BadRequestException = require("./BadRequestException.js");

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
		return {
			isBase64Encoded: false,
			statusCode: 400,
			body: JSON.stringify({ errorMessage: "HTTP body cannot be empty" })
		};
	}
	const attributesToUpdate = JSON.parse(event.body);

	try {
		// Set up execution context
		// This is everything that updateAlbum() needs in order to execute
		// This is done to make updateAlbum() unit testable
		let ctx = {};
		ctx.tableName = tableName;
		ctx.itemExists = async thumbnailImagePath => {
			return await itemExists(docClient, tableName, thumbnailImagePath);
		};
		ctx.doUpdate = async dynamoParams => {
			return docClient.update(dynamoParams).promise();
		};

		// Update the album
		await updateAlbum(ctx, path, attributesToUpdate);

		// Return success
		return {
			statusCode: 200,
			body: JSON.stringify({ message: "Updated" }),
			isBase64Encoded: false
		};
	} catch (e) {
		if (e instanceof NotFoundException) {
			return {
				statusCode: 404,
				body: JSON.stringify({ errorMessage: e.message }),
				isBase64Encoded: false
			};
		} else if (e instanceof BadRequestException) {
			return {
				statusCode: 400,
				body: JSON.stringify({ errorMessage: e.message }),
				isBase64Encoded: false
			};
		} else {
			return {
				statusCode: 500,
				body: JSON.stringify({ errorMessage: e }), // TODO: handle case where e is not a string
				isBase64Encoded: false
			};
		}
	}
};
