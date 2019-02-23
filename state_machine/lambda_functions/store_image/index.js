const getImagePath = require("./get_image_path.js");
const retrieveImageFromDynamo = require("./retrieve_image_from_dynamo.js");
const createImage = require("./create_image.js");
const updateImage = require("./update_image.js");

const getS3ObjectMetadata = require("./get_s3_object_metadata.js");

const AWS = require("aws-sdk");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

const s3 = new AWS.S3();

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that creates/updates the image in DynamoDB
 */
exports.handler = async event => {
	const imagePath = getImagePath(event.s3Key);

	// Retrieve the object's last modified date from S3
	const s3ObjectMetadata = await getS3ObjectMetadata(
		s3,
		event.s3Bucket,
		event.s3Key
	);

	// Convert last mod into a format that's acceptable to DynamoDB
	const fileUploadTimeStamp = new Date(
		Date.parse(s3ObjectMetadata.LastModified)
	).toISOString();

	// Retrieve image entry from DynamoDB
	const imageEntry = await retrieveImageFromDynamo(
		docClient,
		tableName,
		imagePath
	);
	const imageIsNew = !imageEntry;

	// Create the image in DynamoDB if it hasn't already been created
	if (imageIsNew) {
		await createImage(docClient, tableName, imagePath, fileUploadTimeStamp);
	}

	// Update the image entry in DynamoDB
	const thumbnailS3key = event.parallelNewImageResults[0];
	const metadata = event.extractedMetadata;
	const labels = event.parallelNewImageResults[0];
	return await updateImage(
		docClient,
		tableName,
		imagePath,
		imageIsNew,
		fileUploadTimeStamp,
		thumbnailS3key,
		metadata,
		labels
	);
};
