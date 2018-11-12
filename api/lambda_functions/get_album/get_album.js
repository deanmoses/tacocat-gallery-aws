const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Retrieve an album from DynamoDB.  Does not retrieve any child photos or child albums.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB containing gallery items
 * @param {*} path Path of the album to retrieve, like /2001/12-31/
 */
async function getAlbum(docClient, tableName, path) {
	const pathParts = getParentAndNameFromPath(path);
	const ddbparams = {
		TableName: tableName,
		Key: {
			ParentPath: pathParts.parent,
			ItemName: pathParts.name
		},
		ProjectionExpression: "title,description,UploadDateTime"
	};
	const result = await docClient.get(ddbparams).promise();
	return result.Item;
}

module.exports = getAlbum;
