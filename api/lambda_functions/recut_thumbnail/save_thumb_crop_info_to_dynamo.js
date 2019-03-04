const { NotFoundException, BadRequestException } = require("http_utils");
const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Save image thumbnail crop info to DynamoDB
 *
 * @param {Object} ctx execution context
 * @param {String} imagePath Path of the image to update, like /2001/12-31/image.jpg
 * @param {Object} crop thumbnail crop info in the format {x:INTEGER,y:INTEGER,length:INTEGER}
 *
 * @returns {Object} empty {} object if success
 * @throws exception if there's any problem
 */
async function saveThumbnailCropInfoToDynamo(ctx, imagePath, crop) {
	// Validate that the body contains everything we need
	if (!crop || !crop.x || !crop.y || !crop.length) {
		throw new BadRequestException(
			"Crop must contain {x:NUMBER,y:NUMBER,length:NUMBER}"
		);
	}
	const now = new Date().toISOString();
	crop.fileUpdatedOn = now;

	let UpdateExpression = "SET";
	let ExpressionAttributeValues = {};

	UpdateExpression += " thumbnail = :thumbnail";
	ExpressionAttributeValues[":thumbnail"] = crop;

	UpdateExpression += ", updatedOn = :updatedOn";
	ExpressionAttributeValues[":updatedOn"] = now;

	const pathParts = getParentAndNameFromPath(imagePath);

	const dynamoParams = {
		TableName: ctx.tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: UpdateExpression,
		ExpressionAttributeValues: ExpressionAttributeValues,
		ConditionExpression: "attribute_exists (itemName)"
	};

	try {
		return await ctx.doUpdate(dynamoParams);
	} catch (e) {
		if (e.toString().indexOf("conditional") !== -1) {
			throw new NotFoundException("Image not found: " + imagePath);
		} else {
			throw e;
		}
	}
}

module.exports = saveThumbnailCropInfoToDynamo;
