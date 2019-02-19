const AWS = require("aws-sdk");
const deleteResizedImagesFromS3 = require("./delete_resized_images_from_s3.js");

const s3BucketName = process.env.IMAGE_S3_BUCKET; // S3 image bucket
const thumbnailImagePrefix = process.env.THUMBNAIL_IMAGE_S3_PREFIX; // S3 key prefix under which the thumbnail versions of images are stored
const largeImagePrefix = process.env.LARGE_IMAGE_S3_PREFIX; // S3 key prefix under which the large versions of images are stored

const s3 = new AWS.S3();

/**
 * A Lambda function that deletes an image from DynamoDB
 */
exports.handler = async event => {
	if (!event) throw "Undefined event";
	if (!event.objectID) throw "Undefined event.objectID";

	// Delete resized versions of the image from S3
	return await deleteResizedImagesFromS3(
		s3,
		s3BucketName,
		thumbnailImagePrefix,
		largeImagePrefix,
		event.objectID // image path
	);
};
