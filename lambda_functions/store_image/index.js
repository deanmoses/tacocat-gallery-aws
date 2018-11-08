const getImageId = require("./image_id.js");
const getAlbumId = require("./album_id.js");
const createImage = require("./create_image.js");
const updateImage = require("./update_image.js");
const getS3ObjectMetadata = require("./get_s3_object_metadata.js");

const AWS = require("aws-sdk");
//const util = require("util");

const tableName = process.env.IMAGE_DDB_TABLE;

const s3 = new AWS.S3();

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that creates/updates the image in DynamoDB.
 */
exports.handler = async (event) => {
    // console.log("Reading input from event:\n", util.inspect(event, {depth: 5}));
    const imageId = getImageId(event.s3Key);
    const albumId = getAlbumId(event.s3Key);
	await createImage(docClient, tableName, imageId, albumId);

	const s3ObjectMetadata = await getS3ObjectMetadata(s3, event.s3Bucket, event.s3Key);
	const fileUploadTimeStamp = Math.floor(Date.parse(s3ObjectMetadata.LastModified) / 1000);
	const thumbnailS3key = event.parallelResults[0];
	const metadata = event.extractedMetadata;
	const labels = event.parallelResults[0];
	return await updateImage(docClient, tableName, imageId, fileUploadTimeStamp, thumbnailS3key, metadata, labels);
};