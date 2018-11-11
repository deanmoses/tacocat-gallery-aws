const AWS = require("aws-sdk");
const updateAlbum = require("./update_album.js");
const NotFoundException = require("./NotFoundException.js");

const albumTableName = process.env.ALBUM_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that updates an album's attributes (like title and description) in DynamoDB
 */
exports.handler = async event => {
	// event.path is passed in from the API Gateway and contains the full path
	// of the HTTP request, which starts with "/albums/..."
	const albumPath = event.path.replace("/album", "");

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

	// TODO: right now if an exception is thrown because the input data is wrong,
	// there's no catch and you get a 502 Bad Gateway. Instead, return a 400 Bad Request

	// TODO: right now an exception is thrown when there's no album,
	// which results in a 502 Bad Gateway. Instead, return a 404 Not Found

	// TODO: right now if an exception is thrown for an internal reason, there's
	// no catch and you get a 502 Bad Gateway. Instead, return a 500 internal
	// server error

	try {
		const album = await updateAlbum(
			docClient,
			albumTableName,
			albumPath,
			attributesToUpdate
		);
		return {
			statusCode: 200,
			body: JSON.stringify(album),
			isBase64Encoded: false
		};
	} catch (e) {
		if (e instanceof NotFoundException) {
			return {
				statusCode: 404,
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
