const getParentAndNameFromPath = require("./get_parent_and_name_from_path.js");

/**
 * Given an album or image, retrieve the next album or image from DynamoDB.
 *
 * Just retrieves enough information to display a thumbnail: does not retrieve any
 * child photos or child albums.
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB containing gallery items
 * @param {*} path Path of the item, like /2001/12-31/ or /2001/12-31/felix.jpg
 */
async function getNextItem(docClient, tableName, path) {
	const pathParts = getParentAndNameFromPath(path);

	// find the most recent album within the current year
	const ddbparams = {
		TableName: tableName,
		ExclusiveStartKey: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		KeyConditionExpression: "parentPath = :parentPath",
		ExpressionAttributeValues: {
			":parentPath": pathParts.parent
		},
		ProjectionExpression: "itemName,itemDateTime,title,description",
		//ScanIndexForward: false, // sort results in descending order, i.e., newest first
		Limit: 1 // # of results to return
	};
	const result = await docClient.query(ddbparams).promise();
	return result.Items.length === 0 ? null : result.Items[0];
}

module.exports = getNextItem;
