const AWS = require("aws-sdk");
const getS3ObjectMetadata = require("./get_s3_object_metadata.js");
const getAlbumPathFromS3key = require("./album_id.js");
const createAlbum = require("./create_album.js");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

const s3 = new AWS.S3();

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that creates the album in DynamoDB.
 */
exports.handler = async event => {
	const s3ObjectMetadata = await getS3ObjectMetadata(
		s3,
		event.s3Bucket,
		event.s3Key
	);
	const fileUploadTimeStamp = new Date(
		Date.parse(s3ObjectMetadata.LastModified)
	).toJSON();

	const albumPath = getAlbumPathFromS3key(event.s3Key);
	return createAlbum(docClient, tableName, albumPath, fileUploadTimeStamp);
};
