/**
 * Get an album's immediate children: both images and subalbums.
 * Does not get grandchildren.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB containing gallery items
 * @param {*} path Path of the album to retrieve, like /2001/12-31/
 */
async function getChildren(docClient, tableName, path) {
	const ddbparams = {
		TableName: tableName,
		KeyConditionExpression: "ParentPath = :ParentPath",
		ExpressionAttributeValues: {
			":ParentPath": path
		},
		ProjectionExpression: "ItemName,ItemType,UpdateDateTime,dimensions"
	};
	const results = await docClient.query(ddbparams).promise();
	return results.Items;
}

module.exports = getChildren;
