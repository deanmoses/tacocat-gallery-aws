const NotFoundException = require("./NotFoundException.js");
const BadRequestException = require("./BadRequestException.js");

/**
 * Update an image's attributes (like title and description) in DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} imageTableName name of the Image table in DynamoDB
 * @param {*} imageId ID of the image to get
 * @param {*} attributesToUpdate bag of attributes to update
 *
 * @returns {} if success, throws exception if there's a problem with the input
 */
async function getImage(
	docClient,
	imageTableName,
	imageId,
	attributesToUpdate
) {
	if (!imageId) {
		throw new BadRequestException("Must specify image");
	}

	validateAttributes(attributesToUpdate);

	let UpdateExpression = "SET";
	let ExpressionAttributeValues = {};

	if (attributesToUpdate.title) {
		UpdateExpression += " title = :title";
		ExpressionAttributeValues[":title"] = attributesToUpdate.title;
	}
	if (attributesToUpdate.description) {
		UpdateExpression += ",";
		UpdateExpression += " description = :description";
		ExpressionAttributeValues[":description"] = attributesToUpdate.description;
	}

	if (Object.keys(ExpressionAttributeValues).length === 0) {
		throw new BadRequestException("No attributes to update");
	}

	UpdateExpression += ", lastUpdated = :lastUpdated";
	ExpressionAttributeValues[":lastUpdated"] = Math.floor(
		new Date().getTime() / 1000
	);

	const ddbparams = {
		TableName: imageTableName,
		Key: {
			imageID: imageId
		},
		UpdateExpression: UpdateExpression,
		ExpressionAttributeValues: ExpressionAttributeValues,
		ConditionExpression: "attribute_exists (imageID)"
	};

	try {
		const result = await docClient.update(ddbparams).promise();
		return result;
	} catch (e) {
		if (e.toString().indexOf("conditional") !== -1) {
			throw new NotFoundException("Image not found: " + imageId);
		} else {
			throw e;
		}
	}
}

/**
 * Throw exception if the attributesToUpdate aren't valid
 */
function validateAttributes(attributesToUpdate) {
	if (!attributesToUpdate) {
		throw new BadRequestException("No attributes to update");
	}

	const keysToUpdate = Object.keys(attributesToUpdate);

	if (keysToUpdate.length === 0) {
		throw new BadRequestException("No attributes to update");
	}

	const validKeys = new Set(["title", "description"]);
	keysToUpdate.forEach(keyToUpdate => {
		if (!validKeys.has(keyToUpdate)) {
			throw new BadRequestException("Unknown attribute: " + keyToUpdate);
		}
	});
}

module.exports = getImage;
