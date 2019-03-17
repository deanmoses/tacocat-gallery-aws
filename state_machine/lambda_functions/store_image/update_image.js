const { getParentAndNameFromPath } = require("gallery-path-utils");
const { DynamoUpdateBuilder } = require("dynamo-utils");

/**
 * Update image in DynamoDB.
 *
 * To be called every time a new version of the image is uploaded to S3.
 *
 * @param {Object} ctx execution context
 * @param {String} imagePath Path of the image like /2001/12-31/image.jpg
 * @param {Object} metadata EXIF and IPTC metadata extracted from the image
 *
 * @returns {Object} result from DynamoDB if success, throws exception if there's a problem with the input
 */
async function updateImage(ctx, imagePath, metadata) {
	const now = new Date().toISOString();

	const bldr = new DynamoUpdateBuilder();
	bldr.add("updatedOn", now);
	bldr.add("fileUpdatedOn", now);
	bldr.add("mimeSubType", metadata.format.toLowerCase());
	bldr.add("dimensions", metadata.dimensions);
	bldr.add("capturedOn", metadata.creationTime); // Don't check the date format: that was done in the transform metadata step
	bldr.add("tags", metadata.tags);

	//
	// Construct the DynamoDB update statement
	//

	const pathParts = getParentAndNameFromPath(imagePath);
	const ddbparams = {
		TableName: ctx.tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: bldr.getUpdateExpression(),
		ExpressionAttributeValues: bldr.getExpressionAttributeValues(),
		ConditionExpression: "attribute_exists (itemName)"
	};

	//
	// Send update to DynamoDB
	//

	await ctx.doUpdate(ddbparams);
}
module.exports = updateImage;
