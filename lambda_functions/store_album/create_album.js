/**
 * Create album in DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} albumId ID of the album
 * @param {*} fileUploadTimeStamp time the album was uploaded
 */
function createAlbum(docClient, albumTableName, albumId, fileUploadTimeStamp) {
	const dynamoAlbumItem = {
		albumID: albumId,
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
