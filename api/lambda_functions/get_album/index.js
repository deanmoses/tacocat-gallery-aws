const AWS = require("aws-sdk");
const getAlbumAndChildren = require("./get_album_and_children.js");

const albumTableName = process.env.ALBUM_DDB_TABLE;
const imageTableName = process.env.IMAGE_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that gets an album and its child images and child albums from DynamoDB
 */
exports.handler = async event => {
	// event.path is passed in from the API Gateway and represents the full
	// path of the HTTP request, which starts with "/albums/..."
	const albumPath = event.path.replace("/album", "");
	const album = await getAlbumAndChildren(
		docClient,
		albumTableName,
		imageTableName,
		albumPath
	);
	if (!album) {
		return {
			isBase64Encoded: false,
			statusCode: 404,
			body: "Album not found: " + albumPath
		};
	} else {
		return {
			isBase64Encoded: false,
			statusCode: 200,
			body: JSON.stringify(album)
		};
	}
};
