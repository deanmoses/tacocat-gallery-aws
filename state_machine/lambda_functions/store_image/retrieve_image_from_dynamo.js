const { getParentAndNameFromPath } = require("gallery-path-utils");

/**
 * Retrieve an image from DynamoDB.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB containing gallery items
 * @param {*} path Path of the image, like /2001/12-31/image.jpg
 *
 * @returns image entry, or null if no such entry
 */
async function getImageFromDynamo(docClient, tableName, path) {
	const pathParts = getParentAndNameFromPath(path);
	const ddbparams = {
		TableName: tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		ProjectionExpression: "title,description"
	};
	const result = await docClient.get(ddbparams).promise();

	if (!result.Item) return null;
	if (
		Object.keys(result.Item).length === 0 &&
		result.Item.constructor === Object
	)
		return null;
	return result.Item;
}

module.exports = getImageFromDynamo;
