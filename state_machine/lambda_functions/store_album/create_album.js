const { getParentAndNameFromPath } = require("gallery-path-utils");
/**
 * Create album in DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName name of the Gallery Item table in DynamoDB
 * @param {*} albumPath path of the album, like '/2001/12-31/'
 */
function createAlbum(docClient, tableName, albumPath) {
	const pathParts = getParentAndNameFromPath(albumPath);

	const now = new Date().toISOString();

	const dynamoAlbumItem = {
		parentPath: pathParts.parent,
		itemName: pathParts.name,
		itemType: "album",
		createdOn: now,
		updatedOn: now
	};

	const ddbparams = {
		TableName: tableName,
		Item: dynamoAlbumItem,
		ConditionExpression: "attribute_not_exists (itemName)"
	};

	return docClient.put(ddbparams).promise();
}

module.exports = createAlbum;
