const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Update a previously created image in DynamoDB.
 *
 * I expect this to be called  happen every time a new version of the item is
 * uploaded to the bucket.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB in which to store gallery items
 * @param {*} imagePath Path of the image like /2001/12-31/image.jpg
 * @param {*} imageIsNew true if the image is not being re-uploaded
 * @param {*} metadata EXIF and IPTC metadata extracted from the image
 */
function updateImage(docClient, tableName, imagePath, imageIsNew, metadata) {
	const now = new Date().toISOString();

	var UpdateExpression =
		"SET updatedOn = :updatedOn" +
		", fileUpdateOn = :fileUpdatedOn" +
		", mimeSubType = :mimeSubType" +
		", mimeSubType = :dimensions";

	var ExpressionAttributeValues = {
		":updatedOn": now,
		":fileUpdateOn": now,
		":mimeSubType": metadata.format.toLowerCase(),
		":dimensions": metadata.dimensions
	};

	if (metadata.creationTime) {
		UpdateExpression += ", capturedOn = :capturedOn";
		ExpressionAttributeValues[":capturedOn"] = metadata.creationTime;
	}

	// Don't update these if this image is being re-uploaded
	if (imageIsNew) {
		if (metadata.title) {
			UpdateExpression += ", title = :title";
			ExpressionAttributeValues[":title"] = metadata.title;
		}

		if (metadata.description) {
			UpdateExpression += ", description = :description";
			ExpressionAttributeValues[":description"] = metadata.description;
		}
	}

	if (metadata.tags) {
		UpdateExpression += ", tags = :tags";
		ExpressionAttributeValues[":tags"] = metadata.tags;
	}

	const pathParts = getParentAndNameFromPath(imagePath);
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

	return docClient.update(ddbparams).promise();
}

module.exports = updateImage;
