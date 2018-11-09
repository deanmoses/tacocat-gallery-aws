const AWS = require("aws-sdk");
//const util = require('util');
const getS3ObjectMetadata = require("./get_s3_object_metadata.js");
const getAlbumId = require("./album_id.js");
const createAlbum = require("./create_album.js");

const tableName = process.env.ALBUM_DDB_TABLE;

const s3 = new AWS.S3();

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that creates the album in DynamoDB.
 */
exports.handler = async event => {
	// console.log("Reading input from event:\n", util.inspect(event, {depth: 1}));
	const s3ObjectMetadata = await getS3ObjectMetadata(
		s3,
		event.s3Bucket,
		event.s3Key
	);
	const fileUploadTimeStamp = Math.floor(
		Date.parse(s3ObjectMetadata.LastModified) / 1000
	);
	const albumId = getAlbumId(event.s3Key);
	return createAlbum(docClient, tableName, albumId, fileUploadTimeStamp);
};
