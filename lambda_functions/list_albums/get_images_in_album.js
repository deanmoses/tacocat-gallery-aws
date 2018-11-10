/**
 * Retrieve an album's images from DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} imageTableName name of the Image table in DynamoDB
 * @param {*} albumId ID of the album whose images to get
 */
async function getImagesInAlbum(docClient, imageTableName, albumId) {
	const ddbparams = {
		TableName: imageTableName,
		KeyConditionExpression: "albumID = :albumID",
		ExpressionAttributeValues: {
			":albumID": albumId
		},
		ProjectionExpression: "imageID,dimensions",
		IndexName: "albumID-uploadTime-index"
	};
	const results = await docClient.query(ddbparams).promise();
	return results.Items;
}

module.exports = getImagesInAlbum;
