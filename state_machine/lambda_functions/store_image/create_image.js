const { getParentAndNameFromPath } = require("gallery-path-utils");

/**
 * Create image in DynamoDB if it has not already been created.
 *
 * I expect this to be be called every time a new version of the item is
 * uploaded to the S3 bucket, but it will do nothing every time but the
 * first.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB in which to store gallery items
 * @param {*} imagePath Path of the image like /2001/12-31/image.jpg
 */
function createImage(docClient, tableName, imagePath) {
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
	const ddbparams = {
		TableName: tableName,
		Item: dynamoItem,
		ConditionExpression: "attribute_not_exists (itemName)"
	};

	return new Promise(function(resolve, reject) {
		docClient
			.put(ddbparams)
			.promise()
			.then(data => {
				resolve(data);
			})
			.catch(err => {
				// A ConditionalCheckFailedException error means the image already
				// exists.  That's not an error.
				if (err.errorType !== "ConditionalCheckFailedException") {
					resolve("Success: image already existed");
				}
				// Every other error is a real error
				else {
					reject(err);
				}
			});
	});
}

module.exports = createImage;
