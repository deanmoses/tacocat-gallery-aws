const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Return true if the specified image or album exists in DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB containing gallery items
 * @param {*} path Path of the album to update, like /2001/12-31/
 *
 * @returns {boolean} true if item exists at the specified path
 */
async function itemExists(docClient, tableName, path) {
	const pathParts = getParentAndNameFromPath(path);
	const ddbparams = {
		TableName: tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		ProjectionExpression: "itemName,parentPath"
	};
	const result = await docClient.get(ddbparams).promise();
	return typeof result.Item !== "undefined";
}

module.exports = itemExists;
