const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Delete image from DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB in which to store gallery items
 * @param {*} path Path of the image like /2001/12-31/image.jpg
 */
function deleteImage(docClient, tableName, path) {
	const pathParts = getParentAndNameFromPath(path);
	const ddbparams = {
		TableName: tableName,
		Key: {
			ParentPath: pathParts.parent,
			ItemName: pathParts.name
		},
		ConditionExpression: "attribute_exists (ItemName)"
	};
	return docClient.delete(ddbparams).promise();
}

module.exports = deleteImage;
