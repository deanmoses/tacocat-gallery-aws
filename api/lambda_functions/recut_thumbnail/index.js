const recutThumbnail = require("./recut_thumbnail.js");
const saveThumbnailCropInfoToDynamo = require("./save_thumb_crop_info_to_dynamo.js");
const {
	NotFoundException,
	BadRequestException
} = require("http-response-utils");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const s3BucketName = process.env.ORIGINAL_IMAGE_BUCKET; // name of the S3 containing original image
const originalImagePrefix = process.env.ORIGINAL_IMAGE_S3_PREFIX; // S3 key prefix under which to read original image
const derivedImageBucketName = process.env.DERIVED_IMAGE_BUCKET; // name of S3 bucket in which to store resized image
const thumbnailImagePrefix = process.env.THUMBNAIL_IMAGE_S3_PREFIX; // S3 key prefix under which to store resized image
const edgeSize = process.env.THUMBNAIL_IMAGE_SIZE; // longest edge of the resized image, in pixels
const jpegQuality = process.env.THUMBNAIL_IMAGE_QUALITY; // JPEG quality of the resized image

const dynamoTableName = process.env.GALLERY_ITEM_DDB_TABLE;
const dynamoDocClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * Generate a thumbnail of an image stored in s3 and store the thumbnail back in the same bucket under the "Thumbnail/" prefix.
 *
 * @param event an event object coming from AWS API Gateway. It should have the following format:
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
 *
 * @returns something like the following format, as required by AWS API Gateway:
 * 		{
 * 			isBase64Encoded: false,
 *			statusCode: 400,
 *			body: JSON.stringify({ errorMessage: "Some error message" })
 * 		}
 */
exports.handler = async event => {
	const ctx = {
		s3: s3,
		s3BucketName: s3BucketName,
		originalImagePrefix: originalImagePrefix,
		derivedImageBucketName: derivedImageBucketName,
		thumbnailImagePrefix: thumbnailImagePrefix,
		edgeSize: edgeSize,
		jpegQuality: jpegQuality,
		event: event
	};

	return await doIt(ctx);
};

async function doIt(ctx) {
	if (!ctx) throw "Undefined ctx";
	if (!ctx.s3BucketName) throw "Undefined s3BucketName";
	if (!ctx.originalImagePrefix) throw "Undefined originalImagePrefix";
	if (!ctx.derivedImageBucketName) throw "Undefined derivedImageBucketName";
	if (!ctx.thumbnailImagePrefix) throw "Undefined thumbnailImagePrefix";
	if (!ctx.edgeSize) throw "Undefined edgeSize";
	if (!ctx.jpegQuality) throw "Undefined jpegQuality";
	if (!ctx.event) throw "Undefined event";

	// event.path is passed in from the API Gateway and contains the full path
	// of the HTTP request, such as  "/thumb/2001/12-31/image.jpg"
	if (!ctx.event.path) {
		return {
			isBase64Encoded: false,
			statusCode: 400,
			body: JSON.stringify({ errorMessage: "HTTP path cannot be empty" })
		};
	}

	// Remove the first segment of the URL path to get the image path
	const imagePath = ctx.event.path.replace("/thumb", "");

	// event.body contains the body of the HTTP request
	if (!ctx.event.body) {
		return {
			isBase64Encoded: false,
			statusCode: 400,
			body: JSON.stringify({ errorMessage: "HTTP body cannot be empty" })
		};
	}

	// Turn the body into a javascript object
	let crop = JSON.parse(ctx.event.body);

	try {
		// Cut the new thumbnail
		crop = await recutThumbnail(
			ctx.s3,
			ctx.s3BucketName,
			ctx.originalImagePrefix,
			ctx.derivedImageBucketName,
			ctx.thumbnailImagePrefix,
			ctx.edgeSize,
			ctx.jpegQuality,
			imagePath,
			crop
		);

		// Set up execution context for saveThumbnailCropInfoToDynamo()
		// This is everything the method needs in order to execute
		// This is done to make the method unit testable
		ctx = {};
		ctx.tableName = dynamoTableName;
		ctx.doUpdate = async dynamoParams => {
			return dynamoDocClient.update(dynamoParams).promise();
		};

		// Save the crop to Dynamo
		await saveThumbnailCropInfoToDynamo(ctx, imagePath, crop);

		// Success
		return {
			isBase64Encoded: false,
			statusCode: 200,
			body: JSON.stringify({
				successMessage: "Recut thumbnail of image " + imagePath
			})
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
}
exports.doIt = doIt;
