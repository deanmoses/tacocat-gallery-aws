const BadRequestException = require("./BadRequestException.js");
const NotFoundException = require("./NotFoundException.js");
const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Save image's thumbnail crop info to DynamoDB
 *
 * @param {*} dynamoDocClient AWS DynamoDB DocumentClient
 * @param {*} dynamoTableName Name of the table in DynamoDB containing gallery items
 * @param {*} path Path of the image to update, like /2001/12-31/image.jpg
 * @param {*} crop thumbnail crop info in the format {x:INTEGER,y:INTEGER,length:INTEGER}
 *
 * @returns {} nothing if success
 * @throws exception if there's any problem
 */
async function saveThumbnailCropInfoToDynamo(
	dynamoDocClient,
	dynamoTableName,
	path,
	crop
) {
	// Validate that the body contains everything we need
	if (!crop || !crop.x || !crop.y || !crop.length) {
		throw new BadRequestException(
			"Crop must contain {x:NUMBER,y:NUMBER,length:NUMBER}"
		);
	}

	let UpdateExpression = "SET";
	let ExpressionAttributeValues = {};

	UpdateExpression += " thumbCrop = :thumbCrop";
	ExpressionAttributeValues[":thumbCrop"] = crop;

	UpdateExpression += ", updateDateTime = :updateDateTime";
	ExpressionAttributeValues[":updateDateTime"] = Math.floor(
		new Date().toJSON()
	);

	const pathParts = getParentAndNameFromPath(path);

	const dynamoParams = {
		TableName: dynamoTableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: UpdateExpression,
		ExpressionAttributeValues: ExpressionAttributeValues,
		ConditionExpression: "attribute_exists (itemName)"
	};

	try {
		const result = await dynamoDocClient.update(dynamoParams).promise();
		return result;
	} catch (e) {
		if (e.toString().indexOf("conditional") !== -1) {
			throw new NotFoundException("Image not found: " + path);
		} else {
			throw e;
		}
	}
}

module.exports = saveThumbnailCropInfoToDynamo;
