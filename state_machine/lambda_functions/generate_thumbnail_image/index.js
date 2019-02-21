const gm = require("gm").subClass({ imageMagick: true }); // Enable ImageMagick integration
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const derivedImageBucketName = process.env.DERIVED_IMAGE_BUCKET; // name of S3 bucket in which to store resized image
const thumbnailImagePrefix = process.env.THUMBNAIL_IMAGE_S3_PREFIX; // S3 key prefix under which to store the resized image
const edgeSize = process.env.THUMBNAIL_IMAGE_SIZE; // longest edge of the resized image, in pixels
const jpegQuality = process.env.THUMBNAIL_IMAGE_QUALITY; // JPEG quality of the resized image

/**
 * Generate a thumbnail version of the image stored in S3 and store the resized version back in the same bucket.
 *
 * @param event coming from Amazon Step Functions.  It should have the following format:
 *          {
 *                "s3Bucket": "mybucket",
 *                "s3Key": "mykey",
 *                "objectID": "l3j4234-234",
 *                "extractedMetadata": {
 *                   "dimensions": {
 *                      "width": 4567,
 *                      "height": 3456
 *                   }
 *                }
 *          }
 */
exports.handler = async event => {
	if (!thumbnailImagePrefix) throw "Undefined thumbnailImagePrefix";
	if (!edgeSize) throw "Undefined edgeSize";
	if (!jpegQuality) throw "Undefined jpegQuality";
	if (!event) throw "Undefined event";
	if (!event.s3Bucket) throw "Undefined event.s3Bucket";
	if (!event.s3Key) throw "Undefined event.s3Key";
	if (!event.objectID) throw "Undefined event.objectID";

	// S3 bucket containing image
	const s3BucketName = event.s3Bucket;

	// S3 key of original image.  Strip out spaces and unicode non-ASCII characters
	const originalImageKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));

	// Get original image
	const s3Object = await s3
		.getObject({
			Bucket: s3BucketName,
			Key: originalImageKey
		})
		.promise();

	// Cut thumbnail version of image
	const buffer = await new Promise((resolve, reject) => {
		gm(s3Object.Body)
			.autoOrient()
			.resize(edgeSize, edgeSize + "^") // resize, ^ means overflow to get dimensions
			.gravity("Center") // set thumb cutting to center
			.extent(edgeSize, edgeSize) // draw white background, in case thumb doesn't fill image
			.interlace("Line") // aka JPEG Progressive
			.quality(jpegQuality)
			.noProfile() // remove EXIF, ICM, etc profile data // TODO: preserve or insert copyright
			.toBuffer("jpg", (err, buffer) => {
				if (err) {
					return reject(err);
				}
				resolve(buffer);
			});
	});

	// Write the thumbnail version of image to S3
	const destinationKey = thumbnailImagePrefix + "/" + event.objectID;
	await s3
		.upload({
			Bucket: derivedImageBucketName,
			Key: destinationKey,
			ContentType: "image/jpeg",
			Body: buffer
		})
		.promise();

	// Return S3 location of the thumbnail version of the image
	return { s3Bucket: derivedImageBucketName, s3Key: destinationKey };
};
