const NotFoundException = require("./NotFoundException.js");
const BadRequestException = require("./BadRequestException.js");
const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Update an album's attributes (like title and description) in DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB containing gallery items
 * @param {*} path Path of the album to update, like /2001/12-31/
 * @param {*} attributesToUpdate bag of attributes to update
 *
 * @returns {} if success, throws exception if there's a problem with the input
 */
async function getAlbum(
	docClient,
	tableName,
	path,
	attributesToUpdate
) {
	if (!path) {
		throw new BadRequestException("Must specify album");
	}

	validateAttributes(attributesToUpdate);

	const pathParts = getParentAndNameFromPath(path);

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

	UpdateExpression += ", updateDateTime = :updateDateTime";
	ExpressionAttributeValues[":updateDateTime"] = Math.floor(
		new Date().getTime() / 1000
	);

	const ddbparams = {
		TableName: tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: UpdateExpression,
		ExpressionAttributeValues: ExpressionAttributeValues,
		ConditionExpression: "attribute_exists (itemName)"
	};

	try {
		const result = await docClient.update(ddbparams).promise();
		return result;
	} catch (e) {
		if (e.toString().indexOf("conditional") !== -1) {
			throw new NotFoundException("Album not found: " + path);
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

module.exports = getAlbum;
