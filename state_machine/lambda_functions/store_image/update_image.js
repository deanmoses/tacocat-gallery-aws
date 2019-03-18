const { getParentAndNameFromPath } = require("gallery-path-utils");
const { DynamoUpdateBuilder } = require("dynamo-utils");

/**
 * Update an already-existing image in DynamoDB.
 *
 * To be called every time a new version of the image is uploaded to S3.
 *
 * @param {Object} ctx execution context
 * @param {String} imagePath Path of the image like /2001/12-31/image.jpg
 * @param {Object} metadata EXIF and IPTC metadata extracted from the image
 * @param {String} imageUpdatedOn ISO 8601 timestamp of when image was last updated
 *
 * @returns {Object} DynamoDB update command
 */
async function updateImage(ctx, imagePath, metadata, imageUpdatedOn) {
	const pathParts = getParentAndNameFromPath(imagePath);
	const now = new Date().toISOString();

	const bldr = new DynamoUpdateBuilder();
	bldr.setIfNotExists("itemType", "media");
	bldr.setIfNotExists("createdOn", now);
	bldr.setIfNotExists("title", metadata.title);
	bldr.setIfNotExists("description", metadata.description);
	bldr.add("updatedOn", now);
	bldr.add("fileUpdatedOn", imageUpdatedOn);
	bldr.add("mimeSubType", metadata.format.toLowerCase()); // Don't validate metadata: already done in the transform metadata step
	bldr.add("dimensions", metadata.dimensions); // Don't validate metadata: already done in the transform metadata step
	bldr.add("capturedOn", metadata.creationTime); // Don't validate metadata: already done in the transform metadata step
	bldr.add("tags", metadata.tags); // Don't validate metadata: already done in the transform metadata step

	const dynamoParams = {
		TableName: ctx.tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		UpdateExpression: bldr.getUpdateExpression(),
		ExpressionAttributeValues: bldr.getExpressionAttributeValues()
	};

	await ctx.doUpdate(dynamoParams);
}
module.exports = updateImage;
