/**
 * Retrieve an album from DynamoDB.  Does not retrieve any child photos or child albums.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} albumTableName name of the Album table in DynamoDB
 * @param {*} albumId ID of the album to get
 */
async function getAlbum(docClient, albumTableName, albumId) {
	const ddbparams = {
		TableName: albumTableName,
		Key: {
			albumID: albumId
		},
		ProjectionExpression: "albumID,uploadTimeStamp"
	};
	const result = await docClient.get(ddbparams).promise();
	if (!result.Item) throw "No such album: " + albumId;
	return result.Item;
}

module.exports = getAlbum;
