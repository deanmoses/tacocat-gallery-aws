/**
 * Get an album's child albums in DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} albumTableName name of the Album table in DynamoDB
 * @param {*} albumId ID of the album whose children to get
 */
async function getChildAlbums(docClient, albumTableName, albumId) {
	const ddbparams = {
		TableName: albumTableName,
		KeyConditionExpression: "parentID = :parentID",
		ExpressionAttributeValues: {
			":parentID": albumId
		},
		ProjectionExpression: "albumID,uploadTimeStamp",
		IndexName: "parentID-albumID-index",
		ScanIndexForward: false
	};
	const results = await docClient.query(ddbparams).promise();
	return results.Items;
}

module.exports = getChildAlbums;
