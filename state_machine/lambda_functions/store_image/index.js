const getImagePath = require("./get_image_path.js");
const retrieveImageFromDynamo = require("./retrieve_image_from_dynamo.js");
const createImage = require("./create_image.js");
const updateImage = require("./update_image.js");

const AWS = require("aws-sdk");

const tableName = process.env.GALLERY_ITEM_DDB_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION
});

/**
 * A Lambda function that creates/updates the image in DynamoDB
 */
exports.handler = async event => {
	const imagePath = getImagePath(event.s3Key);

	// Retrieve image entry from DynamoDB
	const imageEntry = await retrieveImageFromDynamo(
		docClient,
		tableName,
		imagePath
	);
	const imageIsNew = !imageEntry;

	// Create the image in DynamoDB if it hasn't already been created
	if (imageIsNew) {
		await createImage(docClient, tableName, imagePath);
	}

	// Update the image entry in DynamoDB
	const metadata = event.extractedMetadata;
	return await updateImage(
		docClient,
		tableName,
		imagePath,
		imageIsNew,
		metadata
	);
};
