const recutThumbnail = require("./recut_thumbnail.js");
const saveThumbnailCropInfoToDynamo = require("./save_thumb_crop_info_to_dynamo.js");
const BadRequestException = require("./BadRequestException.js");
const NotFoundException = require("./NotFoundException.js");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const s3BucketName = process.env.IMAGE_S3_BUCKET;
const originalImagePrefix = process.env.ORIGINAL_IMAGE_S3_PREFIX;
const thumbnailImagePrefix = process.env.THUMBNAIL_IMAGE_S3_PREFIX;

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
	// event.path is passed in from the API Gateway and contains the full path
	// of the HTTP request, such as  "/thumb/path/to/image.jpg"
	if (!event.path) {
		return {
			isBase64Encoded: false,
			statusCode: 400,
			body: JSON.stringify({ errorMessage: "HTTP path cannot be empty" })
		};
	}

	// Remove the first segment of the URL path to get the image path
	const imagePath = event.path.replace("/thumb", "");

	// event.body contains the body of the HTTP request
	if (!event.body) {
		return {
			isBase64Encoded: false,
			statusCode: 400,
			body: JSON.stringify({ errorMessage: "HTTP body cannot be empty" })
		};
	}

	// Turn the body into a javascript object
	const crop = JSON.parse(event.body);

	// Validate that the body contains everything we need
	if (!crop.x || !crop.y || !crop.length) {
		return {
			isBase64Encoded: false,
			statusCode: 400,
			body: JSON.stringify({
				errorMessage: "HTTP body must contain {x:NUMBER,y:NUMBER,length:NUMBER}"
			})
		};
	}

	try {
		// Cut the new thumbnail
		await recutThumbnail(
			s3,
			s3BucketName,
			originalImagePrefix,
			thumbnailImagePrefix,
			imagePath,
			crop
		);

		// Save the crop info to Dynamo DB
		await saveThumbnailCropInfoToDynamo(
			dynamoDocClient,
			dynamoTableName,
			imagePath,
			crop
		);
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

	// Success
	return {
		isBase64Encoded: false,
		statusCode: 200,
		body: JSON.stringify({
			successMessage: "Recut thumbnail of image " + imagePath
		})
	};
};
