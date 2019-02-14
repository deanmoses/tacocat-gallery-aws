const AWS = require("aws-sdk");
const S3 = require("aws-sdk/clients/s3");
const gm = require("gm").subClass({ imageMagick: true }); // Enable ImageMagick integration.

const s3 = new S3();

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;
const s3BucketName = process.env.IMAGES_S3_BUCKET;

const docClient = new AWS.DynamoDB.DocumentClient({
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
 * @returns something like thefollowing format:
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

	// Pop off that first segment of the path
	//const imagePath = event.path.split("/").shift().join("/");
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

	const s3Object = await s3
		.getObject({
			Bucket: s3BucketName,
			Key: "albums" + imagePath
		})
		.promise();

	const buffer = await new Promise((resolve, reject) => {
		gm(s3Object.Body)
			.autoOrient()
			.crop(crop.length, crop.length, crop.x, crop.y)
			.resize(200, 200 + "^") // resize, ^ means overflow to get dimensions (shouldn't need it because I just cropped it to square)
			.interlace("Line") // aka JPEG Progressive
			.quality(85) // default is 75.  I'm seeing smaller files at 85!
			.noProfile() // remove EXIF, ICM, etc profile data
			.toBuffer("jpg", (err, buffer) => {
				if (err) {
					return reject(err);
				}
				resolve(buffer);
			});
	});

	await s3
		.upload({
			Bucket: s3BucketName,
			Key: "Thumbnail" + imagePath,
			ContentType: "image/jpeg",
			Body: buffer
		})
		.promise();

	return {
		isBase64Encoded: false,
		statusCode: 200,
		body: JSON.stringify({
			successMessage: "Successfully recut thumbnail of image " + imagePath
		})
	};
};
