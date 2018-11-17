const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");
/**
 * Create album in DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName name of the Gallery Item table in DynamoDB
 * @param {*} albumPath path of the album, like '/2001/12-31/'
 * @param {*} uploadTimestamp time the album was uploaded to S3
 */
function createAlbum(docClient, tableName, albumPath, uploadTimestamp) {
	const pathParts = getParentAndNameFromPath(albumPath);
	const dynamoAlbumItem = {
		parentPath: pathParts.parent,
		itemName: pathParts.name,
		itemType: "album",
		uploadDateTime: uploadTimestamp,
		updateDateTime: uploadTimestamp
	};
	const ddbparams = {
		TableName: tableName,
		Item: dynamoAlbumItem,
		ConditionExpression: "attribute_not_exists (itemName)"
	};
	return docClient.put(ddbparams).promise();
}

module.exports = createAlbum;
