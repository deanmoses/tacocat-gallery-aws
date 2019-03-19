const { getParentAndNameFromPath } = require("gallery-path-utils");

/**
 * Delete image from DynamoDB
 *
 * @param {*} docClient AWS DynamoDB DocumentClient
 * @param {*} tableName Name of the table in DynamoDB in which to store gallery items
 * @param {*} imagePath Path of the image like /2001/12-31/image.jpg
 */
async function deleteImageFromDynamo(docClient, tableName, imagePath) {
	if (!docClient) throw "Undefined docClient";
	if (!tableName) throw "Undefined tableName";
	if (!imagePath) throw "Undefined path";

	//
	// Construct the delete command
	//

	const pathParts = getParentAndNameFromPath(imagePath);
	const ddbparams = {
		TableName: tableName,
		Key: {
			parentPath: pathParts.parent,
			itemName: pathParts.name
		},
		ConditionExpression: "attribute_exists (itemName)",
		ReturnValues: "ALL_OLD"
	};

	//
	// Do the delete
	//

	// the delete returns the attributes of the deleted image
	let deletedImage;
	try {
		deletedImage = await docClient.delete(ddbparams).promise();
	} catch (e) {
		e.imagePath = imagePath;
		throw e;
	}

	//
	// Extract the albums that the image is the thumb on, if any
	//
	// This operates over a result from DynamoDB that looks like this:
	// {
	//   "Attributes": {
	// 		...
	//   	"thumbForAlbums": {
	// 			"wrapperName": "Set",
	// 			"values": [
	// 	  			"/2018/01-24/"
	// 			],
	// 			"type": "String"
	//   	},
	//   ...
	// 	 }
	// }
	//

	const result = {};
	const thumbForAlbums = deletedImage.Attributes.thumbForAlbums;
	if (thumbForAlbums !== undefined) {
		result.thumbForAlbums = thumbForAlbums.values;
		result.albumCount = thumbForAlbums.values.length;
	} else {
		result.thumbForAlbums = [];
		result.albumCount = 0;
	}
	return result;
}

module.exports = deleteImageFromDynamo;
