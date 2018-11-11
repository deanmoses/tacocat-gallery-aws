const getParentFromPath = require("./parent_path.js");

/**
 * Create album in DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} albumTableName name of Album table in DynamoDB
 * @param {*} albumPath path of the album, like '/2001/12-31/'
 * @param {*} fileUploadTimeStamp time the album was uploaded
 */
function createAlbum(
	docClient,
	albumTableName,
	albumPath,
	fileUploadTimeStamp
) {
	const parentAlbumPath = getParentFromPath(albumPath);
	const dynamoAlbumItem = {
		albumID: albumPath,
		parentID: parentAlbumPath,
		uploadTimeStamp: fileUploadTimeStamp
	};
	const ddbparams = {
		TableName: albumTableName,
		Item: dynamoAlbumItem,
		ConditionExpression: "attribute_not_exists (albumID)"
	};
	return docClient.put(ddbparams).promise();
}

module.exports = createAlbum;
