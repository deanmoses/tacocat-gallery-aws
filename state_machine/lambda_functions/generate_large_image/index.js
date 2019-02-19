const gm = require("gm").subClass({ imageMagick: true }); // Enable ImageMagick integration
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const largeImagePrefix = process.env.LARGE_IMAGE_S3_PREFIX; // S3 key prefix under which to store resized image
const longestEdgeOfImage = process.env.LARGE_IMAGE_SIZE; // longest edge of the resized image, in pixels
const jpegQuality = process.env.LARGE_IMAGE_QUALITY; // JPEG quality of the resized image

/**
 * Generate a large version of the image stored in S3 and store the resized version back in the same bucket.
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
	if (!largeImagePrefix) throw "Undefined largeImagePrefix";
	if (!longestEdgeOfImage) throw "Undefined longestEdgeOfImage";
	if (!jpegQuality) throw "Undefined jpegQuality";
	if (!event) throw "Undefined event";
	if (!event.s3Bucket) throw "Undefined event.s3Bucket";
	if (!event.s3Key) throw "Undefined event.s3Key";
	if (!event.objectID) throw "Undefined event.objectID";

	// S3 bucket containing image
	const s3BucketName = event.s3Bucket;

	// S3 key of original image.  Strip out spaces and unicode non-ASCII characters
	const srcKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));

	// Get original image
	const s3Object = await s3
		.getObject({
			Bucket: s3BucketName,
			Key: srcKey
		})
		.promise();

	// Cut large version of image
	const buffer = await new Promise((resolve, reject) => {
		gm(s3Object.Body)
			.autoOrient()
			.resize(longestEdgeOfImage, longestEdgeOfImage)
			.interlace("Line") // aka JPEG Progressive
			.quality(jpegQuality)
			.noProfile() // remove EXIF, ICM, etc profile data // TODO: add copyright info
			.toBuffer("jpg", (err, buffer) => {
				if (err) {
					return reject(err);
				}
				resolve(buffer);
			});
	});

	// Write the large version of image to S3
	const destinationKey = largeImagePrefix + "/" + event.objectID;
	await s3
		.upload({
			Bucket: s3BucketName,
			Key: destinationKey,
			ContentType: "image/" + event.extractedMetadata.format.toLowerCase(),
			Body: buffer
		})
		.promise();

	// Return S3 location of the large version of the image
	return { s3Bucket: s3BucketName, s3Key: destinationKey };
};
