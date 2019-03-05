const { getParentAndNameFromPath } = require("gallery-path-utils");

/**
 * Create image in DynamoDB if it has not already been created.
 *
 * This is to be called every time a new version of the item is uploaded to the
 * S3 bucket, but it will do nothing every time but the first.
 *
 * @param {Object} ctx execution context
 * @param {String} imagePath Path of the image like /2001/12-31/image.jpg
 * @param {Object} metadata EXIF and IPTC metadata extracted from the image
 */
async function createImage(ctx, imagePath, metadata) {
	const pathParts = getParentAndNameFromPath(imagePath);

	const now = new Date().toISOString();

	const dynamoItem = {
		parentPath: pathParts.parent,
		itemName: pathParts.name,
		itemType: "media",
		createdOn: now,
		updatedOn: now,
		fileUpdatedOn: now
	};

	if (metadata.title !== undefined) {
		dynamoItem.title = metadata.title;
	}

	if (metadata.description !== undefined) {
		dynamoItem.description = metadata.description;
	}

	const ddbparams = {
		TableName: ctx.tableName,
		Item: dynamoItem,
		ConditionExpression: "attribute_not_exists (itemName)"
	};

	try {
		await ctx.doPut(ddbparams);
	} catch (err) {
		// ConditionalCheckFailedException means the image exists.
		// That's not an error. Everything else is an error.
		if (err.code !== "ConditionalCheckFailedException") {
			throw err;
		}
	}
}

module.exports = createImage;
